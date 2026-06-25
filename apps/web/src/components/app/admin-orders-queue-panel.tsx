'use client';

import type {
  AdminOrderQueueItem,
  DeliveryOrderSource,
  DeliveryOrderStatus,
  OrderAdminReviewDecision,
  OrderAdminReviewStatus,
  PaymentStatus,
  UserRole,
} from '@wayly/types';
import {
  DeliveryOrderSource as DeliveryOrderSourceEnum,
  OrderAdminReviewDecision as OrderAdminReviewDecisionEnum,
  OrderAdminReviewStatus as OrderAdminReviewStatusEnum,
} from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

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

const DECISION_OPTIONS = [
  OrderAdminReviewDecisionEnum.MONITOR,
  OrderAdminReviewDecisionEnum.ESCALATE_PAYMENT,
  OrderAdminReviewDecisionEnum.ESCALATE_DISPUTE,
  OrderAdminReviewDecisionEnum.NO_ACTION,
  OrderAdminReviewDecisionEnum.OTHER,
] as const;

export type AdminOrdersQueuePanelProps = {
  roles: UserRole[];
};

type CardAction =
  | 'markManualReview'
  | 'clearManualReview'
  | 'recordDecision'
  | 'flagRisk'
  | 'clearRisk';

type ActiveForm =
  | 'manualReview'
  | 'clearManualReview'
  | 'recordDecision'
  | 'flagRisk'
  | 'clearRisk';

export function adminOrderStatusKey(status: DeliveryOrderStatus): TranslationKey {
  return `app.admin.orderStatus.${status}` as TranslationKey;
}

export function adminPaymentStatusKey(status: PaymentStatus): TranslationKey {
  return `app.admin.paymentStatus.${status}` as TranslationKey;
}

export function adminOrderReviewStatusKey(status: OrderAdminReviewStatus): TranslationKey {
  if (status === OrderAdminReviewStatusEnum.MANUAL_REVIEW) {
    return 'app.admin.orderManualReview';
  }
  if (status === OrderAdminReviewStatusEnum.DECISION_RECORDED) {
    return 'app.admin.orderDecisionRecorded';
  }
  if (status === OrderAdminReviewStatusEnum.RISK_FLAGGED) {
    return 'app.admin.orderRiskFlagged';
  }
  return 'app.admin.orderReviewNone';
}

