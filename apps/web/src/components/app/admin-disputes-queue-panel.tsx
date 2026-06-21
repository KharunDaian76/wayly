'use client';

import type { AdminDisputeQueueItem } from '@wayly/types';
import type { UserRole } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { disputeReasonKey, disputeStatusKey } from '@/components/app/dispute-panel';
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

export type AdminDisputesQueuePanelProps = {
  roles: UserRole[];
};

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function formatRoute(item: AdminDisputeQueueItem): string {
  const pickup = [item.pickupCity, item.pickupCountry].filter(Boolean).join(', ');
  const dropoff = [item.dropoffCity, item.dropoffCountry].filter(Boolean).join(', ');
  if (pickup && dropoff) {
    return `${pickup} → ${dropoff}`;
  }
  return pickup || dropoff || '—';
}

function formatParty(displayName: string | null, email: string | null): string {
  if (displayName && email) {
    return `${displayName} (${email})`;
  }
  return displayName ?? email ?? '—';
}

export function AdminDisputesQueuePanel({ roles }: AdminDisputesQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminDisputeQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listDisputes({ page: 1, limit: 50 });
      setItems(response.items);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.disputesLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadDisputes();
    }
  }, [roles, loadDisputes]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const showEmpty = loadedOnce && !loadError && items.length === 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2"
      aria-labelledby="admin-disputes-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-disputes-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.disputesQueueTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.disputesQueueBody')}</p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retryDisputes')}
            onRetry={() => void loadDisputes()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">{t('app.admin.disputesLoading')}</p>
            <RequestsListSkeleton rows={3} itemClassName="h-24 w-full rounded-lg" />
          </div>
        ) : null}

        {showEmpty ? (
          <PanelEmptyState
            title={t('app.admin.noDisputesTitle')}
            body={t('app.admin.noDisputesBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => (
              <li key={item.id} className={LISTING_CARD_CLASS}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {item.orderTitle?.trim() || t('app.admin.disputeOrderFallback')}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t('app.admin.disputeOrder')}: {item.orderId}
                    </p>
                  </div>
                  <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                    {t(disputeStatusKey(item.status))}
                  </span>
                </div>

                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.disputeReason')}</dt>
                    <dd className="font-medium">{t(disputeReasonKey(item.reason))}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.disputeOpened')}</dt>
                    <dd>{formatDateTime(item.openedAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.disputeRoute')}</dt>
                    <dd className="text-right sm:max-w-[60%]">{formatRoute(item)}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t border-border/40 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('app.admin.disputeParties')}
                  </p>
                  <dl className="mt-2 flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.sender')}</dt>
                      <dd className="break-all text-right sm:max-w-[65%]">
                        {formatParty(item.senderDisplayName, item.senderEmail)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.wayler')}</dt>
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
              onClick={() => void loadDisputes()}
            >
              {loading ? t('app.admin.disputesLoading') : t('app.admin.refreshDisputes')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
