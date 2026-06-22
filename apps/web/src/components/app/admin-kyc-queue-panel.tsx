'use client';

import type { AdminKycQueueItem, KycStatus, UserRole } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

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

export type AdminKycQueuePanelProps = {
  roles: UserRole[];
};

export function adminKycStatusKey(status: KycStatus): TranslationKey {
  return `app.admin.kycVerificationStatus.${status}` as TranslationKey;
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

function formatUser(displayName: string | null, email: string | null): string {
  if (displayName && email) {
    return `${displayName} (${email})`;
  }
  return displayName ?? email ?? '—';
}

export function AdminKycQueuePanel({ roles }: AdminKycQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminKycQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadKycQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listKycVerifications({ page: 1, limit: 50 });
      setItems(response.items);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.kycQueueLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadKycQueue();
    }
  }, [roles, loadKycQueue]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const showEmpty = loadedOnce && !loadError && items.length === 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2"
      aria-labelledby="admin-kyc-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-kyc-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.kycReviewTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.kycReviewBody')}</p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retryKycQueue')}
            onRetry={() => void loadKycQueue()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">{t('app.admin.kycQueueLoading')}</p>
            <RequestsListSkeleton rows={3} itemClassName="h-24 w-full rounded-lg" />
          </div>
        ) : null}

        {showEmpty ? (
          <PanelEmptyState
            title={t('app.admin.noKycReviewsTitle')}
            body={t('app.admin.noKycReviewsBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => (
              <li key={item.id} className={LISTING_CARD_CLASS}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {formatUser(item.userDisplayName, item.userEmail)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t('app.admin.kycUser')}: {item.userId}
                    </p>
                  </div>
                  <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                    {t(adminKycStatusKey(item.status))}
                  </span>
                </div>

                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.kycCountry')}</dt>
                    <dd className="font-medium">{item.country?.trim() || '—'}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.kycSubmitted')}</dt>
                    <dd>{formatDateTime(item.submittedAt ?? item.createdAt)}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">{t('app.admin.kycUpdated')}</dt>
                    <dd>{formatDateTime(item.reviewedAt ?? item.updatedAt)}</dd>
                  </div>
                  {item.rejectionReason?.trim() ? (
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.rejectionReason')}</dt>
                      <dd className="break-words text-right sm:max-w-[65%]">
                        {item.rejectionReason}
                      </dd>
                    </div>
                  ) : null}
                </dl>
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
              onClick={() => void loadKycQueue()}
            >
              {loading ? t('app.admin.kycQueueLoading') : t('app.admin.refreshKycQueue')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
