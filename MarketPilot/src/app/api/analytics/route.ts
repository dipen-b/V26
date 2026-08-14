import { db } from '@/lib/db'
import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { generate } from '@/lib/ai'
import { ANALYTICS_SCHEMA, ANALYTICS_SYSTEM, brandContext, mockAnalytics } from '@/lib/prompts'
import { saveAsset } from '@/lib/assets'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

type MetricRow = {
  day: string
  users: number
  sessions: number
  retention: number
  revenue: number
  conversion_rate: number
  churn_rate: number
}

function loadMetrics(workspaceId: string, days: number): MetricRow[] {
  return db()
    .prepare('SELECT * FROM metrics WHERE workspace_id = ? ORDER BY day ASC')
    .all(workspaceId)
    .slice(-days) as MetricRow[]
}

/** Percentage change between the first and second half of the window. */
function periodChange(rows: MetricRow[], key: keyof MetricRow): number {
  if (rows.length < 4) return 0
  const mid = Math.floor(rows.length / 2)
  const avg = (slice: MetricRow[]) =>
    slice.reduce((sum, r) => sum + Number(r[key]), 0) / (slice.length || 1)
  const before = avg(rows.slice(0, mid))
  const after = avg(rows.slice(mid))
  if (!before) return 0
  return ((after - before) / before) * 100
}

function summarize(rows: MetricRow[]) {
  const latest = rows[rows.length - 1]
  return {
    totals: {
      users: rows.reduce((s, r) => s + r.users, 0),
      sessions: rows.reduce((s, r) => s + r.sessions, 0),
      revenue: Number(rows.reduce((s, r) => s + r.revenue, 0).toFixed(2)),
      retention: latest ? latest.retention : 0,
      conversionRate: latest ? latest.conversion_rate : 0,
      churnRate: latest ? latest.churn_rate : 0,
    },
    changes: {
      users: periodChange(rows, 'users'),
      sessions: periodChange(rows, 'sessions'),
      revenue: periodChange(rows, 'revenue'),
      retention: periodChange(rows, 'retention'),
      conversionRate: periodChange(rows, 'conversion_rate'),
      churnRate: periodChange(rows, 'churn_rate'),
    },
  }
}

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('analytics')
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('workspaceId')
    if (!workspaceId) throw new HttpError(400, 'workspaceId is required.')
    requireWorkspace(user, workspaceId)

    const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 30), 7), 90)
    const rows = loadMetrics(workspaceId, days)

    return ok({ days, series: rows, summary: summarize(rows) })
  })
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('analytics')
    const input = await body<{ workspaceId: string; days?: number }>(req)
    requireFields(input, ['workspaceId'])
    const workspace = requireWorkspace(user, input.workspaceId)

    const days = Math.min(Math.max(Number(input.days ?? 30), 7), 90)
    const rows = loadMetrics(input.workspaceId, days)
    if (rows.length === 0) throw new HttpError(400, 'This workspace has no metrics yet.')

    const summary = summarize(rows)
    const table = rows
      .filter((_, i) => i % Math.max(1, Math.floor(rows.length / 15)) === 0)
      .map(
        (r) =>
          `${r.day} | users ${r.users} | sessions ${r.sessions} | retention ${(r.retention * 100).toFixed(1)}% | revenue $${r.revenue} | conv ${(r.conversion_rate * 100).toFixed(2)}% | churn ${(r.churn_rate * 100).toFixed(2)}%`,
      )
      .join('\n')

    const result = await generate({
      system: ANALYTICS_SYSTEM,
      prompt: `Explain the last ${days} days of product metrics.

## Brand
${brandContext(workspace)}

## Period-over-period change (first half vs second half of the window)
users ${summary.changes.users.toFixed(1)}%
sessions ${summary.changes.sessions.toFixed(1)}%
retention ${summary.changes.retention.toFixed(1)}%
revenue ${summary.changes.revenue.toFixed(1)}%
conversion rate ${summary.changes.conversionRate.toFixed(1)}%
churn rate ${summary.changes.churnRate.toFixed(1)}%

## Sampled daily series
${table}`,
      schema: ANALYTICS_SCHEMA,
      fallback: mockAnalytics({
        retentionChange: summary.changes.retention,
        userChange: summary.changes.users,
        revenueChange: summary.changes.revenue,
      }),
      effort: 'high',
    })

    saveAsset({
      workspaceId: input.workspaceId,
      userId: user.id,
      module: 'analytics',
      platform: 'product',
      title: `${days}-day analytics briefing`,
      payload: result.data,
    })

    return ok({ data: result.data, source: result.source, warning: result.error })
  })
}
