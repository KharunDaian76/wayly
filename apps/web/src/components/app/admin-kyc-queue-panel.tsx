'use client';

import type { AdminKycQueueItem, KycStatus, UserRole } from '@wayly/types';
import { KycStatus as KycStatusEnum } from '@wayly/types';
import type { KycVerificationsListQuery } from '@wayly/sdk';
import { Button, Input } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef, AdminTriageRequest } from '@/lib/admin/admin-triage';
import { useAdminTriageEffect } from '@/lib/admin/admin-triage';

import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import { safePanelErrorMessage } from '@/lib/api/safe-error-message';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

const FILTER_SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const FILTER_INPUT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const QUEUE_PAGE_LIMIT = 50;

const KYC_STATUS_OPTIONS = Object.values(KycStatusEnum);

type KycFilterForm = {
  status: KycStatus | '';
  userId: string;
  country: string;
};

const DEFAULT_KYC_FILTER_FORM: KycFilterForm = {
  status: '',
  userId: '',
  country: '',
};

function hasActiveKycFilters(filters: KycFilterForm): boolean {
  return Boolean(filters.status || filters.userId.trim() || filters.country.trim());
}

function buildKycListQuery(page: number, filters: KycFilterForm): KycVerificationsListQuery {
  const query: KycVerificationsListQuery = { page, limit: QUEUE_PAGE_LIMIT };
  if (filters.status) {
    query.status = filters.status;
  }
  const userId = filters.userId.trim();
  if (userId) {
    query.userId = userId;
  }
  const country = filters.country.trim();
  if (country) {
    query.country = country;
  }
  return query;
}

export type AdminKycQueuePanelProps = {
  roles: UserRole[];
  triageRequest?: AdminTriageRequest | null;
  highlighted?: boolean;
  panelRef?: AdminPanelRef;
};

type CardAction = 'approve' | 'reject';

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

function canReviewKyc(status: KycStatus): boolean {
  return status === 'PENDING' || status === 'REJECTED';
}

