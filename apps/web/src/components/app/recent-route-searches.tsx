'use client';

import { Button } from '@wayly/ui';
import { Globe, X } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { RecentRouteSearchRecord } from '@/lib/recent-route-search-storage';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-lg border border-sky-500/20 bg-sky-500/[0.04] px-3 py-2.5 text-xs text-muted-foreground',
);

const CHIP_CLASS = cn(
  'inline-flex max-w-full items-center gap-1 rounded-full border border-border/60 bg-background/80',
  'px-2.5 py-1 text-xs text-foreground shadow-sm',
);

function formatLocationLabel(city: string, country: string): string | undefined {
  const cityText = city.trim();
  const countryText = country.trim().toUpperCase();
  if (cityText && countryText) {
    return `${cityText}, ${countryText}`;
  }
  return cityText || countryText || undefined;
}

function formatSearchLabel(
  search: RecentRouteSearchRecord,
  t: (key: TranslationKey) => string,
): string {
  const origin = formatLocationLabel(search.originCity, search.originCountry);
  const destination = formatLocationLabel(search.destinationCity, search.destinationCountry);

  if (origin && destination) {
    return t('app.recentRoutes.originToDestination')
      .replace('{origin}', origin)
      .replace('{destination}', destination);
  }
  if (origin) {
    return t('app.recentRoutes.originOnly').replace('{origin}', origin);
  }
  if (destination) {
    return t('app.recentRoutes.noDestination').replace('{destination}', destination);
  }
  return t('app.recentRoutes.apply');
}

type RecentRouteSearchesProps = {
  searches: RecentRouteSearchRecord[];
  onApply: (search: RecentRouteSearchRecord) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  clearedNotice?: boolean;
  className?: string;
};

export function RecentRouteSearches({
  searches,
  onApply,
  onRemove,
  onClear,
  clearedNotice = false,
  className,
}: RecentRouteSearchesProps) {
  const { t } = useI18n();

  if (searches.length === 0 && !clearedNotice) {
    return null;
  }

  return (
    <section className={cn(PANEL_CLASS, className)} aria-labelledby="recent-route-searches-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Globe
            className="h-3.5 w-3.5 shrink-0 text-sky-700/80 dark:text-sky-400/90"
            aria-hidden
          />
          <div className="min-w-0">
            <h4 id="recent-route-searches-title" className="text-sm font-medium text-foreground">
              {t('app.recentRoutes.title')}
            </h4>
            <p className="mt-0.5">{t('app.recentRoutes.subtitle')}</p>
          </div>
        </div>
        {searches.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onClear}
          >
            {t('app.recentRoutes.clear')}
          </Button>
        ) : null}
      </div>

      <p className="mt-1.5 text-[11px] opacity-90">{t('app.recentRoutes.localOnly')}</p>

      {clearedNotice && searches.length === 0 ? (
        <p className="mt-2" role="status">
          {t('app.recentRoutes.cleared')}
        </p>
      ) : null}

      {searches.length === 0 ? (
        !clearedNotice ? (
          <p className="mt-2">{t('app.recentRoutes.empty')}</p>
        ) : null
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {searches.map((search) => (
            <li key={search.id} className="flex max-w-full">
              <div className={CHIP_CLASS}>
                <button
                  type="button"
                  className="min-w-0 truncate text-left hover:underline"
                  title={t('app.recentRoutes.apply')}
                  onClick={() => onApply(search)}
                >
                  {formatSearchLabel(search, t)}
                </button>
                <button
                  type="button"
                  className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t('app.recentRoutes.remove')}
                  onClick={() => onRemove(search.id)}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
