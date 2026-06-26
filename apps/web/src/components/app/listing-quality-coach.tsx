'use client';

import { TripDirection, WaylerAvailabilityType } from '@wayly/types';
import { Check, Circle, Sparkles } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

import {
  isWaylerAvailabilityReady,
  type WaylerAvailabilityFormFields,
} from '@/components/app/wayler-availability-composer';

export type ListingQualityType = 'local' | 'trip';

export type ListingQualityState = 'needsDetails' | 'almostReady' | 'readyToPublish';

type QualityHint = {
  id: string;
  labelKey: TranslationKey;
  complete: boolean;
  priority: number;
};

const PANEL_CLASS = cn(
  'rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-2.5 text-xs text-muted-foreground',
);

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeCountry(value: string): string | undefined {
  const code = value.trim().toUpperCase();
  return code.length === 2 ? code : undefined;
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

function hasOptionalHelpfulFields(
  form: WaylerAvailabilityFormFields,
  type: ListingQualityType,
): boolean {
  const hasCapacity = Boolean(optionalText(form.maxPackages) || optionalText(form.maxWeightKg));
  const hasNotes = Boolean(optionalText(form.notes));

  if (!hasCapacity || !hasNotes) {
    return false;
  }

  if (type === 'local') {
    return Boolean(toIsoDateTime(form.availableTo) && optionalText(form.originRegion));
  }

  return Boolean(optionalText(form.destinationRegion));
}

export function evaluateListingQuality(
  form: WaylerAvailabilityFormFields,
  type: ListingQualityType,
): ListingQualityState {
  if (!isWaylerAvailabilityReady(form)) {
    return 'needsDetails';
  }
  if (!hasOptionalHelpfulFields(form, type)) {
    return 'almostReady';
  }
  return 'readyToPublish';
}

function buildQualityHints(
  form: WaylerAvailabilityFormFields,
  type: ListingQualityType,
): QualityHint[] {
  const isLocal = type === 'local';
  const hints: QualityHint[] = [];

  const originComplete = isLocal
    ? Boolean(
        normalizeCountry(form.originCountry) &&
        (optionalText(form.originCity) || optionalText(form.originRegion)),
      )
    : Boolean(normalizeCountry(form.originCountry) && optionalText(form.originCity));

  hints.push({
    id: 'addOrigin',
    labelKey: 'app.listingQuality.addOrigin',
    complete: originComplete,
    priority: 1,
  });

  if (isLocal) {
    hints.push({
      id: 'addDateWindow',
      labelKey: 'app.listingQuality.addDateWindow',
      complete: Boolean(toIsoDateTime(form.availableFrom) && toIsoDateTime(form.availableTo)),
      priority: 2,
    });
    hints.push({
      id: 'clarifyCoverage',
      labelKey: 'app.listingQuality.clarifyCoverage',
      complete: Boolean(optionalText(form.originRegion)),
      priority: 3,
    });
  } else {
    hints.push({
      id: 'addDestination',
      labelKey: 'app.listingQuality.addDestination',
      complete: Boolean(
        normalizeCountry(form.destinationCountry) && optionalText(form.destinationCity),
      ),
      priority: 2,
    });
    hints.push({
      id: 'addDepartureDate',
      labelKey: 'app.listingQuality.addDepartureDate',
      complete: Boolean(toIsoDateTime(form.departureDate)),
      priority: 3,
    });
    hints.push({
      id: 'confirmRouteDirection',
      labelKey: 'app.listingQuality.confirmRouteDirection',
      complete: Boolean(form.tripDirection),
      priority: 4,
    });
    if (form.tripDirection === TripDirection.RETURN) {
      hints.push({
        id: 'addReturnDate',
        labelKey: 'app.listingQuality.addReturnDate',
        complete: Boolean(toIsoDateTime(form.returnDate)),
        priority: 5,
      });
    }
  }

  hints.push({
    id: 'addCapacity',
    labelKey: 'app.listingQuality.addCapacity',
    complete: Boolean(optionalText(form.maxPackages) || optionalText(form.maxWeightKg)),
    priority: 10,
  });
  hints.push({
    id: 'addHelpfulNotes',
    labelKey: 'app.listingQuality.addHelpfulNotes',
    complete: Boolean(optionalText(form.notes)),
    priority: 11,
  });

  const qualityState = evaluateListingQuality(form, type);
  hints.push({
    id: 'publicWhenReady',
    labelKey: 'app.listingQuality.publicWhenReady',
    complete: qualityState === 'readyToPublish',
    priority: 12,
  });

  return hints;
}

function qualityStateLabelKey(state: ListingQualityState): TranslationKey {
  switch (state) {
    case 'needsDetails':
      return 'app.listingQuality.needsDetails';
    case 'almostReady':
      return 'app.listingQuality.almostReady';
    default:
      return 'app.listingQuality.readyToPublish';
  }
}

function qualityStateBadgeClass(state: ListingQualityState): string {
  switch (state) {
    case 'needsDetails':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300';
    case 'almostReady':
      return 'border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300';
    default:
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
  }
}

type ListingQualityCoachProps = {
  form: WaylerAvailabilityFormFields;
  type: ListingQualityType;
  compact?: boolean;
  className?: string;
};

export function listingQualityTypeFromForm(type: WaylerAvailabilityType): ListingQualityType {
  return type === WaylerAvailabilityType.LOCAL_AVAILABILITY ? 'local' : 'trip';
}

export function ListingQualityCoach({
  form,
  type,
  compact = false,
  className,
}: ListingQualityCoachProps) {
  const { t } = useI18n();
  const qualityState = evaluateListingQuality(form, type);
  const hints = buildQualityHints(form, type);
  const incomplete = hints.filter((hint) => !hint.complete).sort((a, b) => a.priority - b.priority);
  const complete = hints.filter((hint) => hint.complete);
  const nextImprovements = incomplete.slice(0, compact ? 3 : 6);
  const completedShown = compact ? complete.slice(-2) : complete;

  return (
    <section className={cn(PANEL_CLASS, className)} aria-labelledby="listing-quality-coach-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 text-emerald-700/80 dark:text-emerald-400/90"
            aria-hidden
          />
          <h4 id="listing-quality-coach-title" className="text-sm font-medium text-foreground">
            {t('app.listingQuality.title')}
          </h4>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
            qualityStateBadgeClass(qualityState),
          )}
          role="status"
        >
          {t(qualityStateLabelKey(qualityState))}
        </span>
      </div>

      <p className="mt-2">{t('app.listingQuality.subtitle')}</p>
      <p className="mt-1 text-[11px] opacity-90">{t('app.listingQuality.noGuaranteedRequests')}</p>

      {completedShown.length > 0 ? (
        <div className="mt-3">
          <p className="font-medium text-foreground">{t('app.listingQuality.completed')}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {completedShown.map((hint) => (
              <li key={hint.id} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                <span>{t(hint.labelKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {nextImprovements.length > 0 ? (
        <div className="mt-3">
          <p className="font-medium text-foreground">{t('app.listingQuality.nextImprovements')}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {nextImprovements.map((hint) => (
              <li key={hint.id} className="flex items-start gap-2">
                <Circle
                  className="mt-0.5 h-3 w-3 shrink-0 fill-transparent stroke-muted-foreground/60"
                  aria-hidden
                />
                <span>{t(hint.labelKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
