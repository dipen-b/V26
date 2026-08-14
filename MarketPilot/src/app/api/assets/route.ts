import { db } from '@/lib/db'
import { HttpError, requireUser, requireWorkspace } from '@/lib/auth'
import { handle, ok } from '@/lib/api'
import { ASSET_MODULES, assetCapability, listAssets } from '@/lib/assets'
import { can } from '@/lib/types'
import type { SessionUser } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * The library spans every module, so membership alone is not enough — a role
 * must not read deliverables from a module it cannot open.
 */
function requireModuleAccess(user: SessionUser, module: string) {
  const capability = assetCapability(module)
  if (!capability || !can(user.role, capability)) {
    throw new HttpError(403, `Your role (${user.role}) does not have access to this module.`)
  }
}

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const requested = url.searchParams.get('module')
    if (requested) {
      requireModuleAccess(user, requested)
      return ok({ assets: listAssets(workspaceId, [requested]) })
    }

    // Unfiltered: narrow to the modules this role can open rather than
    // returning the whole library.
    const readable = ASSET_MODULES.filter((m) => can(user.role, m))
    return ok({ assets: listAssets(workspaceId, readable) })
  })
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const assetId = new URL(req.url).searchParams.get('id')
    if (!assetId) throw new HttpError(400, 'id is required.')

    const row = db()
      .prepare('SELECT workspace_id, module FROM assets WHERE id = ?')
      .get(assetId) as { workspace_id: string; module: string } | undefined
    if (!row) throw new HttpError(404, 'Asset not found.')
    // Membership first, so a non-member gets 404 rather than a 403 that would
    // confirm the asset exists.
    requireWorkspace(user, row.workspace_id)
    requireModuleAccess(user, row.module)

    db().prepare('DELETE FROM assets WHERE id = ?').run(assetId)
    return ok({ ok: true })
  })
}
