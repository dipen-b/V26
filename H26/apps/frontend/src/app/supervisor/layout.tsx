'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'supervisor') {
      router.push('/employee/dashboard');
    } else if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'supervisor') {
    return null;
  }

  return (
    <div className="flex bg-slate-950 h-screen">
      <Sidebar role="supervisor" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
