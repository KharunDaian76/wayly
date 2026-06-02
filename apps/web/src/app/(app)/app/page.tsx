'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@wayly/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LanguageSelect } from '@/components/language-select';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';

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
  const { t } = useI18n();
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
      setError(t('app.signOutFailed'));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="border-b border-border/60 bg-background">
      <Container className="flex flex-col gap-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('app.signedInAs')}</p>
            <h1 className="font-display text-2xl font-bold tracking-tight">{user.displayName}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelect />
            <Button variant="outline" asChild>
              <Link href="/">{t('common.backToHome')}</Link>
            </Button>
            <Button variant="secondary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? t('app.signingOut') : t('app.signOut')}
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
            <CardTitle>{t('app.yourAccount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <StatusRow label={t('common.email')} value={user.email} />
              <StatusRow label={t('common.displayName')} value={user.displayName} />
              <StatusRow label={t('app.roles')} value={user.roles.join(', ') || t('common.none')} />
              <StatusRow
                label={t('app.verified')}
                value={user.verified ? t('common.yes') : t('common.no')}
              />
              <StatusRow label={t('app.kycStatus')} value={user.kycStatus} />
              <StatusRow
                label={t('app.phoneVerified')}
                value={user.phoneVerified ? t('common.yes') : t('common.no')}
              />
            </dl>
          </CardContent>
        </Card>

        <div
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {t('app.kycNotice')}
        </div>

        <p className="text-sm text-muted-foreground">{t('app.placeholderNotice')}</p>
      </Container>
    </div>
  );
}
