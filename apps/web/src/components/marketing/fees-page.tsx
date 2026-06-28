'use client';

import { CreditCard, Receipt, Rocket, Shield, ShieldAlert, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type FeeSection = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  variant?: 'default' | 'warning';
};

const SECTIONS: FeeSection[] = [
  {
    id: 'current-status',
    icon: Wallet,
    titleKey: 'marketing.fees.currentStatusTitle',
    bodyKey: 'marketing.fees.currentStatusBody',
  },
  {
    id: 'status-meaning',
    icon: CreditCard,
    titleKey: 'marketing.fees.statusMeaningTitle',
    bodyKey: 'marketing.fees.statusMeaningBody',
  },
  {
    id: 'platform-fee',
    icon: Receipt,
    titleKey: 'marketing.fees.platformFeeTitle',
    bodyKey: 'marketing.fees.platformFeeBody',
  },
  {
    id: 'refunds-payouts',
    icon: ShieldAlert,
    titleKey: 'marketing.fees.refundsPayoutsTitle',
    bodyKey: 'marketing.fees.refundsPayoutsBody',
    variant: 'warning',
  },
  {
    id: 'admin-review',
    icon: Shield,
    titleKey: 'marketing.fees.adminReviewTitle',
    bodyKey: 'marketing.fees.adminReviewBody',
  },
  {
    id: 'future-work',
    icon: Rocket,
    titleKey: 'marketing.fees.futureWorkTitle',
    bodyKey: 'marketing.fees.futureWorkBody',
  },
  {
    id: 'safety-reminder',
    icon: ShieldAlert,
    titleKey: 'marketing.fees.safetyReminderTitle',
    bodyKey: 'marketing.fees.safetyReminderBody',
  },
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

export function FeesPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.fees.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.fees.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.fees.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.fees.openApp')}
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.fees.trustCenter')}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.fees.faq')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t('marketing.fees.noGuaranteesNotice')}
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
                  'rounded-2xl border p-5 sm:p-6',
                  section.variant === 'warning'
                    ? 'border-amber-500/25 bg-amber-500/[0.04]'
                    : 'border-border/60 bg-card/40',
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
                      <SectionBody bodyKey={section.bodyKey} />
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          );
        })}

        <FadeIn delay={0.2}>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.fees.backHome')}
          </Link>
        </FadeIn>
      </div>
    </>
  );
}
