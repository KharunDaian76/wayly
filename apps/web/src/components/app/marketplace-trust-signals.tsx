'use client';

import type { WaylerAvailabilitySummary } from '@wayly/types';
import { WaylerAvailabilityStatus, WaylerAvailabilityType } from '@wayly/types';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const RECENTLY_UPDATED_MS = 14 * 24 * 60 * 60 * 1000;
const RECENTLY_PUBLISHED_MS = 7 * 24 * 60 * 60 * 1000;

const TRUST_BADGE_CLASS = cn(
  'wayly-status-badge wayly-status-default inline-flex items-center gap-1 text-xs',
  'border border-primary/15 bg-primary/5 text-foreground',
);

type ListingTrustSignal =
  | 'publicAvailability'
  | 'activeListing'
  | 'localAvailability'
  | 'tripRoute'
  | 'recentlyUpdated'
  | 'recentlyPublished'
  | 'secureRequest';

const LISTING_SIGNAL_KEYS: Record<ListingTrustSignal, TranslationKey> = {
  publicAvailability: 'app.marketplaceTrust.publicAvailability',
  activeListing: 'app.marketplaceTrust.activeRoute',
  localAvailability: 'app.marketplaceTrust.localAvailability',
  tripRoute: 'app.marketplaceTrust.tripRoute',
  recentlyUpdated: 'app.marketplaceTrust.recentlyUpdated',
  recentlyPublished: 'app.marketplaceTrust.recentlyPublished',
  secureRequest: 'app.marketplaceTrust.secureRequest',
};

const LISTING_SIGNAL_ICONS: Record<ListingTrustSignal, string> = {
  publicAvailability: '🌐',
  activeListing: '✓',
  localAvailability: '📍',
  tripRoute: '✈️',
  recentlyUpdated: '🔄',
  recentlyPublished: '✨',
  secureRequest: '🔒',
};

function isWithinMs(isoDate: string, windowMs: number): boolean {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  return Date.now() - timestamp <= windowMs;
}

/** Derives trust badges from listing fields only — no inferred identity/KYC claims. */
export function getWaylerListingTrustSignals(
  listing: WaylerAvailabilitySummary,
): ListingTrustSignal[] {
  const signals: ListingTrustSignal[] = [];

  if (listing.isPublic) {
    signals.push('publicAvailability');
  }
  if (listing.status === WaylerAvailabilityStatus.ACTIVE) {
    signals.push('activeListing');
  }
  if (listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY) {
    signals.push('localAvailability');
  } else if (listing.type === WaylerAvailabilityType.TRIP_ROUTE) {
    signals.push('tripRoute');
  }
  if (listing.publishedAt && isWithinMs(listing.publishedAt, RECENTLY_PUBLISHED_MS)) {
    signals.push('recentlyPublished');
  } else if (isWithinMs(listing.updatedAt, RECENTLY_UPDATED_MS)) {
    signals.push('recentlyUpdated');
  }
  signals.push('secureRequest');

  return signals;
}

type MarketplaceTrustBadgeRowProps = {
  listing: WaylerAvailabilitySummary;
  className?: string;
};

export function MarketplaceTrustBadgeRow({ listing, className }: MarketplaceTrustBadgeRowProps) {
  const { t } = useI18n();
  const signals = getWaylerListingTrustSignals(listing);

  return (
    <ul
      className={cn('flex flex-wrap gap-1.5', className)}
      aria-label={t('app.marketplaceTrust.badgesLabel')}
    >
      {signals.map((signal) => (
        <li key={signal}>
          <span className={TRUST_BADGE_CLASS}>
            <span aria-hidden>{LISTING_SIGNAL_ICONS[signal]}</span>
            {t(LISTING_SIGNAL_KEYS[signal])}
          </span>
        </li>
      ))}
    </ul>
  );
}

type MarketplaceRequestSafetyNoteProps = {
  className?: string;
  variant?: 'inline' | 'panel';
};

export function MarketplaceRequestSafetyNote({
  className,
  variant = 'inline',
}: MarketplaceRequestSafetyNoteProps) {
  const { t } = useI18n();

  if (variant === 'panel') {
    return (
      <div
        className={cn(
          'rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground',
          className,
        )}
      >
        <p className="font-medium text-foreground">{t('app.marketplaceTrust.requestSafetyNote')}</p>
        <p className="mt-1">{t('app.marketplaceTrust.chatAfterAcceptance')}</p>
        <p className="mt-1">{t('app.marketplaceTrust.keepAgreementInsideWayly')}</p>
      </div>
    );
  }

  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {t('app.marketplaceTrust.requestSafetyNote')}
    </p>
  );
}

type MarketplaceHowRequestsWorkProps = {
  className?: string;
};

export function MarketplaceHowRequestsWork({ className }: MarketplaceHowRequestsWorkProps) {
  const { t } = useI18n();

  return (
    <section
      className={cn('rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm', className)}
      aria-labelledby="marketplace-how-requests-heading"
    >
      <h3 id="marketplace-how-requests-heading" className="text-sm font-semibold">
        {t('app.marketplaceTrust.howRequestsWork')}
      </h3>
      <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4 text-xs text-muted-foreground">
        <li>{t('app.marketplaceTrust.requestStepOne')}</li>
        <li>{t('app.marketplaceTrust.requestStepTwo')}</li>
        <li>{t('app.marketplaceTrust.requestStepThree')}</li>
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">{t('app.marketplaceTrust.reviewTools')}</p>
    </section>
  );
}
