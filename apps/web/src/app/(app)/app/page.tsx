'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@wayly/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/lib/auth/auth-context';

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function AppHomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setError(null);
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setError('Sign out failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="border-b border-border/60 bg-background">
      <Container className="flex flex-col gap-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Signed in as</p>
            <h1 className="font-display text-2xl font-bold tracking-tight">{user.displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button variant="secondary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <StatusRow label="Email" value={user.email} />
              <StatusRow label="Display name" value={user.displayName} />
              <StatusRow label="Roles" value={user.roles.join(', ') || '—'} />
              <StatusRow label="Verified" value={user.verified ? 'Yes' : 'No'} />
              <StatusRow label="KYC status" value={user.kycStatus} />
              <StatusRow label="Phone verified" value={user.phoneVerified ? 'Yes' : 'No'} />
            </dl>
          </CardContent>
        </Card>

        <div
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Verification will be required before creating deliveries, browsing orders, chatting, or
          accepting orders.
        </div>

        <p className="text-sm text-muted-foreground">
          This is a placeholder app shell. Orders, trips, chat, and payments arrive in later
          milestones.
        </p>
      </Container>
    </div>
  );
}
