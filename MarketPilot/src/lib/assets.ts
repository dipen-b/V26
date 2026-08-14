import { db, id, now } from '@/lib/db'
import type { Asset } from '@/lib/types'

/** Every generated deliverable lands in the workspace asset library. */
export function saveAsset(input: {
  workspaceId: string
  userId: string
  module: string
  platform: string
  title: string
  payload: unknown
}) {
  const assetId = id()
  const created = now()
  db()
    .prepare(
      `INSERT INTO assets (id, workspace_id, user_id, module, platform, title, payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      assetId,
      input.workspaceId,
      input.userId,
      input.module,
      input.platform,
      input.title,
      JSON.stringify(input.payload),
      created,
    )

  return {
    id: assetId,
    module: input.module,
    platform: input.platform,
    title: input.title,
    created_at: created,
  }
}

export function listAssets(workspaceId: string, module?: string) {
  const rows = module
    ? (db()
        .prepare(
          'SELECT * FROM assets WHERE workspace_id = ? AND module = ? ORDER BY created_at DESC LIMIT 100',
        )
        .all(workspaceId, module) as Asset[])
    : (db()
        .prepare('SELECT * FROM assets WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 100')
        .all(workspaceId) as Asset[])

  return rows.map((row) => ({ ...row, payload: JSON.parse(row.payload) }))
}
