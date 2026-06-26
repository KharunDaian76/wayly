'use client';

import type { ReactNode } from 'react';

import type { WaylerAvailabilitySummary } from '@wayly/types';
import { WaylerAvailabilityType } from '@wayly/types';

import {
  getMarketplaceRouteMatchBadges,
  type MarketplaceSearchRoute,
  type RouteMatchKey,
} from '@/components/app/marketplace-route-match';
import { getWaylerListingTrustSignals } from '@/components/app/marketplace-trust-signals';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const COMPARE_PANEL_CLASS = cn(
  'rounded-lg border border-border/60 bg-background/80 px-3 py-3 sm:px-4',
);

const MATCH_BADGE_CLASS = cn(
  'wayly-status-badge inline-flex items-center text-[10px] leading-tight',
);

const TRUST_SIGNAL_KEYS: Record<
  ReturnType<typeof getWaylerListingTrustSignals>[number],
  TranslationKey
> = {
  publicAvailability: 'app.marketplaceTrust.publicAvailability',
  activeListing: 'app.marketplaceTrust.activeRoute',
  localAvailability: 'app.marketplaceTrust.localAvailability',
  tripRoute: 'app.marketplaceTrust.tripRoute',
  recentlyUpdated: 'app.marketplaceTrust.recentlyUpdated',
  recentlyPublished: 'app.marketplaceTrust.recentlyPublished',
  secureRequest: 'app.marketplaceTrust.secureRequest',
};

const MATCH_KEY_LABELS: Record<RouteMatchKey, TranslationKey> = {
  exactRouteMatch: 'app.marketplaceRouteMatch.exactRouteMatch',
  originMatch: 'app.marketplaceRouteMatch.originMatch',
  destinationMatch: 'app.marketplaceRouteMatch.destinationMatch',
  sameCountry: 'app.marketplaceRouteMatch.sameCountry',
  localAvailability: 'app.marketplaceRouteMatch.localAvailability',
  tripRoute: 'app.marketplaceRouteMatch.tripRoute',
  partialMatch: 'app.marketplaceRouteMatch.partialMatch',
};

type CompareRow = {
  id: string;
  labelKey: TranslationKey;
  render: (listing: WaylerAvailabilitySummary) => string;
  renderRich?: (listing: WaylerAvailabilitySummary) => ReactNode;
};

function formatLocationParts(
  city: string | null,
  region: string | null,
  country: string | null,
  notAvailable: string,
): string {
  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : notAvailable;
}

function formatDateTime(value: string | null, notAvailable: string): string {
  if (!value) {
    return notAvailable;
  }
  return new Date(value).toLocaleString();
}

function listingHeaderLabel(
  listing: WaylerAvailabilitySummary,
  localLabel: string,
  tripLabel: string,
): string {
  const typeLabel =
    listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY ? localLabel : tripLabel;
  const location = listing.originCity ?? listing.originCountry ?? typeLabel;
  return `${typeLabel} · ${location}`;
}

type WaylerShortlistCompareProps = {
  listings: WaylerAvailabilitySummary[];
  search: MarketplaceSearchRoute;
  className?: string;
};

