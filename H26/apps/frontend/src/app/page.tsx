'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated && user) {
      if (user.role === 'supervisor') {
        router.push('/supervisor/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, mounted, router]);

  return null;
}
