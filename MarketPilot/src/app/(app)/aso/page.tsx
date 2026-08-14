'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { ModuleGuard } from '@/components/module-guard'
import { CopyButton } from '@/components/copy'
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
  Textarea,
} from '@/components/ui'
import { IconMobile } from '@/components/icons'

type Keyword = { keyword: string; demand: string; difficulty: string; rationale: string }
type Opportunity = { title: string; impact: string; effort: string; rationale: string }

type AsoReport = {
  store: string
  summary: string
  title_suggestions: string[]
  subtitle_suggestions: string[]
  description_outline: string[]
  keywords: Keyword[]
  screenshot_recommendations: string[]
  conversion_opportunities: Opportunity[]
}

export default function AsoPage() {
  return (
    <ModuleGuard capability="aso">
      <AsoOptimizer />
    </ModuleGuard>
  )
}

function AsoOptimizer() {
  const { workspace } = useApp()
  const [form, setForm] = useState({
    store: 'ios',
    appName: '',
    currentTitle: '',
    shortDescription: '',
    longDescription: '',
    keywords: '',
  })
  const [result, setResult] = useState<AsoReport | null>(null)
  const [source, setSource] = useState<'live' | 'fallback' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/aso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workspaceId: workspace.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')
      setResult(data.data)
      setSource(data.source)
      if (data.warning) setError(data.warning)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const limit = form.store === 'ios' ? 30 : 30

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="ASO Optimizer"
        description="Rewrites, not critique. Title and subtitle options inside real store limits, ranked keywords with a reason each is winnable, and screenshot direction for the frames that decide the install."
      />

      <div className="flex min-h-0 flex-1">
        <form onSubmit={submit} className="w-[340px] shrink-0 space-y-4 overflow-y-auto border-r border-line p-5">
          {error && <Alert tone="warning">{error}</Alert>}
          <Field label="Store">
            <Select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })}>
              <option value="ios">Apple App Store</option>
              <option value="android">Google Play Store</option>
            </Select>
          </Field>
          <Field label="App name">
            <Input
              required
              value={form.appName}
              onChange={(e) => setForm({ ...form, appName: e.target.value })}
              placeholder="Streakly"
            />
          </Field>
          <Field label="Current store title" hint={`${limit} character limit on this store.`}>
            <Input
              value={form.currentTitle}
              onChange={(e) => setForm({ ...form, currentTitle: e.target.value })}
              placeholder="Streakly"
            />
          </Field>
          <Field label={form.store === 'ios' ? 'Subtitle' : 'Short description'}>
            <Input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Build better habits"
            />
          </Field>
          <Field label="Long description">
            <Textarea
              rows={5}
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              placeholder="Paste your current store description…"
            />
          </Field>
          {form.store === 'ios' && (
            <Field label="Keyword field" hint="100 characters, comma separated.">
              <Textarea
                rows={2}
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="habit,tracker,routine,streak"
              />
            </Field>
          )}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Analyzing listing…' : 'Optimize listing'}
          </Button>
        </form>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {result ? (
            <div className="mx-auto max-w-4xl space-y-5 p-8 animate-fade-up">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">{result.store}</h2>
                  {source && <SourceBadge source={source} />}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/85">{result.summary}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="Title options" subtitle="Character count shown against the 30-char limit." />
                  <div className="divide-y divide-line">
                    {result.title_suggestions.map((title, i) => (
                      <Suggestion key={i} text={title} limit={30} />
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Subtitle options" subtitle="The second-strongest ranking signal on the page." />
                  <div className="divide-y divide-line">
                    {result.subtitle_suggestions.map((subtitle, i) => (
                      <Suggestion key={i} text={subtitle} limit={30} />
                    ))}
                  </div>
                </Card>
              </div>

              <Card>
                <CardHeader title="Keyword targets" subtitle="Ranked by what this app can realistically win." />
                <div className="divide-y divide-line">
                  {result.keywords.map((keyword, i) => (
                    <div key={i} className="flex flex-wrap items-start gap-3 p-4">
                      <span className="font-mono text-[13px] text-ink">{keyword.keyword}</span>
                      <Badge tone={keyword.demand === 'high' ? 'success' : keyword.demand === 'medium' ? 'warning' : 'neutral'}>
                        {keyword.demand} demand
                      </Badge>
                      <Badge tone={keyword.difficulty === 'low' ? 'success' : keyword.difficulty === 'medium' ? 'warning' : 'error'}>
                        {keyword.difficulty} difficulty
                      </Badge>
                      <p className="w-full text-[13px] leading-6 text-muted">{keyword.rationale}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="Description outline" />
                  <div className="p-5">
                    <BulletList items={result.description_outline} />
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Screenshot direction" />
                  <div className="p-5">
                    <BulletList items={result.screenshot_recommendations} />
                  </div>
                </Card>
              </div>

              <Card>
                <CardHeader title="Conversion opportunities" subtitle="Ranked by impact against effort." />
                <div className="divide-y divide-line">
                  {result.conversion_opportunities.map((opportunity, i) => (
                    <div key={i} className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[13px] font-semibold text-ink">{opportunity.title}</h4>
                        <ImpactBadge level={opportunity.impact} />
                        <Badge>{opportunity.effort} effort</Badge>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-6 text-muted">{opportunity.rationale}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={<IconMobile className="h-5 w-5" />}
              title="No listing analyzed yet"
              description="Paste your current App Store or Play Store listing and MarketPilot will return the rewrite."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Suggestion({ text, limit }: { text: string; limit: number }) {
  const over = text.length > limit
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1 text-[13px] text-ink/90">{text}</span>
      <span className={over ? 'text-[11px] font-medium text-error' : 'text-[11px] text-faint'}>
        {text.length}/{limit}
      </span>
      <CopyButton text={text} label="" />
    </div>
  )
}
