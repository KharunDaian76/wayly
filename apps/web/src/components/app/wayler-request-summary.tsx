'use client';

import type { WaylerAvailabilityRequestSummary } from '@wayly/types';
import { WaylerAvailabilityType } from '@wayly/types';

import { useI18n } from '@/lib/i18n/i18n-context';
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

export type WaylerRequestSummaryProps = {
  request: WaylerAvailabilityRequestSummary;
  /** When known from linked availability; omit to show generic source label. */
  availabilitySourceType?: WaylerAvailabilityType | null;
  compact?: boolean;
  className?: string;
};

export function WaylerRequestSummary({
  request,
  availabilitySourceType,
  compact = false,
  className,
}: WaylerRequestSummaryProps) {
  const { t } = useI18n();

  const pickupTiming = formatTimingRange(request.desiredPickupFrom, request.desiredPickupTo);
  const deliveryTiming = formatTimingRange(request.desiredDeliveryFrom, request.desiredDeliveryTo);
  const timingParts = [pickupTiming, deliveryTiming].filter(Boolean);

  const sourceLabel =
    availabilitySourceType === WaylerAvailabilityType.TRIP_ROUTE
      ? t('app.waylerRequests.fromTripRoute')
      : t('app.waylerRequests.fromAvailability');

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <section>
        <h4
          className={cn(
            'font-semibold uppercase tracking-wide text-muted-foreground',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          {t('app.waylerRequests.summaryTitle')}
        </h4>
        <span
          className={cn(
            'mt-1 inline-flex wayly-status-badge wayly-status-default w-fit',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          {sourceLabel}
        </span>
      </section>

      <section>
        <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('app.waylerRequests.routeTitle')}
        </h5>
        <dl className={cn('mt-1.5 flex flex-col gap-1', compact ? 'text-xs' : 'text-sm')}>
          <SummaryRow
            label={t('app.availabilityRequests.pickupCity')}
            value={formatLocation(request.pickupCity, request.pickupCountry, request.pickupAddress)}
          />
          <SummaryRow
            label={t('app.availabilityRequests.dropoffCity')}
            value={formatLocation(
              request.dropoffCity,
              request.dropoffCountry,
              request.dropoffAddress,
            )}
          />
        </dl>
      </section>

      <section>
        <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t('app.waylerRequests.packageTitle')}
        </h5>
        <dl className={cn('mt-1.5 flex flex-col gap-1', compact ? 'text-xs' : 'text-sm')}>
          <SummaryRow label={t('app.availabilityRequests.requestTitle')} value={request.title} />
          <SummaryRow
            label={t('app.availabilityRequests.packageDescription')}
            value={request.packageDescription}
          />
        </dl>
      </section>

      {timingParts.length > 0 ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.waylerRequests.timingTitle')}
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
          {t('app.waylerRequests.budgetTitle')}
        </h5>
        <p className={cn('mt-1', compact ? 'text-xs' : 'text-sm')}>
          {formatRewardCents(request.proposedRewardCents, request.currency)}
        </p>
      </section>

      {request.message ? (
        <section>
          <h5 className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {t('app.waylerRequests.senderNoteTitle')}
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
    </div>
  );
}

type WaylerRequestAcceptGuidanceProps = {
  className?: string;
  compact?: boolean;
};

export function WaylerRequestAcceptGuidance({
  className,
  compact = false,
}: WaylerRequestAcceptGuidanceProps) {
  const { t } = useI18n();

  return (
    <section
      className={cn(
        'rounded-lg border border-border/60 bg-muted/10',
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
        className,
      )}
      aria-labelledby="wayler-request-accept-guidance"
    >
      <h4
        id="wayler-request-accept-guidance"
        className={cn('font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}
      >
        {t('app.waylerRequests.acceptGuidanceTitle')}
      </h4>
      <ul
        className={cn(
          'mt-2 flex list-disc flex-col gap-1 pl-4 text-muted-foreground',
          compact ? 'text-[11px]' : 'text-xs',
        )}
      >
        <li>{t('app.waylerRequests.acceptingCreatesOrder')}</li>
        <li>{t('app.waylerRequests.decliningCreatesNoOrder')}</li>
        <li>{t('app.waylerRequests.confirmDetailsBeforeAccept')}</li>
        <li>{t('app.waylerRequests.keepCommunicationInsideWayly')}</li>
        <li>{t('app.waylerRequests.chatOpensAfterAccept')}</li>
      </ul>
    </section>
  );
}

type WaylerRequestStatusNoteProps = {
  convertedToOrder: boolean;
  className?: string;
};

export function WaylerRequestStatusNote({
  convertedToOrder,
  className,
}: WaylerRequestStatusNoteProps) {
  const { t } = useI18n();

  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {convertedToOrder
        ? t('app.waylerRequests.convertedToOrder')
        : t('app.waylerRequests.chatOpensAfterAccept')}
    </p>
  );
}
