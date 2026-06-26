'use client';

import { MessageCircle } from 'lucide-react';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

export function ConversationSafetyNote() {
  const { t } = useI18n();

  return (
    <details className={PANEL_CLASS}>
      <summary className={SUMMARY_CLASS}>
        <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
        {t('app.conversationSafety.title')}
      </summary>
      <div className="mt-2 space-y-2">
        <p>{t('app.conversationSafety.subtitle')}</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>{t('app.conversationSafety.keepAgreementInsideWayly')}</li>
          <li>{t('app.conversationSafety.confirmDetailsTiming')}</li>
          <li>{t('app.conversationSafety.noPrivatePayment')}</li>
          <li>{t('app.conversationSafety.noRestrictedItems')}</li>
          <li>{t('app.conversationSafety.reviewToolsHelp')}</li>
        </ul>
      </div>
    </details>
  );
}
