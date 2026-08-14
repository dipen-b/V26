'use client'

import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '@/components/app-provider'
import { ModuleGuard } from '@/components/module-guard'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ImpactBadge,
  PageHeader,
  Select,
  SourceBadge,
  Spinner,
} from '@/components/ui'
import { IconChart } from '@/components/icons'

/**
 * Series colors validated for the dark card surface (#1E293B) with the dataviz
 * six checks: both inside the dark lightness band, chroma above the floor,
 * deutan ΔE 24.0 / tritan 10.4 between the pair, and ≥3:1 against the surface.
 */
const SERIES = {
  primary: '#6366F1',
  secondary: '#12A87E',
}
const SURFACE = '#1E293B'
const GRID = 'rgba(248, 250, 252, 0.07)'
const AXIS = 'rgba(248, 250, 252, 0.42)'

type Point = {
  day: string
  users: number
  sessions: number
  retention: number
  revenue: number
  conversion_rate: number
  churn_rate: number
}

type Summary = {
  totals: {
    users: number
    sessions: number
    revenue: number
    retention: number
    conversionRate: number
    churnRate: number
  }
  changes: Record<string, number>
}

type Briefing = {
  headline: string
  narrative: string
  findings: { metric: string; change: string; direction: string; plain_english: string; likely_cause: string }[]
  actions: { title: string; impact: string; effort: string; rationale: string }[]
}

const nf = new Intl.NumberFormat('en-US')
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function AnalyticsPage() {
  return (
    <ModuleGuard capability="analytics">
      <AnalyticsCenter />
    </ModuleGuard>
  )
}

