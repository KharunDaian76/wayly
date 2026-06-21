'use client';

import { Container, Skeleton } from '@wayly/ui';

import { useI18n } from '@/lib/i18n/i18n-context';

export function AuthLoading() {
  const { t } = useI18n();

  return (
    <div className="wayly-app-shell flex min-h-dvh flex-col items-center justify-center">
      <Container className="flex w-full max-w-md flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-10 w-full" />
      </Container>
      <p className="mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
        {t('common.loadingSession')}
      </p>
    </div>
  );
}
