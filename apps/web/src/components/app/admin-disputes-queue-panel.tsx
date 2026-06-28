'use client';

import type {
  AdminDisputeQueueItem,
  DisputeResolution,
  DisputeStatus,
  UserRole,
} from '@wayly/types';
import { DisputeStatus as DisputeStatusEnum } from '@wayly/types';
import type { DisputesListQuery } from '@wayly/sdk';
import { Button } from '@wayly/ui';
import {
  AdminDisputeResolutionOutcome,
  type AdminDisputeResolutionOutcome as AdminDisputeResolutionOutcomeType,
} from '@wayly/validation';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef, AdminTriageRequest } from '@/lib/admin/admin-triage';
import { useAdminTriageEffect } from '@/lib/admin/admin-triage';

import { disputeReasonKey, disputeStatusKey } from '@/components/app/dispute-panel';
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

const TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const FILTER_SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const FILTER_INPUT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const QUEUE_PAGE_LIMIT = 50;

const DISPUTE_STATUS_OPTIONS = Object.values(DisputeStatusEnum);

type DisputeFilterForm = {
  status: DisputeStatus | '';
  orderId: string;
  openedById: string;
};

const DEFAULT_DISPUTE_FILTER_FORM: DisputeFilterForm = {
  status: '',
  orderId: '',
  openedById: '',
};

function hasActiveDisputeFilters(filters: DisputeFilterForm): boolean {
  return Boolean(filters.status || filters.orderId.trim() || filters.openedById.trim());
}

function buildDisputesListQuery(page: number, filters: DisputeFilterForm): DisputesListQuery {
  const query: DisputesListQuery = { page, limit: QUEUE_PAGE_LIMIT };
  if (filters.status) {
    query.status = filters.status;
  }
  const orderId = filters.orderId.trim();
  if (orderId) {
    query.orderId = orderId;
  }
  const openedById = filters.openedById.trim();
  if (openedById) {
    query.openedById = openedById;
  }
  return query;
}

const MAX_RESOLUTION_NOTE_LENGTH = 2000;

const DISPUTE_OUTCOME_OPTIONS = [
  AdminDisputeResolutionOutcome.SENDER_FAVORED,
  AdminDisputeResolutionOutcome.WAYLER_FAVORED,
  AdminDisputeResolutionOutcome.NO_FAULT,
  AdminDisputeResolutionOutcome.INFORMATION_ONLY,
] as const;