function AnalyticsCenter() {
  const { workspace } = useApp()
  const [days, setDays] = useState(30)
  const [series, setSeries] = useState<Point[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [source, setSource] = useState<'live' | 'fallback' | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspace) return
    const res = await fetch(`/api/analytics?workspaceId=${workspace.id}&days=${days}`)
    if (!res.ok) return
    const data = await res.json()
    setSeries(data.series)
    setSummary(data.summary)
  }, [workspace, days])

  useEffect(() => {
    setBriefing(null)
    setSource(null)
    void load()
  }, [load])

  async function explain() {
    if (!workspace) return
    setExplaining(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id, days }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not analyze the metrics.')
      setBriefing(data.data)
      setSource(data.source)
      if (data.warning) setError(data.warning)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyze the metrics.')
    } finally {
      setExplaining(false)
    }
  }

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-5 w-5 text-muted" />
      </div>
    )
  }

  const chartData = series.map((point) => ({
    ...point,
    label: shortDate(point.day),
    retentionPct: Number((point.retention * 100).toFixed(2)),
  }))

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Analytics Command Center"
        description="Product and marketing metrics in one place, with an AI briefing that explains what moved and what to do about it in plain language."
        action={
          <div className="flex items-center gap-2">
            <Select value={String(days)} onChange={(e) => setDays(Number(e.target.value))} className="w-[130px]">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
            <Button onClick={explain} loading={explaining}>
              {explaining ? 'Analyzing…' : 'Explain these metrics'}
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-5 p-8">
          <div className="rounded-lg border border-line bg-elevated/40 px-4 py-2.5 text-[12px] leading-5 text-muted">
            Showing sample product metrics for this workspace. Connecting GA4, Firebase, Meta Ads, or Google
            Ads is not part of this build — the AI briefing below runs on whatever data is in the table.
          </div>

          {/* Stat tiles — hero numbers, not charts. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Users" value={nf.format(summary.totals.users)} change={summary.changes.users} />
            <Stat label="Sessions" value={nf.format(summary.totals.sessions)} change={summary.changes.sessions} />
            <Stat label="Revenue" value={money.format(summary.totals.revenue)} change={summary.changes.revenue} />
            <Stat label="Retention" value={pct(summary.totals.retention)} change={summary.changes.retention} />
            <Stat
              label="Conversion rate"
              value={pct(summary.totals.conversionRate)}
              change={summary.changes.conversionRate}
            />
            <Stat
              label="Churn rate"
              value={pct(summary.totals.churnRate)}
              change={summary.changes.churnRate}
              lowerIsBetter
            />
          </div>

          <div className="flex items-center justify-end gap-1 rounded-lg border border-line bg-card p-1 sm:w-fit sm:justify-start">
            {(['chart', 'table'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={clsx(
                  'rounded px-3 py-1.5 text-[12px] font-medium capitalize transition',
                  view === option ? 'bg-primary-soft text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {option} view
              </button>
            ))}
          </div>

          {view === 'table' ? (
            <DataTable rows={series} />
          ) : (
            <>
              {/* Users and sessions share one count axis — never a second y-scale. */}
              <Card>
                <CardHeader title="Users and sessions" subtitle="Both are counts, so they share a single axis." />
                <div className="p-5 pt-2">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 64, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke={AXIS}
                          tick={{ fontSize: 11, fill: AXIS }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={28}
                        />
                        <YAxis
                          stroke={AXIS}
                          tick={{ fontSize: 11, fill: AXIS }}
                          tickLine={false}
                          axisLine={false}
                          width={48}
                          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: AXIS, strokeDasharray: '3 3' }} />
                        <Legend content={<ChartLegend />} />
                        <Line
                          type="monotone"
                          dataKey="sessions"
                          name="Sessions"
                          stroke={SERIES.secondary}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          name="Users"
                          stroke={SERIES.primary}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <SingleSeriesChart
                  title="Retention"
                  subtitle="Share of users returning, by day."
                  data={chartData}
                  dataKey="retentionPct"
                  color={SERIES.primary}
                  format={(v) => `${v.toFixed(1)}%`}
                />
                <SingleSeriesChart
                  title="Revenue"
                  subtitle="Daily revenue in USD."
                  data={chartData}
                  dataKey="revenue"
                  color={SERIES.secondary}
                  format={(v) => money.format(v)}
                />
              </div>
            </>
          )}

          {error && <Alert tone="warning">{error}</Alert>}

          {briefing ? (
            <Card>
              <CardHeader
                title="AI briefing"
                subtitle="What the numbers mean, and the order to act in."
                action={source ? <SourceBadge source={source} /> : undefined}
              />
              <div className="space-y-6 p-5">
                <div>
                  <h3 className="text-[15px] font-semibold leading-6 text-ink">{briefing.headline}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-ink/85">{briefing.narrative}</p>
                </div>

                <div className="space-y-3">
                  {briefing.findings.map((finding, i) => (
                    <div key={i} className="rounded-lg border border-line bg-canvas/60 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">{finding.metric}</span>
                        <Badge
                          tone={
                            finding.direction === 'up' ? 'success' : finding.direction === 'down' ? 'error' : 'neutral'
                          }
                        >
                          {finding.change}
                        </Badge>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-ink/85">{finding.plain_english}</p>
                      <p className="mt-1.5 text-[12px] leading-5 text-muted">
                        <span className="text-faint">Likely cause: </span>
                        {finding.likely_cause}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                    Recommended actions
                  </h4>
                  <div className="divide-y divide-line rounded-lg border border-line">
                    {briefing.actions.map((action, i) => (
                      <div key={i} className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-[13px] font-semibold text-ink">{action.title}</span>
                          <ImpactBadge level={action.impact} />
                          <Badge>{action.effort} effort</Badge>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-6 text-muted">{action.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={<IconChart className="h-5 w-5" />}
                title="No briefing yet"
                description="Run “Explain these metrics” and the analytics agent will tell you what moved, why, and what to do first."
                action={
                  <Button onClick={explain} loading={explaining}>
                    Explain these metrics
                  </Button>
                }
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  change,
  lowerIsBetter,
}: {
  label: string
  value: string
  change: number
  lowerIsBetter?: boolean
}) {
  const flat = Math.abs(change) < 1
  const good = lowerIsBetter ? change < 0 : change > 0
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p
        className={clsx(
          'mt-1.5 text-[12px] font-medium',
          flat ? 'text-muted' : good ? 'text-success' : 'text-error',
        )}
      >
        {flat ? 'Flat' : `${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}%`}
        <span className="ml-1 font-normal text-faint">vs previous period</span>
      </p>
    </Card>
  )
}

function SingleSeriesChart({
  title,
  subtitle,
  data,
  dataKey,
  color,
  format,
}: {
  title: string
  subtitle: string
  data: Record<string, unknown>[]
  dataKey: string
  color: string
  format: (value: number) => string
}) {
  const gradientId = `grad-${dataKey}`
  return (
    <Card>
      {/* One series — the title names it, so no legend box is needed. */}
      <CardHeader title={title} subtitle={subtitle} />
      <div className="p-5 pt-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={AXIS}
                tick={{ fontSize: 11, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                stroke={AXIS}
                tick={{ fontSize: 11, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => format(v)}
              />
              <Tooltip
                content={<ChartTooltip formatter={format} />}
                cursor={{ stroke: AXIS, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                name={title}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

type TooltipEntry = { name?: string; value?: number; color?: string }

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  formatter?: (value: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-elevated px-3 py-2 shadow-xl shadow-black/40">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[12px] text-muted">{entry.name}</span>
            <span className="ml-auto text-[12px] font-medium text-ink">
              {formatter && typeof entry.value === 'number'
                ? formatter(entry.value)
                : nf.format(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartLegend({ payload }: { payload?: { value?: string; color?: string }[] }) {
  if (!payload?.length) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
      {payload.map((entry, i) => (
        <span key={i} className="flex items-center gap-2 text-[12px] text-muted">
          <span className="h-0.5 w-4 rounded-full" style={{ background: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  )
}

function DataTable({ rows }: { rows: Point[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Data table" subtitle="The same series, readable without color." />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Users</th>
              <th className="px-4 py-2.5 font-medium">Sessions</th>
              <th className="px-4 py-2.5 font-medium">Retention</th>
              <th className="px-4 py-2.5 font-medium">Revenue</th>
              <th className="px-4 py-2.5 font-medium">Conversion</th>
              <th className="px-4 py-2.5 font-medium">Churn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...rows].reverse().map((row) => (
              <tr key={row.day} className="text-ink/85">
                <td className="whitespace-nowrap px-4 py-2">{shortDate(row.day)}</td>
                <td className="px-4 py-2">{nf.format(row.users)}</td>
                <td className="px-4 py-2">{nf.format(row.sessions)}</td>
                <td className="px-4 py-2">{pct(row.retention)}</td>
                <td className="px-4 py-2">{money.format(row.revenue)}</td>
                <td className="px-4 py-2">{pct(row.conversion_rate)}</td>
                <td className="px-4 py-2">{pct(row.churn_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