export function AdminKycQueuePanel({
  roles,
  triageRequest,
  highlighted = false,
  panelRef,
}: AdminKycQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminKycQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [rejectFormId, setRejectFormId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [rejectReasonErrors, setRejectReasonErrors] = useState<Record<string, string>>({});
  const [cardActions, setCardActions] = useState<Record<string, CardAction | null>>({});
  const [cardActionErrors, setCardActionErrors] = useState<Record<string, string>>({});
  const [cardActionSuccess, setCardActionSuccess] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterForm, setFilterForm] = useState<KycFilterForm>(DEFAULT_KYC_FILTER_FORM);
  const [appliedFilters, setAppliedFilters] = useState<KycFilterForm>(DEFAULT_KYC_FILTER_FORM);

  const fetchKycQueue = useCallback(
    async (pageNumber: number, filters: KycFilterForm) => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await api.admin.listKycVerifications(
          buildKycListQuery(pageNumber, filters),
        );
        setItems(response.items);
        setPage(response.page);
        setTotal(response.total);
        setLoadedOnce(true);
      } catch (error) {
        setLoadError(
          safePanelErrorMessage(error, { fallbackKey: 'app.admin.kycQueueLoadFailed', t }),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const loadKycQueue = useCallback(() => {
    void fetchKycQueue(page, appliedFilters);
  }, [appliedFilters, fetchKycQueue, page]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filterForm);
    void fetchKycQueue(1, filterForm);
  }, [fetchKycQueue, filterForm]);

  const handleClearFilters = useCallback(() => {
    setFilterForm(DEFAULT_KYC_FILTER_FORM);
    setAppliedFilters(DEFAULT_KYC_FILTER_FORM);
    void fetchKycQueue(1, DEFAULT_KYC_FILTER_FORM);
  }, [fetchKycQueue]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void fetchKycQueue(1, DEFAULT_KYC_FILTER_FORM);
    }
  }, [roles, fetchKycQueue]);

  const applyTriageFilters = useCallback(
    (filters: KycFilterForm) => {
      setFilterForm(filters);
      setAppliedFilters(filters);
      void fetchKycQueue(1, filters);
    },
    [fetchKycQueue],
  );

  useAdminTriageEffect(
    triageRequest,
    'kyc',
    DEFAULT_KYC_FILTER_FORM,
    (request) => request.kycFilters,
    applyTriageFilters,
  );

  const updateItemInList = useCallback((updated: AdminKycQueueItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const handleApprove = useCallback(
    async (item: AdminKycQueueItem) => {
      setCardActions((current) => ({ ...current, [item.id]: 'approve' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setRejectFormId((current) => (current === item.id ? null : current));

      try {
        const updated = await api.admin.approveKycVerification(item.id);
        updateItemInList(updated);
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.kycApprovedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.kycReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [t, updateItemInList],
  );

  const handleRejectSubmit = useCallback(
    async (item: AdminKycQueueItem) => {
      const reason = rejectReasons[item.id]?.trim() ?? '';
      if (!reason) {
        setRejectReasonErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.rejectKycReasonRequired'),
        }));
        return;
      }

      setRejectReasonErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActions((current) => ({ ...current, [item.id]: 'reject' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.rejectKycVerification(item.id, {
          rejectionReason: reason,
        });
        updateItemInList(updated);
        setRejectFormId(null);
        setRejectReasons((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.kycRejectedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.kycReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [rejectReasons, t, updateItemInList],
  );

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const filtersActive = hasActiveKycFilters(appliedFilters);
  const showEmpty = loadedOnce && !loadError && items.length === 0 && !filtersActive;
  const showFilteredEmpty = loadedOnce && !loadError && items.length === 0 && filtersActive;
  const totalPages = Math.max(1, Math.ceil(total / QUEUE_PAGE_LIMIT));

  return (
    <section
      ref={panelRef}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2',
        'transition-shadow duration-300',
        highlighted ? 'ring-2 ring-primary/45 border-primary/35' : '',
      )}
      aria-labelledby="admin-kyc-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-kyc-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.kycReviewTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.kycReviewBody')}</p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.kycManualReviewBadge')}</span>
      </div>

      <div className="px-1 pb-1">
        <div className="mb-3 px-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t('app.admin.adminKycFilters')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t('app.admin.adminKycStatusFilter')}</span>
              <select
                className={FILTER_SELECT_CLASS}
                value={filterForm.status}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    status: event.target.value as KycFilterForm['status'],
                  }))
                }
              >
                <option value="">{t('app.admin.adminKycAllStatuses')}</option>
                {KYC_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {t(adminKycStatusKey(status))}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t('app.admin.adminKycUserIdFilter')}</span>
              <input
                type="text"
                className={FILTER_INPUT_CLASS}
                value={filterForm.userId}
                placeholder={t('app.admin.adminKycUserIdFilter')}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    userId: event.target.value.trim(),
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t('app.admin.adminKycCountryFilter')}</span>
              <input
                type="text"
                className={FILTER_INPUT_CLASS}
                value={filterForm.country}
                placeholder="DE"
                maxLength={80}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    country: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
              onClick={handleApplyFilters}
            >
              {t('app.admin.adminQueueApplyFilters')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
              onClick={handleClearFilters}
            >
              {t('app.admin.adminQueueClearFilters')}
            </Button>
          </div>
        </div>

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

        {showFilteredEmpty ? (
          <PanelEmptyState
            title={t('app.admin.adminKycNoFilteredResults')}
            body={t('app.admin.noKycReviewsBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => {
              const action = cardActions[item.id];
              const isRejectFormOpen = rejectFormId === item.id;
              const showReviewActions = canReviewKyc(item.status);
              const isApproved = item.status === 'APPROVED';

              return (
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

                  {isApproved ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t('app.admin.kycAlreadyApproved')}
                    </p>
                  ) : null}

                  {cardActionSuccess[item.id] ? (
                    <p className="mt-3 text-xs text-[hsl(var(--success))]" role="status">
                      {cardActionSuccess[item.id]}
                    </p>
                  ) : null}

                  {cardActionErrors[item.id] ? (
                    <p className="mt-3 text-xs text-[hsl(var(--danger))]" role="alert">
                      {cardActionErrors[item.id]}
                    </p>
                  ) : null}

                  {showReviewActions ? (
                    <div className="mt-3 border-t border-border/40 pt-3">
                      {isRejectFormOpen ? (
                        <div className="flex flex-col gap-2">
                          <label
                            className="text-xs font-medium text-foreground"
                            htmlFor={`reject-reason-${item.id}`}
                          >
                            {t('app.admin.rejectKycReason')}
                          </label>
                          <Input
                            id={`reject-reason-${item.id}`}
                            value={rejectReasons[item.id] ?? ''}
                            placeholder={t('app.admin.rejectKycReasonPlaceholder')}
                            disabled={action === 'reject'}
                            onChange={(event) => {
                              const value = event.target.value;
                              setRejectReasons((current) => ({ ...current, [item.id]: value }));
                              if (value.trim()) {
                                setRejectReasonErrors((current) => ({ ...current, [item.id]: '' }));
                              }
                            }}
                            className="h-9 text-sm"
                          />
                          {rejectReasonErrors[item.id] ? (
                            <p className="text-xs text-[hsl(var(--danger))]" role="alert">
                              {rejectReasonErrors[item.id]}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={action !== null}
                              onClick={() => void handleRejectSubmit(item)}
                            >
                              {action === 'reject'
                                ? t('app.admin.rejectingKyc')
                                : t('app.admin.rejectKyc')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={action !== null}
                              onClick={() => {
                                setRejectFormId(null);
                                setRejectReasonErrors((current) => ({ ...current, [item.id]: '' }));
                              }}
                            >
                              {t('app.admin.cancelKycReject')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={action !== null}
                            onClick={() => void handleApprove(item)}
                          >
                            {action === 'approve'
                              ? t('app.admin.approvingKyc')
                              : t('app.admin.approveKyc')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={action !== null}
                            onClick={() => {
                              setRejectFormId(item.id);
                              setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
                              setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
                            }}
                          >
                            {t('app.admin.rejectKyc')}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {!showInitialLoading && (loadedOnce || items.length > 0) && !loadError ? (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2">
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={loading || page <= 1}
                  onClick={() => void fetchKycQueue(page - 1, appliedFilters)}
                >
                  {t('app.admin.adminQueuePreviousPage')}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t('app.admin.adminQueuePageLabel')
                    .replace('{page}', String(page))
                    .replace('{total}', String(totalPages))}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={loading || page >= totalPages}
                  onClick={() => void fetchKycQueue(page + 1, appliedFilters)}
                >
                  {t('app.admin.adminQueueNextPage')}
                </Button>
              </div>
            ) : (
              <span />
            )}
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
