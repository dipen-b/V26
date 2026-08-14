import { db } from '@/lib/db'
import { createSession, HttpError, verifyPassword } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import type { Role } from '@/lib/types'

type Payload = { email: string; password: string }
type Row = { id: string; email: string; name: string; role: Role; password_hash: string }

export async function POST(req: Request) {
  return handle(async () => {
    const input = await body<Payload>(req)
    requireFields(input, ['email', 'password'])

    const row = db()
      .prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ?')
      .get(input.email.trim().toLowerCase()) as Row | undefined

    // Same message either way so the endpoint does not confirm which emails exist.
    if (!row || !(await verifyPassword(input.password, row.password_hash))) {
      throw new HttpError(401, 'Incorrect email or password.')
    }

    await createSession(row.id)
    return ok({ id: row.id, email: row.email, name: row.name, role: row.role })
  })
}
