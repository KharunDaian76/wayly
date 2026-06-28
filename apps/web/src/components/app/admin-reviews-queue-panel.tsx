'use client';

import { ApiError } from '@wayly/sdk';
import type { AdminReviewQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import type { AdminReviewsListQuery } from '@wayly/sdk';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef } from '@/lib/admin/admin-triage';
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

const QUEUE_PAGE_LIMIT = 50;

type ReviewFilterForm = {
  isHidden: '' | 'true' | 'false';
  rating: string;
  reviewerId: string;
  revieweeId: string;
  orderId: string;
};

const DEFAULT_FILTER_FORM: ReviewFilterForm = {
  isHidden: '',
  rating: '',
  reviewerId: '',
  revieweeId: '',
  orderId: '',
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

function buildListQuery(page: number, filters: ReviewFilterForm): AdminReviewsListQuery {
  const query: AdminReviewsListQuery = { page, limit: QUEUE_PAGE_LIMIT };
  if (filters.isHidden === 'true') {
    query.isHidden = true;
  } else if (filters.isHidden === 'false') {
    query.isHidden = false;
  }
  const rating = Number(filters.rating);
  if (filters.rating && rating >= 1 && rating <= 5) {
    query.rating = rating;
  }
  const reviewerId = filters.reviewerId.trim();
  if (reviewerId) {
    query.reviewerId = reviewerId;
  }
  const revieweeId = filters.revieweeId.trim();
  if (revieweeId) {
    query.revieweeId = revieweeId;
  }
  const orderId = filters.orderId.trim();
  if (orderId) {
    query.orderId = orderId;
  }
  return query;
}

export type AdminReviewsQueuePanelProps = {
  roles: UserRole[];
  panelRef?: AdminPanelRef;
  highlighted?: boolean;
};

export function AdminReviewsQueuePanel({
  roles,
  panelRef,
  highlighted = false,
}: AdminReviewsQueuePanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<AdminReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [filters, setFilters] = useState<ReviewFilterForm>(DEFAULT_FILTER_FORM);
  const [appliedFilters, setAppliedFilters] = useState<ReviewFilterForm>(DEFAULT_FILTER_FORM);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const [editHidden, setEditHidden] = useState(false);
  const [editAdminNote, setEditAdminNote] = useState('');
  const [moderating, setModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [moderationSuccess, setModerationSuccess] = useState(false);

  const isAdmin = roles.includes(UserRole.ADMIN);

  const loadReviews = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.listReviews(buildListQuery(1, appliedFilters));
      setItems(response.items);
      setLoadedOnce(true);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : t('app.admin.reviews.error'));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, isAdmin, t]);

  useEffect(() => {
    if (isAdmin) {
      void loadReviews();
    }
  }, [isAdmin, loadReviews]);

  useEffect(() => {
    if (selected) {
      setEditHidden(selected.isHidden);
      setEditAdminNote(selected.adminNote ?? '');
      setModerationError(null);
      setModerationSuccess(false);
    }
  }, [selected]);

  const handleModerate = async () => {
    if (!selected) {
      return;
    }
    setModerating(true);
    setModerationError(null);
    setModerationSuccess(false);
    try {
      const updated = await api.admin.moderateReview(selected.id, {
        isHidden: editHidden,
        adminNote: editAdminNote.trim() || undefined,
      });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setModerationSuccess(true);
    } catch (error) {
      setModerationError(
        error instanceof ApiError ? error.message : t('app.admin.reviews.moderationError'),
      );
    } finally {
      setModerating(false);
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
      aria-labelledby="admin-reviews-heading"
    >
      <div>
        <h3 id="admin-reviews-heading" className="text-base font-semibold">
          {t('app.admin.reviews.title')}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.reviews.subtitle')}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.reviews.hiddenFilter')}</span>
          <select
            className={FILTER_SELECT_CLASS}
            value={filters.isHidden}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                isHidden: event.target.value as ReviewFilterForm['isHidden'],
              }))
            }
          >
            <option value="">{t('common.none')}</option>
            <option value="false">{t('app.admin.reviews.visible')}</option>
            <option value="true">{t('app.admin.reviews.hidden')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.reviews.ratingFilter')}</span>
          <select
            className={FILTER_SELECT_CLASS}
            value={filters.rating}
            onChange={(event) =>
              setFilters((current) => ({ ...current, rating: event.target.value }))
            }
          >
            <option value="">{t('common.none')}</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.reviews.reviewerIdFilter')}</span>
          <input
            className={FILTER_INPUT_CLASS}
            value={filters.reviewerId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, reviewerId: event.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.reviews.revieweeIdFilter')}</span>
          <input
            className={FILTER_INPUT_CLASS}
            value={filters.revieweeId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, revieweeId: event.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>{t('app.admin.reviews.orderIdFilter')}</span>
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setAppliedFilters(filters)}
        >
          {t('app.admin.reviews.applyFilters')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => void loadReviews()}>
          {t('app.admin.reviews.refresh')}
        </Button>
      </div>

      {loading && !loadedOnce ? (
        <RequestsListSkeleton rows={3} itemClassName="h-16 w-full rounded-lg" />
      ) : null}
      {loadError ? (
        <PanelErrorState
          message={loadError}
          retryLabel={t('app.admin.reviews.retry')}
          onRetry={() => void loadReviews()}
        />
      ) : null}
      {!loading && loadedOnce && items.length === 0 ? (
        <PanelEmptyState title={t('app.admin.reviews.title')} body={t('app.admin.reviews.empty')} />
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
                  item.isHidden && 'border-amber-500/30',
                )}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {item.rating}/5 · {item.reviewerRole} → {item.revieweeRole}
                  </span>
                  <span className="wayly-status-badge wayly-status-default text-[10px]">
                    {item.isHidden ? t('app.admin.reviews.hidden') : t('app.admin.reviews.visible')}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-muted-foreground">{item.comment ?? '—'}</p>
                <p className="mt-0.5 text-muted-foreground">{formatDateTime(item.createdAt)}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/5 p-3 text-xs">
          <dl className="grid gap-1">
            <div>
              <dt className="font-medium">{t('app.admin.reviews.orderId')}</dt>
              <dd className="font-mono text-muted-foreground">{selected.orderId}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('app.admin.reviews.reviewerId')}</dt>
              <dd className="font-mono text-muted-foreground">{selected.reviewerId}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('app.admin.reviews.revieweeId')}</dt>
              <dd className="font-mono text-muted-foreground">{selected.revieweeId}</dd>
            </div>
            <div>
              <dt className="font-medium">{t('app.admin.reviews.rating')}</dt>
              <dd className="text-muted-foreground">{selected.rating} / 5</dd>
            </div>
            {selected.comment ? (
              <div>
                <dt className="font-medium">{t('app.admin.reviews.comment')}</dt>
                <dd className="whitespace-pre-wrap text-muted-foreground">{selected.comment}</dd>
              </div>
            ) : null}
            {selected.tags.length > 0 ? (
              <div>
                <dt className="font-medium">{t('app.admin.reviews.tags')}</dt>
                <dd className="text-muted-foreground">{selected.tags.join(', ')}</dd>
              </div>
            ) : null}
          </dl>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editHidden}
              onChange={(event) => setEditHidden(event.target.checked)}
              disabled={moderating}
            />
            <span>{editHidden ? t('app.admin.reviews.hide') : t('app.admin.reviews.unhide')}</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">{t('app.admin.reviews.adminNote')}</span>
            <textarea
              className={TEXTAREA_CLASS}
              value={editAdminNote}
              onChange={(event) => setEditAdminNote(event.target.value)}
              disabled={moderating}
            />
          </label>

          {moderationError ? (
            <p className="text-destructive" role="alert">
              {moderationError}
            </p>
          ) : null}
          {moderationSuccess ? (
            <p className="text-emerald-600 dark:text-emerald-400" role="status">
              {t('app.admin.reviews.moderationSuccess')}
            </p>
          ) : null}

          <Button
            type="button"
            size="sm"
            disabled={moderating}
            onClick={() => void handleModerate()}
          >
            {moderating ? t('app.admin.reviews.saving') : t('app.admin.reviews.saveModeration')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
