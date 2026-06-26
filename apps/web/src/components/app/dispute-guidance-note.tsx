'use client';

import { DisputeStatus } from '@wayly/types';
import { Scale } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type DisputeGuidanceVariant = 'sender' | 'wayler' | 'neutral';

const PANEL_CLASS = cn(
  'rounded-md border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

const STATUS_BADGE_CLASS = cn(
  'wayly-status-badge inline-flex w-fit text-xs',
  'border border-amber-500/30 bg-amber-500/10 text-foreground',
);

type DisputeGuidanceNoteProps = {
  variant?: DisputeGuidanceVariant;
};

export function DisputeGuidanceNote({ variant = 'neutral' }: DisputeGuidanceNoteProps) {
  const { t } = useI18n();

  const titleKey: TranslationKey =
    variant === 'sender'
      ? 'app.disputeGuidance.senderTitle'
      : variant === 'wayler'
        ? 'app.disputeGuidance.waylerTitle'
        : 'app.disputeGuidance.title';

  return (
    <details className={PANEL_CLASS}>
      <summary className={SUMMARY_CLASS}>
        <Scale
          className="h-3.5 w-3.5 shrink-0 text-amber-700/80 dark:text-amber-400/90"
          aria-hidden
        />
        {t(titleKey)}
      </summary>
      <div className="mt-2 space-y-2">
        <p>{t('app.disputeGuidance.subtitle')}</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>{t('app.disputeGuidance.tryChatFirst')}</li>
          <li>{t('app.disputeGuidance.keepEvidenceInsideWayly')}</li>
          <li>{t('app.disputeGuidance.reviewToolsHelp')}</li>
          <li>{t('app.disputeGuidance.includeClearFacts')}</li>
          <li>{t('app.disputeGuidance.noPrivatePayment')}</li>
          <li>{t('app.disputeGuidance.restrictedItemsSafety')}</li>
        </ul>
      </div>
    </details>
  );
}

function disputeStatusLabelKey(status: DisputeStatus): TranslationKey {
  return `app.disputes.status.${status}` as TranslationKey;
}

function disputeStatusHelpKey(status: DisputeStatus): TranslationKey | null {
  switch (status) {
    case DisputeStatus.OPEN:
      return 'app.disputeGuidance.statusOpen';
    case DisputeStatus.UNDER_REVIEW:
      return 'app.disputeGuidance.statusUnderReview';
    case DisputeStatus.RESOLVED:
      return 'app.disputeGuidance.statusResolved';
    default:
      return null;
  }
}

type DisputeStatusHelpProps = {
  status: DisputeStatus;
  compact?: boolean;
  /** When true, show only status label and primary status line (skip extra context). */
  minimal?: boolean;
};

export function DisputeStatusHelp({
  status,
  compact = false,
  minimal = false,
}: DisputeStatusHelpProps) {
  const { t } = useI18n();
  const helpKey = disputeStatusHelpKey(status);
  const isActive = status === DisputeStatus.OPEN || status === DisputeStatus.UNDER_REVIEW;
  const isResolved = status === DisputeStatus.RESOLVED;

  return (
    <div
      className={cn(
        'rounded-md border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2 text-xs text-muted-foreground',
        compact && 'py-1.5',
      )}
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">{t('app.disputes.status')}:</span>
        <span className={STATUS_BADGE_CLASS}>{t(disputeStatusLabelKey(status))}</span>
      </div>
      {helpKey ? <p className="mt-1.5">{t(helpKey)}</p> : null}
      {!minimal && isActive ? (
        <p className="mt-1">{t('app.disputeGuidance.disputedOrderHelp')}</p>
      ) : null}
      {!minimal && isResolved ? (
        <p className="mt-1">{t('app.disputeGuidance.resolvedHelp')}</p>
      ) : null}
    </div>
  );
}

type DisputeNoDisputeGuidanceProps = {
  className?: string;
};

export function DisputeNoDisputeGuidance({ className }: DisputeNoDisputeGuidanceProps) {
  const { t } = useI18n();

  return (
    <div className={cn('space-y-1 text-xs text-muted-foreground', className)} role="note">
      <p className="font-medium text-foreground">{t('app.disputeGuidance.noDisputeYet')}</p>
      <p>{t('app.disputeGuidance.openOnlyWhenNeeded')}</p>
    </div>
  );
}
