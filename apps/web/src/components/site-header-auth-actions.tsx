'use client';

import Link from 'next/link';

import { EnvDiagnosticsBadge } from '@/components/app/env-diagnostics-badge';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';

export function SiteHeaderAuthActions() {
  const { status, user } = useAuth();
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <EnvDiagnosticsBadge />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {t('common.loading')}
        </span>
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <div className="flex items-center gap-2">
        <EnvDiagnosticsBadge />
        <span
          className="hidden max-w-[140px] truncate rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground lg:inline-block"
          title={user.email}
        >
          {user.displayName}
        </span>
        <Link
          href="/app"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
        >
          {t('marketing.trustCenter.openApp')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <EnvDiagnosticsBadge />
      <Link
        href="/login"
        className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary sm:inline-flex"
      >
        {t('login.signIn')}
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
      >
        {t('marketing.landing.getStarted')}
      </Link>
    </div>
  );
}