export function WaylerShortlistCompare({
  listings,
  search,
  className,
}: WaylerShortlistCompareProps) {
  const { t } = useI18n();

  const localLabel = t('app.senderWaylers.localAvailability');
  const tripLabel = t('app.senderWaylers.tripRoute');
  const notAvailable = t('app.waylerShortlist.compareNotAvailable');
  const yesLabel = t('app.waylerShortlist.compareYes');
  const noLabel = t('app.waylerShortlist.compareNo');

  const formatDates = (listing: WaylerAvailabilitySummary): string => {
    if (listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY) {
      const from = formatDateTime(listing.availableFrom, notAvailable);
      if (listing.availableTo) {
        return `${from} – ${formatDateTime(listing.availableTo, notAvailable)}`;
      }
      return from;
    }
    const departure = formatDateTime(listing.departureDate, notAvailable);
    if (listing.returnDate) {
      return `${departure} – ${formatDateTime(listing.returnDate, notAvailable)}`;
    }
    return departure;
  };

  const formatCapacity = (listing: WaylerAvailabilitySummary): string => {
    const parts: string[] = [];
    if (listing.maxPackages !== null) {
      parts.push(String(listing.maxPackages));
    }
    if (listing.maxWeightKg) {
      parts.push(`${listing.maxWeightKg} kg`);
    }
    return parts.length > 0 ? parts.join(' · ') : notAvailable;
  };

  const rows: CompareRow[] = [
    {
      id: 'verified',
      labelKey: 'app.waylerShortlist.compareVerified',
      render: (listing) => (listing.isWaylerVerified ? yesLabel : noLabel),
    },
    {
      id: 'type',
      labelKey: 'app.waylerShortlist.compareType',
      render: (listing) =>
        listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY ? localLabel : tripLabel,
    },
    {
      id: 'origin',
      labelKey: 'app.waylerShortlist.compareOrigin',
      render: (listing) =>
        formatLocationParts(
          listing.originCity,
          listing.originRegion,
          listing.originCountry,
          notAvailable,
        ),
    },
    {
      id: 'destination',
      labelKey: 'app.waylerShortlist.compareDestination',
      render: (listing) =>
        listing.type === WaylerAvailabilityType.TRIP_ROUTE
          ? formatLocationParts(
              listing.destinationCity,
              listing.destinationRegion,
              listing.destinationCountry,
              notAvailable,
            )
          : notAvailable,
    },
    {
      id: 'dates',
      labelKey: 'app.waylerShortlist.compareDates',
      render: formatDates,
    },
    {
      id: 'capacity',
      labelKey: 'app.waylerShortlist.compareCapacity',
      render: formatCapacity,
    },
    {
      id: 'match',
      labelKey: 'app.waylerShortlist.compareMatch',
      render: () => notAvailable,
      renderRich: (listing) => {
        const badges = getMarketplaceRouteMatchBadges(listing, search);
        if (badges.length === 0) {
          return <span className="text-xs text-muted-foreground">{notAvailable}</span>;
        }
        return (
          <ul className="flex flex-wrap gap-1">
            {badges.map((badge) => (
              <li key={badge}>
                <span className={MATCH_BADGE_CLASS}>{t(MATCH_KEY_LABELS[badge])}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      id: 'trust',
      labelKey: 'app.waylerShortlist.compareTrust',
      render: (listing) => {
        const signals = getWaylerListingTrustSignals(listing).slice(0, 3);
        return signals.map((signal) => t(TRUST_SIGNAL_KEYS[signal])).join(' · ');
      },
    },
  ];

  return (
    <div className={cn(COMPARE_PANEL_CLASS, className)}>
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-foreground">
          {t('app.waylerShortlist.compareTitle')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('app.waylerShortlist.compareSubtitle')}</p>
        <p className="text-xs text-muted-foreground">
          {t('app.waylerShortlist.compareUsesCurrentResults')}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:hidden">
        {listings.map((listing) => (
          <article
            key={listing.id}
            className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 text-sm"
          >
            <p className="font-medium text-foreground">
              {listingHeaderLabel(listing, localLabel, tripLabel)}
            </p>
            <dl className="mt-2 flex flex-col gap-1.5 text-xs">
              {rows.map((row) => (
                <div key={row.id} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <dt className="font-medium text-muted-foreground">{t(row.labelKey)}</dt>
                  <dd className="text-foreground">
                    {row.renderRich ? row.renderRich(listing) : row.render(listing)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-3 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[32rem] border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th scope="col" className="py-2 pr-3 text-left font-medium text-muted-foreground">
                {' '}
              </th>
              {listings.map((listing) => (
                <th
                  key={listing.id}
                  scope="col"
                  className="max-w-[10rem] px-2 py-2 text-left font-medium text-foreground"
                >
                  {listingHeaderLabel(listing, localLabel, tripLabel)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/40 last:border-0">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-muted-foreground">
                  {t(row.labelKey)}
                </th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-2 py-2 align-top text-foreground">
                    {row.renderRich ? row.renderRich(listing) : row.render(listing)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
