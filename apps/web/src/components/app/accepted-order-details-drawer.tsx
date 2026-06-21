'use client';

import type { DeliveryOrderDetail } from '@wayly/types';
import {
  DeliveryOrderSource,
  DeliveryOrderStatus,
  DeliveryOrderType,
  PaymentStatus,
} from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { formatShortOrderReference } from '@/components/app/availability-request-converted-order';
import { DeliveryOrderSourceBadge } from '@/components/app/delivery-order-source-badge';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

export type AcceptedOrderDetailsPanelRole = 'sender' | 'wayler';

export type AcceptedOrderDetailsInput = {
  id: string;
  title: string;
  status: DeliveryOrderDetail['status'];
  type: DeliveryOrderDetail['type'];
  sourceType: DeliveryOrderDetail['sourceType'];
  availabilityRequestId: string | null;
  pickupCountry: string | null;
  pickupCity: string | null;
  dropoffCountry: string | null;
  dropoffCity: string | null;
  currency: string;
  offeredRewardAmount: string | null;
  acceptedAt?: string | null;
  deliveredAt?: string | null;
  /** Set when payment was loaded on the accepted card; omit step when undefined (load failed). */
  paymentStatus?: PaymentStatus | null;
};

type AcceptedOrderDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  order: AcceptedOrderDetailsInput | null;
  panelRole: AcceptedOrderDetailsPanelRole;
  statusLabel: string;
};

