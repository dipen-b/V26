import { db } from '@/lib/db'
import { HttpError, requireUser, requireWorkspace } from '@/lib/auth'
import { body, handle, ok } from '@/lib/api'
import type { Workspace } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }
type Payload = { name?: string; industry?: string; website?: string; audience?: string }

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const user = await requireUser()
    const { id: workspaceId } = await params
    const workspace = requireWorkspace(user, workspaceId)

    // The brand profile shapes every AI prompt, so only the owner may edit it.
    if (workspace.owner_id !== user.id) {
      throw new HttpError(403, 'Only the workspace owner can edit the brand profile.')
    }

    const input = await body<Payload>(req)
    const next = {
      name: input.name?.trim() || workspace.name,
      industry: input.industry?.trim() ?? workspace.industry,
      website: input.website?.trim() ?? workspace.website,
      audience: input.audience?.trim() ?? workspace.audience,
    }

    db()
      .prepare('UPDATE workspaces SET name = ?, industry = ?, website = ?, audience = ? WHERE id = ?')
      .run(next.name, next.industry, next.website, next.audience, workspaceId)

    return ok({
      workspace: db().prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId) as Workspace,
    })
  })
}
