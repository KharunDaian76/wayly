'use client';

import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CreditCard,
  FileCheck,
  MapPin,
  MessageCircle,
  Package,
  Plane,
  Receipt,
  Route,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Truck,
  UserCircle,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { InteractiveRouteGlobe } from '@/components/marketing/interactive-route-globe';
import { FadeIn } from '@/components/motion';
import { siteConfig } from '@/config/site';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type StepDef = {
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

type RouteDef = {
  originKey: TranslationKey;
  destKey: TranslationKey;
};

type FaqDef = {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
  linkKey: TranslationKey;
  href: string;
};

type PrincipleDef = {
  icon: LucideIcon;
  initials: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

const HOW_IT_WORKS_STEPS: StepDef[] = [
  {
    icon: Package,
    titleKey: 'marketing.landing.howItWorks.step1Title',
    bodyKey: 'marketing.landing.howItWorks.step1Body',
  },
  {
    icon: Route,
    titleKey: 'marketing.landing.howItWorks.step2Title',
    bodyKey: 'marketing.landing.howItWorks.step2Body',
  },
  {
    icon: Truck,
    titleKey: 'marketing.landing.howItWorks.step3Title',
    bodyKey: 'marketing.landing.howItWorks.step3Body',
  },
  {
    icon: MessageCircle,
    titleKey: 'marketing.landing.howItWorks.step4Title',
    bodyKey: 'marketing.landing.howItWorks.step4Body',
  },
];

const ROUTE_SHOWCASE: RouteDef[] = [
  {
    originKey: 'marketing.landing.routes.r1Origin',
    destKey: 'marketing.landing.routes.r1Dest',
  },
  {
    originKey: 'marketing.landing.routes.r2Origin',
    destKey: 'marketing.landing.routes.r2Dest',
  },
  {
    originKey: 'marketing.landing.routes.r3Origin',
    destKey: 'marketing.landing.routes.r3Dest',
  },
  {
    originKey: 'marketing.landing.routes.r4Origin',
    destKey: 'marketing.landing.routes.r4Dest',
  },
];

const TRUST_FEATURES: { icon: LucideIcon; labelKey: TranslationKey }[] = [
  { icon: Package, labelKey: 'marketing.landing.trustSafety.feature2' },
  { icon: MessageCircle, labelKey: 'marketing.landing.trustSafety.feature3' },
  { icon: Truck, labelKey: 'marketing.landing.trustSafety.feature4' },
  { icon: Ticket, labelKey: 'marketing.landing.trustSafety.feature5' },
  { icon: Bell, labelKey: 'marketing.landing.trustSafety.feature6' },
  { icon: Star, labelKey: 'marketing.landing.trustSafety.feature7' },
  { icon: Users, labelKey: 'marketing.landing.trustSafety.feature8' },
  { icon: Shield, labelKey: 'marketing.landing.trustSafety.feature1' },
];

const PRICING_CARDS: { icon: LucideIcon; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  {
    icon: Wallet,
    titleKey: 'marketing.landing.pricing.cardAccessTitle',
    bodyKey: 'marketing.landing.pricing.cardAccessBody',
  },
  {
    icon: Receipt,
    titleKey: 'marketing.landing.pricing.cardFeeTitle',
    bodyKey: 'marketing.landing.pricing.cardFeeBody',
  },
  {
    icon: CreditCard,
    titleKey: 'marketing.landing.pricing.cardStatusTitle',
    bodyKey: 'marketing.landing.pricing.cardStatusBody',
  },
];

const VERIFICATION_PIPELINE: { icon: LucideIcon; labelKey: TranslationKey }[] = [
  { icon: UserCircle, labelKey: 'marketing.landing.verified.pipelineProfile' },
  { icon: FileCheck, labelKey: 'marketing.landing.verified.pipelineKyc' },
  { icon: Plane, labelKey: 'marketing.landing.verified.pipelineMarketplace' },
  { icon: Shield, labelKey: 'marketing.landing.verified.pipelineAdmin' },
];

const PRINCIPLES: PrincipleDef[] = [
  {
    icon: Route,
    initials: 'CR',
    titleKey: 'marketing.landing.principles.card1Title',
    bodyKey: 'marketing.landing.principles.card1Body',
  },
  {
    icon: MessageCircle,
    initials: 'SC',
    titleKey: 'marketing.landing.principles.card2Title',
    bodyKey: 'marketing.landing.principles.card2Body',
  },
  {
    icon: Truck,
    initials: 'TS',
    titleKey: 'marketing.landing.principles.card3Title',
    bodyKey: 'marketing.landing.principles.card3Body',
  },
  {
    icon: Sparkles,
    initials: 'TR',
    titleKey: 'marketing.landing.principles.card4Title',
    bodyKey: 'marketing.landing.principles.card4Body',
  },
];

const FAQ_PREVIEW: FaqDef[] = [
  {
    questionKey: 'marketing.landing.faqPreview.q1Question',
    answerKey: 'marketing.landing.faqPreview.q1Answer',
    linkKey: 'marketing.landing.faqPreview.q1Link',
    href: '/fees',
  },
  {
    questionKey: 'marketing.landing.faqPreview.q2Question',
    answerKey: 'marketing.landing.faqPreview.q2Answer',
    linkKey: 'marketing.landing.faqPreview.q2Link',
    href: '/restricted-items',
  },
  {
    questionKey: 'marketing.landing.faqPreview.q3Question',
    answerKey: 'marketing.landing.faqPreview.q3Answer',
    linkKey: 'marketing.landing.faqPreview.q3Link',
    href: '/how-it-works',
  },
  {
    questionKey: 'marketing.landing.faqPreview.q4Question',
    answerKey: 'marketing.landing.faqPreview.q4Answer',
    linkKey: 'marketing.landing.faqPreview.q4Link',
    href: '/trust',
  },
  {
    questionKey: 'marketing.landing.faqPreview.q5Question',
    answerKey: 'marketing.landing.faqPreview.q5Answer',
    linkKey: 'marketing.landing.faqPreview.q5Link',
    href: '/support-disputes',
  },
  {
    questionKey: 'marketing.landing.faqPreview.q6Question',
    answerKey: 'marketing.landing.faqPreview.q6Answer',
    linkKey: 'marketing.landing.faqPreview.q6Link',
    href: '/roadmap',
  },
];

const HERO_CHIPS: TranslationKey[] = [
  'marketing.landing.heroChipSender',
  'marketing.landing.heroChipWayler',
  'marketing.landing.heroChipSupport',
  'marketing.landing.heroChipReviews',
  'marketing.landing.heroChipDemoPayments',
];

function SectionHeader({
  titleKey,
  blurbKey,
}: {
  titleKey: TranslationKey;
  blurbKey: TranslationKey;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {t(titleKey)}
      </h2>
      <p className="max-w-2xl text-base text-muted-foreground">{t(blurbKey)}</p>
    </div>
  );
}

function CtaLink({
  href,
  labelKey,
  variant = 'secondary',
}: {
  href: string;
  labelKey: TranslationKey;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold transition-all',
        variant === 'primary' &&
          'wayly-landing-shine-btn bg-primary text-primary-foreground shadow-glow hover:scale-[1.02]',
        variant === 'secondary' &&
          'border border-border/70 text-foreground hover:border-primary/40 hover:bg-secondary/80',
        variant === 'ghost' && 'text-muted-foreground hover:text-primary',
      )}
    >
      {t(labelKey)}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

function RouteShowcaseCard({ originKey, destKey }: RouteDef) {
  const { t } = useI18n();

  return (
    <div className="wayly-landing-glow-card wayly-landing-gradient-border relative flex flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {t('marketing.landing.routes.type')}
        </span>
        <span className="wayly-landing-route-dot size-2 rounded-full bg-accent" aria-hidden />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5">
          {t(originKey)}
        </span>
        <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden />
        <span className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5">
          {t(destKey)}
        </span>
      </div>
      <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">
            {t('marketing.landing.routes.usefulFor')}:{' '}
          </span>
          {t('marketing.landing.routes.usefulForBody')}
        </p>
        <p>
          <span className="font-semibold text-foreground">
            {t('marketing.landing.routes.safetyNote')}:{' '}
          </span>
          {t('marketing.landing.routes.safetyBody')}
        </p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="dark bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 wayly-landing-hero-grid opacity-60"
          aria-hidden
        />
        <InteractiveRouteGlobe />
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-background/10 via-transparent to-background/70"
          aria-hidden
        />
        <div className="container relative z-10 flex flex-col items-center gap-8 py-24 text-center sm:py-36">
          <p className="pointer-events-none absolute right-4 top-4 hidden rounded-full border border-border/50 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur sm:inline-block">
            Drag globe to explore routes
          </p>
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <span className="size-1.5 rounded-full bg-success wayly-landing-route-dot" />
              {t('marketing.landing.heroBadge')}
            </span>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="mx-auto max-w-4xl bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              {siteConfig.tagline}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t('marketing.landing.heroSubtitle')}
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2">
              {HERO_CHIPS.map((chipKey) => (
                <span
                  key={chipKey}
                  className="rounded-full border border-border/60 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur"
                >
                  {t(chipKey)}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="wayly-landing-shine-btn inline-flex items-center rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.landing.getStarted')}
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-md border border-border/70 bg-card/40 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/40 hover:bg-card/70"
              >
                {t('marketing.landing.seeHowItWorks')}
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <CtaLink
                href="/trust"
                labelKey="marketing.landing.trustSafety.viewTrust"
                variant="ghost"
              />
              <CtaLink href="/roadmap" labelKey="marketing.landing.viewRoadmap" variant="ghost" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.howItWorks.title"
              blurbKey="marketing.landing.howItWorks.blurb"
            />
            <div className="relative mt-12">
              <div
                className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-primary/20 via-accent/50 to-primary/20 lg:block"
                aria-hidden
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HOW_IT_WORKS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.titleKey}
                      className="wayly-landing-glow-card wayly-landing-glass relative flex flex-col gap-3 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-accent/15 text-xs font-bold text-primary ring-1 ring-primary/20">
                          {index + 1}
                        </span>
                        <Icon className="size-5 text-accent" aria-hidden />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{t(step.titleKey)}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t(step.bodyKey)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <CtaLink
                href="/how-it-works"
                labelKey="marketing.landing.howItWorks.fullGuide"
                variant="primary"
              />
              <CtaLink href="/register" labelKey="marketing.landing.getStarted" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* International routes */}
      <section
        id="international"
        className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-transparent"
      >
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.international.title"
              blurbKey="marketing.landing.international.blurb"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {ROUTE_SHOWCASE.map((route) => (
                <RouteShowcaseCard key={route.originKey} {...route} />
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t('marketing.landing.international.lawsNotice')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/how-it-works" labelKey="marketing.landing.howItWorks.fullGuide" />
              <CtaLink
                href="/restricted-items"
                labelKey="marketing.landing.international.restrictedLink"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Local delivery */}
      <section id="local" className="border-b border-border/60">
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.local.title"
              blurbKey="marketing.landing.local.blurb"
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="wayly-landing-glass rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                    {t('marketing.landing.local.body')
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                  </ul>
                </div>
              </div>
              <div className="wayly-landing-glass flex flex-col items-center gap-4 rounded-2xl p-8 lg:min-w-[18rem]">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('marketing.landing.local.diagramLabel')}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  {[
                    t('marketing.landing.local.pickup'),
                    t('marketing.landing.local.handoff'),
                    t('marketing.landing.local.delivery'),
                  ].map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="flex size-14 flex-col items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-center text-[10px] font-semibold leading-tight text-foreground">
                        {label}
                      </div>
                      {index < 2 ? (
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/how-it-works" labelKey="marketing.landing.howItWorks.fullGuide" />
              <CtaLink href="/restricted-items" labelKey="marketing.landing.local.restrictedLink" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border/60">
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeader
                titleKey="marketing.landing.pricing.title"
                blurbKey="marketing.landing.pricing.blurb"
              />
              <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                {t('marketing.landing.pricing.demoBadge')}
              </span>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PRICING_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.titleKey}
                    className="wayly-landing-glow-card wayly-landing-glass rounded-2xl p-6"
                  >
                    <Icon className="size-5 text-primary" aria-hidden />
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                      {t(card.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(card.bodyKey)}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
              {t('marketing.landing.pricing.noGuarantee')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                href="/fees"
                labelKey="marketing.landing.pricing.viewFees"
                variant="primary"
              />
              <CtaLink href="/roadmap" labelKey="marketing.landing.pricing.viewRoadmap" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Trust & safety */}
      <section
        id="trust-safety"
        className="border-b border-border/60 bg-gradient-to-b from-accent/[0.04] to-transparent"
      >
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.trustSafety.title"
              blurbKey="marketing.landing.trustSafety.blurb"
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.labelKey}
                    className="wayly-landing-glow-card wayly-landing-glass flex items-start gap-3 rounded-xl p-4"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Icon className="size-4 text-primary" aria-hidden />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {t(feature.labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t('marketing.landing.trustSafety.notice')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                href="/trust"
                labelKey="marketing.landing.trustSafety.viewTrust"
                variant="primary"
              />
              <CtaLink href="/help" labelKey="marketing.landing.trustSafety.viewHelp" />
              <CtaLink href="/policies" labelKey="marketing.landing.viewPolicies" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Verified by design */}
      <section id="kyc" className="border-b border-border/60">
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.verified.title"
              blurbKey="marketing.landing.verified.blurb"
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {(
                [
                  {
                    key: 'marketing.landing.verified.badgeDesigned' as const,
                    tone: 'primary' as const,
                  },
                  {
                    key: 'marketing.landing.verified.badgeMock' as const,
                    tone: 'warning' as const,
                  },
                  {
                    key: 'marketing.landing.verified.badgePlanned' as const,
                    tone: 'accent' as const,
                  },
                ] satisfies Array<{ key: TranslationKey; tone: 'primary' | 'warning' | 'accent' }>
              ).map((badge) => (
                <span
                  key={badge.key}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold',
                    badge.tone === 'primary' && 'border-primary/35 bg-primary/10 text-primary',
                    badge.tone === 'warning' && 'border-warning/35 bg-warning/10 text-warning',
                    badge.tone === 'accent' && 'border-accent/35 bg-accent/10 text-accent',
                  )}
                >
                  {t(badge.key)}
                </span>
              ))}
            </div>
            <div className="mt-10 overflow-x-auto">
              <div className="flex min-w-[32rem] items-center justify-between gap-2">
                {VERIFICATION_PIPELINE.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.labelKey} className="flex flex-1 items-center gap-2">
                      <div className="wayly-landing-glass flex flex-1 flex-col items-center gap-2 rounded-xl p-4 text-center">
                        <Icon className="size-5 text-primary" aria-hidden />
                        <span className="text-xs font-medium text-muted-foreground">
                          {t(step.labelKey)}
                        </span>
                      </div>
                      {index < VERIFICATION_PIPELINE.length - 1 ? (
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="wayly-landing-glass mt-8 rounded-2xl p-6">
              <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                {t('marketing.landing.verified.body')
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/trust" labelKey="marketing.landing.verified.viewTrust" />
              <CtaLink href="/roadmap" labelKey="marketing.landing.verified.viewRoadmap" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product principles */}
      <section id="testimonials" className="border-b border-border/60">
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.principles.title"
              blurbKey="marketing.landing.principles.blurb"
            />
            <p className="mt-4 max-w-2xl rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              {t('marketing.landing.principles.disclaimer')}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.titleKey}
                    className="wayly-landing-glow-card wayly-landing-glass flex flex-col gap-4 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-xs font-bold text-primary ring-1 ring-primary/25">
                        {principle.initials}
                      </span>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                          {t('marketing.landing.principles.badgeLabel')}
                        </span>
                        <Icon className="mt-1 size-4 text-primary" aria-hidden />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t(principle.titleKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(principle.bodyKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ preview */}
      <section id="faq" className="border-b border-border/60">
        <div className="container py-20 lg:py-24">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.faqPreview.title"
              blurbKey="marketing.landing.faqPreview.blurb"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FAQ_PREVIEW.map((item) => (
                <Link
                  key={item.questionKey}
                  href={item.href}
                  className="wayly-landing-glow-card wayly-landing-glass group flex flex-col gap-2 rounded-2xl p-5"
                >
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {t(item.questionKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(item.answerKey)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {t(item.linkKey)}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                href="/help"
                labelKey="marketing.landing.faqPreview.browseHelp"
                variant="primary"
              />
              <CtaLink href="/faq" labelKey="marketing.landing.faqPreview.viewFaq" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="container py-24 lg:py-28">
        <FadeIn>
          <div className="wayly-landing-gradient-border relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-10 text-center backdrop-blur sm:p-16">
            <div
              className="wayly-landing-glow-blob pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <CheckCircle2 className="relative mx-auto size-8 text-accent" aria-hidden />
            <h2 className="relative mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.landing.finalCta.title')}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              {t('marketing.landing.finalCta.subtitle')}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="wayly-landing-shine-btn inline-flex items-center rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.landing.getStarted')}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-md border border-border/70 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
              >
                {t('marketing.landing.finalCta.signIn')}
              </Link>
            </div>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4">
              <CtaLink
                href="/how-it-works"
                labelKey="marketing.landing.seeHowItWorks"
                variant="ghost"
              />
              <CtaLink
                href="/trust"
                labelKey="marketing.landing.trustSafety.viewTrust"
                variant="ghost"
              />
              <CtaLink href="/fees" labelKey="marketing.landing.pricing.viewFees" variant="ghost" />
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
