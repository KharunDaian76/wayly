'use client';

import {
  DeliveryOrderSource,
  type DeliveryOrderSource as DeliveryOrderSourceType,
} from '@wayly/types';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

import { formatShortOrderReference } from './availability-request-converted-order';

type DeliveryOrderSourceBadgeProps = {
  sourceType?: DeliveryOrderSourceType | null;
  availabilityRequestId?: string | null;
};

export function DeliveryOrderSourceBadge({
  sourceType,
  availabilityRequestId,
}: DeliveryOrderSourceBadgeProps) {
  const { t } = useI18n();

  if (sourceType !== DeliveryOrderSource.WAYLER_AVAILABILITY_REQUEST) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-2 rounded-md border border-border/80 bg-muted/30 px-2.5 py-2 text-xs',
        'flex flex-col gap-1',
      )}
      role="note"
    >
      <span className={cn('wayly-status-badge wayly-status-default w-fit text-xs')}>
        {t('app.orders.fromWaylerRequest')}
      </span>
      {availabilityRequestId ? (
        <p className="text-muted-foreground">
          {t('app.orders.requestReference')}:{' '}
          <span className="font-mono text-foreground">
            {formatShortOrderReference(availabilityRequestId)}
          </span>
        </p>
      ) : null}
    </div>
  );
}
