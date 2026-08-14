'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Alert, Button, Field, Input } from '@/components/ui'
import { Wordmark } from '@/components/brand'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not sign in.')
      router.push('/chat')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark size={32} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-7">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Your AI marketing team is waiting.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Work email">
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted">
          New to MarketPilot?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-secondary">
            Create a workspace
          </Link>
        </p>
      </div>
    </main>
  )
}
