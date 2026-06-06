'use client';

import type { ActiveWaylerCountSummary, WaylerAvailabilitySummary } from '@wayly/types';
import { TripDirection, WaylerAvailabilityStatus, WaylerAvailabilityType } from '@wayly/types';
import type {
  ActiveWaylerCountsQueryInput,
  WaylerAvailabilitiesPublicQueryInput,
} from '@wayly/validation';
import { Button, Input, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

const COUNT_CARD_CLASS = cn('rounded-lg border border-border bg-background/60 px-3 py-2 text-sm');

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_INFO_CLASS = 'wayly-alert wayly-alert-info';

type FilterState = {
  type: '' | WaylerAvailabilityType;
  originCountry: string;
  originCity: string;
  originRegion: string;
  destinationCountry: string;
  destinationCity: string;
  destinationRegion: string;
  date: string;
};

const INITIAL_FILTERS: FilterState = {
  type: '',
  originCountry: '',
  originCity: '',
  originRegion: '',
  destinationCountry: '',
  destinationCity: '',
  destinationRegion: '',
  date: '',
};

type SenderWaylersPanelProps = {
  canBrowse: boolean;
  kycLoading: boolean;
};

function normalizeCountry(value: string): string | undefined {
  const code = value.trim().toUpperCase();
  return code.length === 2 ? code : undefined;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPublicQuery(filters: FilterState): Partial<WaylerAvailabilitiesPublicQueryInput> {
  const query: Partial<WaylerAvailabilitiesPublicQueryInput> = { limit: 20 };
  if (filters.type) {
    query.type = filters.type;
  }
  const originCountry = normalizeCountry(filters.originCountry);
  if (originCountry) {
    query.originCountry = originCountry;
  }
  const originCity = optionalText(filters.originCity);
  if (originCity) {
    query.originCity = originCity;
  }
  const originRegion = optionalText(filters.originRegion);
  if (originRegion) {
    query.originRegion = originRegion;
  }
  const destinationCountry = normalizeCountry(filters.destinationCountry);
  if (destinationCountry) {
    query.destinationCountry = destinationCountry;
  }
  const destinationCity = optionalText(filters.destinationCity);
  if (destinationCity) {
    query.destinationCity = destinationCity;
  }
  const destinationRegion = optionalText(filters.destinationRegion);
  if (destinationRegion) {
    query.destinationRegion = destinationRegion;
  }
  const date = optionalText(filters.date);
  if (date) {
    query.date = date;
  }
  return query;
}

function buildCountsQuery(filters: FilterState): Partial<ActiveWaylerCountsQueryInput> {
  const query: Partial<ActiveWaylerCountsQueryInput> = {};
  const country = normalizeCountry(filters.originCountry);
  if (country) {
    query.country = country;
  }
  const city = optionalText(filters.originCity);
  if (city) {
    query.city = city;
  }
  const region = optionalText(filters.originRegion);
  if (region) {
    query.region = region;
  }
  const date = optionalText(filters.date);
  if (date) {
    query.date = date;
  }
  return query;
}

function availabilityStatusKey(status: WaylerAvailabilityStatus): TranslationKey {
  switch (status) {
    case WaylerAvailabilityStatus.DRAFT:
      return 'app.senderWaylers.draft';
    case WaylerAvailabilityStatus.ACTIVE:
      return 'app.senderWaylers.active';
    case WaylerAvailabilityStatus.PAUSED:
      return 'app.senderWaylers.paused';
    case WaylerAvailabilityStatus.EXPIRED:
      return 'app.senderWaylers.expired';
    case WaylerAvailabilityStatus.CANCELLED:
      return 'app.senderWaylers.cancelled';
    default:
      return 'app.senderWaylers.status';
  }
}

function availabilityStatusBadgeClass(status: WaylerAvailabilityStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAvailabilityStatus.DRAFT:
      return cn(base, 'wayly-status-draft');
    case WaylerAvailabilityStatus.ACTIVE:
      return cn(base, 'wayly-status-open');
    case WaylerAvailabilityStatus.PAUSED:
      return cn(base, 'wayly-status-default');
    case WaylerAvailabilityStatus.EXPIRED:
      return cn(base, 'wayly-status-cancelled');
    case WaylerAvailabilityStatus.CANCELLED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function formatLocationParts(
  city: string | null,
  region: string | null,
  country: string | null,
): string {
  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

function formatCountLocation(entry: ActiveWaylerCountSummary): string {
  return formatLocationParts(entry.city, entry.region, entry.country);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function SenderWaylersPanel({ canBrowse, kycLoading }: SenderWaylersPanelProps) {
  const { t } = useI18n();

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [listings, setListings] = useState<WaylerAvailabilitySummary[]>([]);
  const [counts, setCounts] = useState<ActiveWaylerCountSummary[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);

  const updateFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const loadListings = useCallback(
    async (filterState: FilterState) => {
      if (!canBrowse) {
        setListings([]);
        return;
      }
      setListingsLoading(true);
      setListingsError(null);
      try {
        const result = await api.waylerAvailabilities.publicList(buildPublicQuery(filterState));
        setListings(result.items);
      } catch {
        setListingsError(t('app.senderWaylers.loadFailed'));
      } finally {
        setListingsLoading(false);
      }
    },
    [canBrowse, t],
  );

  const loadCounts = useCallback(
    async (filterState: FilterState) => {
      if (!canBrowse) {
        setCounts([]);
        return;
      }
      setCountsLoading(true);
      setCountsError(null);
      try {
        const result = await api.waylerAvailabilities.activeCounts(buildCountsQuery(filterState));
        setCounts(result);
      } catch {
        setCountsError(t('app.senderWaylers.loadFailed'));
      } finally {
        setCountsLoading(false);
      }
    },
    [canBrowse, t],
  );

  const runSearch = useCallback(
    async (filterState: FilterState) => {
      await Promise.all([loadListings(filterState), loadCounts(filterState)]);
    },
    [loadListings, loadCounts],
  );

  useEffect(() => {
    if (!kycLoading && canBrowse) {
      void runSearch(INITIAL_FILTERS);
    }
  }, [kycLoading, canBrowse, runSearch]);

  const handleSearch = () => {
    void runSearch(filters);
  };

  const handleRefresh = () => {
    void runSearch(filters);
  };

  const tripDirectionLabel = (direction: TripDirection | null): string => {
    if (!direction) {
      return '—';
    }
    switch (direction) {
      case TripDirection.ONE_WAY:
        return t('app.senderWaylers.oneWay');
      case TripDirection.RETURN:
        return t('app.senderWaylers.returnTrip');
      case TripDirection.FLEXIBLE:
        return t('app.senderWaylers.flexible');
      default:
        return direction;
    }
  };

  const busy = listingsLoading || countsLoading;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('app.senderWaylers.subtitle')}</p>

      {!kycLoading && !canBrowse ? (
        <p className={ALERT_INFO_CLASS}>{t('app.senderPanel.kycRequired')}</p>
      ) : null}

      {canBrowse ? (
        <>
          <div className="wayly-filter-panel flex flex-col gap-4 rounded-xl border p-4">
            <h3 className="text-sm font-semibold">{t('app.senderWaylers.filters')}</h3>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.senderWaylers.type')}</span>
              <select
                className={SELECT_CLASS}
                value={filters.type}
                disabled={busy}
                onChange={(e) =>
                  updateFilters({
                    type: e.target.value as FilterState['type'],
                  })
                }
              >
                <option value="">{t('app.senderWaylers.allTypes')}</option>
                <option value={WaylerAvailabilityType.LOCAL_AVAILABILITY}>
                  {t('app.senderWaylers.localAvailability')}
                </option>
                <option value={WaylerAvailabilityType.TRIP_ROUTE}>
                  {t('app.senderWaylers.tripRoute')}
                </option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.originCountry')}</span>
                <Input
                  value={filters.originCountry}
                  disabled={busy}
                  onChange={(e) => updateFilters({ originCountry: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.originCity')}</span>
                <Input
                  value={filters.originCity}
                  disabled={busy}
                  onChange={(e) => updateFilters({ originCity: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.originRegion')}</span>
                <Input
                  value={filters.originRegion}
                  disabled={busy}
                  onChange={(e) => updateFilters({ originRegion: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.destinationCountry')}</span>
                <Input
                  value={filters.destinationCountry}
                  disabled={busy}
                  onChange={(e) => updateFilters({ destinationCountry: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.destinationCity')}</span>
                <Input
                  value={filters.destinationCity}
                  disabled={busy}
                  onChange={(e) => updateFilters({ destinationCity: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.senderWaylers.destinationRegion')}</span>
                <Input
                  value={filters.destinationRegion}
                  disabled={busy}
                  onChange={(e) => updateFilters({ destinationRegion: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2 lg:col-span-1">
                <span className="font-medium">{t('app.senderWaylers.date')}</span>
                <Input
                  type="date"
                  value={filters.date}
                  disabled={busy}
                  onChange={(e) => updateFilters({ date: e.target.value })}
                />
              </label>
            </div>

            <div className="wayly-action-group">
              <Button variant="primary" size="sm" disabled={busy} onClick={handleSearch}>
                {listingsLoading ? t('app.senderWaylers.loading') : t('app.senderWaylers.search')}
              </Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={handleRefresh}>
                {t('app.senderWaylers.refresh')}
              </Button>
            </div>
          </div>

          <p className={ALERT_INFO_CLASS}>{t('app.senderWaylers.noContactYet')}</p>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{t('app.senderWaylers.countsTitle')}</h3>
            {countsError ? <p className={ALERT_ERROR_CLASS}>{countsError}</p> : null}
            {countsLoading ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : counts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('app.senderWaylers.countsEmpty')}</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {counts.map((entry, index) => (
                  <li
                    key={`${entry.country ?? ''}-${entry.city ?? ''}-${entry.region ?? ''}-${index}`}
                    className={COUNT_CARD_CLASS}
                  >
                    <p className="font-medium">{formatCountLocation(entry)}</p>
                    <p className="text-muted-foreground">
                      {entry.activeCount} {t('app.senderWaylers.activeCouriers')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t('app.senderWaylers.resultsTitle')}</h3>
            {listingsError ? <p className={ALERT_ERROR_CLASS}>{listingsError}</p> : null}
            {listingsLoading ? (
              <ul className="flex flex-col gap-4" aria-hidden>
                {[0, 1].map((key) => (
                  <li key={key} className="wayly-order-card rounded-xl px-4 py-4">
                    <Skeleton className="mb-2 h-4 w-3/5 max-w-xs" />
                    <Skeleton className="mb-3 h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </li>
                ))}
              </ul>
            ) : listings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('app.senderWaylers.empty')}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {listings.map((listing) => {
                  const isLocalListing = listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY;

                  return (
                    <li key={listing.id} className={LISTING_CARD_CLASS}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium">
                          {isLocalListing
                            ? t('app.senderWaylers.localAvailability')
                            : t('app.senderWaylers.tripRoute')}
                        </p>
                        <span className={availabilityStatusBadgeClass(listing.status)}>
                          {t(availabilityStatusKey(listing.status))}
                        </span>
                      </div>

                      <dl className="mt-2 flex flex-col gap-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                          <dt className="text-muted-foreground">
                            {t('app.senderWaylers.originCountry')}
                          </dt>
                          <dd>
                            {formatLocationParts(
                              listing.originCity,
                              listing.originRegion,
                              listing.originCountry,
                            )}
                          </dd>
                        </div>
                        {!isLocalListing ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.destinationCity')}
                            </dt>
                            <dd>
                              {formatLocationParts(
                                listing.destinationCity,
                                listing.destinationRegion,
                                listing.destinationCountry,
                              )}
                            </dd>
                          </div>
                        ) : null}
                        {isLocalListing ? (
                          <>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderWaylers.availableFrom')}
                              </dt>
                              <dd>{formatDateTime(listing.availableFrom)}</dd>
                            </div>
                            {listing.availableTo ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.senderWaylers.availableTo')}
                                </dt>
                                <dd>{formatDateTime(listing.availableTo)}</dd>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderWaylers.departureDate')}
                              </dt>
                              <dd>{formatDateTime(listing.departureDate)}</dd>
                            </div>
                            {listing.returnDate ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.senderWaylers.returnDate')}
                                </dt>
                                <dd>{formatDateTime(listing.returnDate)}</dd>
                              </div>
                            ) : null}
                            {listing.tripDirection ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.senderWaylers.tripDirection')}
                                </dt>
                                <dd>{tripDirectionLabel(listing.tripDirection)}</dd>
                              </div>
                            ) : null}
                          </>
                        )}
                        {listing.maxPackages !== null ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.maxPackages')}
                            </dt>
                            <dd>{listing.maxPackages}</dd>
                          </div>
                        ) : null}
                        {listing.maxWeightKg ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.maxWeightKg')}
                            </dt>
                            <dd>{listing.maxWeightKg}</dd>
                          </div>
                        ) : null}
                        {listing.notes ? (
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.notes')}
                            </dt>
                            <dd className="break-words">{listing.notes}</dd>
                          </div>
                        ) : null}
                        {listing.publishedAt ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.publishedAt')}
                            </dt>
                            <dd>{formatDateTime(listing.publishedAt)}</dd>
                          </div>
                        ) : null}
                        {listing.expiresAt ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderWaylers.expiresAt')}
                            </dt>
                            <dd>{formatDateTime(listing.expiresAt)}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
