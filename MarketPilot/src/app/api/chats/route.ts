import { db, id, now } from '@/lib/db'
import { requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { HttpError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('chat')
    const workspaceId = new URL(req.url).searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const chats = db()
      .prepare(
        `SELECT id, title, created_at, updated_at FROM chats
         WHERE workspace_id = ? AND user_id = ?
         ORDER BY updated_at DESC LIMIT 50`,
      )
      .all(workspaceId, user.id)
    return ok({ chats })
  })
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('chat')
    const input = await body<{ workspaceId: string; title?: string }>(req)
    requireFields(input, ['workspaceId'])
    requireWorkspace(user, input.workspaceId)

    const chatId = id()
    const timestamp = now()
    db()
      .prepare(
        'INSERT INTO chats (id, workspace_id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(chatId, input.workspaceId, user.id, input.title?.trim() || 'New conversation', timestamp, timestamp)

    return ok({ chat: { id: chatId, title: input.title?.trim() || 'New conversation', created_at: timestamp, updated_at: timestamp } }, 201)
  })
}
