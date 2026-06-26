'use client';

import { Button } from '@wayly/ui';

import { useI18n } from '@/lib/i18n/i18n-context';
import type { WaylerAvailabilityDraftSaveStatus } from '@/lib/wayler-availability-draft-storage';
import { cn } from '@/lib/utils';

type WaylerAvailabilityDraftBarProps = {
  storageAvailable: boolean;
  saveStatus: WaylerAvailabilityDraftSaveStatus;
  showRestoreActions: boolean;
  notice: 'restored' | 'discarded' | null;
  onRestore: () => void;
  onDiscard: () => void;
  disabled?: boolean;
};

const BAR_CLASS = cn(
  'rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground',
);

export function WaylerAvailabilityDraftBar({
  storageAvailable,
  saveStatus,
  showRestoreActions,
  notice,
  onRestore,
  onDiscard,
  disabled = false,
}: WaylerAvailabilityDraftBarProps) {
  const { t } = useI18n();

  if (!storageAvailable) {
    return (
      <div className={BAR_CLASS} role="status">
        <p>{t('app.waylerAvailabilityDraft.autosaveUnavailable')}</p>
      </div>
    );
  }

  return (
    <div className={BAR_CLASS} role="status">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          {showRestoreActions ? (
            <p className="font-medium text-foreground">
              {t('app.waylerAvailabilityDraft.draftAvailable')}
            </p>
          ) : saveStatus === 'saving' ? (
            <p>{t('app.waylerAvailabilityDraft.saving')}</p>
          ) : saveStatus === 'saved' ? (
            <p>{t('app.waylerAvailabilityDraft.saved')}</p>
          ) : null}
          {notice === 'restored' ? (
            <p className="text-foreground">{t('app.waylerAvailabilityDraft.restored')}</p>
          ) : null}
          {notice === 'discarded' ? (
            <p className="text-foreground">{t('app.waylerAvailabilityDraft.discarded')}</p>
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
              {t('app.waylerAvailabilityDraft.restore')}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onDiscard}>
              {t('app.waylerAvailabilityDraft.discard')}
            </Button>
          </div>
        ) : null}
      </div>

      <p className="mt-2">{t('app.waylerAvailabilityDraft.localOnly')}</p>
    </div>
  );
}