function formatLocation(city: string | null, country: string | null): string {
  const parts = [city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

function formatReward(amount: string | null, currency: string, noneLabel: string): string {
  return amount ? `${amount} ${currency}` : noneLabel;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString();
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/40 bg-muted/15 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium sm:max-w-[65%] sm:text-right">{value}</dd>
    </div>
  );
}

type CopyFeedback = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2000;

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function OrderReferenceCopyAction({ orderId }: { orderId: string }) {
  const { t } = useI18n();
  const [feedback, setFeedback] = useState<CopyFeedback>('idle');
  const [copying, setCopying] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFeedback('idle');
    setCopying(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [orderId]);

  const handleCopy = useCallback(async () => {
    if (copying || feedback === 'copied') {
      return;
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    setCopying(true);
    const ok = await copyTextToClipboard(orderId);
    setCopying(false);
    setFeedback(ok ? 'copied' : 'failed');

    resetTimerRef.current = setTimeout(() => {
      setFeedback('idle');
      resetTimerRef.current = null;
    }, COPY_FEEDBACK_MS);
  }, [copying, feedback, orderId]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xs text-muted-foreground">
          {t('app.orders.orderReference')}:{' '}
          <span className="font-mono text-foreground">{formatShortOrderReference(orderId)}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs"
          disabled={copying || feedback === 'copied'}
          onClick={() => void handleCopy()}
          aria-label={t('app.orders.copyReference')}
        >
          {copying
            ? t('app.orders.copyReference')
            : feedback === 'copied'
              ? t('app.orders.referenceCopied')
              : t('app.orders.copyReference')}
        </Button>
      </div>
      {feedback === 'copied' ? (
        <p className="text-xs text-primary" role="status" aria-live="polite">
          {t('app.orders.referenceCopied')}
        </p>
      ) : null}
      {feedback === 'failed' ? (
        <p className="text-xs text-danger" role="alert">
          {t('app.orders.referenceCopyFailed')}
        </p>
      ) : null}
    </div>
  );
}

type TimelineStepState = 'complete' | 'current' | 'pending';

type TimelineStep = {
  id: string;
  label: string;
  state: TimelineStepState;
  detail: string | null;
};

function isPaymentProgressed(status: PaymentStatus | null | undefined): boolean {
  if (status === null || status === undefined) {
    return false;
  }
  return (
    status === PaymentStatus.AUTHORIZED ||
    status === PaymentStatus.HELD_IN_ESCROW ||
    status === PaymentStatus.RELEASED ||
    status === PaymentStatus.REFUNDED
  );
}

function paymentStatusLabel(
  paymentStatus: PaymentStatus | null,
  panelRole: AcceptedOrderDetailsPanelRole,
  t: (key: TranslationKey) => string,
): string {
  if (panelRole === 'sender') {
    switch (paymentStatus) {
      case PaymentStatus.AUTHORIZED:
        return t('app.senderPanel.payment.authorized');
      case PaymentStatus.HELD_IN_ESCROW:
        return t('app.senderPanel.payment.heldInEscrow');
      case PaymentStatus.RELEASED:
        return t('app.senderPanel.payment.released');
      case PaymentStatus.REFUNDED:
        return t('app.senderPanel.payment.refunded');
      case PaymentStatus.FAILED:
        return t('app.senderPanel.payment.failed');
      case PaymentStatus.CANCELLED:
        return t('app.senderPanel.payment.cancelled');
      default:
        return t('app.senderPanel.payment.notAuthorized');
    }
  }

  switch (paymentStatus) {
    case PaymentStatus.AUTHORIZED:
      return t('app.waylerFeed.acceptedPanel.payment.authorized');
    case PaymentStatus.HELD_IN_ESCROW:
      return t('app.waylerFeed.acceptedPanel.payment.heldInEscrow');
    case PaymentStatus.RELEASED:
      return t('app.waylerFeed.acceptedPanel.payment.released');
    case PaymentStatus.REFUNDED:
      return t('app.waylerFeed.acceptedPanel.payment.refunded');
    case PaymentStatus.FAILED:
      return t('app.waylerFeed.acceptedPanel.payment.failed');
    case PaymentStatus.CANCELLED:
      return t('app.waylerFeed.acceptedPanel.payment.cancelled');
    default:
      return t('app.waylerFeed.acceptedPanel.payment.notAuthorized');
  }
}

function resolveCurrentStepId(
  status: DeliveryOrderDetail['status'],
  includePayment: boolean,
  paymentStatus: PaymentStatus | null | undefined,
): string {
  if (status === DeliveryOrderStatus.DELIVERED) {
    return 'delivered';
  }
  if (status === DeliveryOrderStatus.IN_TRANSIT) {
    return 'in-delivery';
  }
  if (includePayment && !isPaymentProgressed(paymentStatus)) {
    return 'payment';
  }
  return 'in-delivery';
}

function buildDeliveryTimelineSteps(
  status: DeliveryOrderDetail['status'],
  acceptedAt: string | null | undefined,
  deliveredAt: string | null | undefined,
  paymentStatus: PaymentStatus | null | undefined,
  panelRole: AcceptedOrderDetailsPanelRole,
  t: (key: TranslationKey) => string,
): TimelineStep[] {
  const includePayment = paymentStatus !== undefined;
  const allComplete = status === DeliveryOrderStatus.DELIVERED;
  const currentStepId = resolveCurrentStepId(status, includePayment, paymentStatus);
  const currentIndex = (() => {
    const ids = ['accepted', ...(includePayment ? ['payment'] : []), 'in-delivery', 'delivered'];
    return ids.indexOf(currentStepId);
  })();

  const stepDefs: { id: string; label: string; detail: string | null }[] = [
    {
      id: 'accepted',
      label: t('app.senderPanel.statusAccepted'),
      detail: formatDate(acceptedAt) ?? (acceptedAt ? null : t('app.orders.dateUnavailable')),
    },
  ];

  if (includePayment) {
    stepDefs.push({
      id: 'payment',
      label: t('app.senderPanel.payment.title'),
      detail: paymentStatusLabel(paymentStatus ?? null, panelRole, t),
    });
  }

  stepDefs.push(
    {
      id: 'in-delivery',
      label: t('app.senderPanel.statusInTransit'),
      detail: null,
    },
    {
      id: 'delivered',
      label: t('app.senderPanel.statusDelivered'),
      detail: formatDate(deliveredAt) ?? (deliveredAt ? null : t('app.orders.dateUnavailable')),
    },
  );

  return stepDefs.map((step, index) => {
    let state: TimelineStepState;
    if (allComplete) {
      state = 'complete';
    } else if (index < currentIndex) {
      state = 'complete';
    } else if (index === currentIndex) {
      state = 'current';
    } else {
      state = 'pending';
    }

    let detail = step.detail;
    if (state === 'pending' && step.id !== 'payment') {
      detail = t('app.orders.progressPending');
    } else if (state === 'current' && step.id === 'in-delivery') {
      detail = t('app.orders.progressCurrent');
    } else if (state === 'current' && step.id === 'payment') {
      detail = paymentStatusLabel(paymentStatus ?? null, panelRole, t);
    } else if (state === 'pending' && step.id === 'payment') {
      detail = t('app.orders.progressPending');
    } else if (state === 'complete' && step.id === 'delivered' && !deliveredAt) {
      detail = null;
    }

    return { ...step, state, detail };
  });
}

function DeliveryProgressTimeline({ steps }: { steps: TimelineStep[] }) {
  const { t } = useI18n();

  return (
    <section
      className="rounded-lg border border-border/60 bg-muted/10 p-3"
      aria-label={t('app.orders.deliveryProgress')}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('app.orders.deliveryProgress')}
      </h3>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-0.5">
              <span
                className={cn(
                  'flex h-3 w-3 shrink-0 rounded-full border-2',
                  step.state === 'complete' && 'border-primary bg-primary',
                  step.state === 'current' && 'border-primary bg-background ring-2 ring-primary/25',
                  step.state === 'pending' && 'border-muted-foreground/35 bg-background',
                )}
                aria-hidden
              />
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    'my-0.5 w-px min-h-[1.125rem] flex-1',
                    step.state === 'complete' ? 'bg-primary/50' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className={cn('min-w-0', index < steps.length - 1 ? 'pb-3' : 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-snug',
                  step.state === 'pending' && 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
              {step.detail ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DetailFieldsSection({
  detail,
  order,
  t,
}: {
  detail: DeliveryOrderDetail | null;
  order: AcceptedOrderDetailsInput;
  t: (key: TranslationKey) => string;
}) {
  const pickupCity = detail?.pickupCity ?? order.pickupCity;
  const pickupCountry = detail?.pickupCountry ?? order.pickupCountry;
  const dropoffCity = detail?.dropoffCity ?? order.dropoffCity;
  const dropoffCountry = detail?.dropoffCountry ?? order.dropoffCountry;

  return (
    <dl className="flex flex-col gap-2">
      <DetailRow
        label={t('app.orders.route')}
        value={`${formatLocation(pickupCity, pickupCountry)} ${t('app.orders.routeSeparator')} ${formatLocation(dropoffCity, dropoffCountry)}`}
      />
      {detail?.pickupAddressText ? (
        <DetailRow label={t('app.orders.pickup')} value={detail.pickupAddressText} />
      ) : null}
      {detail?.dropoffAddressText ? (
        <DetailRow label={t('app.orders.dropoff')} value={detail.dropoffAddressText} />
      ) : null}
      <DetailRow
        label={t('app.orders.reward')}
        value={formatReward(
          detail?.offeredRewardAmount ?? order.offeredRewardAmount,
          detail?.currency ?? order.currency,
          t('app.orders.rewardNone'),
        )}
      />
      {detail?.pickupDateFrom ? (
        <DetailRow
          label={t('app.orders.labelPickupFrom')}
          value={formatDate(detail.pickupDateFrom) ?? detail.pickupDateFrom}
        />
      ) : null}
      {detail?.pickupDateTo ? (
        <DetailRow
          label={t('app.orders.labelPickupTo')}
          value={formatDate(detail.pickupDateTo) ?? detail.pickupDateTo}
        />
      ) : null}
      {detail?.deliveryDeadline ? (
        <DetailRow
          label={t('app.orders.labelDeadline')}
          value={formatDate(detail.deliveryDeadline) ?? detail.deliveryDeadline}
        />
      ) : null}
      {detail?.description ? (
        <DetailRow label={t('app.orders.fieldDescription')} value={detail.description} />
      ) : null}
      {detail?.notes ? <DetailRow label={t('app.orders.notes')} value={detail.notes} /> : null}
    </dl>
  );
}

export function AcceptedOrderDetailsDrawer({
  open,
  onClose,
  order,
  panelRole,
  statusLabel,
}: AcceptedOrderDetailsDrawerProps) {
  const { t } = useI18n();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [detail, setDetail] = useState<DeliveryOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  const loadOrderDetail = useCallback(
    async (orderId: string, signal: { cancelled: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.orders.detail(orderId);
        if (!signal.cancelled) {
          setDetail(result);
          setError(null);
        }
      } catch {
        if (!signal.cancelled) {
          setError(t('app.orders.detailsLoadFailed'));
        }
      } finally {
        if (!signal.cancelled) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  useEffect(() => {
    if (!open || !order) {
      setDetail(null);
      setError(null);
      setLoading(false);
      setReloadAttempt(0);
      return;
    }

    const orderId = order.id;
    const signal = { cancelled: false };
    void loadOrderDetail(orderId, signal);

    return () => {
      signal.cancelled = true;
    };
  }, [open, order?.id, reloadAttempt, loadOrderDetail, order]);

  const handleReload = useCallback(() => {
    if (loading) {
      return;
    }
    setReloadAttempt((attempt) => attempt + 1);
  }, [loading]);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !order) {
    return null;
  }

  const showInitialLoading = loading && detail === null;
  const isRefreshing = loading && detail !== null;
  const showMissingDetail = !loading && !error && detail === null;
  const showFallbackSummary = Boolean(error && !detail);

  const acceptedAt = detail?.acceptedAt ?? order.acceptedAt;
  const deliveredAt = detail?.deliveredAt ?? order.deliveredAt;
  const typeLabel =
    (detail?.type ?? order.type) === DeliveryOrderType.LOCAL
      ? t('app.orders.typeLocal')
      : t('app.orders.typeInternational');
  const roleLabel =
    panelRole === 'sender' ? t('app.orders.detailsRoleSender') : t('app.orders.detailsRoleWayler');
  const timelineSteps = buildDeliveryTimelineSteps(
    detail?.status ?? order.status,
    acceptedAt,
    deliveredAt,
    order.paymentStatus,
    panelRole,
    t,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={cn(
          'flex max-h-[90vh] w-full flex-col border border-border bg-background shadow-lg',
          'rounded-t-xl sm:max-w-lg sm:rounded-lg',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-semibold">
              {t('app.orders.orderDetails')}
            </p>
            <p className="truncate text-xs text-muted-foreground">{order.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs"
              disabled={loading}
              onClick={handleReload}
            >
              {isRefreshing ? t('app.orders.detailsRefreshing') : t('app.orders.refreshDetails')}
            </Button>
            <Button
              ref={closeButtonRef}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs"
              onClick={onClose}
            >
              {t('app.orders.closeDetails')}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          {error ? (
            <PanelErrorState
              message={error}
              retryLabel={t('app.orders.retryDetails')}
              onRetry={handleReload}
              retryDisabled={loading}
            />
          ) : null}
          {isRefreshing ? (
            <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
              {t('app.orders.detailsRefreshing')}
            </p>
          ) : null}
          {showFallbackSummary ? (
            <p className="text-xs text-muted-foreground">{t('app.orders.detailsFallbackNotice')}</p>
          ) : null}

          {showInitialLoading ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                {t('app.orders.detailsLoading')}
              </p>
              <RequestsListSkeleton rows={4} itemClassName="h-12 w-full rounded-lg" />
            </div>
          ) : null}

          {!showInitialLoading ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('wayly-status-badge text-xs')}>{statusLabel}</span>
                <span className="text-xs text-muted-foreground">{typeLabel}</span>
              </div>

              <p className="text-xs text-muted-foreground">{roleLabel}</p>

              <OrderReferenceCopyAction orderId={order.id} />

              {order.sourceType === DeliveryOrderSource.WAYLER_AVAILABILITY_REQUEST ? (
                <DeliveryOrderSourceBadge
                  sourceType={order.sourceType}
                  availabilityRequestId={order.availabilityRequestId}
                />
              ) : (
                <span className="wayly-status-badge wayly-status-default w-fit text-xs">
                  {t('app.orders.postedOrder')}
                </span>
              )}

              <DeliveryProgressTimeline steps={timelineSteps} />

              {showMissingDetail ? (
                <PanelEmptyState
                  title={t('app.orders.detailsMissingTitle')}
                  body={t('app.orders.detailsMissingBody')}
                />
              ) : (
                <DetailFieldsSection detail={detail} order={order} t={t} />
              )}
            </>
          ) : (
            <>
              <OrderReferenceCopyAction orderId={order.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
