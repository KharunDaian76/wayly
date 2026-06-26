'use client';

import { FileText } from 'lucide-react';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

export function DisputeEvidenceGuidance() {
  const { t } = useI18n();

  return (
    <details className={PANEL_CLASS}>
      <summary className={SUMMARY_CLASS}>
        <FileText className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
        {t('app.disputeEvidence.title')}
      </summary>
      <div className="mt-2 space-y-2">
        <p>{t('app.disputeEvidence.subtitle')}</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>{t('app.disputeEvidence.includeItemTimingHandoff')}</li>
          <li>{t('app.disputeEvidence.includeAgreementDetails')}</li>
          <li>{t('app.disputeEvidence.includeProofReference')}</li>
          <li>{t('app.disputeEvidence.keepRelevant')}</li>
          <li>{t('app.disputeEvidence.noPasswords')}</li>
          <li>{t('app.disputeEvidence.noPaymentDetails')}</li>
          <li>{t('app.disputeEvidence.noDocumentsNumbers')}</li>
          <li>{t('app.disputeEvidence.noIllegalContent')}</li>
          <li>{t('app.disputeEvidence.reviewToolsHelp')}</li>
        </ul>
      </div>
    </details>
  );
}

export function DisputeEvidenceFormHints() {
  const { t } = useI18n();

  return (
    <div className="space-y-1 text-xs text-muted-foreground" role="note">
      <p>
        <span className="font-medium text-foreground">
          {t('app.disputeEvidence.whatToInclude')}
        </span>{' '}
        {t('app.disputeEvidence.includeItemTimingHandoff')}
      </p>
      <p>
        <span className="font-medium text-foreground">
          {t('app.disputeEvidence.whatNotToInclude')}
        </span>{' '}
        {t('app.disputeEvidence.noPaymentDetails')}
      </p>
    </div>
  );
}

type DisputeEvidenceEmptyProps = {
  className?: string;
};

export function DisputeEvidenceEmpty({ className }: DisputeEvidenceEmptyProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 bg-muted/15 px-4 py-4 text-center sm:text-left',
        className,
      )}
      role="status"
    >
      <p className="text-sm font-medium text-foreground">
        {t('app.disputeEvidence.noEvidenceTitle')}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('app.disputeEvidence.noEvidenceDescription')}
      </p>
    </div>
  );
}
