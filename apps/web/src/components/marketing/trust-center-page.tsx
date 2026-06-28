'use client';

import {
  CreditCard,
  Globe2,
  HardDrive,
  MessageCircle,
  PackageX,
  Rocket,
  Scale,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type TrustSection = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

const SECTIONS: TrustSection[] = [
  {
    id: 'how-wayly-works',
    icon: Globe2,
    titleKey: 'marketing.trustCenter.howWaylyWorksTitle',
    bodyKey: 'marketing.trustCenter.howWaylyWorksBody',
  },
  {
    id: 'trust-signals',
    icon: Shield,
    titleKey: 'marketing.trustCenter.trustSignalsTitle',
    bodyKey: 'marketing.trustCenter.trustSignalsBody',
  },
  {
    id: 'safe-communication',
    icon: MessageCircle,
    titleKey: 'marketing.trustCenter.safeCommunicationTitle',
    bodyKey: 'marketing.trustCenter.safeCommunicationBody',
  },
  {
    id: 'restricted-items',
    icon: PackageX,
    titleKey: 'marketing.trustCenter.restrictedItemsTitle',
    bodyKey: 'marketing.trustCenter.restrictedItemsBody',
  },
  {
    id: 'payments',
    icon: CreditCard,
    titleKey: 'marketing.trustCenter.paymentsTitle',
    bodyKey: 'marketing.trustCenter.paymentsBody',
  },
  {
    id: 'disputes',
    icon: Scale,
    titleKey: 'marketing.trustCenter.disputesTitle',
    bodyKey: 'marketing.trustCenter.disputesBody',
  },
  {
    id: 'local-data',
    icon: HardDrive,
    titleKey: 'marketing.trustCenter.localDataTitle',
    bodyKey: 'marketing.trustCenter.localDataBody',
  },
  {
    id: 'future-work',
    icon: Rocket,
    titleKey: 'marketing.trustCenter.futureWorkTitle',
    bodyKey: 'marketing.trustCenter.futureWorkBody',
  },
];

function TrustSectionBody({ bodyKey }: { bodyKey: TranslationKey }) {
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

export function TrustCenterPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">
              {t('marketing.trustCenter.navLabel')}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.trustCenter.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.trustCenter.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t('marketing.trustCenter.noGuaranteesNotice')}
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-16">
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;
          return (
            <FadeIn key={section.id} delay={index * 0.03}>
              <article
                id={section.id}
                className={cn(
                  'rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6',
                  'transition-colors hover:border-border hover:bg-card/60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                      {t(section.titleKey)}
                    </h2>
                    <div className="mt-3">
                      <TrustSectionBody bodyKey={section.bodyKey} />
                    </div>
                    {section.id === 'restricted-items' ? (
                      <Link
                        href="/restricted-items"
                        className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {t('marketing.restrictedItems.navLabel')} →
                      </Link>
                    ) : null}
                    {section.id === 'payments' ? (
                      <Link
                        href="/fees"
                        className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {t('marketing.fees.navLabel')} →
                      </Link>
                    ) : null}
                    {section.id === 'local-data' ? (
                      <Link
                        href="/privacy-local-data"
                        className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {t('marketing.privacyLocalData.navLabel')} →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            </FadeIn>
          );
        })}

        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {t('marketing.trustCenter.backHome')}
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              {t('marketing.trustCenter.openApp')}
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
            >
              {t('marketing.faq.navLabel')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
