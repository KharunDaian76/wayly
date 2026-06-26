'use client';

import { Button } from '@wayly/ui';
import { Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  dispatchLocalSavedDataChanged,
  LOCAL_SAVED_DATA_CHANGED_EVENT,
  type LocalSavedDataScope,
} from '@/lib/local-saved-data-events';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  clearAllSenderRequestDrafts,
  countSenderRequestDrafts,
} from '@/lib/sender-request-draft-storage';
import { cn } from '@/lib/utils';
import {
  clearWaylerAvailabilityDraft,
  hasWaylerAvailabilityDraft,
} from '@/lib/wayler-availability-draft-storage';
import {
  clearRecentRouteSearches,
  countRecentRouteSearches,
} from '@/lib/recent-route-search-storage';
import {
  clearSenderRequestTemplates,
  countSenderRequestTemplates,
} from '@/lib/sender-request-template-storage';
import {
  clearWaylerAvailabilityTemplates,
  countWaylerAvailabilityTemplates,
} from '@/lib/wayler-availability-template-storage';
import { clearWaylerShortlistIds, getWaylerShortlistCount } from '@/lib/wayler-shortlist-storage';

type LocalSavedDataSnapshot = {
  shortlistCount: number;
  senderDraftCount: number;
  waylerDraftExists: boolean;
  recentSearchCount: number;
  availabilityTemplateCount: number;
  senderRequestTemplateCount: number;
};

type ClearNotice = LocalSavedDataScope | null;

