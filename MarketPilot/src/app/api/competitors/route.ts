import { db, id, now } from '@/lib/db'
import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { generate } from '@/lib/ai'
import { brandContext, COMPETITOR_SCHEMA, COMPETITOR_SYSTEM, mockCompetitor } from '@/lib/prompts'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('competitors')
    const workspaceId = new URL(req.url).searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const rows = db()
      .prepare(
        'SELECT id, name, url, kind, status, report, created_at FROM competitors WHERE workspace_id = ? ORDER BY created_at DESC',
      )
      .all(workspaceId) as { report: string | null }[]

    return ok({
      competitors: rows.map((row) => ({ ...row, report: row.report ? JSON.parse(row.report) : null })),
    })
  })
}

type Payload = {
  workspaceId: string
  name: string
  url: string
  kind?: 'website' | 'app_store' | 'play_store'
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('competitors')
    const input = await body<Payload>(req)
    requireFields(input, ['workspaceId', 'name', 'url'])
    const workspace = requireWorkspace(user, input.workspaceId)

    const kind = input.kind ?? 'website'
    const label =
      kind === 'app_store' ? 'Apple App Store listing' : kind === 'play_store' ? 'Google Play listing' : 'website'

    const result = await generate({
      system: COMPETITOR_SYSTEM,
      prompt: `Analyze this competitor and produce the full report.

Competitor name: ${input.name}
Competitor ${label}: ${input.url}

## The brand you are advising
${brandContext(workspace)}

Write the opportunities specifically as moves ${workspace.name} can make against this competitor.`,
      schema: COMPETITOR_SCHEMA,
      fallback: mockCompetitor(input.name, input.url),
      effort: 'high',
    })

    const recordId = id()
    db()
      .prepare(
        `INSERT INTO competitors (id, workspace_id, name, url, kind, report, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        recordId,
        input.workspaceId,
        input.name.trim(),
        input.url.trim(),
        kind,
        JSON.stringify(result.data),
        'complete',
        now(),
      )

    return ok({ id: recordId, report: result.data, source: result.source, warning: result.error }, 201)
  })
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireCapability('competitors')
    const recordId = new URL(req.url).searchParams.get('id')
    if (!recordId) throw new HttpError(400, 'id is required.')

    const row = db()
      .prepare('SELECT workspace_id FROM competitors WHERE id = ?')
      .get(recordId) as { workspace_id: string } | undefined
    if (!row) throw new HttpError(404, 'Report not found.')
    requireWorkspace(user, row.workspace_id)

    db().prepare('DELETE FROM competitors WHERE id = ?').run(recordId)
    return ok({ ok: true })
  })
}
