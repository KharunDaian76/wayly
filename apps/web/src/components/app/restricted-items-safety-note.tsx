'use client';

import { Shield } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
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
    <details className={cn(PANEL_CLASS, className)}>
      <summary className={SUMMARY_CLASS}>
        <Shield
          className="h-3.5 w-3.5 shrink-0 text-amber-700/80 dark:text-amber-400/90"
          aria-hidden
        />
        {t('app.restrictedItems.title')}
      </summary>

      <div className="mt-2 space-y-2">
        <p>{t('app.restrictedItems.subtitle')}</p>
        <p>{t(roleNoteKey)}</p>
        <p>{t('app.restrictedItems.keepInsideWayly')}</p>

        <details>
          <summary className="cursor-pointer font-medium text-foreground">
            {t('app.restrictedItems.categoriesTitle')}
          </summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
            {CATEGORY_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </details>

        <p>{t('app.restrictedItems.customsReminder')}</p>
        <p className="text-[11px] opacity-90">{t('app.restrictedItems.noEvasionAdvice')}</p>
      </div>
    </details>
  );
}
