'use client';

import type { WaylerAvailabilitySummary } from '@wayly/types';
import { WaylerAvailabilityType } from '@wayly/types';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type MarketplaceSearchRoute = {
  originCountry: string;
  originCity: string;
  originRegion: string;
  destinationCountry: string;
  destinationCity: string;
  destinationRegion: string;
};

export type RouteMatchKey =
  | 'exactRouteMatch'
  | 'originMatch'
  | 'destinationMatch'
  | 'sameCountry'
  | 'localAvailability'
  | 'tripRoute'
  | 'partialMatch';

const MATCH_KEY_LABELS: Record<RouteMatchKey, TranslationKey> = {
  exactRouteMatch: 'app.marketplaceRouteMatch.exactRouteMatch',
  originMatch: 'app.marketplaceRouteMatch.originMatch',
  destinationMatch: 'app.marketplaceRouteMatch.destinationMatch',
  sameCountry: 'app.marketplaceRouteMatch.sameCountry',
  localAvailability: 'app.marketplaceRouteMatch.localAvailability',
  tripRoute: 'app.marketplaceRouteMatch.tripRoute',
  partialMatch: 'app.marketplaceRouteMatch.partialMatch',
};

const MATCH_BADGE_CLASS: Record<RouteMatchKey, string> = {
  exactRouteMatch: 'wayly-status-delivered',
  originMatch: 'wayly-status-accepted',
  destinationMatch: 'wayly-status-accepted',
  sameCountry: 'wayly-status-open',
  localAvailability: 'wayly-status-default',
  tripRoute: 'wayly-status-default',
  partialMatch: 'wayly-status-open',
};

function normCountry(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function normText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function hasMarketplaceRouteFilter(search: MarketplaceSearchRoute): boolean {
  return (
    isNonEmpty(search.originCountry) ||
    isNonEmpty(search.originCity) ||
    isNonEmpty(search.originRegion) ||
    isNonEmpty(search.destinationCountry) ||
    isNonEmpty(search.destinationCity) ||
    isNonEmpty(search.destinationRegion)
  );
}

function originCountryMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (!isNonEmpty(search.originCountry)) {
    return false;
  }
  const listingCountry = normCountry(listing.originCountry);
  return listingCountry.length > 0 && normCountry(search.originCountry) === listingCountry;
}

function originCityMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (!isNonEmpty(search.originCity)) {
    return false;
  }
  const listingCity = normText(listing.originCity);
  return listingCity.length > 0 && normText(search.originCity) === listingCity;
}

function destinationCountryMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (!isNonEmpty(search.destinationCountry)) {
    return false;
  }
  const listingCountry = normCountry(listing.destinationCountry);
  return listingCountry.length > 0 && normCountry(search.destinationCountry) === listingCountry;
}

function destinationCityMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (!isNonEmpty(search.destinationCity)) {
    return false;
  }
  const listingCity = normText(listing.destinationCity);
  return listingCity.length > 0 && normText(search.destinationCity) === listingCity;
}

function originMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  const hasOriginSearch = isNonEmpty(search.originCountry) || isNonEmpty(search.originCity);
  if (!hasOriginSearch) {
    return false;
  }
  if (isNonEmpty(search.originCountry) && !originCountryMatches(search, listing)) {
    return false;
  }
  if (isNonEmpty(search.originCity) && !originCityMatches(search, listing)) {
    return false;
  }
  return true;
}

function destinationMatches(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  const hasDestinationSearch =
    isNonEmpty(search.destinationCountry) || isNonEmpty(search.destinationCity);
  if (!hasDestinationSearch) {
    return false;
  }
  if (isNonEmpty(search.destinationCountry) && !destinationCountryMatches(search, listing)) {
    return false;
  }
  if (isNonEmpty(search.destinationCity) && !destinationCityMatches(search, listing)) {
    return false;
  }
  return true;
}

function sameCountryOriginMatch(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (!originCountryMatches(search, listing)) {
    return false;
  }
  const searchCity = normText(search.originCity);
  const listingCity = normText(listing.originCity);
  if (!searchCity || !listingCity) {
    return false;
  }
  return searchCity !== listingCity;
}

