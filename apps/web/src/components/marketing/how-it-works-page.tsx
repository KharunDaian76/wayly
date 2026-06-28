'use client';

import {
  ArrowRight,
  ClipboardCheck,
  MessageCircle,
  Package,
  Route,
  Shield,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

function StepList({ bodyKey }: { bodyKey: TranslationKey }) {
  const { t } = useI18n();
  const steps = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li
          key={step}
          className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:bg-card/60"
        >
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {index + 1}
          </span>
          <span className="pt-0.5 text-sm leading-relaxed text-muted-foreground">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function LifecycleFlow({ bodyKey }: { bodyKey: TranslationKey }) {
  const { t } = useI18n();
  const stages = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-2">
          <span className="inline-flex rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground sm:text-sm">
            {stage}
          </span>
          {index < stages.length - 1 ? (
            <ArrowRight
              className="hidden size-4 shrink-0 text-muted-foreground sm:block"
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

type SafetyLink = {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

const SAFETY_LINKS: SafetyLink[] = [
  { href: '/trust', labelKey: 'marketing.howItWorks.trustCenter', icon: Shield },
  { href: '/faq', labelKey: 'marketing.howItWorks.faq', icon: ClipboardCheck },
  {
    href: '/restricted-items',
    labelKey: 'marketing.howItWorks.restrictedItems',
    icon: Package,
  },
];

export function HowItWorksPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.howItWorks.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.howItWorks.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.howItWorks.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.howItWorks.openApp')}
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.howItWorks.trustCenter')}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.howItWorks.faq')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t('marketing.howItWorks.noGuaranteesNotice')}
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-12 pb-16">
        <FadeIn>
          <section id="sender-flow" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary">
                <Package className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t('marketing.howItWorks.senderTitle')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('marketing.howItWorks.senderSubtitle')}
                </p>
              </div>
            </div>
            <StepList bodyKey="marketing.howItWorks.senderStepsBody" />
          </section>
        </FadeIn>

        <FadeIn delay={0.05}>
          <section id="wayler-flow" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary">
                <Truck className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t('marketing.howItWorks.waylerTitle')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('marketing.howItWorks.waylerSubtitle')}
                </p>
              </div>
            </div>
            <StepList bodyKey="marketing.howItWorks.waylerStepsBody" />
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section
            id="lifecycle"
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary">
                <Route className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t('marketing.howItWorks.lifecycleTitle')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('marketing.howItWorks.lifecycleSubtitle')}
                </p>
              </div>
            </div>
            <LifecycleFlow bodyKey="marketing.howItWorks.lifecycleStepsBody" />
            <Link
              href="/fees"
              className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t('marketing.fees.navLabel')} →
            </Link>
          </section>
        </FadeIn>

        <FadeIn delay={0.15}>
          <section id="safety-links" className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary">
                <MessageCircle className="size-4" aria-hidden />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {t('marketing.howItWorks.safetyLinksTitle')}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {SAFETY_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-card/80',
                    )}
                  >
                    <Icon className="size-5 text-primary" aria-hidden />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {t(item.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <section
            id="limits"
            className="rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6"
          >
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t('marketing.howItWorks.limitsTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('marketing.howItWorks.limitsBody')}
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.25}>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.howItWorks.backHome')}
          </Link>
        </FadeIn>
      </div>
    </>
  );
}
