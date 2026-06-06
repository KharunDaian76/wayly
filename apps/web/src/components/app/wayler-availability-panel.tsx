'use client';

import { ApiError } from '@wayly/sdk';
import type { WaylerAvailabilitySummary } from '@wayly/types';
import { TripDirection, WaylerAvailabilityStatus, WaylerAvailabilityType } from '@wayly/types';
import type { CreateWaylerAvailabilityInput } from '@wayly/validation';
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

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';
const ALERT_INFO_CLASS = 'wayly-alert wayly-alert-info';

type ActionKind = 'publish' | 'pause' | 'cancel';

type FormState = {
  type: WaylerAvailabilityType;
  originCountry: string;
  originCity: string;
  originRegion: string;
  destinationCountry: string;
  destinationCity: string;
  destinationRegion: string;
  availableFrom: string;
  availableTo: string;
  departureDate: string;
  returnDate: string;
  tripDirection: TripDirection | '';
  maxPackages: string;
  maxWeightKg: string;
  notes: string;
};

const INITIAL_FORM: FormState = {
  type: WaylerAvailabilityType.LOCAL_AVAILABILITY,
  originCountry: '',
  originCity: '',
  originRegion: '',
  destinationCountry: '',
  destinationCity: '',
  destinationRegion: '',
  availableFrom: '',
  availableTo: '',
  departureDate: '',
  returnDate: '',
  tripDirection: '',
  maxPackages: '',
  maxWeightKg: '',
  notes: '',
};

type WaylerAvailabilityPanelProps = {
  isApproved: boolean;
  kycLoading: boolean;
};

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

