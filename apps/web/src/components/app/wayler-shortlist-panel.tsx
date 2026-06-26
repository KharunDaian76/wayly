'use client';

import { useEffect, useState } from 'react';

import type { WaylerAvailabilitySummary } from '@wayly/types';
import { WaylerAvailabilityType } from '@wayly/types';
import { Button } from '@wayly/ui';

import type { MarketplaceSearchRoute } from '@/components/app/marketplace-route-match';
import { WaylerShortlistCompare } from '@/components/app/wayler-shortlist-compare';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3',
);

const CHIP_CLASS = cn(
  'inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60',
  'bg-background/80 px-2.5 py-1 text-xs text-foreground',
);

type WaylerShortlistPanelProps = {
  shortlistCount: number;
  savedInCurrentResults: WaylerAvailabilitySummary[];
  hiddenSavedCount: number;
  clearedNotice: boolean;
  search: MarketplaceSearchRoute;
  onClear: () => void;
  onToggleListing: (listingId: string) => void;
  className?: string;
};

function listingChipLabel(
  listing: WaylerAvailabilitySummary,
  localLabel: string,
  tripLabel: string,
) {
  const typeLabel =
    listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY ? localLabel : tripLabel;
  const location = listing.originCity ?? listing.originCountry ?? typeLabel;
  return `${typeLabel} · ${location}`;
}

export function WaylerShortlistPanel({
  shortlistCount,
  savedInCurrentResults,
  hiddenSavedCount,
  clearedNotice,
  search,
  onClear,
  onToggleListing,
  className,
}: WaylerShortlistPanelProps) {
  const { t } = useI18n();
  const [compareOpen, setCompareOpen] = useState(false);

  const canCompare = savedInCurrentResults.length >= 2;

  useEffect(() => {
    if (!canCompare) {
      setCompareOpen(false);
    }
  }, [canCompare]);

  const localLabel = t('app.senderWaylers.localAvailability');
  const tripLabel = t('app.senderWaylers.tripRoute');

  return (
    <section className={cn(PANEL_CLASS, className)} aria-labelledby="wayler-shortlist-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-base leading-none">
              🔖
            </span>
            <h3 id="wayler-shortlist-heading" className="text-sm font-semibold text-foreground">
              {t('app.waylerShortlist.title')}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('app.waylerShortlist.subtitle')}</p>
        </div>
        {shortlistCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 text-xs"
            onClick={onClear}
          >
            {t('app.waylerShortlist.clear')}
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{t('app.waylerShortlist.localOnlyNote')}</p>

      {clearedNotice ? (
        <p className="wayly-alert wayly-alert-success text-xs" role="status">
          {t('app.waylerShortlist.cleared')}
        </p>
      ) : null}

      {shortlistCount === 0 ? (
        <p className="text-sm text-muted-foreground">{t('app.waylerShortlist.empty')}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            {t('app.waylerShortlist.count').replace('{count}', String(shortlistCount))}
          </p>

          {savedInCurrentResults.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-foreground">
                {t('app.waylerShortlist.savedInCurrentResults')}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {savedInCurrentResults.map((listing) => (
                  <li key={listing.id}>
                    <button
                      type="button"
                      className={cn(
                        CHIP_CLASS,
                        'cursor-pointer transition-colors hover:border-primary/30',
                      )}
                      title={t('app.waylerShortlist.saved')}
                      onClick={() => onToggleListing(listing.id)}
                    >
                      <span aria-hidden>🔖</span>
                      <span className="truncate">
                        {listingChipLabel(listing, localLabel, tripLabel)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hiddenSavedCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {t('app.waylerShortlist.someSavedMayBeHidden')}
            </p>
          ) : null}

          {savedInCurrentResults.length === 1 ? (
            <p className="text-xs text-muted-foreground">
              {t('app.waylerShortlist.compareNeedTwo')}
            </p>
          ) : null}

          {canCompare ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs sm:w-auto"
                onClick={() => setCompareOpen((open) => !open)}
              >
                {compareOpen
                  ? t('app.waylerShortlist.hideCompare')
                  : t('app.waylerShortlist.compare')}
              </Button>
              {compareOpen ? (
                <WaylerShortlistCompare listings={savedInCurrentResults} search={search} />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
