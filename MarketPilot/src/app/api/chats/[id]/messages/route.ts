import { db, id, now } from '@/lib/db'
import { HttpError, requireCapability } from '@/lib/auth'
import { body, fail, handle, requireFields } from '@/lib/api'
import { chatStream } from '@/lib/ai'
import { brandContext, CHAT_SYSTEM, mockChat } from '@/lib/prompts'
import type { ChatMessage, Workspace } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireCapability('chat')
    const { id: chatId } = await params
    const input = await body<{ content: string }>(req)
    requireFields(input, ['content'])

    const d = db()
    const chat = d
      .prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?')
      .get(chatId, user.id) as { id: string; workspace_id: string; title: string } | undefined
    if (!chat) throw new HttpError(404, 'Conversation not found.')

    const workspace = d
      .prepare(
        `SELECT w.* FROM workspaces w
         JOIN memberships m ON m.workspace_id = w.id
         WHERE w.id = ? AND m.user_id = ?`,
      )
      .get(chat.workspace_id, user.id) as Workspace | undefined
    if (!workspace) throw new HttpError(403, 'You no longer have access to this workspace.')

    const prompt = input.content.trim()
    const timestamp = now()

    d.prepare('INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
      id(),
      chatId,
      'user',
      prompt,
      timestamp,
    )

    // Name the conversation from its first message, the way ChatGPT does.
    if (chat.title === 'New conversation') {
      const title = prompt.length > 60 ? `${prompt.slice(0, 57)}…` : prompt
      d.prepare('UPDATE chats SET title = ? WHERE id = ?').run(title, chatId)
    }

    const history = d
      .prepare('SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC')
      .all(chatId) as Pick<ChatMessage, 'role' | 'content'>[]

    const upstream = chatStream({
      system: `${CHAT_SYSTEM}\n\n## Workspace context\n${brandContext(workspace)}`,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      fallback: mockChat(prompt, workspace),
    })

    // Tee the stream so the client sees tokens immediately while we still
    // persist the finished reply for the next page load.
    const reader = upstream.getReader()
    const decoder = new TextDecoder()
    let full = ''

    const outbound = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) {
          if (full.trim()) {
            d.prepare(
              'INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
            ).run(id(), chatId, 'assistant', full, now())
            d.prepare('UPDATE chats SET updated_at = ? WHERE id = ?').run(now(), chatId)
          }
          controller.close()
          return
        }
        full += decoder.decode(value, { stream: true })
        controller.enqueue(value)
      },
      cancel() {
        void reader.cancel()
      },
    })

    return new Response(outbound, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  })
}

export function GET() {
  return fail(405, 'Use POST to send a message.')
}
