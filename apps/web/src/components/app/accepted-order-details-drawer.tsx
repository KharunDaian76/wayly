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
import { OrderLifecycleTimeline } from '@/components/app/order-lifecycle-timeline';
import { DeliveryProofGuidance } from '@/components/app/delivery-proof-guidance';
import { PaymentTransparencyNote } from '@/components/app/payment-transparency-note';
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
  const orderStatus = detail?.status ?? order.status;
  const proofFlowEnabled =
    orderStatus === DeliveryOrderStatus.IN_TRANSIT ||
    orderStatus === DeliveryOrderStatus.DELIVERED ||
    Boolean(detail?.proofSubmittedAt);
  const typeLabel =
    (detail?.type ?? order.type) === DeliveryOrderType.LOCAL
      ? t('app.orders.typeLocal')
      : t('app.orders.typeInternational');
  const roleLabel =
    panelRole === 'sender' ? t('app.orders.detailsRoleSender') : t('app.orders.detailsRoleWayler');

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

              <OrderLifecycleTimeline
                status={orderStatus}
                sourceType={detail?.sourceType ?? order.sourceType}
                createdAt={detail?.createdAt ?? null}
                publishedAt={detail?.publishedAt ?? null}
                acceptedAt={acceptedAt}
                deliveredAt={deliveredAt}
                cancelledAt={detail?.cancelledAt ?? null}
                proofFlowEnabled={proofFlowEnabled}
              />

              {order.paymentStatus !== undefined || proofFlowEnabled ? (
                <PaymentTransparencyNote variant={panelRole} />
              ) : null}

              {proofFlowEnabled ? (
                <DeliveryProofGuidance
                  variant={panelRole}
                  status={orderStatus}
                  proofSubmittedAt={detail?.proofSubmittedAt ?? null}
                  paymentStatus={order.paymentStatus}
                />
              ) : null}

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
