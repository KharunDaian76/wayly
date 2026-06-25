'use client';

import type {
  AdminPaymentQueueItem,
  PaymentAdminReviewDecision,
  PaymentAdminReviewStatus,
  UserRole,
} from '@wayly/types';
import {
  PaymentAdminReviewDecision as PaymentAdminReviewDecisionEnum,
  PaymentAdminReviewStatus as PaymentAdminReviewStatusEnum,
} from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { adminPaymentStatusKey } from '@/components/app/admin-orders-queue-panel';
import { disputeStatusKey } from '@/components/app/dispute-panel';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import {
  hasAdminModerationAccess,
  hasOperationsDashboardAccess,
} from '@/lib/auth/operations-dashboard-access';
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

const REFUND_DECISION_OPTIONS = [
  PaymentAdminReviewDecisionEnum.RECOMMEND_FULL_REFUND,
  PaymentAdminReviewDecisionEnum.RECOMMEND_PARTIAL_REFUND,
  PaymentAdminReviewDecisionEnum.NO_ACTION,
  PaymentAdminReviewDecisionEnum.OTHER,
] as const;

const RELEASE_DECISION_OPTIONS = [
  PaymentAdminReviewDecisionEnum.RECOMMEND_RELEASE,
  PaymentAdminReviewDecisionEnum.NO_ACTION,
  PaymentAdminReviewDecisionEnum.OTHER,
] as const;

export type AdminPaymentsQueuePanelProps = {
  roles: UserRole[];
};

type CardAction =
  | 'markManualReview'
  | 'clearManualReview'
  | 'recordRefundDecision'
  | 'recordReleaseDecision';

type ActiveForm = 'manualReview' | 'clearManualReview' | 'refundDecision' | 'releaseDecision';

export function adminPaymentReviewStatusKey(status: PaymentAdminReviewStatus): TranslationKey {
  if (status === PaymentAdminReviewStatusEnum.MANUAL_REVIEW) {
    return 'app.admin.paymentManualReview';
  }
  if (status === PaymentAdminReviewStatusEnum.REFUND_DECISION_RECORDED) {
    return 'app.admin.paymentReviewRefundDecisionRecorded';
  }
  if (status === PaymentAdminReviewStatusEnum.RELEASE_DECISION_RECORDED) {
    return 'app.admin.paymentReviewReleaseDecisionRecorded';
  }
  return 'app.admin.paymentReviewNone';
}

