'use client';

import { Check, Circle, Sparkles } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

import {
  isSenderRequestReady,
  type SenderRequestFormFields,
} from '@/components/app/sender-request-composer';

export type SenderRequestQualityState = 'needsDetails' | 'almostReady' | 'readyToSend';

type QualityHint = {
  id: string;
  labelKey: TranslationKey;
  complete: boolean;
  priority: number;
};

const PANEL_CLASS = cn(
  'rounded-md border border-violet-500/20 bg-violet-500/[0.04] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center justify-between gap-2',
  '[&::-webkit-details-marker]:hidden',
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

function hasOptionalHelpfulFields(form: SenderRequestFormFields): boolean {
  const hasTiming = Boolean(
    toIsoDateTime(form.desiredPickupFrom) ||
    toIsoDateTime(form.desiredPickupTo) ||
    toIsoDateTime(form.desiredDeliveryFrom) ||
    toIsoDateTime(form.desiredDeliveryTo),
  );
  const hasMessage = Boolean(optionalText(form.message));
  const hasAddressDetail = Boolean(
    optionalText(form.pickupAddress) || optionalText(form.dropoffAddress),
  );

  return hasTiming && hasMessage && hasAddressDetail;
}

export function evaluateSenderRequestQuality(
  form: SenderRequestFormFields,
): SenderRequestQualityState {
  if (!isSenderRequestReady(form)) {
    return 'needsDetails';
  }
  if (!hasOptionalHelpfulFields(form)) {
    return 'almostReady';
  }
  return 'readyToSend';
}

function buildQualityHints(form: SenderRequestFormFields): QualityHint[] {
  const hints: QualityHint[] = [];

  hints.push({
    id: 'addPackageDescription',
    labelKey: 'app.senderRequestQuality.addPackageDescription',
    complete: Boolean(optionalText(form.packageDescription)),
    priority: 1,
  });

  hints.push({
    id: 'confirmItemDetails',
    labelKey: 'app.senderRequestQuality.confirmItemDetails',
    complete: Boolean(optionalText(form.title) && optionalText(form.packageDescription)),
    priority: 2,
  });

  hints.push({
    id: 'addPickup',
    labelKey: 'app.senderRequestQuality.addPickup',
    complete: Boolean(normalizeCountry(form.pickupCountry) && optionalText(form.pickupCity)),
    priority: 3,
  });

  hints.push({
    id: 'addDropoff',
    labelKey: 'app.senderRequestQuality.addDropoff',
    complete: Boolean(normalizeCountry(form.dropoffCountry) && optionalText(form.dropoffCity)),
    priority: 4,
  });

  hints.push({
    id: 'addTiming',
    labelKey: 'app.senderRequestQuality.addTiming',
    complete: Boolean(
      toIsoDateTime(form.desiredPickupFrom) ||
      toIsoDateTime(form.desiredPickupTo) ||
      toIsoDateTime(form.desiredDeliveryFrom) ||
      toIsoDateTime(form.desiredDeliveryTo),
    ),
    priority: 5,
  });

  hints.push({
    id: 'addBudget',
    labelKey: 'app.senderRequestQuality.addBudget',
    complete: parseRewardToCents(form.proposedReward) !== null,
    priority: 6,
  });

  hints.push({
    id: 'addHelpfulMessage',
    labelKey: 'app.senderRequestQuality.addHelpfulMessage',
    complete: Boolean(optionalText(form.message)),
    priority: 7,
  });

  return hints;
}

function qualityStateLabelKey(state: SenderRequestQualityState): TranslationKey {
  switch (state) {
    case 'needsDetails':
      return 'app.senderRequestQuality.needsDetails';
    case 'almostReady':
      return 'app.senderRequestQuality.almostReady';
    default:
      return 'app.senderRequestQuality.readyToSend';
  }
}

function qualityStateBadgeClass(state: SenderRequestQualityState): string {
  switch (state) {
    case 'needsDetails':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300';
    case 'almostReady':
      return 'border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300';
    default:
      return 'border-violet-500/25 bg-violet-500/10 text-violet-800 dark:text-violet-300';
  }
}

type SenderRequestQualityCoachProps = {
  form: SenderRequestFormFields;
  compact?: boolean;
  className?: string;
};

export function SenderRequestQualityCoach({
  form,
  compact = false,
  className,
}: SenderRequestQualityCoachProps) {
  const { t } = useI18n();
  const qualityState = evaluateSenderRequestQuality(form);
  const hints = buildQualityHints(form);
  const incomplete = hints.filter((hint) => !hint.complete).sort((a, b) => a.priority - b.priority);
  const complete = hints.filter((hint) => hint.complete);
  const nextImprovements = incomplete.slice(0, compact ? 3 : 6);
  const completedShown = compact ? complete.slice(-2) : complete;

  return (
    <details className={cn(PANEL_CLASS, className)}>
      <summary className={SUMMARY_CLASS}>
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 text-violet-700/80 dark:text-violet-400/90"
            aria-hidden
          />
          <span
            id="sender-request-quality-coach-title"
            className="text-sm font-medium text-foreground"
          >
            {t('app.senderRequestQuality.title')}
          </span>
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
      </summary>

      <div className="mt-2">
        <p>{t('app.senderRequestQuality.subtitle')}</p>
        <p className="mt-1 text-[11px] opacity-90">
          {t('app.senderRequestQuality.noGuaranteedAcceptance')}
        </p>

        {completedShown.length > 0 ? (
          <div className="mt-2">
            <p className="font-medium text-foreground">{t('app.senderRequestQuality.completed')}</p>
            <ul className="mt-1 flex flex-col gap-1">
              {completedShown.map((hint) => (
                <li key={hint.id} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400"
                    aria-hidden
                  />
                  <span>{t(hint.labelKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {nextImprovements.length > 0 ? (
          <div className="mt-2">
            <p className="font-medium text-foreground">
              {t('app.senderRequestQuality.nextImprovements')}
            </p>
            <ul className="mt-1 flex flex-col gap-1">
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
      </div>
    </details>
  );
}
