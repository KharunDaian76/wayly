'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import {
  CircleHelp,
  CreditCard,
  ExternalLink,
  HardDrive,
  LifeBuoy,
  MapPin,
  Route,
  Scale,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

type HelpLink = {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

const HELP_LINKS: HelpLink[] = [
  { href: '/help', labelKey: 'app.helpSafetyCenter.helpCenter', icon: LifeBuoy },
  { href: '/how-it-works', labelKey: 'app.helpSafetyCenter.howItWorks', icon: Route },
  { href: '/trust', labelKey: 'app.helpSafetyCenter.trustCenter', icon: Shield },
  { href: '/faq', labelKey: 'app.helpSafetyCenter.faq', icon: CircleHelp },
  { href: '/restricted-items', labelKey: 'app.helpSafetyCenter.restrictedItems', icon: MapPin },
  { href: '/fees', labelKey: 'app.helpSafetyCenter.fees', icon: CreditCard },
  {
    href: '/privacy-local-data',
    labelKey: 'app.helpSafetyCenter.privacyLocalData',
    icon: HardDrive,
  },
  { href: '/support-disputes', labelKey: 'app.helpSafetyCenter.supportDisputes', icon: Scale },
];

export function HelpSafetyCenterCard({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Card className={cn(APP_PANEL_CLASS, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{t('app.helpSafetyCenter.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('app.helpSafetyCenter.subtitle')}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {HELP_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5',
                    'text-sm font-medium text-foreground transition-colors',
                    'hover:border-primary/30 hover:bg-muted/30',
                  )}
                >
                  <Icon className="size-4 shrink-0 text-primary/80" aria-hidden />
                  <span className="min-w-0 flex-1">{t(link.labelKey)}</span>
                  <ExternalLink
                    className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-60"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t('app.helpSafetyCenter.notice')}
        </p>
      </CardContent>
    </Card>
  );
}
