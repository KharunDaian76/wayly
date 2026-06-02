'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthLoading } from '@/components/auth/auth-loading';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Authenticated app shell. Hydrates session via httpOnly refresh cookie on load,
 * then guards child routes (e.g. /app) from unauthenticated access.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <AuthLoading />;
  }

  if (status === 'unauthenticated') {
    return <AuthLoading />;
  }

  return <div className="min-h-dvh">{children}</div>;
}
