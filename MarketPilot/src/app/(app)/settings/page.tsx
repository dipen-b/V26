'use client'

import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useApp } from '@/components/app-provider'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
} from '@/components/ui'
import { IconSparkles, IconTrash } from '@/components/icons'
import { ROLES } from '@/lib/types'

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    features: ['AI Marketing Chat', 'Content Generator', 'Basic reports'],
  },
  {
    name: 'Growth',
    price: '$99',
    features: ['Competitor analysis', 'Ad generator', 'Analytics dashboard', 'ASO optimization'],
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$299',
    features: ['Unlimited brands', 'Client workspaces', 'White-label reports', 'Team collaboration'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Dedicated AI models', 'Advanced security', 'Custom integrations'],
  },
]

const MODULE_LABELS: Record<string, string> = {
  ads: 'Ad creative',
  social: 'Social calendar',
  aso: 'ASO report',
  analytics: 'Analytics briefing',
}

type AssetRow = {
  id: string
  module: string
  platform: string
  title: string
  created_at: string
}

export default function SettingsPage() {
  const { user, workspace, capabilities } = useApp()
  const role = ROLES.find((r) => r.value === user.role)

  const [form, setForm] = useState({
    name: workspace?.name ?? '',
    industry: workspace?.industry ?? '',
    website: workspace?.website ?? '',
    audience: workspace?.audience ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [assets, setAssets] = useState<AssetRow[]>([])

  useEffect(() => {
    if (!workspace) return
    setForm({
      name: workspace.name,
      industry: workspace.industry,
      website: workspace.website,
      audience: workspace.audience,
    })
  }, [workspace])

  const loadAssets = useCallback(async () => {
    if (!workspace) return
    const res = await fetch(`/api/assets?workspaceId=${workspace.id}`)
    if (!res.ok) return
    const data = await res.json()
    setAssets(data.assets)
  }, [workspace])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!workspace) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save.')
      setMessage({ tone: 'success', text: 'Brand profile saved. Reload to see it across the app.' })
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not save.' })
    } finally {
      setSaving(false)
    }
  }

  async function removeAsset(id: string) {
    await fetch(`/api/assets?id=${id}`, { method: 'DELETE' })
    void loadAssets()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Settings"
        description="Your account, the brand profile every AI module reads from, and everything MarketPilot has generated for this workspace."
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-5 p-8">
          <Card>
            <CardHeader
              title="Brand profile"
              subtitle="Every prompt in every module is built on top of this. Keeping it accurate is the highest-leverage setting here."
            />
            <form onSubmit={save} className="space-y-4 p-5">
              {message && <Alert tone={message.tone === 'success' ? 'success' : 'error'}>{message.text}</Alert>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Workspace name">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Industry">
                  <Input
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="B2B SaaS"
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="Target audience">
                  <Input
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    placeholder="Growth teams at mid-market SaaS companies"
                  />
                </Field>
              </div>
              <Button type="submit" loading={saving}>
                Save profile
              </Button>
            </form>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Account" />
              <div className="space-y-3 p-5 text-[13px]">
                <Row label="Name" value={user.name} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={role?.label ?? user.role} />
                <p className="pt-1 text-[12px] leading-5 text-muted">{role?.blurb}</p>
              </div>
            </Card>

            <Card>
              <CardHeader title="Module access" subtitle="Enforced by the API, not just the sidebar." />
              <div className="flex flex-wrap gap-2 p-5">
                {capabilities.map((capability) => (
                  <Badge key={capability} tone="primary">
                    {capability.replace(/[:_]/g, ' ')}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Plans"
              subtitle="Billing is not wired up in this build — plans are shown for reference and every module is unlocked."
            />
            <div className="grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={clsx('bg-card p-5', plan.highlight && 'ring-1 ring-inset ring-primary/40')}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold text-ink">{plan.name}</h4>
                    {plan.highlight && <Badge tone="primary">Popular</Badge>}
                  </div>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-ink">
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-[13px] font-normal text-faint">/mo</span>}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-[12px] leading-5 text-muted">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Asset library"
              subtitle="Everything generated in this workspace, newest first."
              action={<span className="text-[11px] text-faint">{assets.length} saved</span>}
            />
            {assets.length === 0 ? (
              <EmptyState
                icon={<IconSparkles className="h-5 w-5" />}
                title="Nothing generated yet"
                description="Ad creative, social calendars, ASO reports, and analytics briefings all land here automatically."
              />
            ) : (
              <div className="divide-y divide-line">
                {assets.map((asset) => (
                  <div key={asset.id} className="group flex items-center gap-3 px-5 py-3">
                    <Badge>{MODULE_LABELS[asset.module] ?? asset.module}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink/85">{asset.title}</span>
                    <span className="shrink-0 text-[11px] text-faint">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      title="Delete asset"
                      className="rounded p-1 text-faint opacity-0 transition hover:text-error group-hover:opacity-100"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="truncate font-medium text-ink">{value}</span>
    </div>
  )
}
