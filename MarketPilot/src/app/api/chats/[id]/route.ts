import { db } from '@/lib/db'
import { HttpError, requireCapability } from '@/lib/auth'
import { handle, ok } from '@/lib/api'
import type { ChatMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

/** A chat is private to the user who created it, inside a workspace they belong to. */
function ownedChat(userId: string, chatId: string) {
  const chat = db()
    .prepare(
      `SELECT c.* FROM chats c
       JOIN memberships m ON m.workspace_id = c.workspace_id AND m.user_id = c.user_id
       WHERE c.id = ? AND c.user_id = ?`,
    )
    .get(chatId, userId) as { id: string; title: string; workspace_id: string } | undefined
  if (!chat) throw new HttpError(404, 'Conversation not found.')
  return chat
}

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireCapability('chat')
    const { id: chatId } = await params
    const chat = ownedChat(user.id, chatId)

    const messages = db()
      .prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC')
      .all(chatId) as ChatMessage[]

    return ok({ chat, messages })
  })
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireCapability('chat')
    const { id: chatId } = await params
    ownedChat(user.id, chatId)
    db().prepare('DELETE FROM chats WHERE id = ?').run(chatId)
    return ok({ ok: true })
  })
}
