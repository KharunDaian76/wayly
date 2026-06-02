'use client';

import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n/languages';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

interface LanguageSelectProps {
  className?: string;
}

export function LanguageSelect({ className }: LanguageSelectProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      aria-label={t('common.language')}
      className={cn(
        'h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
