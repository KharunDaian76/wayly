'use client';

import type { AdminUserQueueItem, KycStatus, UserAccountStatus, UserRole } from '@wayly/types';
import {
  KycStatus as KycStatusEnum,
  UserAccountStatus as UserAccountStatusEnum,
  UserRole as UserRoleEnum,
} from '@wayly/types';
import type { AdminUsersListQuery } from '@wayly/sdk';
import { Button, Input } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef, AdminTriageRequest } from '@/lib/admin/admin-triage';
import { useAdminTriageEffect } from '@/lib/admin/admin-triage';

import { adminKycStatusKey } from '@/components/app/admin-kyc-queue-panel';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import {
  hasAdminModerationAccess,
  hasOperationsDashboardAccess,
} from '@/lib/auth/operations-dashboard-access';
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

const ROLE_OPTIONS = Object.values(UserRoleEnum);
const KYC_STATUS_OPTIONS = Object.values(KycStatusEnum);
const ACCOUNT_STATUS_OPTIONS = Object.values(UserAccountStatusEnum);

type UserFilterForm = {
  role: UserRole | '';
  kycStatus: KycStatus | '';
  accountStatus: UserAccountStatus | '';
  search: string;
};

const DEFAULT_USER_FILTER_FORM: UserFilterForm = {
  role: '',
  kycStatus: '',
  accountStatus: '',
  search: '',
};

function hasActiveUserFilters(filters: UserFilterForm): boolean {
  return Boolean(
    filters.role || filters.kycStatus || filters.accountStatus || filters.search.trim(),
  );
}

function buildUsersListQuery(page: number, filters: UserFilterForm): AdminUsersListQuery {
  const query: AdminUsersListQuery = { page, limit: QUEUE_PAGE_LIMIT };
  if (filters.role) {
    query.role = filters.role;
  }
  if (filters.kycStatus) {
    query.kycStatus = filters.kycStatus;
  }
  if (filters.accountStatus) {
    query.accountStatus = filters.accountStatus;
  }
  const search = filters.search.trim();
  if (search) {
    query.search = search;
  }
  return query;
}

function roleFilterLabel(role: UserRole, t: (key: TranslationKey) => string): string {
  if (role === UserRoleEnum.ADMIN) {
    return t('app.admin.roleAdmin');
  }
  if (role === UserRoleEnum.ARBITRATOR) {
    return t('app.admin.roleArbitrator');
  }
  return t('app.admin.userRole.USER');
}

export type AdminUsersQueuePanelProps = {
  roles: UserRole[];
  triageRequest?: AdminTriageRequest | null;
  highlighted?: boolean;
  panelRef?: AdminPanelRef;
};

type CardAction = 'suspend' | 'unsuspend';

