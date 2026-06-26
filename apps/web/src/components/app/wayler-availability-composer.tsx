'use client';

import { TripDirection, WaylerAvailabilityType } from '@wayly/types';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground',
);

const CHECKLIST_ITEM_CLASS = 'flex items-start gap-2';

export type WaylerAvailabilityFormFields = {
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

function formatDateTimeLocal(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }
  return parsed.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatTimingWindow(from: string, to: string): string | undefined {
  const fromLabel = formatDateTimeLocal(from);
  const toLabel = formatDateTimeLocal(to);
  if (fromLabel && toLabel) {
    return `${fromLabel} → ${toLabel}`;
  }
  return fromLabel ?? toLabel;
}

function formatOriginLocation(form: WaylerAvailabilityFormFields): string | undefined {
  const parts = [
    optionalText(form.originCity),
    optionalText(form.originRegion),
    normalizeCountry(form.originCountry),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function formatDestinationLocation(form: WaylerAvailabilityFormFields): string | undefined {
  const parts = [
    optionalText(form.destinationCity),
    optionalText(form.destinationRegion),
    normalizeCountry(form.destinationCountry),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function tripDirectionLabel(
  direction: TripDirection | '',
  t: (key: TranslationKey) => string,
): string | undefined {
  if (!direction) {
    return undefined;
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
}

type PreviewRow = {
  key: string;
  labelKey: TranslationKey;
  value: string;
};

export function buildWaylerAvailabilityPreviewRows(
  form: WaylerAvailabilityFormFields,
  t: (key: TranslationKey) => string,
): PreviewRow[] {
  const rows: PreviewRow[] = [];
  const isLocal = form.type === WaylerAvailabilityType.LOCAL_AVAILABILITY;

  rows.push({
    key: 'type',
    labelKey: 'app.waylerAvailabilityComposer.previewType',
    value: isLocal
      ? t('app.waylerAvailability.localAvailability')
      : t('app.waylerAvailability.tripRoute'),
  });

  const origin = formatOriginLocation(form);
  if (origin) {
    rows.push({
      key: 'origin',
      labelKey: 'app.waylerAvailabilityComposer.previewOrigin',
      value: origin,
    });
  }

  if (!isLocal) {
    const destination = formatDestinationLocation(form);
    if (destination) {
      rows.push({
        key: 'destination',
        labelKey: 'app.waylerAvailabilityComposer.previewDestination',
        value: destination,
      });
    }
    const direction = tripDirectionLabel(form.tripDirection, t);
    if (direction) {
      rows.push({
        key: 'direction',
        labelKey: 'app.waylerAvailability.tripDirection',
        value: direction,
      });
    }
  }

  if (isLocal) {
    const window = formatTimingWindow(form.availableFrom, form.availableTo);
    if (window) {
      rows.push({
        key: 'dates',
        labelKey: 'app.waylerAvailabilityComposer.previewDates',
        value: window,
      });
    }
  } else {
    const departure = formatDateTimeLocal(form.departureDate);
    const returnLeg = formatDateTimeLocal(form.returnDate);
    const tripTiming = [
      departure,
      returnLeg ? `${t('app.waylerAvailability.returnDate')}: ${returnLeg}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    if (tripTiming) {
      rows.push({
        key: 'dates',
        labelKey: 'app.waylerAvailabilityComposer.previewDates',
        value: tripTiming,
      });
    }
  }

  const capacityParts: string[] = [];
  const maxPackages = optionalText(form.maxPackages);
  if (maxPackages) {
    capacityParts.push(`${t('app.waylerAvailability.maxPackages')}: ${maxPackages}`);
  }
  const maxWeight = optionalText(form.maxWeightKg);
  if (maxWeight) {
    capacityParts.push(`${t('app.waylerAvailability.maxWeightKg')}: ${maxWeight}`);
  }
  if (capacityParts.length > 0) {
    rows.push({
      key: 'capacity',
      labelKey: 'app.waylerAvailabilityComposer.previewCapacity',
      value: capacityParts.join(' · '),
    });
  }

  const notes = optionalText(form.notes);
  if (notes) {
    rows.push({
      key: 'notes',
      labelKey: 'app.waylerAvailability.notes',
      value: notes,
    });
  }

  return rows;
}

export function isWaylerAvailabilityReady(form: WaylerAvailabilityFormFields): boolean {
  const isLocal = form.type === WaylerAvailabilityType.LOCAL_AVAILABILITY;
  const originCountry = normalizeCountry(form.originCountry);
  const originCity = optionalText(form.originCity);
  const originRegion = optionalText(form.originRegion);

  if (isLocal) {
    return !!(originCountry && (originCity || originRegion) && toIsoDateTime(form.availableFrom));
  }

  const destinationCountry = normalizeCountry(form.destinationCountry);
  const destinationCity = optionalText(form.destinationCity);

  if (!originCountry || !originCity || !destinationCountry || !destinationCity) {
    return false;
  }
  if (!toIsoDateTime(form.departureDate)) {
    return false;
  }
  if (!form.tripDirection) {
    return false;
  }
  if (form.tripDirection === TripDirection.RETURN && !toIsoDateTime(form.returnDate)) {
    return false;
  }
  return true;
}

type WaylerAvailabilityHowItWorksProps = {
  className?: string;
};

export function WaylerAvailabilityHowItWorks({ className }: WaylerAvailabilityHowItWorksProps) {
  const { t } = useI18n();

  return (
    <div className={cn(PANEL_CLASS, className)}>
      <p className="font-medium text-foreground">
        {t('app.waylerAvailabilityComposer.howItWorksTitle')}
      </p>
      <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4">
        <li>{t('app.waylerAvailabilityComposer.stepPublish')}</li>
        <li>{t('app.waylerAvailabilityComposer.stepSenderRequests')}</li>
        <li>{t('app.waylerAvailabilityComposer.stepAcceptDecline')}</li>
        <li>{t('app.waylerAvailabilityComposer.stepOrderChat')}</li>
      </ol>
    </div>
  );
}

type WaylerAvailabilityAccessNoteProps = {
  className?: string;
};

export function WaylerAvailabilityAccessNote({ className }: WaylerAvailabilityAccessNoteProps) {
  const { t } = useI18n();

  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {t('app.waylerAvailabilityComposer.accessNote')}
    </p>
  );
}

type WaylerAvailabilityPreviewProps = {
  form: WaylerAvailabilityFormFields;
  className?: string;
};

export function WaylerAvailabilityPreview({ form, className }: WaylerAvailabilityPreviewProps) {
  const { t } = useI18n();
  const rows = buildWaylerAvailabilityPreviewRows(form, t);
  const hasOnlyType = rows.length === 1 && rows[0]?.key === 'type';

  return (
    <div className={cn(PANEL_CLASS, className)}>
      <p className="font-medium text-foreground">
        {t('app.waylerAvailabilityComposer.previewTitle')}
      </p>
      {hasOnlyType || rows.length === 0 ? (
        <p className="mt-2">{t('app.waylerAvailabilityComposer.previewEmpty')}</p>
      ) : (
        <dl className="mt-2 flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.key} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">{t(row.labelKey)}</dt>
              <dd className="font-medium text-foreground sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

const CHECKLIST_KEYS: TranslationKey[] = [
  'app.waylerAvailabilityComposer.checkLocationsDates',
  'app.waylerAvailabilityComposer.checkPublicReady',
  'app.waylerAvailabilityComposer.checkRespondInsideWayly',
  'app.waylerAvailabilityComposer.checkChatAfterAccept',
  'app.waylerAvailabilityComposer.checkNoRestrictedItems',
  'app.waylerAvailabilityComposer.checkReviewTools',
];

type WaylerAvailabilityPublishingChecklistProps = {
  className?: string;
};

export function WaylerAvailabilityPublishingChecklist({
  className,
}: WaylerAvailabilityPublishingChecklistProps) {
  const { t } = useI18n();

  return (
    <details className={cn(PANEL_CLASS, className)}>
      <summary className="cursor-pointer font-medium text-foreground">
        {t('app.waylerAvailabilityComposer.checklistTitle')}
      </summary>
      <ul className="mt-2 flex flex-col gap-1.5">
        {CHECKLIST_KEYS.map((key) => (
          <li key={key} className={CHECKLIST_ITEM_CLASS}>
            <span aria-hidden className="text-primary">
              ✓
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

type WaylerAvailabilityReadyBadgeProps = {
  ready: boolean;
  className?: string;
};

export function WaylerAvailabilityReadyBadge({
  ready,
  className,
}: WaylerAvailabilityReadyBadgeProps) {
  const { t } = useI18n();

  if (!ready) {
    return null;
  }

  return (
    <p
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary',
        className,
      )}
      role="status"
    >
      <span aria-hidden>✓</span>
      {t('app.waylerAvailabilityComposer.ready')}
    </p>
  );
}
