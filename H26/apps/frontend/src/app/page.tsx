'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const route = async () => {
      // Hydrate the store from localStorage before deciding where to go
      await initializeAuth();

      const { isAuthenticated, user } = useAuthStore.getState();

      if (isAuthenticated && user) {
        if (user.role === 'supervisor') {
          router.replace('/supervisor/dashboard');
        } else {
          router.replace('/employee/dashboard');
        }
      } else {
        router.replace('/login');
      }
    };
    route();
  }, [initializeAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-xl font-bold animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-strong))' }}
        >
          S
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading SkillProof AI…</p>
      </div>
    </div>
  );
}
