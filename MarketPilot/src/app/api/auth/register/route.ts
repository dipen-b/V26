import { db, id, now } from '@/lib/db'
import { createSession, createWorkspace, hashPassword, HttpError } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { ROLES, type Role } from '@/lib/types'

type Payload = {
  name: string
  email: string
  password: string
  role: Role
  workspaceName: string
  industry?: string
  website?: string
  audience?: string
}

export async function POST(req: Request) {
  return handle(async () => {
    const input = await body<Payload>(req)
    requireFields(input, ['name', 'email', 'password', 'role', 'workspaceName'])

    if (input.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters.')
    }
    if (!ROLES.some((r) => r.value === input.role)) {
      throw new HttpError(400, 'Unknown role.')
    }

    const email = input.email.trim().toLowerCase()
    const existing = db().prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) throw new HttpError(409, 'An account with that email already exists.')

    const userId = id()
    db()
      .prepare(
        'INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(userId, email, await hashPassword(input.password), input.name.trim(), input.role, now())

    createWorkspace(userId, input.role, {
      name: input.workspaceName.trim(),
      industry: input.industry,
      website: input.website,
      audience: input.audience,
    })

    await createSession(userId)
    return ok({ id: userId, email, name: input.name.trim(), role: input.role }, 201)
  })
}
