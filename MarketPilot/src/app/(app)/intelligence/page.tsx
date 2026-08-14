'use client'

import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useApp } from '@/components/app-provider'
import { ModuleGuard } from '@/components/module-guard'
import { ReportView } from '@/components/intelligence/report-view'
import { ComparisonView } from '@/components/intelligence/comparison-view'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from '@/components/ui'
import { IconRadar, IconTrash } from '@/components/icons'
import { TARGET_KINDS } from '@/lib/intelligence/target'
import type { IntelligenceReport, TargetKind } from '@/lib/intelligence/types'
import type { Comparison } from '@/lib/intelligence/compare'

type ReportRow = {
  id: string
  name: string
  url: string
  kind: TargetKind
  marketing_score: number
  source: string
  created_at: string
}

type ComparisonRow = { id: string; title: string; report_ids: string[]; created_at: string }

type Mode = 'report' | 'comparison'

export default function IntelligencePage() {
  return (
    <ModuleGuard capability="intelligence">
      <MarketingIntelligence />
    </ModuleGuard>
  )
}

function MarketingIntelligence() {
  const { workspace } = useApp()

  const [rows, setRows] = useState<ReportRow[]>([])
  const [comparisons, setComparisons] = useState<ComparisonRow[]>([])
  const [mode, setMode] = useState<Mode>('report')

  const [activeReport, setActiveReport] = useState<{ id: string; report: IntelligenceReport } | null>(null)
  const [activeComparison, setActiveComparison] = useState<
    { id: string; title: string; comparison: Comparison } | null
  >(null)

  const [form, setForm] = useState({ url: '', name: '', kind: '' as '' | TargetKind, notes: '' })
  const [selected, setSelected] = useState<string[]>([])

  const [analyzing, setAnalyzing] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notices, setNotices] = useState<string[]>([])

  const load = useCallback(async () => {
    if (!workspace) return
    const [reportsRes, comparisonsRes] = await Promise.all([
      fetch(`/api/intelligence?workspaceId=${workspace.id}`),
      fetch(`/api/intelligence/compare?workspaceId=${workspace.id}`),
    ])
    if (reportsRes.ok) setRows((await reportsRes.json()).reports)
    if (comparisonsRes.ok) setComparisons((await comparisonsRes.json()).comparisons)
  }, [workspace])

  useEffect(() => {
    setActiveReport(null)
    setActiveComparison(null)
    setSelected([])
    void load()
  }, [load])

  async function analyze(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setAnalyzing(true)
    setError(null)
    setNotices([])
    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          url: form.url,
          name: form.name || undefined,
          kind: form.kind || undefined,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')

      setActiveReport({ id: data.id, report: data.report })
      setActiveComparison(null)
      setMode('report')
      setNotices(data.warnings ?? [])
      setForm({ url: '', name: '', kind: '', notes: '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function openReport(id: string) {
    if (!workspace) return
    setLoadingDetail(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence?workspaceId=${workspace.id}&id=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not open the report.')
      setActiveReport({ id, report: data.report })
      setActiveComparison(null)
      setMode('report')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the report.')
    } finally {
      setLoadingDetail(false)
    }
  }

  async function openComparison(id: string) {
    if (!workspace) return
    setLoadingDetail(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence/compare?workspaceId=${workspace.id}&id=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not open the comparison.')
      setActiveComparison({ id, title: data.title, comparison: data.comparison })
      setActiveReport(null)
      setMode('comparison')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the comparison.')
    } finally {
      setLoadingDetail(false)
    }
  }

  async function compare() {
    if (!workspace || selected.length < 2) return
    setComparing(true)
    setError(null)
    setNotices([])
    try {
      const res = await fetch('/api/intelligence/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id, reportIds: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Comparison failed.')

      setActiveComparison({ id: data.id, title: data.title, comparison: data.comparison })
      setActiveReport(null)
      setMode('comparison')
      if (data.warning) setNotices([data.warning])
      setSelected([])
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed.')
    } finally {
      setComparing(false)
    }
  }

  async function removeReport(id: string) {
    await fetch(`/api/intelligence?id=${id}`, { method: 'DELETE' })
    if (activeReport?.id === id) setActiveReport(null)
    setSelected((prev) => prev.filter((value) => value !== id))
    await load()
  }

  async function removeComparison(id: string) {
    await fetch(`/api/intelligence/compare?id=${id}`, { method: 'DELETE' })
    if (activeComparison?.id === id) setActiveComparison(null)
    await load()
  }

  const exportBase =
    mode === 'comparison' && activeComparison
      ? `/api/intelligence/export?type=comparison&id=${activeComparison.id}`
      : activeReport
        ? `/api/intelligence/export?type=report&id=${activeReport.id}`
        : null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Marketing Intelligence Engine"
        description="Paste any competitor URL — app listing, website, landing page, or SaaS product — and get a full marketing audit: positioning, personas, ASO, acquisition channels, ad strategy, funnel, revenue, SWOT, and a ranked action plan."
        action={
          exportBase && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide text-faint">Export</span>
              {(['pdf', 'pptx', 'xlsx'] as const).map((format) => (
                <a
                  key={format}
                  href={`${exportBase}&format=${format}`}
                  className="rounded-lg border border-line bg-elevated px-3 py-1.5 text-[12px] font-medium uppercase text-ink transition hover:border-primary/50"
                >
                  {format}
                </a>
              ))}
            </div>
          )
        }
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex w-[330px] shrink-0 flex-col border-r border-line">
          <form onSubmit={analyze} className="space-y-3 border-b border-line p-5">
            <Field label="Competitor URL">
              <Input
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://competitor.com"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" hint="Optional">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Auto"
                />
              </Field>
              <Field label="Type">
                <Select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as TargetKind | '' })}
                >
                  <option value="">Detect</option>
                  {TARGET_KINDS.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Context" hint="Anything the analyst already knows.">
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="They just launched a free tier"
              />
            </Field>
            <Button type="submit" loading={analyzing} className="w-full">
              {analyzing ? 'Running full audit…' : 'Run intelligence report'}
            </Button>
            {analyzing && (
              <p className="text-center text-[11px] leading-4 text-faint">
                Researching the target, then running four analysis passes. This takes a minute.
              </p>
            )}
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Reports</p>
              {selected.length > 0 && (
                <span className="text-[11px] text-primary">{selected.length} selected</span>
              )}
            </div>

            {rows.length === 0 && (
              <p className="px-2 pb-3 text-xs leading-5 text-faint">No reports yet.</p>
            )}

            {rows.map((row) => (
              <div
                key={row.id}
                className={clsx(
                  'group mb-0.5 flex items-center gap-2 rounded-lg pr-1 transition',
                  activeReport?.id === row.id ? 'bg-primary-soft' : 'hover:bg-elevated',
                )}
              >
                <input
                  type="checkbox"
                  className="ml-2.5 accent-primary"
                  checked={selected.includes(row.id)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, row.id] : prev.filter((value) => value !== row.id),
                    )
                  }
                  title="Select for comparison"
                />
                <button onClick={() => openReport(row.id)} className="min-w-0 flex-1 py-2 text-left">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-ink">{row.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] font-medium text-primary">
                      {row.marketing_score}
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-faint">{row.url}</span>
                </button>
                <button
                  onClick={() => removeReport(row.id)}
                  title="Delete report"
                  className="rounded p-1 text-faint opacity-0 transition hover:text-error group-hover:opacity-100"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {rows.length >= 2 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                loading={comparing}
                disabled={selected.length < 2}
                onClick={compare}
              >
                {selected.length < 2
                  ? 'Select 2+ to compare'
                  : `Compare ${selected.length} competitors`}
              </Button>
            )}

            {comparisons.length > 0 && (
              <>
                <p className="px-2 pb-2 pt-5 text-[11px] font-medium uppercase tracking-wide text-faint">
                  Comparisons
                </p>
                {comparisons.map((row) => (
                  <div
                    key={row.id}
                    className={clsx(
                      'group mb-0.5 flex items-center gap-1 rounded-lg pr-1 transition',
                      activeComparison?.id === row.id ? 'bg-primary-soft' : 'hover:bg-elevated',
                    )}
                  >
                    <button
                      onClick={() => openComparison(row.id)}
                      className="min-w-0 flex-1 px-2.5 py-2 text-left"
                    >
                      <span className="block truncate text-[13px] text-ink/85">{row.title}</span>
                      <span className="block text-[11px] text-faint">
                        {row.report_ids.length} competitors
                      </span>
                    </button>
                    <button
                      onClick={() => removeComparison(row.id)}
                      title="Delete comparison"
                      className="rounded p-1 text-faint opacity-0 transition hover:text-error group-hover:opacity-100"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-4 p-8">
            {error && <Alert>{error}</Alert>}
            {notices.map((notice, i) => (
              <Alert key={i} tone="warning">
                {notice}
              </Alert>
            ))}

            {loadingDetail && (
              <div className="flex justify-center py-10">
                <Spinner className="h-5 w-5 text-muted" />
              </div>
            )}

            {!loadingDetail && mode === 'comparison' && activeComparison && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    {activeComparison.title}
                  </h2>
                  <Badge tone="primary">CEO growth report</Badge>
                </div>
                <ComparisonView comparison={activeComparison.comparison} />
              </>
            )}

            {!loadingDetail && mode === 'report' && activeReport && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-ink">
                      {activeReport.report.target.name}
                    </h2>
                    <a
                      href={activeReport.report.target.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[12px] text-primary hover:text-secondary"
                    >
                      {activeReport.report.target.url}
                    </a>
                  </div>
                  <Badge>{activeReport.report.target.kind.replace(/_/g, ' ')}</Badge>
                </div>
                <ReportView report={activeReport.report} />
              </>
            )}

            {!loadingDetail && !activeReport && !activeComparison && (
              <Card>
                <EmptyState
                  icon={<IconRadar className="h-5 w-5" />}
                  title="No analysis open"
                  description="Paste a competitor URL on the left to run a full marketing audit, or tick two or more finished reports to build a market landscape and CEO growth report."
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
