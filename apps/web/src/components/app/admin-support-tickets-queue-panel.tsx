'use client';

import { ApiError } from '@wayly/sdk';
import type { AdminSupportTicketQueueItem } from '@wayly/types';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  UserRole,
} from '@wayly/types';
import type { AdminSupportTicketsListQuery } from '@wayly/sdk';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef } from '@/lib/admin/admin-triage';
import {
  supportTicketCategoryKey,
  supportTicketPriorityKey,
  supportTicketStatusKey,
} from '@/components/app/support-ticket-panel';
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

const FILTER_SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const FILTER_INPUT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const QUEUE_PAGE_LIMIT = 50;

const STATUS_OPTIONS = [
  SupportTicketStatus.OPEN,
  SupportTicketStatus.UNDER_REVIEW,
  SupportTicketStatus.WAITING_FOR_USER,
  SupportTicketStatus.RESOLVED,
  SupportTicketStatus.CLOSED,
] as const;

const CATEGORY_OPTIONS = [
  SupportTicketCategory.GENERAL,
  SupportTicketCategory.ACCOUNT,
  SupportTicketCategory.SAFETY,
  SupportTicketCategory.PAYMENT_STATUS,
  SupportTicketCategory.ORDER_ISSUE,
  SupportTicketCategory.BUG_REPORT,
  SupportTicketCategory.OTHER,
] as const;

const PRIORITY_OPTIONS = [
  SupportTicketPriority.LOW,
  SupportTicketPriority.NORMAL,
  SupportTicketPriority.HIGH,
  SupportTicketPriority.URGENT,
] as const;

type SupportTicketFilterForm = {
  status: SupportTicketStatus | '';
  category: SupportTicketCategory | '';
  priority: SupportTicketPriority | '';
  userId: string;
  orderId: string;
};

const DEFAULT_FILTER_FORM: SupportTicketFilterForm = {
  status: '',
  category: '',
  priority: '',
  userId: '',
  orderId: '',
};

function hasActiveFilters(filters: SupportTicketFilterForm): boolean {
  return Boolean(
    filters.status ||
    filters.category ||
    filters.priority ||
    filters.userId.trim() ||
    filters.orderId.trim(),
  );
}

function buildListQuery(
  page: number,
  filters: SupportTicketFilterForm,
): AdminSupportTicketsListQuery {
  const query: AdminSupportTicketsListQuery = { page, limit: QUEUE_PAGE_LIMIT };
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }
  const userId = filters.userId.trim();
  if (userId) {
    query.userId = userId;
  }
  const orderId = filters.orderId.trim();
  if (orderId) {
    query.orderId = orderId;
  }
  return query;
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

export type AdminSupportTicketsQueuePanelProps = {
  roles: UserRole[];
  highlighted?: boolean;
  panelRef?: AdminPanelRef;
};

