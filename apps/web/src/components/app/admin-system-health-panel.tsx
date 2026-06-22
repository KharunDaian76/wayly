'use client';

import type {
  AdminHealthComponentStatus,
  AdminSystemHealthResponse,
  AdminSystemOverallStatus,
  UserRole,
} from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { adminPaymentStatusKey } from '@/components/app/admin-orders-queue-panel';
import { PanelErrorState, RequestsListSkeleton } from '@/components/app/panel-status-states';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const CARD_CLASS = cn('wayly-order-card rounded-xl px-4 py-4 text-sm', 'wayly-feed-item-enter');

export type AdminSystemHealthPanelProps = {
  roles: UserRole[];
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function componentStatusKey(status: AdminHealthComponentStatus): TranslationKey {
  if (status === 'ok') {
    return 'app.admin.statusHealthy';
  }
  if (status === 'degraded' || status === 'error') {
    return 'app.admin.statusDegraded';
  }
  return 'app.admin.statusUnknown';
}

function overallStatusKey(status: AdminSystemOverallStatus): TranslationKey {
  if (status === 'healthy') {
    return 'app.admin.statusHealthy';
  }
  if (status === 'degraded') {
    return 'app.admin.statusDegraded';
  }
  return 'app.admin.statusUnknown';
}

function overallStatusBadgeClass(status: AdminSystemOverallStatus): string {
  if (status === 'healthy') {
    return 'wayly-status-delivered';
  }
  if (status === 'degraded') {
    return 'wayly-status-cancelled';
  }
  return 'wayly-status-default';
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium sm:text-right">{value}</dd>
    </div>
  );
}

export function AdminSystemHealthPanel({ roles }: AdminSystemHealthPanelProps) {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<AdminSystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadSystemHealth = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.getSystemHealth();
      setSnapshot(response);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.systemHealthLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadSystemHealth();
    }
  }, [roles, loadSystemHealth]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2"
      aria-labelledby="admin-system-health-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-system-health-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.systemHealthTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.systemHealthDescription')}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retrySystemHealth')}
            onRetry={() => void loadSystemHealth()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">
              {t('app.admin.systemHealthLoading')}
            </p>
            <RequestsListSkeleton rows={2} itemClassName="h-24 w-full rounded-lg" />
          </div>
        ) : null}

        {!showInitialLoading && !loadError && snapshot ? (
          <div className="flex flex-col gap-2 px-2 pb-2">
            <div className={CARD_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{t('app.admin.systemHealthTitle')}</p>
                <span
                  className={cn(
                    'wayly-status-badge shrink-0 text-xs',
                    overallStatusBadgeClass(snapshot.overallStatus),
                  )}
                >
                  {t(overallStatusKey(snapshot.overallStatus))}
                </span>
              </div>

              <dl className="mt-3 flex flex-col gap-1.5">
                <HealthRow
                  label={t('app.admin.apiStatus')}
                  value={t(componentStatusKey(snapshot.apiStatus))}
                />
                <HealthRow
                  label={t('app.admin.databaseStatus')}
                  value={t(componentStatusKey(snapshot.databaseStatus))}
                />
                <HealthRow
                  label={t('app.admin.lastChecked')}
                  value={formatDateTime(snapshot.checkedAt)}
                />
                <HealthRow label={t('app.admin.environment')} value={snapshot.environment} />
                {snapshot.appVersion ? (
                  <HealthRow label={t('app.admin.appVersion')} value={snapshot.appVersion} />
                ) : null}
              </dl>
            </div>

            {snapshot.operationalCounts ? (
              <div className={CARD_CLASS}>
                <p className="font-medium text-foreground">{t('app.admin.operationalCounts')}</p>
                <dl className="mt-3 flex flex-col gap-1.5">
                  <HealthRow
                    label={t('app.admin.usersCount')}
                    value={String(snapshot.operationalCounts.usersCount)}
                  />
                  <HealthRow
                    label={t('app.admin.pendingKycCount')}
                    value={String(snapshot.operationalCounts.pendingKycCount)}
                  />
                  <HealthRow
                    label={t('app.admin.openOrdersCount')}
                    value={String(snapshot.operationalCounts.openOrdersCount)}
                  />
                  <HealthRow
                    label={t('app.admin.openDisputesCount')}
                    value={String(snapshot.operationalCounts.openDisputesCount)}
                  />
                </dl>

                {snapshot.operationalCounts.paymentIntentsByStatus.length > 0 ? (
                  <div className="mt-3 border-t border-border/40 pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {t('app.admin.paymentsCount')}
                    </p>
                    <dl className="flex flex-col gap-1.5">
                      {snapshot.operationalCounts.paymentIntentsByStatus.map((row) => (
                        <HealthRow
                          key={row.status}
                          label={t(adminPaymentStatusKey(row.status))}
                          value={String(row.count)}
                        />
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            ) : null}

            {snapshot.recentActivity ? (
              <div className={CARD_CLASS}>
                <p className="font-medium text-foreground">{t('app.admin.recentActivity')}</p>
                <dl className="mt-3 flex flex-col gap-1.5">
                  <HealthRow
                    label={t('app.admin.latestUser')}
                    value={formatDateTime(snapshot.recentActivity.latestUserCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestOrder')}
                    value={formatDateTime(snapshot.recentActivity.latestOrderCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestDispute')}
                    value={formatDateTime(snapshot.recentActivity.latestDisputeCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestPayment')}
                    value={formatDateTime(snapshot.recentActivity.latestPaymentCreatedAt)}
                  />
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}

        {!showInitialLoading && snapshot && !loadError ? (
          <div className="flex justify-end px-3 pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
              onClick={() => void loadSystemHealth()}
            >
              {loading ? t('app.admin.systemHealthLoading') : t('app.admin.refreshSystemHealth')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
