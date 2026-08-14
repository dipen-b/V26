'use client'

import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useApp } from '@/components/app-provider'
import { ModuleGuard } from '@/components/module-guard'
import {
  Alert,
  Badge,
  BulletList,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  ImpactBadge,
  Input,
  PageHeader,
  Select,
  SourceBadge,
} from '@/components/ui'
import { IconRadar, IconTrash } from '@/components/icons'

type Opportunity = { title: string; impact: string; effort: string; rationale: string }

type Report = {
  competitor_name: string
  summary: string
  business: { model: string; pricing_strategy: string; target_audience: string; positioning: string }
  marketing: {
    ad_angles: string[]
    headlines: string[]
    landing_page_notes: string[]
    content_strategy: string[]
  }
  growth: { seo_opportunities: string[]; traffic_sources: string[]; funnel_recommendations: string[] }
  opportunities: Opportunity[]
}

type Row = { id: string; name: string; url: string; kind: string; created_at: string; report: Report | null }

export default function CompetitorsPage() {
  return (
    <ModuleGuard capability="competitors">
      <CompetitorIntelligence />
    </ModuleGuard>
  )
}

function CompetitorIntelligence() {
  const { workspace } = useApp()
  const [rows, setRows] = useState<Row[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', url: '', kind: 'website' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'live' | 'fallback' | null>(null)

  const load = useCallback(async () => {
    if (!workspace) return
    const res = await fetch(`/api/competitors?workspaceId=${workspace.id}`)
    if (!res.ok) return
    const data = await res.json()
    setRows(data.competitors)
    setActiveId((current) => current ?? data.competitors[0]?.id ?? null)
  }, [workspace])

  useEffect(() => {
    setActiveId(null)
    setSource(null)
    void load()
  }, [load])

  async function analyze(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workspaceId: workspace.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')
      setSource(data.source)
      if (data.warning) setError(data.warning)
      setForm({ name: '', url: '', kind: form.kind })
      await load()
      setActiveId(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
    if (id === activeId) setActiveId(null)
    await load()
  }

  const active = rows.find((r) => r.id === activeId) ?? null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Competitor Intelligence"
        description="Point MarketPilot at a competitor's website or app listing. It returns their business model, pricing, ad angles, content strategy, and the openings you can attack."
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex w-[320px] shrink-0 flex-col border-r border-line">
          <form onSubmit={analyze} className="space-y-3 border-b border-line p-5">
            {error && <Alert tone="warning">{error}</Alert>}
            <Field label="Competitor name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Notion"
              />
            </Field>
            <Field label="Source">
              <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="website">Website</option>
                <option value="app_store">App Store listing</option>
                <option value="play_store">Play Store listing</option>
              </Select>
            </Field>
            <Field label="URL">
              <Input
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://competitor.com"
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Analyzing…' : 'Run analysis'}
            </Button>
          </form>

          <div className="flex-1 overflow-y-auto p-3">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Reports</p>
            {rows.length === 0 && <p className="px-2 text-xs leading-5 text-faint">No reports yet.</p>}
            {rows.map((row) => (
              <div
                key={row.id}
                className={clsx(
                  'group flex items-center gap-1 rounded-lg pr-1 transition',
                  row.id === activeId ? 'bg-primary-soft' : 'hover:bg-elevated',
                )}
              >
                <button
                  onClick={() => setActiveId(row.id)}
                  className="min-w-0 flex-1 px-2.5 py-2 text-left"
                >
                  <span className="block truncate text-[13px] font-medium text-ink">{row.name}</span>
                  <span className="block truncate text-[11px] text-faint">{row.url}</span>
                </button>
                <button
                  onClick={() => remove(row.id)}
                  className="rounded p-1 text-faint opacity-0 transition hover:text-error group-hover:opacity-100"
                  title="Delete report"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {active?.report ? (
            <ReportView report={active.report} source={source} />
          ) : (
            <EmptyState
              icon={<IconRadar className="h-5 w-5" />}
              title="No report selected"
              description="Add a competitor on the left and MarketPilot will build the full intelligence report."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ReportView({ report, source }: { report: Report; source: 'live' | 'fallback' | null }) {
  return (
    <div className="mx-auto max-w-4xl space-y-5 p-8 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{report.competitor_name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/85">{report.summary}</p>
        </div>
        {source && <SourceBadge source={source} />}
      </div>

      <Card>
        <CardHeader title="Business analysis" subtitle="How they make money and who they sell to." />
        <dl className="grid gap-px overflow-hidden bg-line sm:grid-cols-2">
          {[
            ['Business model', report.business.model],
            ['Pricing strategy', report.business.pricing_strategy],
            ['Target audience', report.business.target_audience],
            ['Positioning', report.business.positioning],
          ].map(([label, value]) => (
            <div key={label} className="bg-card p-5">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</dt>
              <dd className="mt-1.5 text-[13px] leading-6 text-ink/85">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader title="Marketing analysis" subtitle="The angles, headlines, and content engine behind their growth." />
        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <Section title="Ad angles" items={report.marketing.ad_angles} />
          <Section title="Headlines in market" items={report.marketing.headlines} />
          <Section title="Landing page notes" items={report.marketing.landing_page_notes} />
          <Section title="Content strategy" items={report.marketing.content_strategy} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Growth analysis" subtitle="Where their funnel leaks and which channels carry them." />
        <div className="grid gap-6 p-5 sm:grid-cols-3">
          <Section title="SEO opportunities" items={report.growth.seo_opportunities} />
          <Section title="Traffic sources" items={report.growth.traffic_sources} />
          <Section title="Funnel recommendations" items={report.growth.funnel_recommendations} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Your openings" subtitle="Ranked moves you can make against this competitor." />
        <div className="divide-y divide-line">
          {report.opportunities.map((opportunity, i) => (
            <div key={i} className="flex gap-4 p-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[13px] font-semibold text-ink">{opportunity.title}</h4>
                  <ImpactBadge level={opportunity.impact} />
                  <Badge>{opportunity.effort} effort</Badge>
                </div>
                <p className="mt-1.5 text-[13px] leading-6 text-muted">{opportunity.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{title}</h4>
      <BulletList items={items} />
    </div>
  )
}
