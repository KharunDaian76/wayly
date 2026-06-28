'use client';

import { ApiError } from '@wayly/sdk';
import type { UserReviewSummary } from '@wayly/types';
import { DeliveryOrderStatus, REVIEW_TAG_VALUES, type ReviewTag } from '@wayly/types';
import { Button } from '@wayly/ui';
import { Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { AcceptedOrderDetailsPanelRole } from '@/components/app/accepted-order-details-drawer';
import { PanelErrorState } from '@/components/app/panel-status-states';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

function reviewTagKey(tag: string): TranslationKey {
  return `app.reviews.tag.${tag}` as TranslationKey;
}

export type OrderReviewPanelProps = {
  orderId: string;
  orderStatus: DeliveryOrderStatus;
  panelRole: AcceptedOrderDetailsPanelRole;
  revieweeUserId: string | null;
  className?: string;
};

export function UserReviewSummaryLine({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [summary, setSummary] = useState<UserReviewSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api.reviews.getUserSummary(userId).then((result) => {
      if (!cancelled) {
        setSummary(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!summary || summary.visibleReviewCount === 0 || summary.averageRating === null) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>{t('app.reviews.noReviews')}</p>
    );
  }

  return (
    <p className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
      <span>
        {t('app.reviews.average')}: {summary.averageRating.toFixed(1)} ({summary.visibleReviewCount}{' '}
        {t('app.reviews.reviewCount')})
      </span>
    </p>
  );
}

export function OrderReviewPanel({
  orderId,
  orderStatus,
  panelRole,
  revieweeUserId,
  className,
}: OrderReviewPanelProps) {
  const { t } = useI18n();
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const canReview = orderStatus === DeliveryOrderStatus.DELIVERED && Boolean(revieweeUserId);

  const loadMine = useCallback(async () => {
    if (!canReview) {
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const result = await api.reviews.getMineForOrder(orderId);
      setHasReviewed(result.hasReviewed);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : t('app.reviews.error'));
    } finally {
      setLoading(false);
    }
  }, [canReview, orderId, t]);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const toggleTag = (tag: ReviewTag) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canReview || hasReviewed) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await api.reviews.createForOrder(orderId, {
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        tags,
      });
      setHasReviewed(true);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : t('app.reviews.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!canReview) {
    if (orderStatus !== DeliveryOrderStatus.DELIVERED) {
      return (
        <p className={cn('text-xs text-muted-foreground', className)}>
          {t('app.reviews.onlyDelivered')}
        </p>
      );
    }
    return null;
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/5 p-3',
        className,
      )}
    >
      <div>
        <h4 className="text-sm font-semibold">{t('app.reviews.title')}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('app.reviews.subtitle')}</p>
      </div>

      <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
        {t('app.reviews.notice')}
      </p>

      {revieweeUserId ? <UserReviewSummaryLine userId={revieweeUserId} /> : null}

      {loading ? (
        <p className="text-xs text-muted-foreground" role="status">
          {t('app.reviews.loading')}
        </p>
      ) : null}
      {loadError ? (
        <PanelErrorState
          message={loadError}
          retryLabel={t('app.reviews.retry')}
          onRetry={() => void loadMine()}
        />
      ) : null}

      {!loading && hasReviewed ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">
          {t('app.reviews.alreadyReviewed')}
        </p>
      ) : null}

      {!loading && !hasReviewed && !loadError ? (
        <form className="flex flex-col gap-2" onSubmit={(event) => void handleSubmit(event)}>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t('app.reviews.rating')}</span>
            <select
              className={SELECT_CLASS}
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              disabled={submitting}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t('app.reviews.comment')}</span>
            <textarea
              className={TEXTAREA_CLASS}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              disabled={submitting}
              rows={3}
            />
          </label>

          <fieldset className="flex flex-col gap-1.5 text-xs">
            <legend className="font-medium">{t('app.reviews.tags')}</legend>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAG_VALUES.map((tag) => (
                <label key={tag} className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={tags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    disabled={submitting}
                  />
                  <span>{t(reviewTagKey(tag))}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {submitError ? (
            <p className="text-xs text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}
          {submitSuccess ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">
              {t('app.reviews.success')}
            </p>
          ) : null}

          <Button type="submit" size="sm" disabled={submitting} className="self-start">
            {submitting ? t('app.reviews.submitting') : t('app.reviews.submit')}
          </Button>
        </form>
      ) : null}

      <p className="text-[10px] text-muted-foreground">
        {panelRole === 'sender' ? t('app.reviews.roleSender') : t('app.reviews.roleWayler')}
      </p>
    </section>
  );
}
