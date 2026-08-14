import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { db, id, now, seedMetrics } from './db'
import type { Capability, Role, SessionUser, Workspace } from './types'
import { can } from './types'

const COOKIE = 'mp_session'
const DAY = 60 * 60 * 24

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set in production')
    }
    // Dev-only fallback so `npm run dev` works with no .env file.
    return new TextEncoder().encode('marketpilot-dev-secret-not-for-production')
  }
  return new TextEncoder().encode(value)
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * DAY,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null

  let userId: string
  try {
    const { payload } = await jwtVerify(token, secret())
    if (typeof payload.sub !== 'string') return null
    userId = payload.sub
  } catch {
    return null
  }

  const row = db()
    .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
    .get(userId) as SessionUser | undefined
  return row ?? null
}

/** Throws a Response-shaped error the route handlers turn into 401/403. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser()
  if (!user) throw new HttpError(401, 'Sign in to continue.')
  return user
}

export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await requireUser()
  if (!can(user.role, capability)) {
    throw new HttpError(403, `Your role (${user.role}) does not have access to this module.`)
  }
  return user
}

/** Confirms the user is a member of the workspace before any read or write. */
export function requireWorkspace(user: SessionUser, workspaceId: string): Workspace {
  const workspace = db()
    .prepare(
      `SELECT w.* FROM workspaces w
       JOIN memberships m ON m.workspace_id = w.id
       WHERE w.id = ? AND m.user_id = ?`,
    )
    .get(workspaceId, user.id) as Workspace | undefined
  if (!workspace) throw new HttpError(404, 'Workspace not found.')
  return workspace
}

export function listWorkspaces(userId: string): Workspace[] {
  return db()
    .prepare(
      `SELECT w.* FROM workspaces w
       JOIN memberships m ON m.workspace_id = w.id
       WHERE m.user_id = ?
       ORDER BY w.is_client ASC, w.created_at ASC`,
    )
    .all(userId) as Workspace[]
}

export function createWorkspace(
  userId: string,
  role: Role,
  input: { name: string; industry?: string; website?: string; audience?: string; isClient?: boolean },
): Workspace {
  const d = db()
  const workspaceId = id()
  const timestamp = now()

  d.transaction(() => {
    d.prepare(
      `INSERT INTO workspaces (id, name, owner_id, industry, website, audience, is_client, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      workspaceId,
      input.name,
      userId,
      input.industry ?? '',
      input.website ?? '',
      input.audience ?? '',
      input.isClient ? 1 : 0,
      timestamp,
    )
    d.prepare('INSERT INTO memberships (id, workspace_id, user_id, role) VALUES (?, ?, ?, ?)').run(
      id(),
      workspaceId,
      userId,
      role,
    )
  })()

  seedMetrics(workspaceId)
  return d.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId) as Workspace
}
