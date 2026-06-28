'use client';

import {
  ArrowRight,
  Bell,
  CreditCard,
  Globe,
  MapPin,
  MessageCircle,
  Package,
  Route,
  Shield,
  Star,
  Ticket,
  Truck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { HelpCenterLandingLink } from '@/components/marketing/help-center-landing-link';
import { TrustCenterLandingLink } from '@/components/marketing/trust-center-landing-link';
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

type FaqDef = {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
  linkKey: TranslationKey;
  href: string;
};

type PrincipleDef = {
  icon: LucideIcon;
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

const TRUST_FEATURES: { icon: LucideIcon; labelKey: TranslationKey }[] = [
  { icon: Shield, labelKey: 'marketing.landing.trustSafety.feature1' },
  { icon: Package, labelKey: 'marketing.landing.trustSafety.feature2' },
  { icon: MessageCircle, labelKey: 'marketing.landing.trustSafety.feature3' },
  { icon: Truck, labelKey: 'marketing.landing.trustSafety.feature4' },
  { icon: Ticket, labelKey: 'marketing.landing.trustSafety.feature5' },
  { icon: Bell, labelKey: 'marketing.landing.trustSafety.feature6' },
  { icon: Star, labelKey: 'marketing.landing.trustSafety.feature7' },
  { icon: Users, labelKey: 'marketing.landing.trustSafety.feature8' },
];

const PRINCIPLES: PrincipleDef[] = [
  {
    icon: Route,
    titleKey: 'marketing.landing.principles.card1Title',
    bodyKey: 'marketing.landing.principles.card1Body',
  },
  {
    icon: MessageCircle,
    titleKey: 'marketing.landing.principles.card2Title',
    bodyKey: 'marketing.landing.principles.card2Body',
  },
  {
    icon: Truck,
    titleKey: 'marketing.landing.principles.card3Title',
    bodyKey: 'marketing.landing.principles.card3Body',
  },
  {
    icon: Shield,
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

function BulletBody({ bodyKey }: { bodyKey: TranslationKey }) {
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
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t(titleKey)}</h2>
      <p className="max-w-2xl text-muted-foreground">{t(blurbKey)}</p>
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
  variant?: 'primary' | 'secondary';
}) {
  const { t } = useI18n();

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground shadow-glow hover:scale-[1.02]'
          : 'border border-border text-foreground hover:bg-secondary',
      )}
    >
      {t(labelKey)}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  const routeExamples = [
    t('marketing.landing.international.route1'),
    t('marketing.landing.international.route2'),
    t('marketing.landing.international.route3'),
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div className="container relative flex flex-col items-center gap-6 py-24 text-center sm:py-32">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-success" />
              {t('marketing.landing.heroBadge')}
            </span>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {siteConfig.tagline}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              {siteConfig.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.landing.getStarted')}
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.landing.seeHowItWorks')}
              </Link>
            </div>
            <TrustCenterLandingLink className="mt-4" />
            <HelpCenterLandingLink className="mt-2" />
          </FadeIn>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.howItWorks.title"
              blurbKey="marketing.landing.howItWorks.blurb"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.titleKey}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <Icon className="size-5 text-primary" aria-hidden />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{t(step.titleKey)}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(step.bodyKey)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
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

      <section id="international" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.international.title"
              blurbKey="marketing.landing.international.blurb"
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <BulletBody bodyKey="marketing.landing.international.body" />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {t('marketing.landing.international.lawsNotice')}
                </p>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-6 lg:min-w-[16rem]">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('marketing.landing.international.routesLabel')}
                </p>
                {routeExamples.map((route) => (
                  <span
                    key={route}
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium"
                  >
                    <Route className="size-4 text-primary" aria-hidden />
                    {route}
                  </span>
                ))}
              </div>
            </div>
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

      <section id="local" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.local.title"
              blurbKey="marketing.landing.local.blurb"
            />
            <div className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <BulletBody bodyKey="marketing.landing.local.body" />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/how-it-works" labelKey="marketing.landing.howItWorks.fullGuide" />
              <CtaLink href="/restricted-items" labelKey="marketing.landing.local.restrictedLink" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="pricing" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.pricing.title"
              blurbKey="marketing.landing.pricing.blurb"
            />
            <div className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <BulletBody bodyKey="marketing.landing.pricing.body" />
              </div>
            </div>
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

      <section id="trust-safety" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.trustSafety.title"
              blurbKey="marketing.landing.trustSafety.blurb"
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.labelKey}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
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
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="kyc" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.verified.title"
              blurbKey="marketing.landing.verified.blurb"
            />
            <div className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-6">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <BulletBody bodyKey="marketing.landing.verified.body" />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/trust" labelKey="marketing.landing.verified.viewTrust" />
              <CtaLink href="/roadmap" labelKey="marketing.landing.verified.viewRoadmap" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="testimonials" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.principles.title"
              blurbKey="marketing.landing.principles.blurb"
            />
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              {t('marketing.landing.principles.disclaimer')}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.titleKey}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-6"
                  >
                    <Icon className="size-5 text-primary" aria-hidden />
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

      <section id="faq" className="border-b border-border/60">
        <div className="container py-20">
          <FadeIn>
            <SectionHeader
              titleKey="marketing.landing.faqPreview.title"
              blurbKey="marketing.landing.faqPreview.blurb"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FAQ_PREVIEW.map((item) => (
                <Link
                  key={item.questionKey}
                  href={item.href}
                  className="group flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-card/80"
                >
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {t(item.questionKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(item.answerKey)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {t(item.linkKey)}
                    <ArrowRight className="size-3.5" aria-hidden />
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

      <section id="cta" className="container py-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
            <div
              className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.landing.finalCta.title')}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              {t('marketing.landing.finalCta.subtitle')}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.landing.getStarted')}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.landing.finalCta.signIn')}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