function partialRouteMatch(
  search: MarketplaceSearchRoute,
  listing: WaylerAvailabilitySummary,
): boolean {
  if (originMatches(search, listing) || destinationMatches(search, listing)) {
    return false;
  }
  return originCountryMatches(search, listing) || destinationCountryMatches(search, listing);
}

/** Derives match badges from listing fields and current sender search — no ranking or distance. */
export function getMarketplaceRouteMatchBadges(
  listing: WaylerAvailabilitySummary,
  search: MarketplaceSearchRoute,
): RouteMatchKey[] {
  if (!hasMarketplaceRouteFilter(search)) {
    return [];
  }

  const badges: RouteMatchKey[] = [];
  const hasOriginSearch = isNonEmpty(search.originCountry) || isNonEmpty(search.originCity);
  const hasDestinationSearch =
    isNonEmpty(search.destinationCountry) || isNonEmpty(search.destinationCity);
  const originFull = originMatches(search, listing);
  const destinationFull = destinationMatches(search, listing);

  if (
    listing.type === WaylerAvailabilityType.TRIP_ROUTE &&
    hasOriginSearch &&
    hasDestinationSearch &&
    originFull &&
    destinationFull &&
    listing.destinationCountry
  ) {
    badges.push('exactRouteMatch');
  } else {
    if (originFull) {
      badges.push('originMatch');
    } else if (sameCountryOriginMatch(search, listing)) {
      badges.push('sameCountry');
    }

    if (destinationFull) {
      badges.push('destinationMatch');
    }

    if (badges.length === 0 && partialRouteMatch(search, listing)) {
      badges.push('partialMatch');
    }
  }

  if (badges.length < 3) {
    if (
      listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY &&
      !badges.includes('localAvailability')
    ) {
      badges.push('localAvailability');
    } else if (
      listing.type === WaylerAvailabilityType.TRIP_ROUTE &&
      !badges.includes('tripRoute') &&
      !badges.includes('exactRouteMatch')
    ) {
      badges.push('tripRoute');
    }
  }

  return badges.slice(0, 3);
}

export type MarketplaceRouteMatchRowProps = {
  listing: WaylerAvailabilitySummary;
  search: MarketplaceSearchRoute;
  compact?: boolean;
  className?: string;
};

export function MarketplaceRouteMatchRow({
  listing,
  search,
  compact = false,
  className,
}: MarketplaceRouteMatchRowProps) {
  const { t } = useI18n();
  const hasFilter = hasMarketplaceRouteFilter(search);
  const badges = getMarketplaceRouteMatchBadges(listing, search);
  const primaryBadge = badges[0] ?? null;

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 bg-muted/5',
        compact ? 'mt-2 px-2 py-1.5' : 'mt-2 px-2.5 py-2',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            'font-medium text-muted-foreground',
            compact ? 'text-[10px] uppercase tracking-wide' : 'text-xs uppercase tracking-wide',
          )}
        >
          {t('app.marketplaceRouteMatch.label')}
        </span>
        {hasFilter && primaryBadge ? (
          <span
            className={cn(
              'wayly-status-badge shrink-0 font-medium',
              compact ? 'text-[10px]' : 'text-xs',
              MATCH_BADGE_CLASS[primaryBadge],
            )}
          >
            {t(MATCH_KEY_LABELS[primaryBadge])}
          </span>
        ) : null}
        {hasFilter && badges.length > 1
          ? badges.slice(1).map((key) => (
              <span
                key={key}
                className={cn(
                  'wayly-status-badge wayly-status-default shrink-0 opacity-90',
                  compact ? 'text-[10px]' : 'text-xs',
                )}
              >
                {t(MATCH_KEY_LABELS[key])}
              </span>
            ))
          : null}
      </div>

      <p className={cn('mt-1 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {hasFilter
          ? t('app.marketplaceRouteMatch.basedOnSearch')
          : t('app.marketplaceRouteMatch.noRouteFilter')}
      </p>

      {hasFilter && badges.length === 0 ? (
        <p className={cn('mt-0.5 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
          {t('app.marketplaceRouteMatch.routeHint')}
        </p>
      ) : null}
    </div>
  );
}
