'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Alert, Button, Field, Input } from '@/components/ui'
import { Wordmark } from '@/components/brand'
import { ROLES, type Role } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'founder' as Role,
    workspaceName: '',
    industry: '',
    website: '',
    audience: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  function next(event: React.FormEvent) {
    event.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(null)
    setStep(2)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create your workspace.')
      router.push('/chat')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your workspace.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Wordmark size={32} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">
              {step === 1 ? 'Create your account' : 'Set up your workspace'}
            </h1>
            <span className="text-xs font-medium text-faint">Step {step} of 2</span>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {step === 1
              ? 'One login for chat, competitor intel, ads, social, ASO, and analytics.'
              : 'The AI uses this to tailor every campaign, report, and recommendation.'}
          </p>

          {step === 1 ? (
            <form onSubmit={next} className="mt-6 space-y-4">
              {error && <Alert>{error}</Alert>}
              <Field label="Full name">
                <Input required value={form.name} onChange={set('name')} placeholder="Alex Rivera" />
              </Field>
              <Field label="Work email">
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@company.com"
                />
              </Field>
              <Field label="Password" hint="At least 8 characters.">
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                />
              </Field>

              <div>
                <span className="mb-2 block text-[13px] font-medium text-ink/80">Your role</span>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                        form.role === role.value
                          ? 'border-primary-border bg-primary-soft'
                          : 'border-line bg-canvas hover:border-line/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        className="mt-1 accent-primary"
                        checked={form.role === role.value}
                        onChange={() => setForm((f) => ({ ...f, role: role.value }))}
                      />
                      <span>
                        <span className="block text-[13px] font-medium text-ink">{role.label}</span>
                        <span className="block text-xs leading-5 text-muted">{role.blurb}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && <Alert>{error}</Alert>}
              <Field label="Brand or company name">
                <Input
                  required
                  value={form.workspaceName}
                  onChange={set('workspaceName')}
                  placeholder="Northwind Analytics"
                />
              </Field>
              <Field label="Industry" hint="Optional, but it sharpens every AI output.">
                <Input value={form.industry} onChange={set('industry')} placeholder="B2B SaaS" />
              </Field>
              <Field label="Website">
                <Input value={form.website} onChange={set('website')} placeholder="https://example.com" />
              </Field>
              <Field label="Target audience">
                <Input
                  value={form.audience}
                  onChange={set('audience')}
                  placeholder="Growth teams at mid-market SaaS companies"
                />
              </Field>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Create workspace
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[13px] text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-secondary">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
