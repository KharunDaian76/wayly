'use client';

import type { ActiveWaylerLocationCount, ActiveWaylerMarketplaceResponse } from '@wayly/types';
import { Button, Input, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { PanelErrorState } from '@/components/app/panel-status-states';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const LOCATION_CARD_CLASS = cn(
  'rounded-lg border border-primary/15 bg-background/80 px-3 py-2.5 text-sm shadow-sm',
  'transition-colors hover:border-primary/30',
);

const LOCATION_CARD_INTERACTIVE_CLASS = cn(
  LOCATION_CARD_CLASS,
  'w-full cursor-pointer text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
);

type LocationFilters = {
  country: string;
  city: string;
};

type RouteFilters = {
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
};

type ActiveWaylersMarketplaceSectionProps = {
  canBrowse: boolean;
  routeFilters?: RouteFilters;
  refreshKey?: number;
  onLocationSelect?: (country: string, city: string | null) => void;
};

function normalizeCountry(value: string): string | undefined {
  const trimmed = value.trim().toUpperCase();
  return trimmed.length >= 2 ? trimmed : undefined;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function formatLocationLabel(entry: ActiveWaylerLocationCount): string {
  if (entry.city) {
    return `${entry.city}, ${entry.country}`;
  }
  return entry.country;
}

export function ActiveWaylersMarketplaceSection({
  canBrowse,
  routeFilters,
  refreshKey = 0,
  onLocationSelect,
}: ActiveWaylersMarketplaceSectionProps) {
  const { t } = useI18n();

  const [draftFilters, setDraftFilters] = useState<LocationFilters>({ country: '', city: '' });
  const [appliedFilters, setAppliedFilters] = useState<LocationFilters>({ country: '', city: '' });

  const [data, setData] = useState<ActiveWaylerMarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeFromCountry = routeFilters?.fromCountry ?? '';
  const routeFromCity = routeFilters?.fromCity ?? '';
  const routeToCountry = routeFilters?.toCountry ?? '';
  const routeToCity = routeFilters?.toCity ?? '';

  const loadCounts = useCallback(async () => {
    if (!canBrowse) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.marketplace.getActiveWaylerCounts({
        country: normalizeCountry(appliedFilters.country),
        city: optionalText(appliedFilters.city),
        fromCountry: normalizeCountry(routeFromCountry),
        fromCity: optionalText(routeFromCity),
        toCountry: normalizeCountry(routeToCountry),
        toCity: optionalText(routeToCity),
        limit: 12,
      });
      setData(result);
    } catch {
      setError(t('app.activeWaylers.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [
    appliedFilters.city,
    appliedFilters.country,
    canBrowse,
    routeFromCity,
    routeFromCountry,
    routeToCity,
    routeToCountry,
    t,
  ]);

  useEffect(() => {
    if (canBrowse) {
      void loadCounts();
    }
  }, [canBrowse, loadCounts, refreshKey]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleClearFilters = () => {
    setDraftFilters({ country: '', city: '' });
    setAppliedFilters({ country: '', city: '' });
  };

  const handleLocationClick = (entry: ActiveWaylerLocationCount) => {
    if (!onLocationSelect) {
      return;
    }
    setDraftFilters({ country: entry.country, city: entry.city ?? '' });
    onLocationSelect(entry.country, entry.city ?? null);
  };

  if (!canBrowse) {
    return null;
  }

  const hasAppliedFilters =
    appliedFilters.country.trim() !== '' || appliedFilters.city.trim() !== '';

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-primary/20 p-4 shadow-sm',
        'bg-gradient-to-br from-primary/5 via-background to-muted/20',
      )}
      aria-labelledby="active-waylers-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-lg">
              🌍
            </span>
            <h3 id="active-waylers-heading" className="text-base font-semibold tracking-tight">
              {t('app.activeWaylers.title')}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">{t('app.activeWaylers.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void loadCounts()}
          className="shrink-0 self-start"
        >
          {loading ? t('app.activeWaylers.loading') : t('app.activeWaylers.refresh')}
        </Button>
      </div>

      {!loading && data ? (
        <p className="text-sm font-medium text-primary">
          {t('app.activeWaylers.total').replace('{count}', String(data.totalActiveWaylers))}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{t('app.activeWaylers.filterCountry')}</span>
          <Input
            value={draftFilters.country}
            disabled={loading}
            placeholder={t('app.senderWaylers.originCountry')}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, country: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{t('app.activeWaylers.filterCity')}</span>
          <Input
            value={draftFilters.city}
            disabled={loading}
            placeholder={t('app.senderWaylers.originCity')}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, city: e.target.value }))}
          />
        </label>
      </div>

      <div className="wayly-action-group">
        <Button variant="primary" size="sm" disabled={loading} onClick={handleApplyFilters}>
          {t('app.activeWaylers.applyFilters')}
        </Button>
        {hasAppliedFilters ? (
          <Button variant="outline" size="sm" disabled={loading} onClick={handleClearFilters}>
            {t('app.activeWaylers.clearFilters')}
          </Button>
        ) : null}
      </div>

      {error ? (
        <PanelErrorState
          message={error}
          retryLabel={t('app.activeWaylers.refresh')}
          onRetry={() => void loadCounts()}
          retryDisabled={loading}
        />
      ) : null}

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !error && data && data.locations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('app.activeWaylers.empty')}</p>
      ) : !error && data && data.locations.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.locations.map((entry, index) => {
            const content = (
              <>
                <p className="font-medium">{formatLocationLabel(entry)}</p>
                <p className="text-muted-foreground">
                  {t('app.activeWaylers.locationCount').replace(
                    '{count}',
                    String(entry.activeWaylerCount),
                  )}
                </p>
                {entry.availableTripCount != null && entry.availableTripCount > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t('app.activeWaylers.tripCount').replace(
                      '{count}',
                      String(entry.availableTripCount),
                    )}
                  </p>
                ) : null}
              </>
            );

            return (
              <li key={`${entry.country}-${entry.city ?? ''}-${index}`}>
                {onLocationSelect ? (
                  <button
                    type="button"
                    className={LOCATION_CARD_INTERACTIVE_CLASS}
                    onClick={() => handleLocationClick(entry)}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={LOCATION_CARD_CLASS}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {t('app.marketplaceTrust.aggregatedCountsNote')}
      </p>
      <p className="text-xs text-muted-foreground">
        {t('app.marketplaceTrust.browseAvailableWaylers')}
      </p>
    </section>
  );
}
