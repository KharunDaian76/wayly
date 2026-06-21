'use client';

import { Button, Card, CardContent, CardHeader, Container, Skeleton } from '@wayly/ui';
import Link from 'next/link';

import { PanelErrorState } from '@/components/app/panel-status-states';
import { useI18n } from '@/lib/i18n/i18n-context';

const APP_PANEL_CLASS = 'wayly-app-panel';

function DashboardPanelSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <Card className={APP_PANEL_CLASS}>
      <CardHeader>
        <Skeleton className="h-5 w-40 max-w-[60%]" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        {tall ? (
          <>
            <Skeleton className="mt-2 h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : (
          <Skeleton className="mt-1 h-10 w-32" />
        )}
      </CardContent>
    </Card>
  );
}

function DashboardShellSkeleton() {
  return (
    <>
      <header
        className="wayly-app-header flex flex-col gap-4 rounded-2xl border px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        aria-hidden
      >
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-48 max-w-full sm:h-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <section className="flex flex-col gap-4" aria-hidden>
        <Skeleton className="h-6 w-36" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </section>

      <DashboardPanelSkeleton />
      <DashboardPanelSkeleton tall />
    </>
  );
}

type AppDashboardLoadingShellProps = {
  statusMessage: string;
};

export function AppDashboardLoadingShell({ statusMessage }: AppDashboardLoadingShellProps) {
  return (
    <div className="wayly-app-shell">
      <Container className="relative flex min-w-0 flex-col gap-6 py-6 sm:gap-8 sm:py-10">
        <p className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </p>
        <DashboardShellSkeleton />
        <p className="text-center text-sm text-muted-foreground" role="status" aria-live="polite">
          {statusMessage}
        </p>
      </Container>
    </div>
  );
}

type AppDashboardBootstrapErrorProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  retryDisabled?: boolean;
  returnToLoginLabel: string;
  onReturnToLogin: () => void;
  returnToLoginDisabled?: boolean;
};

export function AppDashboardBootstrapError({
  message,
  retryLabel,
  onRetry,
  retryDisabled = false,
  returnToLoginLabel,
  onReturnToLogin,
  returnToLoginDisabled = false,
}: AppDashboardBootstrapErrorProps) {
  const { t } = useI18n();

  return (
    <div className="wayly-app-shell">
      <Container className="relative flex min-w-0 flex-col gap-6 py-6 sm:gap-8 sm:py-10">
        <Card className={APP_PANEL_CLASS}>
          <CardContent className="flex flex-col gap-4 pt-6">
            <PanelErrorState
              message={message}
              retryLabel={retryLabel}
              onRetry={onRetry}
              retryDisabled={retryDisabled}
            />
            <div className="wayly-action-group flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={returnToLoginDisabled}
                onClick={onReturnToLogin}
              >
                {returnToLoginLabel}
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href="/">{t('common.backToHome')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
