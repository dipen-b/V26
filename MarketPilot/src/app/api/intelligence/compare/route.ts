import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { runComparison } from '@/lib/intelligence/compare'
import {
  deleteComparison,
  getComparison,
  getReport,
  listComparisons,
  saveComparison,
} from '@/lib/intelligence/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 800

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const comparisonId = url.searchParams.get('id')
    if (comparisonId) {
      const stored = getComparison(comparisonId)
      requireWorkspace(user, stored.workspace_id)
      return ok({ comparison: stored.comparison, id: stored.id, title: stored.title })
    }

    return ok({ comparisons: listComparisons(workspaceId) })
  })
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const input = await body<{ workspaceId: string; reportIds: string[]; title?: string }>(req)
    requireFields(input, ['workspaceId'])
    requireWorkspace(user, input.workspaceId)

    const reportIds = [...new Set(input.reportIds ?? [])]
    if (reportIds.length < 2) {
      throw new HttpError(400, 'Select at least 2 competitors to compare.')
    }
    if (reportIds.length > 10) {
      throw new HttpError(400, 'Comparisons are limited to 10 competitors.')
    }

    // Every report must belong to a workspace this user is a member of.
    const stored = reportIds.map((reportId) => {
      const row = getReport(reportId)
      requireWorkspace(user, row.workspace_id)
      if (row.workspace_id !== input.workspaceId) {
        throw new HttpError(400, 'All reports must come from the same workspace.')
      }
      return row
    })

    const result = await runComparison(stored.map((row) => row.report))
    const title =
      input.title?.trim() || `${stored.map((row) => row.name).join(' vs ')}`.slice(0, 160)

    const comparisonId = saveComparison({
      workspaceId: input.workspaceId,
      userId: user.id,
      title,
      reportIds,
      comparison: result.data,
      source: result.source,
    })

    return ok(
      {
        id: comparisonId,
        title,
        comparison: result.data,
        source: result.source,
        warning: result.error,
      },
      201,
    )
  })
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const comparisonId = new URL(req.url).searchParams.get('id')
    if (!comparisonId) throw new HttpError(400, 'id is required.')

    const stored = getComparison(comparisonId)
    requireWorkspace(user, stored.workspace_id)
    deleteComparison(comparisonId)
    return ok({ ok: true })
  })
}
