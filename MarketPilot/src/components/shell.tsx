'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'
import { useApp } from './app-provider'
import { Wordmark } from './brand'
import { Button, Field, Input, Alert } from './ui'
import type { Capability } from '@/lib/types'
import {
  IconChart,
  IconChat,
  IconChevron,
  IconLogout,
  IconMegaphone,
  IconMobile,
  IconPlus,
  IconRadar,
  IconSettings,
  IconSparkles,
  IconTarget,
} from './icons'

const NAV: { href: string; label: string; capability: Capability | null; Icon: typeof IconChat }[] = [
  { href: '/chat', label: 'AI Chat', capability: 'chat', Icon: IconChat },
  { href: '/competitors', label: 'Competitor Intel', capability: 'competitors', Icon: IconRadar },
  { href: '/intelligence', label: 'Market Intelligence', capability: 'intelligence', Icon: IconTarget },
  { href: '/ads', label: 'Ad Creative', capability: 'ads', Icon: IconMegaphone },
  { href: '/social', label: 'Social Studio', capability: 'social', Icon: IconSparkles },
  { href: '/aso', label: 'ASO Optimizer', capability: 'aso', Icon: IconMobile },
  { href: '/analytics', label: 'Analytics', capability: 'analytics', Icon: IconChart },
  { href: '/settings', label: 'Settings', capability: null, Icon: IconSettings },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, can } = useApp()
  const visible = NAV.filter((item) => item.capability === null || can(item.capability))

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-line bg-card/40">
        <div className="px-5 py-5">
          <Wordmark />
        </div>

        <WorkspaceSwitcher />

        <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
          {visible.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition',
                  active ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-elevated hover:text-ink',
                )}
              >
                <Icon className={clsx('h-[18px] w-[18px]', active ? 'text-primary' : 'text-faint')} />
                {label}
              </Link>
            )
          })}
        </nav>

        <UserMenu name={user.name} role={user.role} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}

function WorkspaceSwitcher() {
  const { workspaces, workspace, setWorkspaceId, can } = useApp()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  if (!workspace) return null

  return (
    <div className="relative px-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5 text-left transition hover:border-primary/40"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary to-secondary text-[11px] font-semibold text-white">
          {workspace.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{workspace.name}</span>
          <span className="block truncate text-[11px] text-faint">
            {workspace.is_client ? 'Client workspace' : workspace.industry || 'Workspace'}
          </span>
        </span>
        <IconChevron className={clsx('h-4 w-4 shrink-0 text-faint transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 z-30 mt-1 animate-fade-up overflow-hidden rounded-lg border border-line bg-elevated shadow-xl shadow-black/40">
          <div className="max-h-64 overflow-y-auto p-1">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setWorkspaceId(w.id)
                  setOpen(false)
                }}
                className={clsx(
                  'flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[13px] transition',
                  w.id === workspace.id ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-card hover:text-ink',
                )}
              >
                <span className="truncate">{w.name}</span>
                {w.is_client === 1 && <span className="ml-auto text-[10px] text-faint">CLIENT</span>}
              </button>
            ))}
          </div>
          {can('workspace:create') && (
            <button
              onClick={() => {
                setCreating(true)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-[13px] text-primary transition hover:bg-card"
            >
              <IconPlus className="h-4 w-4" />
              New workspace
            </button>
          )}
        </div>
      )}

      {creating && <NewWorkspaceDialog onClose={() => setCreating(false)} />}
    </div>
  )
}

function NewWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const { addWorkspace, can } = useApp()
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, isClient }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create the workspace.')
      addWorkspace(data.workspace)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the workspace.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm animate-fade-up space-y-4 rounded-2xl border border-line bg-card p-6"
      >
        <div>
          <h2 className="text-sm font-semibold tracking-tight">New workspace</h2>
          <p className="mt-1 text-[13px] text-muted">Each workspace has its own chats, assets, and analytics.</p>
        </div>
        {error && <Alert>{error}</Alert>}
        <Field label="Name">
          <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Fitness" />
        </Field>
        <Field label="Industry">
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Consumer mobile app" />
        </Field>
        {can('workspace:clients') && (
          <label className="flex items-center gap-2.5 text-[13px] text-ink/85">
            <input
              type="checkbox"
              className="accent-primary"
              checked={isClient}
              onChange={(e) => setIsClient(e.target.checked)}
            />
            This is a client workspace
          </label>
        )}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Create
          </Button>
        </div>
      </form>
    </div>
  )
}

function UserMenu({ name, role }: { name: string; role: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated text-[11px] font-semibold text-ink">
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-ink">{name}</span>
        <span className="block truncate text-[11px] capitalize text-faint">{role.replace(/_/g, ' ')}</span>
      </span>
      <button
        onClick={signOut}
        disabled={busy}
        title="Sign out"
        className="rounded p-1.5 text-faint transition hover:bg-elevated hover:text-ink"
      >
        <IconLogout className="h-4 w-4" />
      </button>
    </div>
  )
}
