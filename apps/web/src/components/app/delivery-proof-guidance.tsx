'use client';

import {
  DeliveryOrderStatus,
  PaymentStatus,
  type DeliveryOrderStatus as DeliveryOrderStatusType,
} from '@wayly/types';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

export type DeliveryProofGuidanceVariant = 'sender' | 'wayler';

export type DeliveryProofStatusKey =
  | 'proofNotAvailable'
  | 'proofMayBeRequired'
  | 'proofSubmitted'
  | 'waitingSenderConfirmation'
  | 'deliveryConfirmed';

const PROOF_LIFECYCLE_STATUSES = new Set<DeliveryOrderStatusType>([
  DeliveryOrderStatus.ACCEPTED,
  DeliveryOrderStatus.IN_TRANSIT,
  DeliveryOrderStatus.DELIVERED,
]);

const STATUS_CHIP_KEYS: Record<DeliveryProofStatusKey, TranslationKey> = {
  proofNotAvailable: 'app.deliveryProof.proofNotAvailable',
  proofMayBeRequired: 'app.deliveryProof.proofMayBeRequired',
  proofSubmitted: 'app.deliveryProof.proofSubmitted',
  waitingSenderConfirmation: 'app.deliveryProof.waitingSenderConfirmation',
  deliveryConfirmed: 'app.deliveryProof.deliveryConfirmed',
};

export function resolveDeliveryProofStatus(input: {
  status: DeliveryOrderStatusType;
  proofSubmittedAt?: string | null;
  proofLoadFailed?: boolean;
  paymentStatus?: PaymentStatus | null;
  variant: DeliveryProofGuidanceVariant;
}): DeliveryProofStatusKey | null {
  if (!PROOF_LIFECYCLE_STATUSES.has(input.status)) {
    return null;
  }

  if (input.proofLoadFailed) {
    return 'proofNotAvailable';
  }

  const hasProof = Boolean(input.proofSubmittedAt);
  const delivered = input.status === DeliveryOrderStatus.DELIVERED;

  if (delivered && hasProof) {
    if (input.variant === 'sender' && input.paymentStatus === PaymentStatus.HELD_IN_ESCROW) {
      return 'waitingSenderConfirmation';
    }
    return 'deliveryConfirmed';
  }

  if (hasProof) {
    return 'proofSubmitted';
  }

  if (delivered || input.status === DeliveryOrderStatus.IN_TRANSIT) {
    return 'proofMayBeRequired';
  }

  if (input.status === DeliveryOrderStatus.ACCEPTED) {
    return 'proofMayBeRequired';
  }

  return null;
}

export type DeliveryProofGuidanceProps = {
  variant: DeliveryProofGuidanceVariant;
  status: DeliveryOrderStatusType;
  proofSubmittedAt?: string | null;
  proofLoadFailed?: boolean;
  paymentStatus?: PaymentStatus | null;
  compact?: boolean;
  className?: string;
};

function statusChipClass(status: DeliveryProofStatusKey): string {
  switch (status) {
    case 'deliveryConfirmed':
      return 'wayly-status-delivered';
    case 'proofSubmitted':
      return 'wayly-status-accepted';
    case 'waitingSenderConfirmation':
      return 'wayly-status-in-transit';
    case 'proofMayBeRequired':
      return 'wayly-status-open';
    case 'proofNotAvailable':
      return 'wayly-status-default';
    default:
      return 'wayly-status-default';
  }
}

export function DeliveryProofGuidance({
  variant,
  status,
  proofSubmittedAt,
  proofLoadFailed,
  paymentStatus,
  compact = false,
  className,
}: DeliveryProofGuidanceProps) {
  const { t } = useI18n();

  const proofStatus = resolveDeliveryProofStatus({
    status,
    proofSubmittedAt,
    proofLoadFailed,
    paymentStatus,
    variant,
  });

  const roleGuidanceKey =
    variant === 'sender' ? 'app.deliveryProof.senderGuidance' : 'app.deliveryProof.waylerGuidance';

  return (
    <section
      className={cn(
        'rounded-lg border border-border/60 bg-muted/10',
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
        className,
      )}
      aria-labelledby={`delivery-proof-guidance-${variant}`}
    >
      <div className="flex flex-wrap items-start gap-2">
        <span aria-hidden className="text-base leading-none">
          ✓
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              id={`delivery-proof-guidance-${variant}`}
              className={cn('font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}
            >
              {t('app.deliveryProof.title')}
            </h4>
            {proofStatus ? (
              <span
                className={cn(
                  'wayly-status-badge shrink-0 text-[10px] sm:text-xs',
                  statusChipClass(proofStatus),
                )}
              >
                {t(STATUS_CHIP_KEYS[proofStatus])}
              </span>
            ) : null}
          </div>
          {!compact ? (
            <p className="text-xs text-muted-foreground">{t('app.deliveryProof.subtitle')}</p>
          ) : null}
        </div>
      </div>

      <p className={cn('mt-2 text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
        {t(roleGuidanceKey)}
      </p>
      <p className={cn('mt-1 text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
        {variant === 'sender'
          ? t('app.deliveryProof.confirmOnlyAfterChecking')
          : t('app.deliveryProof.proofMayBeRequired')}
      </p>

      <ul
        className={cn(
          'mt-2 flex list-disc flex-col gap-0.5 pl-4 text-muted-foreground',
          compact ? 'text-[11px]' : 'text-xs',
        )}
      >
        <li>{t('app.deliveryProof.keepRelevantSafe')}</li>
        <li>{t('app.deliveryProof.noPrivatePayment')}</li>
        <li>{t('app.deliveryProof.reviewToolsHelp')}</li>
      </ul>
    </section>
  );
}
