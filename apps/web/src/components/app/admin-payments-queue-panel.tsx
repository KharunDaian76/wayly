'use client';

import type { AdminPaymentQueueItem, UserRole } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { adminPaymentStatusKey } from '@/components/app/admin-orders-queue-panel';
import { disputeStatusKey } from '@/components/app/dispute-panel';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

export type AdminPaymentsQueuePanelProps = {
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

function formatParty(displayName: string | null, email: string | null): string {
  if (displayName && email) {
    return `${displayName} (${email})`;
  }
  return displayName ?? email ?? '—';
}

function formatAmount(currency: string, amount: string): string {
  return `${currency} ${amount}`;
}

export function AdminPaymentsQueuePanel({ roles }: AdminPaymentsQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminPaymentQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listPayments({ page: 1, limit: 50 });
      setItems(response.items);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.paymentsLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadPayments();
    }
  }, [roles, loadPayments]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const showEmpty = loadedOnce && !loadError && items.length === 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2"
      aria-labelledby="admin-payments-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-payments-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.paymentsQueueTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.paymentsQueueDescription')}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retryPayments')}
            onRetry={() => void loadPayments()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">{t('app.admin.paymentsLoading')}</p>
            <RequestsListSkeleton rows={3} itemClassName="h-28 w-full rounded-lg" />
          </div>
        ) : null}

        {showEmpty ? (
          <PanelEmptyState
            title={t('app.admin.noPaymentsTitle')}
            body={t('app.admin.noPaymentsBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => (
              <li key={item.id} className={LISTING_CARD_CLASS}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {formatAmount(item.currency, item.amount)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.orderTitle?.trim() || t('app.admin.disputeOrderFallback')}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t('app.admin.paymentOrder')}: {item.orderId}
                    </p>
                  </div>
                  <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                    {t(adminPaymentStatusKey(item.status))}
                  </span>
                </div>

                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.paymentAmount')}</dt>
                    <dd className="font-medium">{formatAmount(item.currency, item.amount)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.platformFee')}</dt>
                    <dd className="font-medium">
                      {item.platformFeeAmount
                        ? formatAmount(item.currency, item.platformFeeAmount)
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.escrowState')}</dt>
                    <dd className="font-medium">{t(adminPaymentStatusKey(item.status))}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.paymentCreated')}</dt>
                    <dd>{formatDateTime(item.createdAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.paymentUpdated')}</dt>
                    <dd>{formatDateTime(item.updatedAt)}</dd>
                  </div>
                  {item.escrowedAt ? (
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.escrowHeldAt')}</dt>
                      <dd>{formatDateTime(item.escrowedAt)}</dd>
                    </div>
                  ) : null}
                  {item.releasedAt ? (
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.escrowReleasedAt')}</dt>
                      <dd>{formatDateTime(item.releasedAt)}</dd>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.paymentDisputeStatus')}</dt>
                    <dd className="font-medium">
                      {item.latestDisputeStatus
                        ? t(disputeStatusKey(item.latestDisputeStatus))
                        : '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 border-t border-border/40 pt-3">
                  <dl className="flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.paymentSender')}</dt>
                      <dd className="break-all text-right sm:max-w-[65%]">
                        {formatParty(item.senderDisplayName, item.senderEmail)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.paymentWayler')}</dt>
                      <dd className="break-all text-right sm:max-w-[65%]">
                        {formatParty(item.waylerDisplayName, item.waylerEmail)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {!showInitialLoading && items.length > 0 && !loadError ? (
          <div className="flex justify-end px-3 pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
              onClick={() => void loadPayments()}
            >
              {loading ? t('app.admin.paymentsLoading') : t('app.admin.refreshPayments')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
