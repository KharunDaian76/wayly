'use client';

import { Button } from '@wayly/ui';

import { useI18n } from '@/lib/i18n/i18n-context';
import type { SenderRequestDraftSaveStatus } from '@/lib/sender-request-draft-storage';
import { cn } from '@/lib/utils';

type SenderRequestDraftBarProps = {
  storageAvailable: boolean;
  saveStatus: SenderRequestDraftSaveStatus;
  showRestoreActions: boolean;
  notice: 'restored' | 'discarded' | null;
  onRestore: () => void;
  onDiscard: () => void;
  disabled?: boolean;
};

const BAR_CLASS = cn(
  'rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground',
);

export function SenderRequestDraftBar({
  storageAvailable,
  saveStatus,
  showRestoreActions,
  notice,
  onRestore,
  onDiscard,
  disabled = false,
}: SenderRequestDraftBarProps) {
  const { t } = useI18n();

  if (!storageAvailable) {
    return (
      <div className={BAR_CLASS} role="status">
        <p>{t('app.senderRequestDraft.autosaveUnavailable')}</p>
        <p className="mt-1">{t('app.senderRequestDraft.doNotIncludePaymentDetails')}</p>
      </div>
    );
  }

  return (
    <div className={BAR_CLASS} role="status">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          {showRestoreActions ? (
            <p className="font-medium text-foreground">
              {t('app.senderRequestDraft.draftAvailable')}
            </p>
          ) : saveStatus === 'saving' ? (
            <p>{t('app.senderRequestDraft.saving')}</p>
          ) : saveStatus === 'saved' ? (
            <p>{t('app.senderRequestDraft.saved')}</p>
          ) : null}
          {notice === 'restored' ? (
            <p className="text-foreground">{t('app.senderRequestDraft.restored')}</p>
          ) : null}
          {notice === 'discarded' ? (
            <p className="text-foreground">{t('app.senderRequestDraft.discarded')}</p>
          ) : null}
        </div>

        {showRestoreActions ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onRestore}
            >
              {t('app.senderRequestDraft.restore')}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onDiscard}>
              {t('app.senderRequestDraft.discard')}
            </Button>
          </div>
        ) : null}
      </div>

      <p className="mt-2">{t('app.senderRequestDraft.localOnly')}</p>
      <p className="mt-1">{t('app.senderRequestDraft.doNotIncludePaymentDetails')}</p>
    </div>
  );
}
