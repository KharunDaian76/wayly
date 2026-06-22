'use client';

import type {
  AdminOrderQueueItem,
  DeliveryOrderSource,
  DeliveryOrderStatus,
  PaymentStatus,
  UserRole,
} from '@wayly/types';
import { DeliveryOrderSource as DeliveryOrderSourceEnum } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { disputeStatusKey } from '@/components/app/dispute-panel';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

export type AdminOrdersQueuePanelProps = {
  roles: UserRole[];
};

export function adminOrderStatusKey(status: DeliveryOrderStatus): TranslationKey {
  return `app.admin.orderStatus.${status}` as TranslationKey;
}

export function adminPaymentStatusKey(status: PaymentStatus): TranslationKey {
  return `app.admin.paymentStatus.${status}` as TranslationKey;
}

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

function formatRoute(item: AdminOrderQueueItem, routeSeparator: string): string {
  const pickup = [item.pickupCity, item.pickupCountry].filter(Boolean).join(', ');
  const dropoff = [item.dropoffCity, item.dropoffCountry].filter(Boolean).join(', ');
  if (pickup && dropoff) {
    return `${pickup} ${routeSeparator} ${dropoff}`;
  }
  return pickup || dropoff || '—';
}

function formatParty(displayName: string | null, email: string | null): string {
  if (displayName && email) {
    return `${displayName} (${email})`;
  }
  return displayName ?? email ?? '—';
}

function formatReward(item: AdminOrderQueueItem, rewardNoneLabel: string): string {
  if (!item.offeredRewardAmount) {
    return rewardNoneLabel;
  }
  return `${item.currency} ${item.offeredRewardAmount}`;
}

function sourceTypeLabel(
  sourceType: DeliveryOrderSource,
  t: (key: TranslationKey) => string,
): string {
  if (sourceType === DeliveryOrderSourceEnum.WAYLER_AVAILABILITY_REQUEST) {
    return t('app.orders.fromWaylerRequest');
  }
  return t('app.orders.postedOrder');
}

export function AdminOrdersQueuePanel({ roles }: AdminOrdersQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminOrderQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listOrders({ page: 1, limit: 50 });
      setItems(response.items);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.ordersLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadOrders();
    }
  }, [roles, loadOrders]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const showEmpty = loadedOnce && !loadError && items.length === 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2"
      aria-labelledby="admin-orders-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-orders-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.ordersMonitoringTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.ordersMonitoringBody')}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retryOrders')}
            onRetry={() => void loadOrders()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">{t('app.admin.ordersLoading')}</p>
            <RequestsListSkeleton rows={3} itemClassName="h-28 w-full rounded-lg" />
          </div>
        ) : null}

        {showEmpty ? (
          <PanelEmptyState
            title={t('app.admin.noOrdersTitle')}
            body={t('app.admin.noOrdersBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => (
              <li key={item.id} className={LISTING_CARD_CLASS}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t('app.orders.orderReference')}: {item.id}
                    </p>
                  </div>
                  <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                    {t(adminOrderStatusKey(item.status))}
                  </span>
                </div>

                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.orderSource')}</dt>
                    <dd className="font-medium">{sourceTypeLabel(item.sourceType, t)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.orderRoute')}</dt>
                    <dd className="text-right sm:max-w-[60%]">
                      {formatRoute(item, t('app.orders.routeSeparator'))}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.orderReward')}</dt>
                    <dd className="font-medium">
                      {formatReward(item, t('app.orders.rewardNone'))}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.orderCreated')}</dt>
                    <dd>{formatDateTime(item.createdAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.orderUpdated')}</dt>
                    <dd>{formatDateTime(item.updatedAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.paymentStatus')}</dt>
                    <dd className="font-medium">
                      {item.paymentStatus ? t(adminPaymentStatusKey(item.paymentStatus)) : '—'}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.disputeStatus')}</dt>
                    <dd className="font-medium">
                      {item.latestDisputeStatus
                        ? t(disputeStatusKey(item.latestDisputeStatus))
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.proofStatus')}</dt>
                    <dd className="font-medium">
                      {item.proofSubmitted
                        ? t('app.admin.proofStatusSubmitted')
                        : t('app.admin.proofStatusNone')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 border-t border-border/40 pt-3">
                  <dl className="flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.orderSender')}</dt>
                      <dd className="break-all text-right sm:max-w-[65%]">
                        {formatParty(item.senderDisplayName, item.senderEmail)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.orderWayler')}</dt>
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
              onClick={() => void loadOrders()}
            >
              {loading ? t('app.admin.ordersLoading') : t('app.admin.refreshOrders')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
