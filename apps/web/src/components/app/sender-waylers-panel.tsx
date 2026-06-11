'use client';

import { ApiError } from '@wayly/sdk';
import type {
  ActiveWaylerCountSummary,
  WaylerAvailabilityRequestSummary,
  WaylerAvailabilitySummary,
} from '@wayly/types';
import {
  TripDirection,
  WaylerAvailabilityRequestStatus,
  WaylerAvailabilityStatus,
  WaylerAvailabilityType,
} from '@wayly/types';
import type {
  ActiveWaylerCountsQueryInput,
  WaylerAvailabilitiesPublicQueryInput,
} from '@wayly/validation';
import { Button, Input, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

const COUNT_CARD_CLASS = cn('rounded-lg border border-border bg-background/60 px-3 py-2 text-sm');

const REQUEST_CARD_CLASS = cn(
  'rounded-lg border border-border bg-background/60 px-3 py-3 text-sm',
  'wayly-feed-item-enter',
);

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_INFO_CLASS = 'wayly-alert wayly-alert-info';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

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

type RequestFormState = {
  title: string;
  packageDescription: string;
  pickupCountry: string;
  pickupCity: string;
  pickupAddress: string;
  dropoffCountry: string;
  dropoffCity: string;
  dropoffAddress: string;
  desiredPickupFrom: string;
  desiredPickupTo: string;
  desiredDeliveryFrom: string;
  desiredDeliveryTo: string;
  proposedReward: string;
  currency: string;
  message: string;
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

function toIsoDateTime(localValue: string): string | undefined {
  const trimmed = localValue.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}

function parseRewardToCents(amountStr: string): number | null {
  const trimmed = amountStr.trim();
  if (!trimmed) {
    return null;
  }
  const amount = Number(trimmed);
  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100);
}

function formatRewardCents(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
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

function buildInitialRequestForm(listing: WaylerAvailabilitySummary): RequestFormState {
  const isTrip = listing.type === WaylerAvailabilityType.TRIP_ROUTE;
  return {
    title: '',
    packageDescription: '',
    pickupCountry: listing.originCountry ?? '',
    pickupCity: listing.originCity ?? '',
    pickupAddress: '',
    dropoffCountry: isTrip ? (listing.destinationCountry ?? '') : '',
    dropoffCity: isTrip ? (listing.destinationCity ?? '') : '',
    dropoffAddress: '',
    desiredPickupFrom: '',
    desiredPickupTo: '',
    desiredDeliveryFrom: '',
    desiredDeliveryTo: '',
    proposedReward: '',
    currency: 'EUR',
    message: '',
  };
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

function requestStatusKey(status: WaylerAvailabilityRequestStatus): TranslationKey {
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return 'app.availabilityRequests.statusPending';
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return 'app.availabilityRequests.statusAccepted';
    case WaylerAvailabilityRequestStatus.DECLINED:
      return 'app.availabilityRequests.statusDeclined';
    case WaylerAvailabilityRequestStatus.CANCELLED:
      return 'app.availabilityRequests.statusCancelled';
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return 'app.availabilityRequests.statusExpired';
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

function requestStatusBadgeClass(status: WaylerAvailabilityRequestStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return cn(base, 'wayly-status-open');
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return cn(base, 'wayly-status-default');
    case WaylerAvailabilityRequestStatus.DECLINED:
    case WaylerAvailabilityRequestStatus.CANCELLED:
    case WaylerAvailabilityRequestStatus.EXPIRED:
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

function formatRequestRoute(request: WaylerAvailabilityRequestSummary): string {
  const pickup = formatLocationParts(request.pickupCity, null, request.pickupCountry);
  const dropoff = formatLocationParts(request.dropoffCity, null, request.dropoffCountry);
  return `${pickup} → ${dropoff}`;
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

function resolveRequestError(err: unknown, t: (key: TranslationKey) => string): string {
  if (!(err instanceof ApiError)) {
    return t('app.availabilityRequests.requestFailed');
  }
  if (err.code === 'AVAILABILITY_NOT_REQUESTABLE') {
    return t('app.availabilityRequests.availabilityNotRequestable');
  }
  if (err.code === 'CANNOT_REQUEST_OWN_AVAILABILITY') {
    return t('app.availabilityRequests.ownAvailabilityError');
  }
  if (err.code === 'KYC_REQUIRED') {
    return t('app.senderPanel.kycRequired');
  }
  const message = err.message.toLowerCase();
  if (message.includes('verification') || message.includes('kyc')) {
    return t('app.senderPanel.kycRequired');
  }
  return err.message || t('app.availabilityRequests.requestFailed');
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

  const [requestTargetId, setRequestTargetId] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState<RequestFormState | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestFormError, setRequestFormError] = useState<string | null>(null);

  const [myRequests, setMyRequests] = useState<WaylerAvailabilityRequestSummary[]>([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const updateFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const updateRequestForm = (patch: Partial<RequestFormState>) => {
    setRequestForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setRequestFormError(null);
    setRequestError(null);
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

  const loadMyRequests = useCallback(async () => {
    if (!canBrowse) {
      setMyRequests([]);
      return;
    }
    setMyRequestsLoading(true);
    setMyRequestsError(null);
    try {
      const result = await api.waylerAvailabilityRequests.mineAsSender({ limit: 5 });
      setMyRequests(result.items);
    } catch {
      setMyRequestsError(t('app.availabilityRequests.requestsLoadFailed'));
    } finally {
      setMyRequestsLoading(false);
    }
  }, [canBrowse, t]);

  const runSearch = useCallback(
    async (filterState: FilterState) => {
      await Promise.all([loadListings(filterState), loadCounts(filterState)]);
    },
    [loadListings, loadCounts],
  );

  useEffect(() => {
    if (!kycLoading && canBrowse) {
      void runSearch(INITIAL_FILTERS);
      void loadMyRequests();
    }
  }, [kycLoading, canBrowse, runSearch, loadMyRequests]);

  const handleSearch = () => {
    void runSearch(filters);
  };

  const handleRefresh = () => {
    void runSearch(filters);
    void loadMyRequests();
  };

  const openRequestForm = (listing: WaylerAvailabilitySummary) => {
    setRequestTargetId(listing.id);
    setRequestForm(buildInitialRequestForm(listing));
    setRequestError(null);
    setRequestSuccess(null);
    setRequestFormError(null);
  };

  const closeRequestForm = () => {
    setRequestTargetId(null);
    setRequestForm(null);
    setRequestError(null);
    setRequestFormError(null);
  };

  const handleSubmitRequest = async (event: FormEvent<HTMLFormElement>, availabilityId: string) => {
    event.preventDefault();
    if (!requestForm) {
      return;
    }

    setRequestError(null);
    setRequestFormError(null);
    setRequestSuccess(null);

    const title = requestForm.title.trim();
    const packageDescription = requestForm.packageDescription.trim();
    const pickupCountry = normalizeCountry(requestForm.pickupCountry);
    const pickupCity = optionalText(requestForm.pickupCity);
    const dropoffCountry = normalizeCountry(requestForm.dropoffCountry);
    const dropoffCity = optionalText(requestForm.dropoffCity);
    const proposedRewardCents = parseRewardToCents(requestForm.proposedReward);

    if (
      !title ||
      !packageDescription ||
      !pickupCountry ||
      !pickupCity ||
      !dropoffCountry ||
      !dropoffCity
    ) {
      setRequestFormError(t('app.availabilityRequests.requestFailed'));
      return;
    }

    if (proposedRewardCents === null) {
      setRequestFormError(t('app.availabilityRequests.rewardInvalid'));
      return;
    }

    setRequestSubmitting(true);
    try {
      await api.waylerAvailabilityRequests.create({
        availabilityId,
        title,
        packageDescription,
        pickupCountry,
        pickupCity,
        pickupAddress: optionalText(requestForm.pickupAddress),
        dropoffCountry,
        dropoffCity,
        dropoffAddress: optionalText(requestForm.dropoffAddress),
        desiredPickupFrom: toIsoDateTime(requestForm.desiredPickupFrom),
        desiredPickupTo: toIsoDateTime(requestForm.desiredPickupTo),
        desiredDeliveryFrom: toIsoDateTime(requestForm.desiredDeliveryFrom),
        desiredDeliveryTo: toIsoDateTime(requestForm.desiredDeliveryTo),
        proposedRewardCents,
        currency: requestForm.currency.trim().toUpperCase() || 'EUR',
        message: optionalText(requestForm.message),
      });
      setRequestSuccess(t('app.availabilityRequests.requestSent'));
      closeRequestForm();
      await loadMyRequests();
    } catch (err) {
      setRequestError(resolveRequestError(err, t));
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    setCancelError(null);
    setCancelSuccess(null);
    setCancellingId(id);
    try {
      await api.waylerAvailabilityRequests.cancel(id);
      setCancelSuccess(t('app.availabilityRequests.requestCancelled'));
      await loadMyRequests();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AVAILABILITY_REQUEST_NOT_PENDING') {
        setCancelError(t('app.availabilityRequests.cancelFailed'));
      } else {
        setCancelError(
          err instanceof ApiError ? err.message : t('app.availabilityRequests.cancelFailed'),
        );
      }
    } finally {
      setCancellingId(null);
    }
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

      {requestSuccess ? <p className={ALERT_SUCCESS_CLASS}>{requestSuccess}</p> : null}

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
            {requestError ? <p className={ALERT_ERROR_CLASS}>{requestError}</p> : null}
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
                  const isRequestOpen = requestTargetId === listing.id && requestForm !== null;

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

                      <div className="wayly-action-group mt-3">
                        {isRequestOpen ? (
                          <Button variant="outline" size="sm" onClick={closeRequestForm}>
                            {t('app.availabilityRequests.closeForm')}
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openRequestForm(listing)}
                          >
                            {t('app.availabilityRequests.requestThisWayler')}
                          </Button>
                        )}
                      </div>

                      {isRequestOpen ? (
                        <form
                          className="mt-4 flex flex-col gap-4 rounded-lg border border-border bg-background/40 p-4"
                          onSubmit={(event) => void handleSubmitRequest(event, listing.id)}
                        >
                          <h4 className="text-sm font-semibold">
                            {t('app.availabilityRequests.requestDelivery')}
                          </h4>

                          {requestFormError ? (
                            <p className={ALERT_ERROR_CLASS}>{requestFormError}</p>
                          ) : null}

                          <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">
                              {t('app.availabilityRequests.requestTitle')}
                            </span>
                            <Input
                              value={requestForm.title}
                              disabled={requestSubmitting}
                              onChange={(e) => updateRequestForm({ title: e.target.value })}
                              required
                            />
                          </label>

                          <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">
                              {t('app.availabilityRequests.packageDescription')}
                            </span>
                            <textarea
                              className={TEXTAREA_CLASS}
                              value={requestForm.packageDescription}
                              disabled={requestSubmitting}
                              onChange={(e) =>
                                updateRequestForm({ packageDescription: e.target.value })
                              }
                              required
                            />
                          </label>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.pickupCountry')}
                              </span>
                              <Input
                                value={requestForm.pickupCountry}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ pickupCountry: e.target.value })
                                }
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.pickupCity')}
                              </span>
                              <Input
                                value={requestForm.pickupCity}
                                disabled={requestSubmitting}
                                onChange={(e) => updateRequestForm({ pickupCity: e.target.value })}
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                              <span className="font-medium">
                                {t('app.availabilityRequests.pickupAddress')}
                              </span>
                              <Input
                                value={requestForm.pickupAddress}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ pickupAddress: e.target.value })
                                }
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.dropoffCountry')}
                              </span>
                              <Input
                                value={requestForm.dropoffCountry}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ dropoffCountry: e.target.value })
                                }
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.dropoffCity')}
                              </span>
                              <Input
                                value={requestForm.dropoffCity}
                                disabled={requestSubmitting}
                                onChange={(e) => updateRequestForm({ dropoffCity: e.target.value })}
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                              <span className="font-medium">
                                {t('app.availabilityRequests.dropoffAddress')}
                              </span>
                              <Input
                                value={requestForm.dropoffAddress}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ dropoffAddress: e.target.value })
                                }
                              />
                            </label>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.desiredPickupFrom')}
                              </span>
                              <Input
                                type="datetime-local"
                                value={requestForm.desiredPickupFrom}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ desiredPickupFrom: e.target.value })
                                }
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.desiredPickupTo')}
                              </span>
                              <Input
                                type="datetime-local"
                                value={requestForm.desiredPickupTo}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ desiredPickupTo: e.target.value })
                                }
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.desiredDeliveryFrom')}
                              </span>
                              <Input
                                type="datetime-local"
                                value={requestForm.desiredDeliveryFrom}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ desiredDeliveryFrom: e.target.value })
                                }
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.desiredDeliveryTo')}
                              </span>
                              <Input
                                type="datetime-local"
                                value={requestForm.desiredDeliveryTo}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ desiredDeliveryTo: e.target.value })
                                }
                              />
                            </label>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.proposedReward')}
                              </span>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="15.00"
                                value={requestForm.proposedReward}
                                disabled={requestSubmitting}
                                onChange={(e) =>
                                  updateRequestForm({ proposedReward: e.target.value })
                                }
                                required
                              />
                            </label>
                            <label className="flex flex-col gap-1.5 text-sm">
                              <span className="font-medium">
                                {t('app.availabilityRequests.currency')}
                              </span>
                              <Input
                                value={requestForm.currency}
                                disabled={requestSubmitting}
                                onChange={(e) => updateRequestForm({ currency: e.target.value })}
                              />
                            </label>
                          </div>

                          <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">
                              {t('app.availabilityRequests.messageToWayler')}
                            </span>
                            <textarea
                              className={TEXTAREA_CLASS}
                              value={requestForm.message}
                              disabled={requestSubmitting}
                              onChange={(e) => updateRequestForm({ message: e.target.value })}
                            />
                          </label>

                          <div className="wayly-action-group">
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              disabled={requestSubmitting}
                            >
                              {requestSubmitting
                                ? t('app.senderWaylers.loading')
                                : t('app.availabilityRequests.sendRequest')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={requestSubmitting}
                              onClick={closeRequestForm}
                            >
                              {t('app.availabilityRequests.closeForm')}
                            </Button>
                          </div>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">
              {t('app.availabilityRequests.myWaylerRequests')}
            </h3>
            {cancelSuccess ? <p className={ALERT_SUCCESS_CLASS}>{cancelSuccess}</p> : null}
            {cancelError ? <p className={ALERT_ERROR_CLASS}>{cancelError}</p> : null}
            {myRequestsError ? <p className={ALERT_ERROR_CLASS}>{myRequestsError}</p> : null}
            {myRequestsLoading ? (
              <ul className="flex flex-col gap-2" aria-hidden>
                {[0, 1].map((key) => (
                  <li key={key}>
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </li>
                ))}
              </ul>
            ) : myRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('app.availabilityRequests.noRequestsYet')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myRequests.map((request) => (
                  <li key={request.id} className={REQUEST_CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium">{request.title}</p>
                      <span className={requestStatusBadgeClass(request.status)}>
                        {t(requestStatusKey(request.status))}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{formatRequestRoute(request)}</p>
                    <p className="mt-1">
                      {formatRewardCents(request.proposedRewardCents, request.currency)}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {formatDateTime(request.createdAt)}
                    </p>
                    {request.responseMessage ? (
                      <p className="mt-2 break-words">
                        <span className="text-muted-foreground">
                          {t('app.availabilityRequests.responseMessage')}:{' '}
                        </span>
                        {request.responseMessage}
                      </p>
                    ) : null}
                    {request.status === WaylerAvailabilityRequestStatus.PENDING ? (
                      <div className="wayly-action-group mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancellingId === request.id}
                          onClick={() => void handleCancelRequest(request.id)}
                        >
                          {cancellingId === request.id
                            ? t('app.senderWaylers.loading')
                            : t('app.availabilityRequests.cancelRequest')}
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
