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
  Input,
  PageHeader,
  Select,
  SourceBadge,
  Textarea,
} from '@/components/ui'
import { IconMegaphone } from '@/components/icons'

type Variant = { angle: string; headline: string; body: string; cta: string; creative_direction: string }
type AdSet = {
  platform: string
  objective: string
  summary: string
  variants: Variant[]
  testing_plan: string[]
}

const PLATFORMS = [
  { value: 'meta', label: 'Meta Ads' },
  { value: 'google_search', label: 'Google Search' },
  { value: 'google_display', label: 'Google Display / PMax' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'youtube', label: 'YouTube Ads' },
]

export default function AdsPage() {
  return (
    <ModuleGuard capability="ads">
      <AdGenerator />
    </ModuleGuard>
  )
}

function AdGenerator() {
  const { workspace } = useApp()
  const [form, setForm] = useState({
    platform: 'meta',
    product: '',
    objective: '',
    audience: '',
    variants: 4,
  })
  const [result, setResult] = useState<AdSet | null>(null)
  const [source, setSource] = useState<'live' | 'fallback' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workspaceId: workspace.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.')
      setResult(data.data)
      setSource(data.source)
      if (data.warning) setError(data.warning)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Ad Creative Generator"
        description="Platform-native ad creative for Meta, Google, TikTok, and YouTube — each variant testing a genuinely different angle, with a plan for what to run first."
      />

      <div className="flex min-h-0 flex-1">
        <form onSubmit={submit} className="w-[340px] shrink-0 space-y-4 overflow-y-auto border-r border-line p-5">
          {error && <Alert tone="warning">{error}</Alert>}
          <Field label="Platform">
            <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="What are you advertising?">
            <Textarea
              required
              rows={3}
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              placeholder="A habit-tracking app with streaks and smart reminders"
            />
          </Field>
          <Field label="Campaign objective">
            <Input
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Drive installs from cold traffic"
            />
          </Field>
          <Field label="Audience">
            <Input
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder="25–40, productivity-minded, iOS"
            />
          </Field>
          <Field label="Variants" hint="Between 2 and 6.">
            <Select
              value={String(form.variants)}
              onChange={(e) => setForm({ ...form, variants: Number(e.target.value) })}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} variants
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Generating…' : 'Generate ad creative'}
          </Button>
        </form>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {result ? (
            <div className="mx-auto max-w-4xl space-y-5 p-8 animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">{result.platform}</h2>
                    {source && <SourceBadge source={source} />}
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{result.objective}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/85">{result.summary}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {result.variants.map((variant, i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader
                      title={variant.angle}
                      action={
                        <CopyButton
                          text={`${variant.headline}\n\n${variant.body}\n\nCTA: ${variant.cta}`}
                        />
                      }
                    />
                    <div className="flex-1 space-y-4 p-5">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Headline</p>
                        <p className="mt-1 text-[15px] font-semibold leading-6 text-ink">{variant.headline}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Body</p>
                        <p className="mt-1 whitespace-pre-line text-[13px] leading-6 text-ink/85">{variant.body}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
                          Creative direction
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-muted">{variant.creative_direction}</p>
                      </div>
                    </div>
                    <div className="border-t border-line px-5 py-3">
                      <Badge tone="primary">{variant.cta}</Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="Testing plan" subtitle="Run it in this order and kill losers on evidence, not instinct." />
                <div className="p-5">
                  <BulletList items={result.testing_plan} />
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={<IconMegaphone className="h-5 w-5" />}
              title="No creative generated yet"
              description="Describe what you're advertising and MarketPilot will write platform-native variants across distinct angles."
            />
          )}
        </div>
      </div>
    </div>
  )
}
