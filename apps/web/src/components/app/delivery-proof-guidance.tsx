'use client';

import {
  DeliveryOrderStatus,
  PaymentStatus,
  type DeliveryOrderStatus as DeliveryOrderStatusType,
} from '@wayly/types';
import { CheckCircle2 } from 'lucide-react';

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

const PANEL_CLASS = cn(
  'rounded-md border border-border/60 bg-muted/10 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

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

  const body = (
    <>
      {!compact ? (
        <p className="text-xs text-muted-foreground">{t('app.deliveryProof.subtitle')}</p>
      ) : null}
      <p className={cn('text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
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
    </>
  );

  if (compact) {
    return (
      <details className={cn(PANEL_CLASS, 'px-2.5 py-2', className)}>
        <summary className={SUMMARY_CLASS}>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
          <span className="text-xs">{t('app.deliveryProof.title')}</span>
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
        </summary>
        <div className="mt-2">{body}</div>
      </details>
    );
  }

  return (
    <section
      className={cn(PANEL_CLASS, 'px-3 py-2.5', className)}
      aria-labelledby={`delivery-proof-guidance-${variant}`}
    >
      <div className="flex flex-wrap items-start gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              id={`delivery-proof-guidance-${variant}`}
              className="text-sm font-medium text-foreground"
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
        </div>
      </div>
      <div className="mt-2">{body}</div>
    </section>
  );
}