function normalizeCountry(value: string): string | undefined {
  const code = value.trim().toUpperCase();
  return code.length === 2 ? code : undefined;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalPositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const num = Number.parseInt(trimmed, 10);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

function optionalPositiveDecimal(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

function availabilityStatusKey(status: WaylerAvailabilityStatus): TranslationKey {
  switch (status) {
    case WaylerAvailabilityStatus.DRAFT:
      return 'app.waylerAvailability.draft';
    case WaylerAvailabilityStatus.ACTIVE:
      return 'app.waylerAvailability.active';
    case WaylerAvailabilityStatus.PAUSED:
      return 'app.waylerAvailability.paused';
    case WaylerAvailabilityStatus.EXPIRED:
      return 'app.waylerAvailability.expired';
    case WaylerAvailabilityStatus.CANCELLED:
      return 'app.waylerAvailability.cancelled';
    default:
      return 'app.waylerAvailability.status';
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

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function WaylerAvailabilityPanel({ isApproved, kycLoading }: WaylerAvailabilityPanelProps) {
  const { t } = useI18n();

  const [listings, setListings] = useState<WaylerAvailabilitySummary[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [actionBusy, setActionBusy] = useState<{ id: string; action: ActionKind } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isLocal = form.type === WaylerAvailabilityType.LOCAL_AVAILABILITY;
  const isTrip = form.type === WaylerAvailabilityType.TRIP_ROUTE;
  const returnRequired = isTrip && form.tripDirection === TripDirection.RETURN;

  const loadListings = useCallback(async () => {
    if (!isApproved) {
      setListings([]);
      return;
    }
    setListingsLoading(true);
    setListingsError(null);
    try {
      const result = await api.waylerAvailabilities.mine({ limit: 20 });
      setListings(result.items);
    } catch {
      setListingsError(t('app.waylerAvailability.loadFailed'));
    } finally {
      setListingsLoading(false);
    }
  }, [isApproved, t]);

  useEffect(() => {
    if (!kycLoading && isApproved) {
      void loadListings();
    }
  }, [kycLoading, isApproved, loadListings]);

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setFormError(null);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFormError(null);
    setCreateError(null);
  };

  const buildCreateBody = (): CreateWaylerAvailabilityInput | null => {
    const originCountry = normalizeCountry(form.originCountry);
    const originCity = optionalText(form.originCity);
    const originRegion = optionalText(form.originRegion);

    if (isLocal) {
      if (!originCountry) {
        setFormError(t('app.waylerAvailability.originCountry'));
        return null;
      }
      if (!originCity && !originRegion) {
        setFormError(t('app.waylerAvailability.localHint'));
        return null;
      }
      const availableFrom = toIsoDateTime(form.availableFrom);
      if (!availableFrom) {
        setFormError(t('app.waylerAvailability.availableFrom'));
        return null;
      }

      return {
        type: WaylerAvailabilityType.LOCAL_AVAILABILITY,
        originCountry,
        originCity,
        originRegion,
        availableFrom,
        availableTo: toIsoDateTime(form.availableTo),
        maxPackages: optionalPositiveInt(form.maxPackages),
        maxWeightKg: optionalPositiveDecimal(form.maxWeightKg),
        notes: optionalText(form.notes),
      };
    }

    const destinationCountry = normalizeCountry(form.destinationCountry);
    const destinationCity = optionalText(form.destinationCity);

    if (!originCountry || !originCity) {
      setFormError(t('app.waylerAvailability.tripHint'));
      return null;
    }
    if (!destinationCountry || !destinationCity) {
      setFormError(t('app.waylerAvailability.tripHint'));
      return null;
    }
    const departureDate = toIsoDateTime(form.departureDate);
    if (!departureDate) {
      setFormError(t('app.waylerAvailability.departureDate'));
      return null;
    }
    if (!form.tripDirection) {
      setFormError(t('app.waylerAvailability.tripDirection'));
      return null;
    }
    if (form.tripDirection === TripDirection.RETURN && !toIsoDateTime(form.returnDate)) {
      setFormError(t('app.waylerAvailability.returnDateRequired'));
      return null;
    }

    return {
      type: WaylerAvailabilityType.TRIP_ROUTE,
      originCountry,
      originCity,
      originRegion,
      destinationCountry,
      destinationCity,
      destinationRegion: optionalText(form.destinationRegion),
      departureDate,
      returnDate: toIsoDateTime(form.returnDate),
      tripDirection: form.tripDirection,
      maxPackages: optionalPositiveInt(form.maxPackages),
      maxWeightKg: optionalPositiveDecimal(form.maxWeightKg),
      notes: optionalText(form.notes),
    };
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!isApproved || creating) {
      return;
    }

    setCreateError(null);
    setCreateSuccess(false);
    setActionError(null);
    setActionSuccess(null);

    const body = buildCreateBody();
    if (!body) {
      return;
    }

    setCreating(true);
    try {
      await api.waylerAvailabilities.create(body);
      setCreateSuccess(true);
      resetForm();
      await loadListings();
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.message || t('app.waylerAvailability.createFailed'));
      } else {
        setCreateError(t('app.waylerAvailability.createFailed'));
      }
    } finally {
      setCreating(false);
    }
  };

  const runAction = async (id: string, action: ActionKind) => {
    if (!isApproved || actionBusy) {
      return;
    }

    setActionBusy({ id, action });
    setActionError(null);
    setActionSuccess(null);
    setCreateSuccess(false);

    try {
      if (action === 'publish') {
        await api.waylerAvailabilities.publish(id);
        setActionSuccess(t('app.waylerAvailability.publishSuccess'));
      } else if (action === 'pause') {
        await api.waylerAvailabilities.pause(id);
        setActionSuccess(t('app.waylerAvailability.pauseSuccess'));
      } else {
        await api.waylerAvailabilities.cancel(id);
        setActionSuccess(t('app.waylerAvailability.cancelSuccess'));
      }
      await loadListings();
    } catch {
      setActionError(t('app.waylerAvailability.actionFailed'));
    } finally {
      setActionBusy(null);
    }
  };

  const actionDisabled = actionBusy !== null || creating;

  const tripDirectionLabel = (direction: TripDirection | null): string => {
    if (!direction) {
      return '—';
    }
    switch (direction) {
      case TripDirection.ONE_WAY:
        return t('app.waylerAvailability.oneWay');
      case TripDirection.RETURN:
        return t('app.waylerAvailability.returnTrip');
      case TripDirection.FLEXIBLE:
        return t('app.waylerAvailability.flexible');
      default:
        return direction;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('app.waylerAvailability.subtitle')}</p>

      {!kycLoading && !isApproved ? (
        <p className={ALERT_INFO_CLASS}>{t('app.waylerFeed.kycRequired')}</p>
      ) : null}

      {isApproved ? (
        <>
          <form
            className="wayly-filter-panel flex flex-col gap-4 rounded-xl border p-4"
            onSubmit={(e) => void handleCreate(e)}
          >
            <h3 className="text-sm font-semibold">{t('app.waylerAvailability.createTitle')}</h3>
            <p className="text-xs text-muted-foreground">
              {isLocal
                ? t('app.waylerAvailability.localHint')
                : t('app.waylerAvailability.tripHint')}
            </p>

            {formError ? <p className={ALERT_ERROR_CLASS}>{formError}</p> : null}
            {createError ? <p className={ALERT_ERROR_CLASS}>{createError}</p> : null}
            {createSuccess ? (
              <p className={ALERT_SUCCESS_CLASS} role="status">
                {t('app.waylerAvailability.createSuccess')}
              </p>
            ) : null}

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.waylerAvailability.type')}</span>
              <select
                className={SELECT_CLASS}
                value={form.type}
                disabled={creating}
                onChange={(e) => updateForm({ type: e.target.value as WaylerAvailabilityType })}
              >
                <option value={WaylerAvailabilityType.LOCAL_AVAILABILITY}>
                  {t('app.waylerAvailability.localAvailability')}
                </option>
                <option value={WaylerAvailabilityType.TRIP_ROUTE}>
                  {t('app.waylerAvailability.tripRoute')}
                </option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.waylerAvailability.originCountry')}</span>
                <Input
                  value={form.originCountry}
                  maxLength={2}
                  placeholder="KG"
                  disabled={creating}
                  onChange={(e) => updateForm({ originCountry: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.waylerAvailability.originCity')}</span>
                <Input
                  value={form.originCity}
                  disabled={creating}
                  onChange={(e) => updateForm({ originCity: e.target.value })}
                />
              </label>
              {isLocal ? (
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.originRegion')}</span>
                  <Input
                    value={form.originRegion}
                    disabled={creating}
                    onChange={(e) => updateForm({ originRegion: e.target.value })}
                  />
                </label>
              ) : null}
            </div>

            {isTrip ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">
                    {t('app.waylerAvailability.destinationCountry')}
                  </span>
                  <Input
                    value={form.destinationCountry}
                    maxLength={2}
                    placeholder="ID"
                    disabled={creating}
                    onChange={(e) => updateForm({ destinationCountry: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.destinationCity')}</span>
                  <Input
                    value={form.destinationCity}
                    disabled={creating}
                    onChange={(e) => updateForm({ destinationCity: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">
                    {t('app.waylerAvailability.destinationRegion')}
                  </span>
                  <Input
                    value={form.destinationRegion}
                    disabled={creating}
                    onChange={(e) => updateForm({ destinationRegion: e.target.value })}
                  />
                </label>
              </div>
            ) : null}

            {isLocal ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.availableFrom')}</span>
                  <Input
                    type="datetime-local"
                    value={form.availableFrom}
                    disabled={creating}
                    onChange={(e) => updateForm({ availableFrom: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.availableTo')}</span>
                  <Input
                    type="datetime-local"
                    value={form.availableTo}
                    disabled={creating}
                    onChange={(e) => updateForm({ availableTo: e.target.value })}
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.departureDate')}</span>
                  <Input
                    type="datetime-local"
                    value={form.departureDate}
                    disabled={creating}
                    onChange={(e) => updateForm({ departureDate: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t('app.waylerAvailability.tripDirection')}</span>
                  <select
                    className={SELECT_CLASS}
                    value={form.tripDirection}
                    disabled={creating}
                    onChange={(e) =>
                      updateForm({
                        tripDirection: e.target.value as TripDirection | '',
                      })
                    }
                  >
                    <option value="">—</option>
                    <option value={TripDirection.ONE_WAY}>
                      {t('app.waylerAvailability.oneWay')}
                    </option>
                    <option value={TripDirection.RETURN}>
                      {t('app.waylerAvailability.returnTrip')}
                    </option>
                    <option value={TripDirection.FLEXIBLE}>
                      {t('app.waylerAvailability.flexible')}
                    </option>
                  </select>
                </label>
                {returnRequired ? (
                  <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                    <span className="font-medium">{t('app.waylerAvailability.returnDate')}</span>
                    <Input
                      type="datetime-local"
                      value={form.returnDate}
                      disabled={creating}
                      onChange={(e) => updateForm({ returnDate: e.target.value })}
                    />
                  </label>
                ) : null}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.waylerAvailability.maxPackages')}</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={form.maxPackages}
                  disabled={creating}
                  onChange={(e) => updateForm({ maxPackages: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.waylerAvailability.maxWeightKg')}</span>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={form.maxWeightKg}
                  disabled={creating}
                  onChange={(e) => updateForm({ maxWeightKg: e.target.value })}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.waylerAvailability.notes')}</span>
              <textarea
                className={TEXTAREA_CLASS}
                value={form.notes}
                maxLength={1000}
                disabled={creating}
                onChange={(e) => updateForm({ notes: e.target.value })}
              />
            </label>

            <Button type="submit" variant="primary" disabled={creating || actionDisabled}>
              {creating ? t('app.waylerAvailability.creating') : t('app.waylerAvailability.create')}
            </Button>
          </form>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t('app.waylerAvailability.myListings')}</h3>

            {actionError ? <p className={ALERT_ERROR_CLASS}>{actionError}</p> : null}
            {actionSuccess ? (
              <p className={ALERT_SUCCESS_CLASS} role="status">
                {actionSuccess}
              </p>
            ) : null}
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
              <p className="text-sm text-muted-foreground">{t('app.waylerAvailability.empty')}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {listings.map((listing) => {
                  const busy = actionBusy?.id === listing.id ? actionBusy.action : null;
                  const canPublish =
                    listing.status === WaylerAvailabilityStatus.DRAFT ||
                    listing.status === WaylerAvailabilityStatus.PAUSED;
                  const canPause = listing.status === WaylerAvailabilityStatus.ACTIVE;
                  const canCancel =
                    listing.status === WaylerAvailabilityStatus.DRAFT ||
                    listing.status === WaylerAvailabilityStatus.ACTIVE ||
                    listing.status === WaylerAvailabilityStatus.PAUSED;
                  const isLocalListing = listing.type === WaylerAvailabilityType.LOCAL_AVAILABILITY;

                  return (
                    <li key={listing.id} className={LISTING_CARD_CLASS}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium">
                          {isLocalListing
                            ? t('app.waylerAvailability.localAvailability')
                            : t('app.waylerAvailability.tripRoute')}
                        </p>
                        <span className={availabilityStatusBadgeClass(listing.status)}>
                          {t(availabilityStatusKey(listing.status))}
                        </span>
                      </div>

                      <dl className="mt-2 flex flex-col gap-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                          <dt className="text-muted-foreground">
                            {t('app.waylerAvailability.originCountry')}
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
                              {t('app.waylerAvailability.destinationCity')}
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
                                {t('app.waylerAvailability.availableFrom')}
                              </dt>
                              <dd>{formatDateTime(listing.availableFrom)}</dd>
                            </div>
                            {listing.availableTo ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.waylerAvailability.availableTo')}
                                </dt>
                                <dd>{formatDateTime(listing.availableTo)}</dd>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.waylerAvailability.departureDate')}
                              </dt>
                              <dd>{formatDateTime(listing.departureDate)}</dd>
                            </div>
                            {listing.returnDate ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.waylerAvailability.returnDate')}
                                </dt>
                                <dd>{formatDateTime(listing.returnDate)}</dd>
                              </div>
                            ) : null}
                            {listing.tripDirection ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.waylerAvailability.tripDirection')}
                                </dt>
                                <dd>{tripDirectionLabel(listing.tripDirection)}</dd>
                              </div>
                            ) : null}
                          </>
                        )}
                        {listing.maxPackages !== null ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.waylerAvailability.maxPackages')}
                            </dt>
                            <dd>{listing.maxPackages}</dd>
                          </div>
                        ) : null}
                        {listing.maxWeightKg ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.waylerAvailability.maxWeightKg')}
                            </dt>
                            <dd>{listing.maxWeightKg}</dd>
                          </div>
                        ) : null}
                        {listing.notes ? (
                          <div className="flex flex-col gap-0.5">
                            <dt className="text-muted-foreground">
                              {t('app.waylerAvailability.notes')}
                            </dt>
                            <dd className="break-words">{listing.notes}</dd>
                          </div>
                        ) : null}
                        {listing.publishedAt ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.waylerAvailability.publishedAt')}
                            </dt>
                            <dd>{formatDateTime(listing.publishedAt)}</dd>
                          </div>
                        ) : null}
                        {listing.expiresAt ? (
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.waylerAvailability.expiresAt')}
                            </dt>
                            <dd>{formatDateTime(listing.expiresAt)}</dd>
                          </div>
                        ) : null}
                      </dl>

                      <div className="wayly-action-group">
                        {canPublish ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionDisabled}
                            onClick={() => void runAction(listing.id, 'publish')}
                          >
                            {busy === 'publish'
                              ? t('app.waylerAvailability.publishing')
                              : t('app.waylerAvailability.publish')}
                          </Button>
                        ) : null}
                        {canPause ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionDisabled}
                            onClick={() => void runAction(listing.id, 'pause')}
                          >
                            {busy === 'pause'
                              ? t('app.waylerAvailability.pausing')
                              : t('app.waylerAvailability.pause')}
                          </Button>
                        ) : null}
                        {canCancel ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionDisabled}
                            onClick={() => void runAction(listing.id, 'cancel')}
                          >
                            {busy === 'cancel'
                              ? t('app.waylerAvailability.cancelling')
                              : t('app.waylerAvailability.cancel')}
                          </Button>
                        ) : null}
                      </div>
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
