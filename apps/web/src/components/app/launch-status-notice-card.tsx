'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  LifeBuoy,
  Rocket,
  ScrollText,
  Signal,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

type StatusVariant = 'available' | 'mockManual' | 'planned';

type StatusSection = {
  variant: StatusVariant;
  icon: LucideIcon;
  labelKey: TranslationKey;
  bodyKey: TranslationKey;
};

const STATUS_SECTIONS: StatusSection[] = [
  {
    variant: 'available',
    icon: CheckCircle2,
    labelKey: 'app.launchStatus.availableLabel',
    bodyKey: 'app.launchStatus.availableBody',
  },
  {
    variant: 'mockManual',
    icon: Wrench,
    labelKey: 'app.launchStatus.mockManualLabel',
    bodyKey: 'app.launchStatus.mockManualBody',
  },
  {
    variant: 'planned',
    icon: Rocket,
    labelKey: 'app.launchStatus.plannedLabel',
    bodyKey: 'app.launchStatus.plannedBody',
  },
];

type QuickLink = {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

const QUICK_LINKS: QuickLink[] = [
  { href: '/roadmap', labelKey: 'app.launchStatus.roadmap', icon: Signal },
  { href: '/fees', labelKey: 'app.launchStatus.fees', icon: CreditCard },
  { href: '/policies', labelKey: 'app.launchStatus.policies', icon: ScrollText },
  { href: '/help', labelKey: 'app.launchStatus.helpCenter', icon: LifeBuoy },
];

const BADGE_CLASS: Record<StatusVariant, string> = {
  available: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  mockManual: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  planned: 'border-primary/30 bg-primary/10 text-primary',
};

function StatusBody({ bodyKey }: { bodyKey: TranslationKey }) {
  const { t } = useI18n();
  const lines = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <ul className="mt-1.5 flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground">
      {lines.map((line) => (
        <li key={line} className="flex gap-1.5">
          <span
            className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"
            aria-hidden
          />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export function LaunchStatusNoticeCard({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Card className={cn(APP_PANEL_CLASS, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{t('app.launchStatus.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('app.launchStatus.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {STATUS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.variant}
                className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 shrink-0 text-primary/80" aria-hidden />
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      BADGE_CLASS[section.variant],
                    )}
                  >
                    {t(section.labelKey)}
                  </span>
                </div>
                <StatusBody bodyKey={section.bodyKey} />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/15 px-2.5 py-1',
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

        <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t('app.launchStatus.notice')}
        </p>
      </CardContent>
    </Card>
  );
}
