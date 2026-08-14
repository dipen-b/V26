import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { runIntelligence } from '@/lib/intelligence/engine'
import { deleteReport, getReport, listReports, saveReport } from '@/lib/intelligence/store'
import { inferKind, inferName } from '@/lib/intelligence/target'
import type { TargetKind } from '@/lib/intelligence/types'

export const dynamic = 'force-dynamic'
// Research plus four section-group calls; this is the longest request in the app.
export const maxDuration = 800

const KINDS: TargetKind[] = ['play_store', 'app_store', 'website', 'landing_page', 'saas_product']

type Payload = {
  workspaceId: string
  url: string
  name?: string
  kind?: TargetKind
  notes?: string
}

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const reportId = url.searchParams.get('id')
    if (reportId) {
      const stored = getReport(reportId)
      requireWorkspace(user, stored.workspace_id)
      return ok({ report: stored.report, id: stored.id, source: stored.source })
    }

    return ok({ reports: listReports(workspaceId) })
  })
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const input = await body<Payload>(req)
    requireFields(input, ['workspaceId', 'url'])
    requireWorkspace(user, input.workspaceId)

    let parsed: URL
    try {
      parsed = new URL(input.url.trim())
    } catch {
      throw new HttpError(400, 'Enter a full URL, including https://')
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new HttpError(400, 'Only http and https URLs can be analyzed.')
    }

    const kind = input.kind && KINDS.includes(input.kind) ? input.kind : inferKind(parsed.href)
    const target = {
      url: parsed.href,
      kind,
      name: input.name?.trim() || inferName(parsed.href),
      notes: input.notes?.trim() || undefined,
    }

    const { report, source, warnings } = await runIntelligence(target)
    const reportId = saveReport({
      workspaceId: input.workspaceId,
      userId: user.id,
      report,
      source,
    })

    return ok({ id: reportId, report, source, warnings }, 201)
  })
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const reportId = new URL(req.url).searchParams.get('id')
    if (!reportId) throw new HttpError(400, 'id is required.')

    const stored = getReport(reportId)
    requireWorkspace(user, stored.workspace_id)
    deleteReport(reportId)
    return ok({ ok: true })
  })
}
