export const LOCALES = ['en', 'ru', 'es', 'fr', 'de', 'tr', 'ar', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'wayly-locale';

/** Native language names shown in the selector. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  tr: 'Türkçe',
  ar: 'العربية',
  zh: '中文',
};

export const RTL_LOCALES: readonly Locale[] = ['ar'];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
