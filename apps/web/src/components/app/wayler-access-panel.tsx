'use client';

import type { WaylerAccessPassSummary, WaylerAccessState } from '@wayly/types';
import { WaylerAccessPassStatus } from '@wayly/types';
import { Button, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { KycMarketplaceGateNotice, type KycGateProps } from '@/components/app/kyc-marketplace-gate';
import { demoToolsEnabled } from '@/lib/demo-tools';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

type WaylerAccessPanelProps = {
  kycGate: KycGateProps;
  onAccessChanged?: (hasActiveAccess: boolean) => void;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function formatAmount(currency: string, amount: string): string {
  return `${currency} ${amount}`;
}

function accessStatusKey(status: WaylerAccessPassStatus): TranslationKey {
  switch (status) {
    case WaylerAccessPassStatus.PENDING:
      return 'app.waylerAccess.pending';
    case WaylerAccessPassStatus.ACTIVE:
      return 'app.waylerAccess.active';
    case WaylerAccessPassStatus.EXPIRED:
      return 'app.waylerAccess.expired';
    case WaylerAccessPassStatus.CANCELLED:
      return 'app.waylerAccess.cancelled';
    case WaylerAccessPassStatus.REFUNDED:
      return 'app.waylerAccess.refunded';
    case WaylerAccessPassStatus.FAILED:
      return 'app.waylerAccess.failed';
    default:
      return 'app.waylerAccess.status';
  }
}

function accessStatusBadgeClass(status: WaylerAccessPassStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAccessPassStatus.PENDING:
      return cn(base, 'wayly-status-default');
    case WaylerAccessPassStatus.ACTIVE:
      return cn(base, 'wayly-status-open');
    case WaylerAccessPassStatus.EXPIRED:
      return cn(base, 'wayly-status-cancelled');
    case WaylerAccessPassStatus.CANCELLED:
      return cn(base, 'wayly-status-cancelled');
    case WaylerAccessPassStatus.REFUNDED:
      return cn(base, 'wayly-status-default');
    case WaylerAccessPassStatus.FAILED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function PassHistoryRow({
  pass,
  t,
}: {
  pass: WaylerAccessPassSummary;
  t: (key: TranslationKey) => string;
}) {
  return (
    <li className={LISTING_CARD_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={accessStatusBadgeClass(pass.status)}>
          {t(accessStatusKey(pass.status))}
        </span>
        <span className="text-xs text-muted-foreground">{pass.provider}</span>
      </div>
      <dl className="mt-3 flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-muted-foreground">{t('app.waylerAccess.amount')}</dt>
          <dd>{formatAmount(pass.currency, pass.amount)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-muted-foreground">{t('app.waylerAccess.accessDate')}</dt>
          <dd>{formatDateTime(pass.accessDate)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-muted-foreground">{t('app.waylerAccess.startsAt')}</dt>
          <dd>{formatDateTime(pass.startsAt)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-muted-foreground">{t('app.waylerAccess.expiresAt')}</dt>
          <dd>{formatDateTime(pass.expiresAt)}</dd>
        </div>
        {pass.activatedAt ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground">{t('app.waylerAccess.activatedAt')}</dt>
            <dd>{formatDateTime(pass.activatedAt)}</dd>
          </div>
        ) : null}
        {pass.cancelledAt ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground">{t('app.waylerAccess.cancelledAt')}</dt>
            <dd>{formatDateTime(pass.cancelledAt)}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

export function WaylerAccessPanel({ kycGate, onAccessChanged }: WaylerAccessPanelProps) {
  const { t } = useI18n();
  const { isApproved, kycLoading } = kycGate;

  const [accessState, setAccessState] = useState<WaylerAccessState | null>(null);
  const [history, setHistory] = useState<WaylerAccessPassSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateSuccess, setActivateSuccess] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!isApproved) {
      setAccessState(null);
      setHistory([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [todayResult, mineResult] = await Promise.all([
        api.waylerAccess.today(),
        api.waylerAccess.mine({ limit: 10 }),
      ]);
      setAccessState(todayResult);
      setHistory(mineResult.items);
    } catch {
      setLoadError(t('app.waylerAccess.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [isApproved, t]);

  useEffect(() => {
    if (!kycLoading && isApproved) {
      void loadAccess();
    }
  }, [kycLoading, isApproved, loadAccess]);

  useEffect(() => {
    if (accessState && onAccessChanged) {
      onAccessChanged(accessState.hasActiveAccess);
    }
  }, [accessState, onAccessChanged]);

  const handleMockActivate = async () => {
    if (!isApproved || activating) {
      return;
    }
    setActivating(true);
    setActivateError(null);
    setActivateSuccess(false);
    setCancelError(null);
    setCancelSuccess(false);
    try {
      await api.waylerAccess.mockActivateToday();
      setActivateSuccess(true);
      await loadAccess();
    } catch {
      setActivateError(t('app.waylerAccess.activateFailed'));
    } finally {
      setActivating(false);
    }
  };

  const handleCancel = async () => {
    const activePass = accessState?.activePass;
    if (
      !isApproved ||
      cancelling ||
      !activePass ||
      activePass.status !== WaylerAccessPassStatus.ACTIVE
    ) {
      return;
    }
    setCancelling(true);
    setCancelError(null);
    setCancelSuccess(false);
    setActivateError(null);
    setActivateSuccess(false);
    try {
      await api.waylerAccess.cancel(activePass.id);
      setCancelSuccess(true);
      await loadAccess();
    } catch {
      setCancelError(t('app.waylerAccess.cancelFailed'));
    } finally {
      setCancelling(false);
    }
  };

  const hasActiveAccess = accessState?.hasActiveAccess ?? false;
  const activePass = accessState?.activePass ?? null;
  const showCancel = hasActiveAccess && activePass?.status === WaylerAccessPassStatus.ACTIVE;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('app.waylerAccess.subtitle')}</p>

      {!isApproved ? <KycMarketplaceGateNotice {...kycGate} /> : null}

      {isApproved ? (
        <>
          {loadError ? <p className={ALERT_ERROR_CLASS}>{loadError}</p> : null}

          {loading && !accessState ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-48" />
            </div>
          ) : accessState ? (
            <div className={LISTING_CARD_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{t('app.waylerAccess.status')}</span>
                <span
                  className={cn(
                    'wayly-status-badge',
                    hasActiveAccess ? 'wayly-status-open' : 'wayly-status-default',
                  )}
                >
                  {hasActiveAccess ? t('app.waylerAccess.active') : t('app.waylerAccess.inactive')}
                </span>
              </div>

              {hasActiveAccess && activePass ? (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t('app.waylerAccess.activeNote')}
                  </p>
                  <dl className="mt-3 flex flex-col gap-1.5">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.waylerAccess.expiresAt')}</dt>
                      <dd>{formatDateTime(activePass.expiresAt)}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.waylerAccess.amount')}</dt>
                      <dd>{formatAmount(activePass.currency, activePass.amount)}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.waylerAccess.provider')}</dt>
                      <dd>{activePass.provider}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t('app.waylerAccess.demoAccessCardTitle')}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('app.waylerAccess.demoAccessCardBody')}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('app.waylerAccess.demoAccessCardNote')}
                    </p>
                    {demoToolsEnabled ? (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          disabled={activating || loading}
                          onClick={() => void handleMockActivate()}
                        >
                          {activating
                            ? t('app.waylerAccess.activating')
                            : t('app.waylerAccess.activateDemoAccess')}
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {t('app.waylerAccess.manualOnlyNote')}
                      </p>
                    )}
                  </div>
                </>
              )}

              {demoToolsEnabled ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t('app.waylerAccess.manualOnlyNote')}
                </p>
              ) : null}

              {activateError ? (
                <p className={cn('mt-3', ALERT_ERROR_CLASS)}>{activateError}</p>
              ) : null}
              {activateSuccess ? (
                <p className={cn('mt-3', ALERT_SUCCESS_CLASS)} role="status">
                  {t('app.waylerAccess.activateSuccess')}
                </p>
              ) : null}
              {cancelError ? <p className={cn('mt-3', ALERT_ERROR_CLASS)}>{cancelError}</p> : null}
              {cancelSuccess ? (
                <p className={cn('mt-3', ALERT_SUCCESS_CLASS)} role="status">
                  {t('app.waylerAccess.cancelSuccess')}
                </p>
              ) : null}

              {showCancel ? (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelling || loading}
                    onClick={() => void handleCancel()}
                  >
                    {cancelling ? t('app.waylerAccess.cancelling') : t('app.waylerAccess.cancel')}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{t('app.waylerAccess.historyTitle')}</h3>
            {loading && history.length === 0 ? (
              <div className="flex flex-col gap-2" aria-busy="true">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('app.waylerAccess.historyEmpty')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {history.map((pass) => (
                  <PassHistoryRow key={pass.id} pass={pass} t={t} />
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