export function adminOrderReviewDecisionKey(decision: OrderAdminReviewDecision): TranslationKey {
  const map: Record<OrderAdminReviewDecision, TranslationKey> = {
    MONITOR: 'app.admin.orderDecisionMonitor',
    ESCALATE_PAYMENT: 'app.admin.orderDecisionEscalatePayment',
    ESCALATE_DISPUTE: 'app.admin.orderDecisionEscalateDispute',
    NO_ACTION: 'app.admin.orderDecisionNoAction',
    OTHER: 'app.admin.orderDecisionOther',
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
  const canModerate = hasAdminModerationAccess(roles);
  const [items, setItems] = useState<AdminOrderQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeFormType, setActiveFormType] = useState<ActiveForm | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, OrderAdminReviewDecision>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cardActions, setCardActions] = useState<Record<string, CardAction | null>>({});
  const [cardActionErrors, setCardActionErrors] = useState<Record<string, string>>({});
  const [cardActionSuccess, setCardActionSuccess] = useState<Record<string, string>>({});

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

  const updateItemInList = useCallback((updated: AdminOrderQueueItem) => {
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
    async (item: AdminOrderQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      if (!note) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'markManualReview' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.markOrderManualReview(item.id, { note });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.orderManualReviewMarkedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

  const handleClearManualReview = useCallback(
    async (item: AdminOrderQueueItem) => {
      setCardActions((current) => ({ ...current, [item.id]: 'clearManualReview' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      const note = (reviewNotes[item.id] ?? '').trim();

      try {
        const updated = await api.admin.clearOrderManualReview(
          item.id,
          note ? { note } : undefined,
        );
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.orderManualReviewClearedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

  const handleRecordDecision = useCallback(
    async (item: AdminOrderQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      const decision = decisions[item.id];
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
          [item.id]: t('app.admin.orderReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'recordDecision' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.recordOrderDecision(item.id, {
          decision: decision as (typeof DECISION_OPTIONS)[number],
          note,
        });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.orderDecisionRecordedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, decisions, reviewNotes, t, updateItemInList],
  );

  const handleFlagRisk = useCallback(
    async (item: AdminOrderQueueItem) => {
      const note = (reviewNotes[item.id] ?? '').trim();
      if (!note) {
        setFormErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewNoteRequired'),
        }));
        return;
      }

      setCardActions((current) => ({ ...current, [item.id]: 'flagRisk' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      try {
        const updated = await api.admin.flagOrderRisk(item.id, { note });
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.orderRiskFlaggedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

  const handleClearRisk = useCallback(
    async (item: AdminOrderQueueItem) => {
      setCardActions((current) => ({ ...current, [item.id]: 'clearRisk' }));
      setCardActionErrors((current) => ({ ...current, [item.id]: '' }));
      setCardActionSuccess((current) => ({ ...current, [item.id]: '' }));
      setFormErrors((current) => ({ ...current, [item.id]: '' }));

      const note = (reviewNotes[item.id] ?? '').trim();

      try {
        const updated = await api.admin.clearOrderRisk(item.id, note ? { note } : undefined);
        updateItemInList(updated);
        closeForm(item.id);
        setReviewNotes((current) => ({ ...current, [item.id]: '' }));
        setCardActionSuccess((current) => ({
          ...current,
          [item.id]: t('app.admin.orderRiskClearedSuccess'),
        }));
      } catch {
        setCardActionErrors((current) => ({
          ...current,
          [item.id]: t('app.admin.orderReviewActionFailed'),
        }));
      } finally {
        setCardActions((current) => ({ ...current, [item.id]: null }));
      }
    },
    [closeForm, reviewNotes, t, updateItemInList],
  );

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
        {!canModerate ? (
          <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
        ) : null}
      </div>

      {canModerate ? (
        <p className="px-3 text-xs text-muted-foreground">{t('app.admin.orderReviewOnlyNotice')}</p>
      ) : null}

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
            {items.map((item) => {
              const isActionLoading = cardActions[item.id] != null;
              const showForm = activeFormId === item.id && activeFormType != null;

              return (
                <li key={item.id} className={LISTING_CARD_CLASS}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {t('app.orders.orderReference')}: {item.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminOrderStatusKey(item.status))}
                      </span>
                      <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                        {t(adminOrderReviewStatusKey(item.adminReviewStatus))}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.admin.orderReviewStatus')}</dt>
                      <dd className="font-medium">
                        {t(adminOrderReviewStatusKey(item.adminReviewStatus))}
                      </dd>
                    </div>
                    {item.adminReviewDecision ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.orderReviewDecision')}
                        </dt>
                        <dd className="font-medium">
                          {t(adminOrderReviewDecisionKey(item.adminReviewDecision))}
                        </dd>
                      </div>
                    ) : null}
                    {item.adminReviewAt ? (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.admin.orderReviewRecordedAt')}
                        </dt>
                        <dd>{formatDateTime(item.adminReviewAt)}</dd>
                      </div>
                    ) : null}
                    {item.adminReviewNote ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-muted-foreground">{t('app.admin.orderReviewNote')}</dt>
                        <dd className="whitespace-pre-wrap text-sm">{item.adminReviewNote}</dd>
                      </div>
                    ) : null}
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
                          {item.adminReviewStatus !== OrderAdminReviewStatusEnum.MANUAL_REVIEW ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => openForm(item.id, 'manualReview')}
                            >
                              {t('app.admin.markOrderManualReview')}
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
                              {t('app.admin.clearOrderManualReview')}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isActionLoading}
                            onClick={() => openForm(item.id, 'recordDecision')}
                          >
                            {t('app.admin.recordOrderDecision')}
                          </Button>
                          {item.adminReviewStatus !== OrderAdminReviewStatusEnum.RISK_FLAGGED ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => openForm(item.id, 'flagRisk')}
                            >
                              {t('app.admin.flagOrderRisk')}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isActionLoading}
                              onClick={() => openForm(item.id, 'clearRisk')}
                            >
                              {t('app.admin.clearOrderRisk')}
                            </Button>
                          )}
                        </>
                      ) : null}

                      {showForm && activeFormType === 'manualReview' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.orderReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.orderReviewNotePlaceholder')}
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
                                : t('app.admin.markOrderManualReview')}
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
                            placeholder={t('app.admin.orderReviewNotePlaceholder')}
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
                                : t('app.admin.clearOrderManualReview')}
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

                      {showForm && activeFormType === 'recordDecision' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.orderReviewDecision')}
                          </label>
                          <select
                            className={SELECT_CLASS}
                            value={decisions[item.id] ?? ''}
                            disabled={isActionLoading}
                            onChange={(event) =>
                              setDecisions((current) => ({
                                ...current,
                                [item.id]: event.target.value as OrderAdminReviewDecision,
                              }))
                            }
                          >
                            <option value="">{t('app.admin.paymentReviewSelectDecision')}</option>
                            {DECISION_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {t(adminOrderReviewDecisionKey(option))}
                              </option>
                            ))}
                          </select>
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.orderReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.orderReviewNotePlaceholder')}
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
                              onClick={() => void handleRecordDecision(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.recordOrderDecision')}
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

                      {showForm && activeFormType === 'flagRisk' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.orderReviewNote')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.orderReviewNotePlaceholder')}
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
                              onClick={() => void handleFlagRisk(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.flagOrderRisk')}
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

                      {showForm && activeFormType === 'clearRisk' ? (
                        <div className="w-full space-y-2">
                          <label className="block text-xs font-medium text-foreground">
                            {t('app.admin.paymentReviewNoteOptional')}
                          </label>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={reviewNotes[item.id] ?? ''}
                            placeholder={t('app.admin.orderReviewNotePlaceholder')}
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
                              onClick={() => void handleClearRisk(item)}
                            >
                              {isActionLoading
                                ? t('app.admin.paymentReviewSaving')
                                : t('app.admin.clearOrderRisk')}
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
