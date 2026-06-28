'use client';

import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  CreditCard,
  HardDrive,
  LifeBuoy,
  MapPin,
  Route,
  Scale,
  ScrollText,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type FeaturedGuide = {
  href: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

const FEATURED_GUIDES: FeaturedGuide[] = [
  {
    href: '/how-it-works',
    icon: Route,
    titleKey: 'marketing.helpCenter.howItWorks',
    descriptionKey: 'marketing.helpCenter.howItWorksDescription',
  },
  {
    href: '/trust',
    icon: Shield,
    titleKey: 'marketing.helpCenter.trustCenter',
    descriptionKey: 'marketing.helpCenter.trustCenterDescription',
  },
  {
    href: '/faq',
    icon: CircleHelp,
    titleKey: 'marketing.helpCenter.faq',
    descriptionKey: 'marketing.helpCenter.faqDescription',
  },
  {
    href: '/restricted-items',
    icon: MapPin,
    titleKey: 'marketing.helpCenter.restrictedItems',
    descriptionKey: 'marketing.helpCenter.restrictedItemsDescription',
  },
  {
    href: '/fees',
    icon: CreditCard,
    titleKey: 'marketing.helpCenter.fees',
    descriptionKey: 'marketing.helpCenter.feesDescription',
  },
  {
    href: '/privacy-local-data',
    icon: HardDrive,
    titleKey: 'marketing.helpCenter.privacyLocalData',
    descriptionKey: 'marketing.helpCenter.privacyLocalDataDescription',
  },
  {
    href: '/support-disputes',
    icon: Scale,
    titleKey: 'marketing.helpCenter.supportDisputes',
    descriptionKey: 'marketing.helpCenter.supportDisputesDescription',
  },
  {
    href: '/policies',
    icon: ScrollText,
    titleKey: 'marketing.policies.navLabel',
    descriptionKey: 'marketing.policies.helpCenterDescription',
  },
];

type SafetyShortcut = {
  href: string;
  labelKey: TranslationKey;
};

const SAFETY_SHORTCUTS: SafetyShortcut[] = [
  { href: '/restricted-items', labelKey: 'marketing.helpCenter.restrictedItems' },
  { href: '/support-disputes', labelKey: 'marketing.helpCenter.supportDisputes' },
  { href: '/fees', labelKey: 'marketing.helpCenter.fees' },
  { href: '/privacy-local-data', labelKey: 'marketing.helpCenter.privacyLocalData' },
];

function SectionBody({ bodyKey }: { bodyKey: TranslationKey }) {
  const { t } = useI18n();
  const lines = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p className="text-sm leading-relaxed text-muted-foreground">{lines[0]}</p>;
  }

  return (
    <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed text-muted-foreground">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export function HelpCenterPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.helpCenter.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.helpCenter.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.helpCenter.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.helpCenter.openApp')}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.helpCenter.faq')}
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.helpCenter.trustCenter')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-10">
        <FadeIn>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
              aria-hidden
            >
              <BookOpen className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t('marketing.helpCenter.featuredTitle')}
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <article
                  key={guide.href}
                  className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/60"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold tracking-tight">
                        {t(guide.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {t(guide.descriptionKey)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={guide.href}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t('marketing.helpCenter.viewGuide')}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-16">
        <FadeIn delay={0.05}>
          <article
            id="start-here"
            className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                aria-hidden
              >
                <LifeBuoy className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                  {t('marketing.helpCenter.startHereTitle')}
                </h2>
                <div className="mt-3">
                  <SectionBody bodyKey="marketing.helpCenter.startHereBody" />
                </div>
              </div>
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4 sm:px-5">
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t('marketing.helpCenter.limitsTitle')}
            </h2>
            <div className="mt-3">
              <SectionBody bodyKey="marketing.helpCenter.limitsBody" />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section id="safety-shortcuts">
            <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
              {t('marketing.helpCenter.safetyShortcutsTitle')}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {SAFETY_SHORTCUTS.map((shortcut) => (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className={cn(
                    'inline-flex items-center rounded-full border border-border/60 bg-card/40 px-4 py-2',
                    'text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card/70',
                  )}
                >
                  {t(shortcut.labelKey)}
                </Link>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.12}>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.helpCenter.backHome')}
          </Link>
        </FadeIn>
      </div>
    </>
  );
}
