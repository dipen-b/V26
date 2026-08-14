import { db } from '@/lib/db'
import { HttpError, requireUser, requireWorkspace } from '@/lib/auth'
import { handle, ok } from '@/lib/api'
import { listAssets } from '@/lib/assets'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    return ok({ assets: listAssets(workspaceId, url.searchParams.get('module') ?? undefined) })
  })
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const assetId = new URL(req.url).searchParams.get('id')
    if (!assetId) throw new HttpError(400, 'id is required.')

    const row = db()
      .prepare('SELECT workspace_id FROM assets WHERE id = ?')
      .get(assetId) as { workspace_id: string } | undefined
    if (!row) throw new HttpError(404, 'Asset not found.')
    requireWorkspace(user, row.workspace_id)

    db().prepare('DELETE FROM assets WHERE id = ?').run(assetId)
    return ok({ ok: true })
  })
}