const PANEL_CLASS = cn(
  'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

const ROW_CLASS =
  'flex flex-col gap-2 border-t border-border/50 py-3 sm:flex-row sm:items-center sm:justify-between';

function readLocalSavedDataSnapshot(): LocalSavedDataSnapshot {
  return {
    shortlistCount: getWaylerShortlistCount(),
    senderDraftCount: countSenderRequestDrafts(),
    waylerDraftExists: hasWaylerAvailabilityDraft(),
    recentSearchCount: countRecentRouteSearches(),
    availabilityTemplateCount: countWaylerAvailabilityTemplates(),
    senderRequestTemplateCount: countSenderRequestTemplates(),
  };
}

export function LocalSavedDataPanel() {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<LocalSavedDataSnapshot>(() => ({
    shortlistCount: 0,
    senderDraftCount: 0,
    waylerDraftExists: false,
    recentSearchCount: 0,
    availabilityTemplateCount: 0,
    senderRequestTemplateCount: 0,
  }));
  const [clearNotice, setClearNotice] = useState<ClearNotice>(null);
  const [isOpen, setIsOpen] = useState(false);

  const refreshSnapshot = useCallback(() => {
    setSnapshot(readLocalSavedDataSnapshot());
  }, []);

  useEffect(() => {
    refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    const handleLocalSavedDataChanged = () => {
      refreshSnapshot();
    };

    window.addEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    return () => {
      window.removeEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    };
  }, [refreshSnapshot]);

  const hasAnySavedData =
    snapshot.shortlistCount > 0 ||
    snapshot.senderDraftCount > 0 ||
    snapshot.waylerDraftExists ||
    snapshot.recentSearchCount > 0 ||
    snapshot.availabilityTemplateCount > 0 ||
    snapshot.senderRequestTemplateCount > 0;

  const showNotice = (scope: LocalSavedDataScope) => {
    setClearNotice(scope);
    dispatchLocalSavedDataChanged(scope);
    refreshSnapshot();
  };

  const handleClearShortlist = () => {
    clearWaylerShortlistIds();
    showNotice('shortlist');
  };

  const handleClearSenderDrafts = () => {
    clearAllSenderRequestDrafts();
    showNotice('senderDrafts');
  };

  const handleClearWaylerDraft = () => {
    clearWaylerAvailabilityDraft();
    showNotice('waylerDraft');
  };

  const handleClearRecentSearches = () => {
    clearRecentRouteSearches();
    showNotice('recentSearches');
  };

  const handleClearAvailabilityTemplates = () => {
    clearWaylerAvailabilityTemplates();
    showNotice('availabilityTemplates');
  };

  const handleClearSenderRequestTemplates = () => {
    clearSenderRequestTemplates();
    showNotice('senderRequestTemplates');
  };

  const handleClearAll = () => {
    clearWaylerShortlistIds();
    clearAllSenderRequestDrafts();
    clearWaylerAvailabilityDraft();
    clearRecentRouteSearches();
    clearWaylerAvailabilityTemplates();
    clearSenderRequestTemplates();
    showNotice('all');
  };

  const noticeMessage = (() => {
    switch (clearNotice) {
      case 'shortlist':
        return t('app.localSavedData.clearedShortlist');
      case 'senderDrafts':
        return t('app.localSavedData.clearedSenderDrafts');
      case 'waylerDraft':
        return t('app.localSavedData.clearedWaylerDraft');
      case 'recentSearches':
        return t('app.localSavedData.clearedRecentSearches');
      case 'availabilityTemplates':
        return t('app.localSavedData.clearedAvailabilityTemplates');
      case 'senderRequestTemplates':
        return t('app.localSavedData.clearedSenderRequestTemplates');
      case 'all':
        return t('app.localSavedData.clearedAll');
      default:
        return null;
    }
  })();

  return (
    <details
      className={PANEL_CLASS}
      open={isOpen}
      onToggle={(event) => {
        const nextOpen = event.currentTarget.open;
        setIsOpen(nextOpen);
        if (nextOpen) {
          setClearNotice(null);
          refreshSnapshot();
        }
      }}
    >
      <summary className={SUMMARY_CLASS}>
        <Shield className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
        {t('app.localSavedData.title')}
      </summary>

      <div className="mt-3 space-y-3 text-xs sm:text-sm">
        <p>{t('app.localSavedData.subtitle')}</p>
        <p>{t('app.localSavedData.localOnly')}</p>
        <p>{t('app.localSavedData.privacyNote')}</p>

        {!hasAnySavedData ? (
          <p className="rounded-md border border-dashed border-border/60 px-3 py-2">
            {t('app.localSavedData.noSavedData')}
          </p>
        ) : (
          <dl className="divide-y divide-border/50 rounded-md border border-border/50">
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.shortlistCount').replace(
                  '{count}',
                  String(snapshot.shortlistCount),
                )}
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={snapshot.shortlistCount === 0}
                  onClick={handleClearShortlist}
                >
                  {t('app.localSavedData.clearShortlist')}
                </Button>
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.senderDraftCount').replace(
                  '{count}',
                  String(snapshot.senderDraftCount),
                )}
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={snapshot.senderDraftCount === 0}
                  onClick={handleClearSenderDrafts}
                >
                  {t('app.localSavedData.clearSenderDrafts')}
                </Button>
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.waylerDraftExists')}{' '}
                <span className="font-medium text-foreground">
                  {snapshot.waylerDraftExists
                    ? t('app.localSavedData.yes')
                    : t('app.localSavedData.no')}
                </span>
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!snapshot.waylerDraftExists}
                  onClick={handleClearWaylerDraft}
                >
                  {t('app.localSavedData.clearWaylerDraft')}
                </Button>
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.recentSearchCount').replace(
                  '{count}',
                  String(snapshot.recentSearchCount),
                )}
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={snapshot.recentSearchCount === 0}
                  onClick={handleClearRecentSearches}
                >
                  {t('app.localSavedData.clearRecentSearches')}
                </Button>
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.availabilityTemplateCount').replace(
                  '{count}',
                  String(snapshot.availabilityTemplateCount),
                )}
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={snapshot.availabilityTemplateCount === 0}
                  onClick={handleClearAvailabilityTemplates}
                >
                  {t('app.localSavedData.clearAvailabilityTemplates')}
                </Button>
              </dd>
            </div>
            <div className={ROW_CLASS}>
              <dt>
                {t('app.localSavedData.senderRequestTemplateCount').replace(
                  '{count}',
                  String(snapshot.senderRequestTemplateCount),
                )}
              </dt>
              <dd className="flex shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={snapshot.senderRequestTemplateCount === 0}
                  onClick={handleClearSenderRequestTemplates}
                >
                  {t('app.localSavedData.clearSenderRequestTemplates')}
                </Button>
              </dd>
            </div>
          </dl>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasAnySavedData}
            onClick={handleClearAll}
          >
            {t('app.localSavedData.clearAll')}
          </Button>
        </div>

        {noticeMessage ? (
          <p className="wayly-alert wayly-alert-success rounded-md px-3 py-2" role="status">
            {noticeMessage}
          </p>
        ) : null}
      </div>
    </details>
  );
}
