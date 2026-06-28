'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import { CheckCircle2, ExternalLink, MapPin, Route, Scale, Shield, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { useAppMode } from '@/lib/app-mode/app-mode-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

type RoleVariant = 'sender' | 'wayler' | 'general';

type QuickLink = {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

const SENDER_LINKS: QuickLink[] = [
  { href: '/how-it-works', labelKey: 'app.roleStarter.howItWorks', icon: Route },
  { href: '/restricted-items', labelKey: 'app.roleStarter.restrictedItems', icon: MapPin },
  { href: '/fees', labelKey: 'app.roleStarter.fees', icon: CreditCard },
  { href: '/support-disputes', labelKey: 'app.roleStarter.supportDisputes', icon: Scale },
];

const WAYLER_LINKS: QuickLink[] = [
  { href: '/how-it-works', labelKey: 'app.roleStarter.howItWorks', icon: Route },
  { href: '/trust', labelKey: 'app.roleStarter.trustCenter', icon: Shield },
  { href: '/restricted-items', labelKey: 'app.roleStarter.restrictedItems', icon: MapPin },
  { href: '/support-disputes', labelKey: 'app.roleStarter.supportDisputes', icon: Scale },
];

const GENERAL_LINKS: QuickLink[] = [
  { href: '/how-it-works', labelKey: 'app.roleStarter.howItWorks', icon: Route },
  { href: '/restricted-items', labelKey: 'app.roleStarter.restrictedItems', icon: MapPin },
  { href: '/support-disputes', labelKey: 'app.roleStarter.supportDisputes', icon: Scale },
];

const VARIANT_CONFIG: Record<
  RoleVariant,
  {
    badgeKey: TranslationKey;
    stepsKey: TranslationKey;
    badgeClass: string;
    links: QuickLink[];
  }
> = {
  sender: {
    badgeKey: 'app.roleStarter.senderBadge',
    stepsKey: 'app.roleStarter.senderSteps',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    links: SENDER_LINKS,
  },
  wayler: {
    badgeKey: 'app.roleStarter.waylerBadge',
    stepsKey: 'app.roleStarter.waylerSteps',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    links: WAYLER_LINKS,
  },
  general: {
    badgeKey: 'app.roleStarter.generalBadge',
    stepsKey: 'app.roleStarter.generalSteps',
    badgeClass: 'border-border/60 bg-muted/30 text-muted-foreground',
    links: GENERAL_LINKS,
  },
};

function resolveVariant(mode: 'sender' | 'wayler', modeReady: boolean): RoleVariant {
  if (!modeReady) return 'general';
  return mode;
}

export function RoleStarterChecklistCard({ className }: { className?: string }) {
  const { t } = useI18n();
  const { mode, modeReady } = useAppMode();
  const variant = resolveVariant(mode, modeReady);
  const config = VARIANT_CONFIG[variant];

  const steps = t(config.stepsKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Card className={cn(APP_PANEL_CLASS, className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base sm:text-lg">{t('app.roleStarter.title')}</CardTitle>
          <span
            className={cn(
              'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              config.badgeClass,
            )}
          >
            {t(config.badgeKey)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t('app.roleStarter.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="flex flex-col gap-2.5">
          {steps.map((step) => (
            <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/75" aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2">
          {config.links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/15 px-3 py-1.5',
                  'text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-muted/30',
                )}
              >
                <Icon className="size-3.5 shrink-0 text-primary/80" aria-hidden />
                {t(link.labelKey)}
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            );
          })}
        </div>

        <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t('app.roleStarter.notice')}
        </p>
      </CardContent>
    </Card>
  );
}