export function AdminSupportTicketsQueuePanel({
  roles,
  highlighted = false,
  panelRef,
}: AdminSupportTicketsQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminSupportTicketQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [filters, setFilters] = useState<SupportTicketFilterForm>(DEFAULT_FILTER_FORM);
  const [appliedFilters, setAppliedFilters] =
    useState<SupportTicketFilterForm>(DEFAULT_FILTER_FORM);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const [editStatus, setEditStatus] = useState<SupportTicketStatus>(SupportTicketStatus.OPEN);
  const [editPriority, setEditPriority] = useState<SupportTicketPriority>(
    SupportTicketPriority.NORMAL,
  );
  const [editAdminNote, setEditAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const isAdmin = roles.includes(UserRole.ADMIN);

  const loadTickets = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listSupportTickets(buildListQuery(1, appliedFilters));
      setItems(response.items);
      setLoadedOnce(true);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : t('app.admin.supportTickets.loadError'),
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, isAdmin, t]);

  useEffect(() => {
    if (isAdmin) {
      void loadTickets();
    }
  }, [isAdmin, loadTickets]);

  useEffect(() => {
    if (selected) {
      setEditStatus(selected.status);
      setEditPriority(selected.priority);
      setEditAdminNote(selected.adminNote ?? '');
      setUpdateError(null);
      setUpdateSuccess(false);
    }
  }, [selected]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setSelectedId(null);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTER_FORM);
    setAppliedFilters(DEFAULT_FILTER_FORM);
    setSelectedId(null);
  };

  const handleUpdate = async () => {
    if (!selected) {
      return;
    }
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      const updated = await api.admin.updateSupportTicket(selected.id, {
        status: editStatus,
        priority: editPriority,
        adminNote: editAdminNote.trim() || undefined,
      });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setUpdateSuccess(true);
    } catch (error) {
      setUpdateError(
        error instanceof ApiError ? error.message : t('app.admin.supportTickets.updateError'),
      );
    } finally {
      setUpdating(false);
    }
  };

  if (!hasOperationsDashboardAccess(roles) || !isAdmin) {
    return null;
  }

  return (
    <section
      ref={panelRef}
      className={cn(
        LISTING_CARD_CLASS,
        'flex flex-col gap-3',
        highlighted && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
      )}
      aria-labelledby="admin-support-tickets-heading"
    >
      <div>
        <h3 id="admin-support-tickets-heading" className="text-base font-semibold">
          {t('app.admin.supportTickets.title')}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('app.admin.supportTickets.subtitle')}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.supportTickets.statusFilter')}</span>
          <select
            className={FILTER_SELECT_CLASS}
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as SupportTicketStatus | '',
              }))
            }
          >
            <option value="">{t('common.none')}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(supportTicketStatusKey(option))}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.supportTickets.categoryFilter')}</span>
          <select
            className={FILTER_SELECT_CLASS}
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value as SupportTicketCategory | '',
              }))
            }
          >
            <option value="">{t('common.none')}</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(supportTicketCategoryKey(option))}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.supportTickets.priorityFilter')}</span>
          <select
            className={FILTER_SELECT_CLASS}
            value={filters.priority}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priority: event.target.value as SupportTicketPriority | '',
              }))
            }
          >
            <option value="">{t('common.none')}</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(supportTicketPriorityKey(option))}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.supportTickets.userIdFilter')}</span>
          <input
            className={FILTER_INPUT_CLASS}
            value={filters.userId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, userId: event.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.supportTickets.orderIdFilter')}</span>
          <input
            className={FILTER_INPUT_CLASS}
            value={filters.orderId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, orderId: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleApplyFilters}>
          {t('app.admin.supportTickets.applyFilters')}
        </Button>
        {hasActiveFilters(appliedFilters) ? (
          <Button type="button" size="sm" variant="ghost" onClick={handleClearFilters}>
            {t('app.admin.supportTickets.clearFilters')}
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="ghost" onClick={() => void loadTickets()}>
          {t('app.admin.supportTickets.refresh')}
        </Button>
      </div>

      {loading && !loadedOnce ? (
        <RequestsListSkeleton rows={3} itemClassName="h-16 w-full rounded-lg" />
      ) : null}
      {loadError ? (
        <PanelErrorState
          message={loadError}
          retryLabel={t('app.admin.supportTickets.retry')}
          onRetry={() => void loadTickets()}
        />
      ) : null}
      {!loading && loadedOnce && items.length === 0 ? (
        <PanelEmptyState
          title={t('app.admin.supportTickets.title')}
          body={t('app.admin.supportTickets.empty')}
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                  selectedId === item.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/60 bg-muted/10 hover:bg-muted/20',
                )}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{item.subject}</span>
                  <span className="wayly-status-badge wayly-status-default text-[10px]">
                    {t(supportTicketStatusKey(item.status))}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {t(supportTicketCategoryKey(item.category))} ·{' '}
                  {t(supportTicketPriorityKey(item.priority))} · {formatDateTime(item.createdAt)}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground">{item.userId}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/5 p-3">
          <h4 className="text-sm font-semibold">{t('app.admin.supportTickets.selectedTicket')}</h4>
          <dl className="grid gap-1 text-xs">
            <div>
              <dt className="font-medium">{t('app.admin.supportTickets.user')}</dt>
              <dd className="text-muted-foreground">
                {formatUser(selected.userDisplayName, selected.userEmail)}
              </dd>
            </div>
            <div>
              <dt className="font-medium">{t('app.admin.supportTickets.subject')}</dt>
              <dd className="text-muted-foreground">{selected.subject}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('app.admin.supportTickets.message')}</dt>
              <dd className="whitespace-pre-wrap text-muted-foreground">{selected.message}</dd>
            </div>
            {selected.orderId ? (
              <div>
                <dt className="font-medium">{t('app.admin.supportTickets.orderId')}</dt>
                <dd className="font-mono text-muted-foreground">{selected.orderId}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-medium">{t('app.admin.supportTickets.createdAt')}</dt>
              <dd className="text-muted-foreground">{formatDateTime(selected.createdAt)}</dd>
            </div>
          </dl>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t('app.admin.supportTickets.status')}</span>
            <select
              className={SELECT_CLASS}
              value={editStatus}
              onChange={(event) => setEditStatus(event.target.value as SupportTicketStatus)}
              disabled={updating}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(supportTicketStatusKey(option))}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t('app.admin.supportTickets.priority')}</span>
            <select
              className={SELECT_CLASS}
              value={editPriority}
              onChange={(event) => setEditPriority(event.target.value as SupportTicketPriority)}
              disabled={updating}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(supportTicketPriorityKey(option))}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t('app.admin.supportTickets.adminNote')}</span>
            <textarea
              className={TEXTAREA_CLASS}
              value={editAdminNote}
              onChange={(event) => setEditAdminNote(event.target.value)}
              disabled={updating}
            />
          </label>

          {updateError ? (
            <p className="text-xs text-destructive" role="alert">
              {updateError}
            </p>
          ) : null}
          {updateSuccess ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">
              {t('app.admin.supportTickets.updateSuccess')}
            </p>
          ) : null}

          <Button type="button" size="sm" disabled={updating} onClick={() => void handleUpdate()}>
            {updating
              ? t('app.admin.supportTickets.updating')
              : t('app.admin.supportTickets.update')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function adminSupportTicketStatusKey(status: SupportTicketStatus): TranslationKey {
  return supportTicketStatusKey(status);
}
