'use client';

import { Info } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type OrderActionGuidanceType =
  | 'cancelOrder'
  | 'startTransit'
  | 'markDelivered'
  | 'submitProof'
  | 'openDispute'
  | 'viewDispute'
  | 'confirmDelivery'
  | 'paymentAction';

const PANEL_CLASS = cn(
  'rounded-md border border-slate-500/20 bg-slate-500/[0.04] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

type ActionGuidanceConfig = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  bulletKeys: readonly TranslationKey[];
};

const ACTION_GUIDANCE: Record<OrderActionGuidanceType, ActionGuidanceConfig> = {
  cancelOrder: {
    titleKey: 'app.orderActionGuidance.cancelOrderTitle',
    descriptionKey: 'app.orderActionGuidance.cancelOrderDescription',
    bulletKeys: [
      'app.orderActionGuidance.cancelBeforeAccepted',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
  startTransit: {
    titleKey: 'app.orderActionGuidance.startTransitTitle',
    descriptionKey: 'app.orderActionGuidance.startTransitDescription',
    bulletKeys: [
      'app.orderActionGuidance.startWhenReady',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
  markDelivered: {
    titleKey: 'app.orderActionGuidance.markDeliveredTitle',
    descriptionKey: 'app.orderActionGuidance.markDeliveredDescription',
    bulletKeys: [
      'app.orderActionGuidance.markOnlyAfterHandoff',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
  submitProof: {
    titleKey: 'app.orderActionGuidance.submitProofTitle',
    descriptionKey: 'app.orderActionGuidance.submitProofDescription',
    bulletKeys: [
      'app.orderActionGuidance.proofHelpsDocumentDelivery',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
  openDispute: {
    titleKey: 'app.orderActionGuidance.openDisputeTitle',
    descriptionKey: 'app.orderActionGuidance.openDisputeDescription',
    bulletKeys: ['app.orderActionGuidance.tryChatFirst', 'app.orderActionGuidance.keepInsideWayly'],
  },
  viewDispute: {
    titleKey: 'app.orderActionGuidance.openDisputeTitle',
    descriptionKey: 'app.orderActionGuidance.openDisputeDescription',
    bulletKeys: ['app.orderActionGuidance.tryChatFirst', 'app.orderActionGuidance.keepInsideWayly'],
  },
  confirmDelivery: {
    titleKey: 'app.orderActionGuidance.confirmDeliveryTitle',
    descriptionKey: 'app.orderActionGuidance.confirmDeliveryDescription',
    bulletKeys: [
      'app.orderActionGuidance.confirmOnlyAfterChecking',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
  paymentAction: {
    titleKey: 'app.orderActionGuidance.paymentActionTitle',
    descriptionKey: 'app.orderActionGuidance.paymentActionDescription',
    bulletKeys: [
      'app.orderActionGuidance.noRealMoneyMovement',
      'app.orderActionGuidance.keepInsideWayly',
    ],
  },
};

type OrderActionGuidanceProps = {
  action: OrderActionGuidanceType;
  className?: string;
};

export function OrderActionGuidance({ action, className }: OrderActionGuidanceProps) {
  const { t } = useI18n();
  const config = ACTION_GUIDANCE[action];

  return (
    <details className={cn(PANEL_CLASS, className)}>
      <summary className={SUMMARY_CLASS}>
        <Info
          className="h-3.5 w-3.5 shrink-0 text-slate-700/80 dark:text-slate-400/90"
          aria-hidden
        />
        {t(config.titleKey)}
      </summary>
      <div className="mt-2 space-y-2">
        <p>{t(config.descriptionKey)}</p>
        <ul className="list-disc space-y-1 pl-4">
          {config.bulletKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
