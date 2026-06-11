'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

/** Compact order reference for cards (first 8 hex chars, no dashes). */
export function formatShortOrderReference(orderId: string): string {
  const compact = orderId.replace(/-/g, '');
  if (compact.length <= 8) {
    return compact;
  }
  return `${compact.slice(0, 8)}…`;
}

type AvailabilityRequestConvertedOrderProps = {
  deliveryOrderId: string;
};

export function AvailabilityRequestConvertedOrder({
  deliveryOrderId,
}: AvailabilityRequestConvertedOrderProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'mt-2 rounded-md border border-border/80 bg-muted/30 px-2.5 py-2 text-xs',
        'flex flex-col gap-1',
      )}
      role="note"
    >
      <span className={cn('wayly-status-badge wayly-status-default w-fit text-xs')}>
        {t('app.availabilityRequests.convertedToOrder')}
      </span>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">
          {t('app.availabilityRequests.linkedOrder')}
        </span>
        {' · '}
        {t('app.availabilityRequests.orderReference')}:{' '}
        <span className="font-mono text-foreground">
          {formatShortOrderReference(deliveryOrderId)}
        </span>
      </p>
    </div>
  );
}
