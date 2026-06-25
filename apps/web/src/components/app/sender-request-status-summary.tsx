'use client';

import type { WaylerAvailabilityRequestSummary } from '@wayly/types';
import { WaylerAvailabilityRequestStatus } from '@wayly/types';

import { AvailabilityRequestConvertedOrder } from '@/components/app/availability-request-converted-order';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

function formatLocation(city: string, country: string, address: string | null): string {
  const place = [city, country].filter(Boolean).join(', ');
  if (!place) {
    return '—';
  }
  return address ? `${place} · ${address}` : place;
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString();
}

function formatTimingRange(from: string | null, to: string | null): string | null {
  const fromLabel = formatDateTime(from);
  const toLabel = formatDateTime(to);
  if (fromLabel && toLabel) {
    return `${fromLabel} → ${toLabel}`;
  }
  return fromLabel ?? toLabel;
}

function formatRewardCents(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

const STATUS_LABEL_KEYS: Record<WaylerAvailabilityRequestStatus, TranslationKey> = {
  [WaylerAvailabilityRequestStatus.PENDING]: 'app.senderRequests.statusPending',
  [WaylerAvailabilityRequestStatus.ACCEPTED]: 'app.senderRequests.statusAccepted',
  [WaylerAvailabilityRequestStatus.DECLINED]: 'app.senderRequests.statusDeclined',
  [WaylerAvailabilityRequestStatus.CANCELLED]: 'app.senderRequests.statusCancelled',
  [WaylerAvailabilityRequestStatus.EXPIRED]: 'app.availabilityRequests.statusExpired',
};

function statusBadgeClass(status: WaylerAvailabilityRequestStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return cn(base, 'wayly-status-open');
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return cn(base, 'wayly-status-accepted');
    case WaylerAvailabilityRequestStatus.DECLINED:
    case WaylerAvailabilityRequestStatus.CANCELLED:
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function nextStepKeys(status: WaylerAvailabilityRequestStatus): TranslationKey[] {
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return [
        'app.senderRequests.waitingWaylerResponse',
        'app.senderRequests.noFinalOrderUntilAccepted',
        'app.senderRequests.continueInsideWayly',
      ];
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return [
        'app.senderRequests.acceptedOrderCreated',
        'app.senderRequests.chatOpensForOrder',
        'app.senderRequests.continueInsideWayly',
      ];
    case WaylerAvailabilityRequestStatus.DECLINED:
      return ['app.senderRequests.declinedNoOrder', 'app.senderRequests.requestAnotherWayler'];
    case WaylerAvailabilityRequestStatus.CANCELLED:
      return ['app.senderRequests.cancelledNoOrder'];
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return ['app.senderRequests.declinedNoOrder', 'app.senderRequests.requestAnotherWayler'];
    default:
      return ['app.senderRequests.continueInsideWayly'];
  }
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-words sm:max-w-[65%] sm:text-right">{value}</dd>
    </div>
  );
}

export type SenderRequestStatusSummaryProps = {
  request: WaylerAvailabilityRequestSummary;
  compact?: boolean;
  className?: string;
};

export function SenderRequestNextStepsGuidance({
  status,
  className,
  compact = false,
}: {
  status: WaylerAvailabilityRequestStatus;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const keys = nextStepKeys(status);

  return (
    <section
      className={cn(
        'rounded-lg border border-border/60 bg-muted/10',
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
        className,
      )}
      aria-label={t('app.senderRequests.summaryTitle')}
    >
      <ul
        className={cn(
          'flex list-disc flex-col gap-1 pl-4 text-muted-foreground',
          compact ? 'text-[11px]' : 'text-xs',
        )}
      >
        {keys.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
    </section>
  );
}

export function SenderRequestStatusSummary({
  request,
  compact = false,
  className,
}: SenderRequestStatusSummaryProps) {
  const { t } = useI18n();

  const pickupTiming = formatTimingRange(request.desiredPickupFrom, request.desiredPickupTo);
  const deliveryTiming = formatTimingRange(request.desiredDeliveryFrom, request.desiredDeliveryTo);
  const sentAt = formatDateTime(request.createdAt);

  return (
    <article className={cn('flex flex-col gap-3', className)}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
            {request.title}
          </h4>
          {sentAt ? (
            <p className={cn('mt-0.5 text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
              {t('app.senderRequests.sentAt')}: {sentAt}
            </p>
          ) : null}
        </div>
        <span className={cn(statusBadgeClass(request.status), compact ? 'text-xs' : 'text-sm')}>
          {t(STATUS_LABEL_KEYS[request.status])}
        </span>
      </header>

      <section>
        <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('app.senderRequests.summaryTitle')}
        </h5>
        <dl className={cn('mt-1.5 flex flex-col gap-1', compact ? 'text-xs' : 'text-sm')}>
          <SummaryRow
            label={t('app.senderRequests.routeTitle')}
            value={`${formatLocation(request.pickupCity, request.pickupCountry, request.pickupAddress)} → ${formatLocation(request.dropoffCity, request.dropoffCountry, request.dropoffAddress)}`}
          />
        </dl>
      </section>

      <section>
        <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('app.senderRequests.packageTitle')}
        </h5>
        <p className={cn('mt-1 break-words', compact ? 'text-xs' : 'text-sm')}>
          {request.packageDescription}
        </p>
      </section>

      {pickupTiming || deliveryTiming ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.senderRequests.timingTitle')}
          </h5>
          <dl className={cn('mt-1.5 flex flex-col gap-1', compact ? 'text-xs' : 'text-sm')}>
            {pickupTiming ? (
              <SummaryRow
                label={t('app.availabilityRequests.desiredPickupFrom')}
                value={pickupTiming}
              />
            ) : null}
            {deliveryTiming ? (
              <SummaryRow
                label={t('app.availabilityRequests.desiredDeliveryFrom')}
                value={deliveryTiming}
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      <section>
        <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('app.senderRequests.budgetTitle')}
        </h5>
        <p className={cn('mt-1', compact ? 'text-xs' : 'text-sm')}>
          {formatRewardCents(request.proposedRewardCents, request.currency)}
        </p>
      </section>

      {request.message ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.availabilityRequests.messageToWayler')}
          </h5>
          <p
            className={cn(
              'mt-1 break-words text-muted-foreground',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {request.message}
          </p>
        </section>
      ) : null}

      {request.responseMessage ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.senderRequests.responseMessageTitle')}
          </h5>
          <p className={cn('mt-1 break-words', compact ? 'text-xs' : 'text-sm')}>
            {request.responseMessage}
          </p>
        </section>
      ) : null}

      <SenderRequestNextStepsGuidance compact status={request.status} />

      {request.deliveryOrderId ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.senderRequests.convertedOrderTitle')}
          </h5>
          <AvailabilityRequestConvertedOrder deliveryOrderId={request.deliveryOrderId} />
        </section>
      ) : null}
    </article>
  );
}
