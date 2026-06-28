'use client';

import { CheckCircle2, CreditCard, ExternalLink, MapPin, Scale, Shield } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type SafetyPreflightVariant = 'senderRequest' | 'waylerAvailability' | 'general';

const PANEL_CLASS = cn(
  'rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs text-muted-foreground',
);

const SUMMARY_CLASS = cn(
  'flex cursor-pointer list-none items-center gap-2 font-medium text-foreground',
  '[&::-webkit-details-marker]:hidden',
);

type QuickLink = {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

type VariantConfig = {
  subtitleKey: TranslationKey;
  stepsKey: TranslationKey;
  links: QuickLink[];
};

const VARIANT_CONFIG: Record<SafetyPreflightVariant, VariantConfig> = {
  senderRequest: {
    subtitleKey: 'app.safetyPreflight.senderSubtitle',
    stepsKey: 'app.safetyPreflight.senderSteps',
    links: [
      { href: '/restricted-items', labelKey: 'app.safetyPreflight.restrictedItems', icon: MapPin },
      { href: '/fees', labelKey: 'app.safetyPreflight.fees', icon: CreditCard },
      { href: '/support-disputes', labelKey: 'app.safetyPreflight.supportDisputes', icon: Scale },
    ],
  },
  waylerAvailability: {
    subtitleKey: 'app.safetyPreflight.waylerSubtitle',
    stepsKey: 'app.safetyPreflight.waylerSteps',
    links: [
      { href: '/restricted-items', labelKey: 'app.safetyPreflight.restrictedItems', icon: MapPin },
      { href: '/trust', labelKey: 'app.safetyPreflight.trustCenter', icon: Shield },
      { href: '/support-disputes', labelKey: 'app.safetyPreflight.supportDisputes', icon: Scale },
    ],
  },
  general: {
    subtitleKey: 'app.safetyPreflight.generalSubtitle',
    stepsKey: 'app.safetyPreflight.generalSteps',
    links: [
      { href: '/restricted-items', labelKey: 'app.safetyPreflight.restrictedItems', icon: MapPin },
      { href: '/support-disputes', labelKey: 'app.safetyPreflight.supportDisputes', icon: Scale },
    ],
  },
};

type SafetyPreflightChecklistProps = {
  variant: SafetyPreflightVariant;
  /** When true, checklist starts collapsed (default for dense form areas). */
  defaultCollapsed?: boolean;
  className?: string;
};

export function SafetyPreflightChecklist({
  variant,
  defaultCollapsed = true,
  className,
}: SafetyPreflightChecklistProps) {
  const { t } = useI18n();
  const config = VARIANT_CONFIG[variant];

  const steps = t(config.stepsKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <details className={cn(PANEL_CLASS, className)} open={defaultCollapsed ? undefined : true}>
      <summary className={SUMMARY_CLASS}>
        <Shield
          className="h-3.5 w-3.5 shrink-0 text-amber-700/80 dark:text-amber-400/90"
          aria-hidden
        />
        {t('app.safetyPreflight.title')}
      </summary>
      <div className="mt-2 space-y-3">
        <p>{t(config.subtitleKey)}</p>
        <ol className="flex flex-col gap-1.5">
          {steps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary/75" aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-1.5">
          {config.links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2.5 py-1',
                  'text-[11px] font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-muted/30',
                )}
              >
                <Icon className="size-3 shrink-0 text-primary/80" aria-hidden />
                {t(link.labelKey)}
                <ExternalLink className="size-2.5 shrink-0 opacity-60" aria-hidden />
              </Link>
            );
          })}
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">{t('app.safetyPreflight.notice')}</p>
      </div>
    </details>
  );
}
