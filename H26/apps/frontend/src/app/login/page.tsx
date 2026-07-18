'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md sp-animate-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-strong))', boxShadow: '0 10px 30px -8px rgba(79,70,229,0.6)' }}
          >
            S
          </div>
          <h1 className="text-3xl font-bold text-white">SkillProof AI</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Employee &amp; Supervisor Performance Platform
          </p>
        </div>

        {/* Card */}
        <div className="sp-card">
          <h2 className="sp-heading mb-1">Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Sign in to continue to your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sp-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sp-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="sp-btn sp-btn-primary w-full mt-2">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 sp-card">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            DEMO CREDENTIALS
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillDemo('employee@example.com')}
              className="rounded-xl p-3 text-left transition-colors"
              style={{ background: 'var(--surface-3)' }}
            >
              <p className="text-xs font-semibold text-white">Employee</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>employee@example.com</p>
            </button>
            <button
              onClick={() => fillDemo('supervisor@example.com')}
              className="rounded-xl p-3 text-left transition-colors"
              style={{ background: 'var(--surface-3)' }}
            >
              <p className="text-xs font-semibold text-white">Supervisor</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>supervisor@example.com</p>
            </button>
          </div>
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Password for both: <span className="font-mono">password</span> · Click a card to autofill
          </p>
        </div>
      </div>
    </div>
  );
}
