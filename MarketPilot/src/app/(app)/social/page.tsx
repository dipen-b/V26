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
  PageHeader,
  Select,
  SourceBadge,
  Textarea,
} from '@/components/ui'
import { IconSparkles } from '@/components/icons'

type Post = {
  day: number
  format: string
  hook: string
  body: string
  hashtags: string[]
  best_time: string
}

type Calendar = {
  platform: string
  horizon_days: number
  summary: string
  posts: Post[]
  cadence_notes: string[]
}

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
]

export default function SocialPage() {
  return (
    <ModuleGuard capability="social">
      <SocialStudio />
    </ModuleGuard>
  )
}

function SocialStudio() {
  const { workspace } = useApp()
  const [form, setForm] = useState({ platform: 'linkedin', horizon: 30, topics: '' })
  const [result, setResult] = useState<Calendar | null>(null)
  const [source, setSource] = useState<'live' | 'fallback' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/social', {
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
        title="Social Media AI Studio"
        description="A full content calendar in the platform's native voice — 7, 30, or 90 days, with hooks, bodies, hashtags, and posting times."
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
          <Field label="Horizon">
            <Select
              value={String(form.horizon)}
              onChange={(e) => setForm({ ...form, horizon: Number(e.target.value) })}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Select>
          </Field>
          <Field label="Themes to cover" hint="Optional — leave blank and the AI picks angles that fit your brand.">
            <Textarea
              rows={4}
              value={form.topics}
              onChange={(e) => setForm({ ...form, topics: e.target.value })}
              placeholder="Product launches, customer stories, growth lessons"
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Building calendar…' : 'Generate calendar'}
          </Button>
        </form>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {result ? (
            <div className="mx-auto max-w-4xl space-y-5 p-8 animate-fade-up">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {result.platform} · {result.horizon_days} days
                  </h2>
                  {source && <SourceBadge source={source} />}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/85">{result.summary}</p>
              </div>

              <div className="space-y-3">
                {result.posts.map((post, i) => (
                  <Card key={i}>
                    <div className="flex items-start gap-4 p-5">
                      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-line bg-canvas py-2">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-faint">Day</span>
                        <span className="text-base font-semibold text-ink">{post.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="primary">{post.format}</Badge>
                          <span className="text-[11px] text-faint">{post.best_time}</span>
                          <span className="ml-auto">
                            <CopyButton text={`${post.hook}\n\n${post.body}\n\n${post.hashtags.map((h) => `#${h}`).join(' ')}`} />
                          </span>
                        </div>
                        <p className="mt-2.5 text-[15px] font-semibold leading-6 text-ink">{post.hook}</p>
                        <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-ink/85">{post.body}</p>
                        {post.hashtags.length > 0 && (
                          <p className="mt-2.5 text-[12px] text-primary">
                            {post.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join('  ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="Cadence notes" subtitle="How to run this calendar week to week." />
                <div className="p-5">
                  <BulletList items={result.cadence_notes} />
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={<IconSparkles className="h-5 w-5" />}
              title="No calendar yet"
              description="Pick a platform and horizon, and MarketPilot will write the whole schedule in that platform's voice."
            />
          )}
        </div>
      </div>
    </div>
  )
}
