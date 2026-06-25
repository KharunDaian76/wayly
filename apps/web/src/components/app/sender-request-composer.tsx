'use client';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const MESSAGE_MAX_LENGTH = 2000;

const PANEL_CLASS = cn(
  'rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground',
);

const CHECKLIST_ITEM_CLASS = 'flex items-start gap-2';

export type SenderRequestFormFields = {
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

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeCountry(value: string): string | undefined {
  const code = value.trim().toUpperCase();
  return code.length === 2 ? code : undefined;
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

function formatLocation(city: string, country: string): string | undefined {
  const cityText = optionalText(city);
  const countryText = normalizeCountry(country);
  if (cityText && countryText) {
    return `${cityText}, ${countryText}`;
  }
  if (cityText) {
    return cityText;
  }
  if (countryText) {
    return countryText;
  }
  return undefined;
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

type SummaryRow = {
  key: string;
  labelKey: TranslationKey;
  value: string;
};

export function buildSenderRequestSummaryRows(form: SenderRequestFormFields): SummaryRow[] {
  const rows: SummaryRow[] = [];

  const pickup = formatLocation(form.pickupCity, form.pickupCountry);
  if (pickup) {
    rows.push({
      key: 'pickup',
      labelKey: 'app.senderRequest.summaryPickup',
      value: pickup,
    });
  }

  const destination = formatLocation(form.dropoffCity, form.dropoffCountry);
  if (destination) {
    rows.push({
      key: 'destination',
      labelKey: 'app.senderRequest.summaryDestination',
      value: destination,
    });
  }

  const packageText = optionalText(form.packageDescription) ?? optionalText(form.title);
  if (packageText) {
    rows.push({
      key: 'package',
      labelKey: 'app.senderRequest.summaryPackage',
      value: packageText,
    });
  }

  const pickupWindow = formatTimingWindow(form.desiredPickupFrom, form.desiredPickupTo);
  const deliveryWindow = formatTimingWindow(form.desiredDeliveryFrom, form.desiredDeliveryTo);
  const timingParts = [pickupWindow, deliveryWindow].filter(Boolean);
  if (timingParts.length > 0) {
    rows.push({
      key: 'timing',
      labelKey: 'app.senderRequest.summaryTiming',
      value: timingParts.join(' · '),
    });
  }

  const rewardCents = parseRewardToCents(form.proposedReward);
  if (rewardCents !== null) {
    const currency = form.currency.trim().toUpperCase() || 'EUR';
    rows.push({
      key: 'budget',
      labelKey: 'app.senderRequest.summaryBudget',
      value: `${(rewardCents / 100).toFixed(2)} ${currency}`,
    });
  }

  return rows;
}

export function isSenderRequestReady(form: SenderRequestFormFields): boolean {
  return (
    optionalText(form.title) !== undefined &&
    optionalText(form.packageDescription) !== undefined &&
    normalizeCountry(form.pickupCountry) !== undefined &&
    optionalText(form.pickupCity) !== undefined &&
    normalizeCountry(form.dropoffCountry) !== undefined &&
    optionalText(form.dropoffCity) !== undefined &&
    parseRewardToCents(form.proposedReward) !== null
  );
}

type SenderRequestHowItWorksProps = {
  className?: string;
};

export function SenderRequestHowItWorks({ className }: SenderRequestHowItWorksProps) {
  const { t } = useI18n();

  return (
    <div className={cn(PANEL_CLASS, className)}>
      <p className="font-medium text-foreground">{t('app.senderRequest.howItWorksTitle')}</p>
      <ul className="mt-2 flex flex-col gap-1">
        <li>{t('app.senderRequest.notFinalOrder')}</li>
        <li>{t('app.senderRequest.waylerCanAcceptDecline')}</li>
        <li>{t('app.senderRequest.chatAfterAccept')}</li>
      </ul>
    </div>
  );
}

type SenderRequestSummaryProps = {
  form: SenderRequestFormFields;
  className?: string;
};

export function SenderRequestSummary({ form, className }: SenderRequestSummaryProps) {
  const { t } = useI18n();
  const rows = buildSenderRequestSummaryRows(form);

  return (
    <div className={cn(PANEL_CLASS, className)}>
      <p className="font-medium text-foreground">{t('app.senderRequest.summaryTitle')}</p>
      {rows.length === 0 ? (
        <p className="mt-2">{t('app.senderRequest.summaryEmpty')}</p>
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

type SenderRequestSafetyChecklistProps = {
  className?: string;
};

const SAFETY_CHECKLIST_KEYS: TranslationKey[] = [
  'app.senderRequest.keepDetailsInsideWayly',
  'app.senderRequest.noPrivatePayment',
  'app.senderRequest.confirmPackageDetails',
  'app.senderRequest.chatAfterAccept',
  'app.senderRequest.adminReviewTools',
];

export function SenderRequestSafetyChecklist({ className }: SenderRequestSafetyChecklistProps) {
  const { t } = useI18n();

  return (
    <div className={cn(PANEL_CLASS, className)}>
      <p className="font-medium text-foreground">{t('app.senderRequest.safetyChecklistTitle')}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {SAFETY_CHECKLIST_KEYS.map((key) => (
          <li key={key} className={CHECKLIST_ITEM_CLASS}>
            <span aria-hidden className="text-primary">
              ✓
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SenderRequestGoodTipsProps = {
  className?: string;
};

const GOOD_TIP_KEYS: TranslationKey[] = [
  'app.senderRequest.tipBeSpecific',
  'app.senderRequest.tipIncludeTiming',
  'app.senderRequest.tipAgreeInsideWayly',
];

export function SenderRequestGoodTips({ className }: SenderRequestGoodTipsProps) {
  const { t } = useI18n();

  return (
    <details className={cn(PANEL_CLASS, className)}>
      <summary className="cursor-pointer font-medium text-foreground">
        {t('app.senderRequest.goodTipsTitle')}
      </summary>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
        {GOOD_TIP_KEYS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
    </details>
  );
}

type SenderRequestMessageCounterProps = {
  message: string;
  className?: string;
};

export function SenderRequestMessageCounter({
  message,
  className,
}: SenderRequestMessageCounterProps) {
  const { t } = useI18n();
  const remaining = MESSAGE_MAX_LENGTH - message.length;

  return (
    <p className={cn('text-xs text-muted-foreground', className)} aria-live="polite">
      {t('app.senderRequest.messageCounter').replace('{count}', String(remaining))}
    </p>
  );
}

type SenderRequestReadyBadgeProps = {
  ready: boolean;
  className?: string;
};

export function SenderRequestReadyBadge({ ready, className }: SenderRequestReadyBadgeProps) {
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
      {t('app.senderRequest.ready')}
    </p>
  );
}

export { MESSAGE_MAX_LENGTH as SENDER_REQUEST_MESSAGE_MAX_LENGTH };
