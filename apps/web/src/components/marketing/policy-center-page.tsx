'use client';

import {
  ArrowRight,
  CreditCard,
  FileText,
  HardDrive,
  MapPin,
  Scale,
  ScrollText,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';

type PolicyCard = {
  href: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

const POLICY_CARDS: PolicyCard[] = [
  {
    href: '/terms',
    icon: FileText,
    titleKey: 'marketing.policies.terms',
    descriptionKey: 'marketing.policies.termsDescription',
  },
  {
    href: '/privacy',
    icon: HardDrive,
    titleKey: 'marketing.policies.privacy',
    descriptionKey: 'marketing.policies.privacyDescription',
  },
  {
    href: '/community-guidelines',
    icon: Users,
    titleKey: 'marketing.policies.communityGuidelines',
    descriptionKey: 'marketing.policies.communityGuidelinesDescription',
  },
  {
    href: '/restricted-items',
    icon: MapPin,
    titleKey: 'marketing.policies.restrictedItems',
    descriptionKey: 'marketing.policies.restrictedItemsDescription',
  },
  {
    href: '/fees',
    icon: CreditCard,
    titleKey: 'marketing.policies.fees',
    descriptionKey: 'marketing.policies.feesDescription',
  },
  {
    href: '/support-disputes',
    icon: Scale,
    titleKey: 'marketing.policies.supportDisputes',
    descriptionKey: 'marketing.policies.supportDisputesDescription',
  },
];

export function PolicyCenterPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.policies.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.policies.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.policies.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.policies.openApp')}
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.helpCenter.navLabel')}
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.trustCenter.navLabel')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                aria-hidden
              >
                <ScrollText className="size-4" />
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('marketing.policies.draftNotice')}
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="container pb-16">
        <FadeIn delay={0.05}>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
              aria-hidden
            >
              <Shield className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t('marketing.policies.cardsTitle')}
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POLICY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.href}
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
                        {t(card.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {t(card.descriptionKey)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={card.href}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t('marketing.policies.viewPolicy')}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.12} className="mt-10">
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.policies.backHome')}
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
