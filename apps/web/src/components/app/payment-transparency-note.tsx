'use client';

import { Receipt } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type PaymentTransparencyVariant = 'sender' | 'wayler' | 'admin' | 'neutral';

const PANEL_CLASS = cn(
  'rounded-md border border-sky-500/20 bg-sky-500/[0.05] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

const COMMON_KEYS = [
  'app.paymentTransparency.statusBasedOnRecords',
  'app.paymentTransparency.keepAgreementInsideWayly',
  'app.paymentTransparency.noPrivatePaymentDetails',
  'app.paymentTransparency.mockManualFlow',
  'app.paymentTransparency.noRealMoneyMovement',
] as const satisfies readonly TranslationKey[];

function variantTitleKey(variant: PaymentTransparencyVariant): TranslationKey {
  switch (variant) {
    case 'sender':
      return 'app.paymentTransparency.senderTitle';
    case 'wayler':
      return 'app.paymentTransparency.waylerTitle';
    case 'admin':
      return 'app.paymentTransparency.adminTitle';
    default:
      return 'app.paymentTransparency.title';
  }
}

function variantExtraKeys(variant: PaymentTransparencyVariant): TranslationKey[] {
  switch (variant) {
    case 'sender':
      return ['app.paymentTransparency.noGuaranteedRefund'];
    case 'wayler':
      return [
        'app.paymentTransparency.noGuaranteedPayout',
        'app.paymentTransparency.proofAndCommunicationHelp',
      ];
    case 'admin':
      return [
        'app.paymentTransparency.adminDecisionOnly',
        'app.paymentTransparency.futureProviderIntegration',
      ];
    default:
      return [];
  }
}

type PaymentTransparencyNoteProps = {
  variant?: PaymentTransparencyVariant;
  className?: string;
};

export function PaymentTransparencyNote({
  variant = 'neutral',
  className,
}: PaymentTransparencyNoteProps) {
  const { t } = useI18n();
  const bulletKeys = [...COMMON_KEYS, ...variantExtraKeys(variant)];

  return (
    <details className={cn(PANEL_CLASS, className)}>
      <summary className={SUMMARY_CLASS}>
        <Receipt
          className="h-3.5 w-3.5 shrink-0 text-sky-700/80 dark:text-sky-400/90"
          aria-hidden
        />
        {t(variantTitleKey(variant))}
      </summary>
      <div className="mt-2 space-y-2">
        <p>{t('app.paymentTransparency.subtitle')}</p>
        <ul className="list-disc space-y-1 pl-4">
          {bulletKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