export type AdminDisputesQueuePanelProps = {
  roles: UserRole[];
  triageRequest?: AdminTriageRequest | null;
  highlighted?: boolean;
  panelRef?: AdminPanelRef;
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

function canResolveDispute(status: DisputeStatus): boolean {
  return status === 'OPEN' || status === 'UNDER_REVIEW';
}

function isResolvedDispute(status: DisputeStatus): boolean {
  return status === 'RESOLVED';
}

export function adminDisputeOutcomeKey(outcome: AdminDisputeResolutionOutcomeType): TranslationKey {
  const map: Record<AdminDisputeResolutionOutcomeType, TranslationKey> = {
    [AdminDisputeResolutionOutcome.SENDER_FAVORED]: 'app.admin.disputeOutcomeSenderFavored',
    [AdminDisputeResolutionOutcome.WAYLER_FAVORED]: 'app.admin.disputeOutcomeWaylerFavored',
    [AdminDisputeResolutionOutcome.NO_FAULT]: 'app.admin.disputeOutcomeNoFault',
    [AdminDisputeResolutionOutcome.INFORMATION_ONLY]: 'app.admin.disputeOutcomeInformationOnly',
  };
  return map[outcome];
}

export function adminDisputeResolutionKey(
  resolution: DisputeResolution | null,
): TranslationKey | null {
  if (!resolution) {
    return null;
  }
  switch (resolution) {
    case 'REFUND_SENDER':
      return 'app.admin.disputeOutcomeSenderFavored';
    case 'RELEASE_TO_WAYLER':
      return 'app.admin.disputeOutcomeWaylerFavored';
    case 'NO_ACTION':
      return 'app.admin.disputeOutcomeNoFault';
    case 'OTHER':
      return 'app.admin.disputeOutcomeInformationOnly';
    default:
      return null;
  }
}

export function AdminDisputesQueuePanel({
  roles,
  triageRequest,
  highlighted = false,
  panelRef,
}: AdminDisputesQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminDisputeQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [resolveFormId, setResolveFormId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [resolutionOutcomes, setResolutionOutcomes] = useState<
    Record<string, AdminDisputeResolutionOutcomeType | ''>
  >({});
  const [noteErrors, setNoteErrors] = useState<Record<string, string>>({});
  const [resolvingIds, setResolvingIds] = useState<Record<string, boolean>>({});
  const [cardActionErrors, setCardActionErrors] = useState<Record<string, string>>({});
  const [cardActionSuccess, setCardActionSuccess] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterForm, setFilterForm] = useState<DisputeFilterForm>(DEFAULT_DISPUTE_FILTER_FORM);
  const [appliedFilters, setAppliedFilters] = useState<DisputeFilterForm>(
    DEFAULT_DISPUTE_FILTER_FORM,
  );

  const fetchDisputes = useCallback(
    async (pageNumber: number, filters: DisputeFilterForm) => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await api.admin.listDisputes(buildDisputesListQuery(pageNumber, filters));
        setItems(response.items);
        setPage(response.page);
        setTotal(response.total);
        setLoadedOnce(true);
      } catch (error) {
        setLoadError(
          safePanelErrorMessage(error, { fallbackKey: 'app.admin.disputesLoadFailed', t }),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const loadDisputes = useCallback(() => {
    void fetchDisputes(page, appliedFilters);
  }, [appliedFilters, fetchDisputes, page]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filterForm);
    void fetchDisputes(1, filterForm);
  }, [fetchDisputes, filterForm]);

  const handleClearFilters = useCallback(() => {
    setFilterForm(DEFAULT_DISPUTE_FILTER_FORM);
    setAppliedFilters(DEFAULT_DISPUTE_FILTER_FORM);
    void fetchDisputes(1, DEFAULT_DISPUTE_FILTER_FORM);
  }, [fetchDisputes]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void fetchDisputes(1, DEFAULT_DISPUTE_FILTER_FORM);
    }
  }, [roles, fetchDisputes]);

  const applyTriageFilters = useCallback(
    (filters: DisputeFilterForm) => {
      setFilterForm(filters);
      setAppliedFilters(filters);
      void fetchDisputes(1, filters);
    },
    [fetchDisputes],
  );

  useAdminTriageEffect(
    triageRequest,
    'disputes',
    DEFAULT_DISPUTE_FILTER_FORM,
    (request) => request.disputeFilters,
    applyTriageFilters,
  );

  const updateItemInList = useCallback((updated: AdminDisputeQueueItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const handleResolveSubmit = useCallback(
    async (item: AdminDisputeQueueItem) => {
      const note = resolutionNotes[item.id]?.trim() ?? '';
      if (!note) {
        setNoteErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.disputeResolutionNoteRequired'),
        }));
        return;
      }

      setNoteErrors((current) => ({ ...current, [item.id]: '' }));
      setResolvingIds((current) => ({ ...current, [item.id]: true }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));

      const selectedOutcome = resolutionOutcomes[item.id];
      const body = {
        resolutionNote: note,
        ...(selectedOutcome ? { outcome: selectedOutcome } : {}),
      };

      try {
        const updated = await api.admin.resolveAdminDispute(item.id, body);
        updateItemInList(updated);
        setResolveFormId(null);
        setResolutionNotes((current) => ({ ...current, [item.id]: '' }));
        setResolutionOutcomes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.disputeResolvedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.disputeResolutionFailed'),
        }));
      } finally {
        setResolvingIds((current) => ({ ...current, [item.id]: false }));
      }
    },
    [resolutionNotes, resolutionOutcomes, t, updateItemInList],
  );

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const filtersActive = hasActiveDisputeFilters(appliedFilters);
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
      aria-labelledby="admin-disputes-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-disputes-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.disputesQueueTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.disputesQueueBody')}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('app.admin.disputeManualReviewBadge')}
        </span>
      </div>

      <div className="px-1 pb-1">
        <div className="mb-3 px-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t('app.admin.adminDisputesFilters')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t('app.admin.adminDisputesStatusFilter')}
              </span>
              <select
                className={FILTER_SELECT_CLASS}
                value={filterForm.status}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    status: event.target.value as DisputeFilterForm['status'],
                  }))
                }
              >
                <option value="">{t('app.admin.adminDisputesAllStatuses')}</option>
                {DISPUTE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {t(disputeStatusKey(status))}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t('app.admin.adminDisputesOrderIdFilter')}
              </span>
              <input
                type="text"
                className={FILTER_INPUT_CLASS}
                value={filterForm.orderId}
                placeholder={t('app.admin.adminDisputesOrderIdFilter')}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    orderId: event.target.value.trim(),
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t('app.admin.adminDisputesOpenedByIdFilter')}
              </span>
              <input
                type="text"
                className={FILTER_INPUT_CLASS}
                value={filterForm.openedById}
                placeholder={t('app.admin.adminDisputesOpenedByIdFilter')}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    openedById: event.target.value.trim(),
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

        {showFilteredEmpty ? (
          <PanelEmptyState
            title={t('app.admin.adminDisputesNoFilteredResults')}
            body={t('app.admin.noDisputesBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => {
              const isResolving = resolvingIds[item.id] ?? false;
              const isResolveFormOpen = resolveFormId === item.id;
              const showResolveActions = canResolveDispute(item.status);
              const isResolved = isResolvedDispute(item.status);
              const resolutionLabelKey = adminDisputeResolutionKey(item.resolution);

              return (
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
                    {isResolved && item.resolvedAt ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.disputeResolvedAt')}
                        </dt>
                        <dd>{formatDateTime(item.resolvedAt)}</dd>
                      </div>
                    ) : null}
                    {isResolved && resolutionLabelKey ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.disputeResolution')}
                        </dt>
                        <dd className="font-medium">{t(resolutionLabelKey)}</dd>
                      </div>
                    ) : null}
                    {isResolved && item.resolutionNote?.trim() ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.disputeResolutionNote')}
                        </dt>
                        <dd className="whitespace-pre-wrap break-words text-right sm:max-w-[65%]">
                          {item.resolutionNote}
                        </dd>
                      </div>
                    ) : null}
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

                  {isResolved ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t('app.admin.disputeAlreadyResolved')}
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

                  {showResolveActions ? (
                    <div className="mt-3 border-t border-border/40 pt-3">
                      {isResolveFormOpen ? (
                        <div className="flex flex-col gap-2">
                          <label
                            className="text-xs font-medium text-foreground"
                            htmlFor={`resolution-note-${item.id}`}
                          >
                            {t('app.admin.disputeResolutionNote')}
                          </label>
                          <textarea
                            id={`resolution-note-${item.id}`}
                            className={TEXTAREA_CLASS}
                            value={resolutionNotes[item.id] ?? ''}
                            maxLength={MAX_RESOLUTION_NOTE_LENGTH}
                            placeholder={t('app.admin.disputeResolutionNotePlaceholder')}
                            disabled={isResolving}
                            rows={4}
                            onChange={(event) => {
                              const value = event.target.value;
                              setResolutionNotes((current) => ({ ...current, [item.id]: value }));
                              if (value.trim()) {
                                setNoteErrors((current) => ({ ...current, [item.id]: '' }));
                              }
                            }}
                          />
                          {noteErrors[item.id] ? (
                            <p className="text-xs text-[hsl(var(--danger))]" role="alert">
                              {noteErrors[item.id]}
                            </p>
                          ) : null}
                          <label
                            className="text-xs font-medium text-foreground"
                            htmlFor={`resolution-outcome-${item.id}`}
                          >
                            {t('app.admin.disputeResolutionOutcome')}
                          </label>
                          <select
                            id={`resolution-outcome-${item.id}`}
                            className={SELECT_CLASS}
                            value={resolutionOutcomes[item.id] ?? ''}
                            disabled={isResolving}
                            onChange={(event) => {
                              const value = event.target.value as
                                | AdminDisputeResolutionOutcomeType
                                | '';
                              setResolutionOutcomes((current) => ({
                                ...current,
                                [item.id]: value,
                              }));
                            }}
                          >
                            <option value="">
                              {t('app.admin.disputeResolutionOutcomeDefault')}
                            </option>
                            {DISPUTE_OUTCOME_OPTIONS.map((outcome) => (
                              <option key={outcome} value={outcome}>
                                {t(adminDisputeOutcomeKey(outcome))}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isResolving}
                              onClick={() => void handleResolveSubmit(item)}
                            >
                              {isResolving
                                ? t('app.admin.resolvingDispute')
                                : t('app.admin.resolveDispute')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isResolving}
                              onClick={() => {
                                setResolveFormId(null);
                                setNoteErrors((current) => ({ ...current, [item.id]: '' }));
                              }}
                            >
                              {t('app.admin.cancelDisputeResolution')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isResolving}
                          onClick={() => {
                            setResolveFormId(item.id);
                            setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
                            setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
                          }}
                        >
                          {t('app.admin.resolveDispute')}
                        </Button>
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
                  onClick={() => void fetchDisputes(page - 1, appliedFilters)}
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
                  onClick={() => void fetchDisputes(page + 1, appliedFilters)}
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
