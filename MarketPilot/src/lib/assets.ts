import { db, id, now } from '@/lib/db'
import type { Asset, Capability } from '@/lib/types'

/**
 * Every module that writes to the asset library. Each name doubles as the
 * capability that gates it, so reading an asset requires the same role access
 * as generating one.
 */
export const ASSET_MODULES = ['ads', 'aso', 'social', 'analytics'] as const

/** Null for an unknown or legacy module name, so callers fail closed. */
export function assetCapability(module: string): Capability | null {
  return (ASSET_MODULES as readonly string[]).includes(module) ? (module as Capability) : null
}

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

/** Lists assets for the given modules only — callers pass the set the role may read. */
export function listAssets(workspaceId: string, modules: readonly string[]) {
  // `IN ()` is a syntax error, and a role with no asset modules reads nothing.
  if (modules.length === 0) return []

  const placeholders = modules.map(() => '?').join(', ')
  const rows = db()
    .prepare(
      `SELECT * FROM assets WHERE workspace_id = ? AND module IN (${placeholders})
       ORDER BY created_at DESC LIMIT 100`,
    )
    .all(workspaceId, ...modules) as Asset[]

  return rows.map((row) => ({ ...row, payload: JSON.parse(row.payload) }))
}