export function adminAccountStatusKey(status: UserAccountStatus): TranslationKey {
  if (status === UserAccountStatusEnum.SUSPENDED) {
    return 'app.admin.accountStatusSuspended';
  }
  return 'app.admin.accountStatusActive';
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

function formatRoles(roles: UserRole[], t: (key: TranslationKey) => string): string {
  return roles
    .map((role) => {
      if (role === UserRoleEnum.ADMIN) {
        return t('app.admin.roleAdmin');
      }
      if (role === UserRoleEnum.ARBITRATOR) {
        return t('app.admin.roleArbitrator');
      }
      return t('app.admin.userRole.USER');
    })
    .join(' · ');
}

function isModeratableUser(item: AdminUserQueueItem): boolean {
  return !item.roles.includes(UserRoleEnum.ADMIN) && !item.roles.includes(UserRoleEnum.ARBITRATOR);
}

export function AdminUsersQueuePanel({
  roles,
  triageRequest,
  highlighted = false,
  panelRef,
}: AdminUsersQueuePanelProps) {
  const { t } = useI18n();
  const canModerate = hasAdminModerationAccess(roles);
  const [items, setItems] = useState<AdminUserQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [suspendFormId, setSuspendFormId] = useState<string | null>(null);
  const [unsuspendFormId, setUnsuspendFormId] = useState<string | null>(null);
  const [suspendReasons, setSuspendReasons] = useState<Record<string, string>>({});
  const [unsuspendNotes, setUnsuspendNotes] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cardActions, setCardActions] = useState<Record<string, CardAction | null>>({});
  const [cardActionErrors, setCardActionErrors] = useState<Record<string, string>>({});
  const [cardActionSuccess, setCardActionSuccess] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterForm, setFilterForm] = useState<UserFilterForm>(DEFAULT_USER_FILTER_FORM);
  const [appliedFilters, setAppliedFilters] = useState<UserFilterForm>(DEFAULT_USER_FILTER_FORM);

  const fetchUsers = useCallback(
    async (pageNumber: number, filters: UserFilterForm) => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await api.admin.listUsers(buildUsersListQuery(pageNumber, filters));
        setItems(response.items);
        setPage(response.page);
        setTotal(response.total);
        setLoadedOnce(true);
      } catch (error) {
        setLoadError(safePanelErrorMessage(error, { fallbackKey: 'app.admin.usersLoadFailed', t }));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const loadUsers = useCallback(() => {
    void fetchUsers(page, appliedFilters);
  }, [appliedFilters, fetchUsers, page]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filterForm);
    void fetchUsers(1, filterForm);
  }, [fetchUsers, filterForm]);

  const handleClearFilters = useCallback(() => {
    setFilterForm(DEFAULT_USER_FILTER_FORM);
    setAppliedFilters(DEFAULT_USER_FILTER_FORM);
    void fetchUsers(1, DEFAULT_USER_FILTER_FORM);
  }, [fetchUsers]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void fetchUsers(1, DEFAULT_USER_FILTER_FORM);
    }
  }, [roles, fetchUsers]);

  const applyTriageFilters = useCallback(
    (filters: UserFilterForm) => {
      setFilterForm(filters);
      setAppliedFilters(filters);
      void fetchUsers(1, filters);
    },
    [fetchUsers],
  );

  useAdminTriageEffect(
    triageRequest,
    'users',
    DEFAULT_USER_FILTER_FORM,
    (request) => request.userFilters,
    applyTriageFilters,
  );

  const updateItemInList = useCallback((updated: AdminUserQueueItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const handleSuspend = useCallback(
    async (item: AdminUserQueueItem) => {
      const reason = (suspendReasons[item.id] ?? '').trim();
      if (!reason) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.suspensionReasonRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'suspend' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.suspendAdminUser(item.id, { reason });
        updateItemInList(updated);
        setSuspendFormId(null);
        setSuspendReasons((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.userSuspendedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.userSuspendFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [suspendReasons, t, updateItemInList],
  );

  const handleUnsuspend = useCallback(
    async (item: AdminUserQueueItem) => {
      setCardActions((current) => ({ ...current, [item.id]: 'unsuspend' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      const note = (unsuspendNotes[item.id] ?? '').trim();

      try {
        const updated = await api.admin.unsuspendAdminUser(item.id, note ? { note } : undefined);
        updateItemInList(updated);
        setUnsuspendFormId(null);
        setUnsuspendNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.userUnsuspendedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.userUnsuspendFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [unsuspendNotes, t, updateItemInList],
  );

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const filtersActive = hasActiveUserFilters(appliedFilters);
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
      aria-labelledby="admin-users-queue-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-users-queue-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.trustSafetyQueueTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.trustSafetyQueueDescription')}
          </p>
        </div>
        {!canModerate ? (
          <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
        ) : null}
      </div>

      <div className="px-1 pb-1">
        <div className="mb-3 px-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t('app.admin.adminUsersFilters')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t('app.admin.adminUsersRoleFilter')}</span>
              <select
                className={FILTER_SELECT_CLASS}
                value={filterForm.role}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    role: event.target.value as UserFilterForm['role'],
                  }))
                }
              >
                <option value="">{t('app.admin.adminUsersAllRoles')}</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {roleFilterLabel(role, t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t('app.admin.adminUsersKycStatusFilter')}
              </span>
              <select
                className={FILTER_SELECT_CLASS}
                value={filterForm.kycStatus}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    kycStatus: event.target.value as UserFilterForm['kycStatus'],
                  }))
                }
              >
                <option value="">{t('app.admin.adminUsersAllKycStatuses')}</option>
                {KYC_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {t(adminKycStatusKey(status))}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t('app.admin.adminUsersAccountStatusFilter')}
              </span>
              <select
                className={FILTER_SELECT_CLASS}
                value={filterForm.accountStatus}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    accountStatus: event.target.value as UserFilterForm['accountStatus'],
                  }))
                }
              >
                <option value="">{t('app.admin.adminUsersAllAccountStatuses')}</option>
                {ACCOUNT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {t(adminAccountStatusKey(status))}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t('app.admin.adminUsersSearchFilter')}</span>
              <input
                type="search"
                className={FILTER_INPUT_CLASS}
                value={filterForm.search}
                placeholder={t('app.admin.adminUsersSearchPlaceholder')}
                onChange={(event) =>
                  setFilterForm((prev) => ({
                    ...prev,
                    search: event.target.value,
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
            retryLabel={t('app.admin.retryUsers')}
            onRetry={() => void loadUsers()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">{t('app.admin.usersLoading')}</p>
            <RequestsListSkeleton rows={3} itemClassName="h-28 w-full rounded-lg" />
          </div>
        ) : null}

        {showEmpty ? (
          <PanelEmptyState title={t('app.admin.noUsersTitle')} body={t('app.admin.noUsersBody')} />
        ) : null}

        {showFilteredEmpty ? (
          <PanelEmptyState
            title={t('app.admin.adminUsersNoFilteredResults')}
            body={t('app.admin.noUsersBody')}
          />
        ) : null}

        {!showInitialLoading && !loadError && items.length > 0 ? (
          <ul className="flex flex-col gap-2 px-2 pb-2">
            {items.map((item) => {
              const isActionLoading = cardActions[item.id] != null;
              const showSuspendForm = suspendFormId === item.id;
              const showUnsuspendForm = unsuspendFormId === item.id;
              const canActOnUser = canModerate && isModeratableUser(item);

              return (
                <li key={item.id} className={LISTING_CARD_CLASS}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.displayName}</p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">{item.email}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {t('app.admin.trustSafetyUser')}: {item.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminAccountStatusKey(item.accountStatus))}
                      </span>
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminKycStatusKey(item.kycStatus))}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.accountStatus')}</dt>
                      <dd className="font-medium">
                        {t(adminAccountStatusKey(item.accountStatus))}
                      </dd>
                    </div>
                    {item.accountStatus === UserAccountStatusEnum.SUSPENDED && item.suspendedAt ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">{t('app.admin.userSuspendedAt')}</dt>
                        <dd>{formatDateTime(item.suspendedAt)}</dd>
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.userRoles')}</dt>
                      <dd className="font-medium">{formatRoles(item.roles, t)}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.userKycStatus')}</dt>
                      <dd className="font-medium">{t(adminKycStatusKey(item.kycStatus))}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.userCreated')}</dt>
                      <dd>{formatDateTime(item.createdAt)}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.userUpdated')}</dt>
                      <dd>{formatDateTime(item.updatedAt)}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.userLatestActivity')}</dt>
                      <dd>{formatDateTime(item.latestActivityAt)}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 border-t border-border/40 pt-3">
                    <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-muted-foreground">{t('app.admin.userOrdersCount')}</dt>
                        <dd className="font-medium">{item.postedOrdersCount}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          {t('app.admin.userDeliveriesCount')}
                        </dt>
                        <dd className="font-medium">{item.acceptedOrdersCount}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          {t('app.admin.userDisputesCount')}
                        </dt>
                        <dd className="font-medium">{item.disputesCount}</dd>
                      </div>
                    </dl>
                  </div>

                  {cardActionErrors[item.id] ? (
                    <p className="mt-3 text-xs text-destructive" role="alert">
                      {cardActionErrors[item.id]}
                    </p>
                  ) : null}
                  {cardActionSuccess[item.id] ? (
                    <p
                      className="mt-3 text-xs text-emerald-600 dark:text-emerald-400"
                      role="status"
                    >
                      {cardActionSuccess[item.id]}
                    </p>
                  ) : null}

                  {canActOnUser &&
                  item.accountStatus === UserAccountStatusEnum.ACTIVE &&
                  !showSuspendForm ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isActionLoading}
                        onClick={() => {
                          setSuspendFormId(item.id);
                          setUnsuspendFormId(null);
                          setFormErrors((current) => ({ ...current, [item.id]: '' }));
                        }}
                      >
                        {t('app.admin.suspendUser')}
                      </Button>
                    </div>
                  ) : null}

                  {canActOnUser &&
                  item.accountStatus === UserAccountStatusEnum.SUSPENDED &&
                  !showUnsuspendForm ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={isActionLoading}
                        onClick={() => {
                          setUnsuspendFormId(item.id);
                          setSuspendFormId(null);
                          setFormErrors((current) => ({ ...current, [item.id]: '' }));
                        }}
                      >
                        {t('app.admin.unsuspendUser')}
                      </Button>
                    </div>
                  ) : null}

                  {canActOnUser && showSuspendForm ? (
                    <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
                      <label className="text-xs font-medium" htmlFor={`suspend-reason-${item.id}`}>
                        {t('app.admin.suspensionReason')}
                      </label>
                      <Input
                        id={`suspend-reason-${item.id}`}
                        value={suspendReasons[item.id] ?? ''}
                        placeholder={t('app.admin.suspensionReasonPlaceholder')}
                        disabled={isActionLoading}
                        onChange={(event) =>
                          setSuspendReasons((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                      {formErrors[item.id] ? (
                        <p className="text-xs text-destructive">{formErrors[item.id]}</p>
                      ) : null}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isActionLoading}
                          onClick={() => setSuspendFormId(null)}
                        >
                          {t('app.admin.cancelUserModeration')}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isActionLoading}
                          onClick={() => void handleSuspend(item)}
                        >
                          {isActionLoading && cardActions[item.id] === 'suspend'
                            ? t('app.admin.suspendingUser')
                            : t('app.admin.suspendUser')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {canActOnUser && showUnsuspendForm ? (
                    <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
                      <label className="text-xs font-medium" htmlFor={`unsuspend-note-${item.id}`}>
                        {t('app.admin.unsuspendNote')}
                      </label>
                      <Input
                        id={`unsuspend-note-${item.id}`}
                        value={unsuspendNotes[item.id] ?? ''}
                        placeholder={t('app.admin.unsuspendNotePlaceholder')}
                        disabled={isActionLoading}
                        onChange={(event) =>
                          setUnsuspendNotes((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isActionLoading}
                          onClick={() => setUnsuspendFormId(null)}
                        >
                          {t('app.admin.cancelUserModeration')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isActionLoading}
                          onClick={() => void handleUnsuspend(item)}
                        >
                          {isActionLoading && cardActions[item.id] === 'unsuspend'
                            ? t('app.admin.unsuspendingUser')
                            : t('app.admin.unsuspendUser')}
                        </Button>
                      </div>
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
                  onClick={() => void fetchUsers(page - 1, appliedFilters)}
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
                  onClick={() => void fetchUsers(page + 1, appliedFilters)}
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
              onClick={() => void loadUsers()}
            >
              {loading ? t('app.admin.usersLoading') : t('app.admin.refreshUsers')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