export function adminPaymentReviewDecisionKey(
  decision: PaymentAdminReviewDecision,
): TranslationKey {
  const map: Record<PaymentAdminReviewDecision, TranslationKey> = {
    RECOMMEND_FULL_REFUND: 'app.admin.paymentDecisionRecommendFullRefund',
    RECOMMEND_PARTIAL_REFUND: 'app.admin.paymentDecisionRecommendPartialRefund',
    RECOMMEND_RELEASE: 'app.admin.paymentDecisionRecommendRelease',
    NO_ACTION: 'app.admin.paymentDecisionNoAction',
    OTHER: 'app.admin.paymentDecisionOther',
  };
  return map[decision];
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
  const canModerate = hasAdminModerationAccess(roles);
  const [items, setItems] = useState<AdminPaymentQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeFormType, setActiveFormType] = useState<ActiveForm | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [refundDecisions, setRefundDecisions] = useState<
    Record<string, PaymentAdminReviewDecision>
  >({});
  const [releaseDecisions, setReleaseDecisions] = useState<
    Record<string, PaymentAdminReviewDecision>
  >({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cardActions, setCardActions] = useState<Record<string, CardAction | null>>({});
  const [cardActionErrors, setCardActionErrors] = useState<Record<string, string>>({});
  const [cardActionSuccess, setCardActionSuccess] = useState<Record<string, string>>({});

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

  const updateItemInList = useCallback((updated: AdminPaymentQueueItem) => {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const closeForm = useCallback((itemId: string) => {
    setActiveFormId(null);
    setActiveFormType(null);
    setFormErrors((current) => ({ ...current, [itemId]: '' }));
  }, []);

  const openForm = useCallback((itemId: string, formType: ActiveForm) => {
    setActiveFormId(itemId);
    setActiveFormType(formType);
    setFormErrors((current) => ({ ...current, [itemId]: '' }));
    setCardActionErrors((current) => ({ ...current, [itemId]: '' }));
    setCardActionSuccess((current) => ({ ...current, [itemId]: '' }));
  }, []);

  const handleMarkManualReview = useCallback(
    async (item: AdminPaymentQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      if (!note) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'markManualReview' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.markPaymentManualReview(item.id, { note });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentManualReviewMarkedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

  const handleClearManualReview = useCallback(
    async (item: AdminPaymentQueueItem) => {
      setCardActions((current) => ({ ...current, [item.id]: 'clearManualReview' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      const note = (reviewNotes[item.id] ?? '').trim();

      try {
        const updated = await api.admin.clearPaymentManualReview(
          item.id,
          note ? { note } : undefined,
        );
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentManualReviewClearedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

  const handleRecordRefundDecision = useCallback(
    async (item: AdminPaymentQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      const decision = refundDecisions[item.id];
      if (!decision) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewDecisionRequired'),
        }));
        return;
      }
      if (!note) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'recordRefundDecision' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.recordPaymentRefundDecision(item.id, {
          decision: decision as (typeof REFUND_DECISION_OPTIONS)[number],
          note,
        });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentRefundDecisionRecordedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, refundDecisions, reviewNotes, t, updateItemInList],
  );

  const handleRecordReleaseDecision = useCallback(
    async (item: AdminPaymentQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      const decision = releaseDecisions[item.id];
      if (!decision) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewDecisionRequired'),
        }));
        return;
      }
      if (!note) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'recordReleaseDecision' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.recordPaymentReleaseDecision(item.id, {
          decision: decision as (typeof RELEASE_DECISION_OPTIONS)[number],
          note,
        });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReleaseDecisionRecordedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.paymentReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, releaseDecisions, reviewNotes, t, updateItemInList],
  );

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
        {!canModerate ? (
          <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
        ) : null}
      </div>

      {canModerate ? (
        <p className="px-3 text-xs text-muted-foreground">
          {t('app.admin.paymentDecisionOnlyNotice')}
        </p>
      ) : null}

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
            {items.map((item) => {
              const isActionLoading = cardActions[item.id] != null;
              const showForm = activeFormId === item.id && activeFormType != null;

              return (
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
                    <div className="flex flex-col items-end gap-1">
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminPaymentStatusKey(item.status))}
                      </span>
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminPaymentReviewStatusKey(item.adminReviewStatus))}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">
                        {t('app.admin.paymentReviewStatus')}
                      </dt>
                      <dd className="font-medium">
                        {t(adminPaymentReviewStatusKey(item.adminReviewStatus))}
                      </dd>
                    </div>
                    {item.adminReviewDecision ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.paymentReviewDecision')}
                        </dt>
                        <dd className="font-medium">
                          {t(adminPaymentReviewDecisionKey(item.adminReviewDecision))}
                        </dd>
                      </div>
                    ) : null}
                    {item.adminReviewAt ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.paymentReviewRecordedAt')}
                        </dt>
                        <dd>{formatDateTime(item.adminReviewAt)}</dd>
                      </div>
                    ) : null}
                    {item.adminReviewNote ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-muted-foreground">
                          {t('app.admin.paymentReviewNote')}
                        </dt>
                        <dd className="whitespace-pre-wrap text-sm">{item.adminReviewNote}</dd>
                      </div>
                    ) : null}
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
                      <dt className="text-muted-foreground">
                        {t('app.admin.paymentDisputeStatus')}
                      </dt>
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
                  {formErrors[item.id] ? (
                    <p className="mt-3 text-xs text-destructive" role="alert">
                      {formErrors[item.id]}
                    </p>
                  ) : null}

                  {canModerate ? (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
                      {!showForm ? (
                        <>
                          {item.adminReviewStatus !== PaymentAdminReviewStatusEnum.MANUAL_REVIEW ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => openForm(item.id, 'manualReview')}
                            >
                              {t('app.admin.markPaymentManualReview')}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => openForm(item.id, 'clearManualReview')}
                            >
                              {t('app.admin.clearPaymentManualReview')}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isActionLoading}
                            onClick={() => openForm(item.id, 'refundDecision')}
                          >
                            {t('app.admin.recordPaymentRefundDecision')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isActionLoading}
                            onClick={() => openForm(item.id, 'releaseDecision')}
                          >
                            {t('app.admin.recordPaymentReleaseDecision')}
                          </Button>
                        </>
                      ) : null}

                      {showForm && activeFormType === 'manualReview' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.paymentReviewNotePlaceholder')}
                            maxLength={500}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setReviewNotes((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => void handleMarkManualReview(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.markPaymentManualReview')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => closeForm(item.id)}
                            >
                              {t('app.admin.cancelPaymentReview')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {showForm && activeFormType === 'clearManualReview' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewNoteOptional')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.paymentReviewNotePlaceholder')}
                            maxLength={500}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setReviewNotes((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => void handleClearManualReview(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.clearPaymentManualReview')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => closeForm(item.id)}
                            >
                              {t('app.admin.cancelPaymentReview')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {showForm && activeFormType === 'refundDecision' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewDecision')}
                          </label>
                          <select
                            className={SELECT_CLASS}
                            value={refundDecisions[item.id] ?? ''}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setRefundDecisions((current) => ({
                                ...current,
                                [item.id]: event.target.value as PaymentAdminReviewDecision,
                              }))
                            }
                          >
                            <option value="">{t('app.admin.paymentReviewSelectDecision')}</option>
                            {REFUND_DECISION_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {t(adminPaymentReviewDecisionKey(option))}
                              </option>
                            ))}
                          </select>
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.paymentReviewNotePlaceholder')}
                            maxLength={500}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setReviewNotes((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => void handleRecordRefundDecision(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.recordPaymentRefundDecision')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => closeForm(item.id)}
                            >
                              {t('app.admin.cancelPaymentReview')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {showForm && activeFormType === 'releaseDecision' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewDecision')}
                          </label>
                          <select
                            className={SELECT_CLASS}
                            value={releaseDecisions[item.id] ?? ''}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setReleaseDecisions((current) => ({
                                ...current,
                                [item.id]: event.target.value as PaymentAdminReviewDecision,
                              }))
                            }
                          >
                            <option value="">{t('app.admin.paymentReviewSelectDecision')}</option>
                            {RELEASE_DECISION_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {t(adminPaymentReviewDecisionKey(option))}
                              </option>
                            ))}
                          </select>
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.paymentReviewNotePlaceholder')}
                            maxLength={500}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setReviewNotes((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => void handleRecordReleaseDecision(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.recordPaymentReleaseDecision')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => closeForm(item.id)}
                            >
                              {t('app.admin.cancelPaymentReview')}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
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
