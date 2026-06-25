'use client';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-muted-foreground',
);

const CATEGORY_KEYS: TranslationKey[] = [
  'app.restrictedItems.categoryIllegalGoods',
  'app.restrictedItems.categoryWeaponsDangerous',
  'app.restrictedItems.categoryDrugsControlled',
  'app.restrictedItems.categoryCashFinancial',
  'app.restrictedItems.categoryFragileTemperature',
  'app.restrictedItems.categoryLiquidsBatteriesChemicals',
  'app.restrictedItems.categoryDocuments',
];

export type RestrictedItemsSafetyVariant = 'sender' | 'wayler';

type RestrictedItemsSafetyNoteProps = {
  variant: RestrictedItemsSafetyVariant;
  className?: string;
};

export function RestrictedItemsSafetyNote({ variant, className }: RestrictedItemsSafetyNoteProps) {
  const { t } = useI18n();

  const roleNoteKey =
    variant === 'sender' ? 'app.restrictedItems.senderNote' : 'app.restrictedItems.waylerNote';

  return (
    <section
      className={cn(PANEL_CLASS, className)}
      aria-labelledby={`restricted-items-heading-${variant}`}
    >
      <div className="flex gap-2">
        <span aria-hidden className="text-base leading-none">
          🛡️
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h4
            id={`restricted-items-heading-${variant}`}
            className="text-sm font-medium text-foreground"
          >
            {t('app.restrictedItems.title')}
          </h4>
          <p>{t('app.restrictedItems.subtitle')}</p>
        </div>
      </div>

      <p className="mt-2">{t(roleNoteKey)}</p>
      <p className="mt-1">{t('app.restrictedItems.keepInsideWayly')}</p>

      <details className="mt-2">
        <summary className="cursor-pointer font-medium text-foreground">
          {t('app.restrictedItems.categoriesTitle')}
        </summary>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
          {CATEGORY_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </details>

      <p className="mt-2">{t('app.restrictedItems.customsReminder')}</p>
      <p className="mt-1 text-[11px] opacity-90">{t('app.restrictedItems.noEvasionAdvice')}</p>
    </section>
  );
}
