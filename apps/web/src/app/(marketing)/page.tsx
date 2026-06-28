import Link from 'next/link';

import { FaqLandingLink } from '@/components/marketing/faq-landing-link';
import { HowItWorksLandingLink } from '@/components/marketing/how-it-works-landing-link';
import { TrustCenterLandingLink } from '@/components/marketing/trust-center-landing-link';
import { FadeIn } from '@/components/motion';
import { siteConfig } from '@/config/site';

/**
 * Landing PLACEHOLDER. A premium hero plus anchored, empty section scaffolds.
 * Each section is wired for future content (filled in the design/marketing
 * milestone) — intentionally not a finished marketing page.
 */

const SECTIONS: { id: string; title: string; blurb: string }[] = [
  { id: 'how-it-works', title: 'How it works', blurb: 'Three simple steps: post, match, deliver.' },
  {
    id: 'international',
    title: 'International & intercity',
    blurb: 'Travelers carry parcels along routes they already take.',
  },
  {
    id: 'local',
    title: 'Local city delivery',
    blurb: 'Fast same-city delivery from shops, restaurants, and people.',
  },
  {
    id: 'pricing',
    title: 'Pricing',
    blurb: 'Flexible Wayler access packages and a simple per-order fee.',
  },
  {
    id: 'trust-safety',
    title: 'Trust & safety',
    blurb:
      'Verified profiles, clear payment status, dispute review tools, and guidance to keep agreements inside Wayly.',
  },
  {
    id: 'kyc',
    title: 'Verified by design',
    blurb: 'Phone, document, and liveness checks before any activity.',
  },
  {
    id: 'testimonials',
    title: 'Loved by senders & waylers',
    blurb: 'Stories from our growing community.',
  },
  {
    id: 'faq',
    title: 'Frequently asked questions',
    blurb: 'Everything you need to know to get started.',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
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
              P2P delivery, reimagined
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
                Get started
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                See how it works
              </Link>
            </div>
            <TrustCenterLandingLink className="mt-4" />
            <FaqLandingLink className="mt-2" />
          </FadeIn>
        </div>
      </section>

      {/* ------------------------------------------------ Placeholder sections */}
      {SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="border-b border-border/60">
          <div className="container py-20">
            <FadeIn>
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {section.title}
                </h2>
                <p className="max-w-xl text-muted-foreground">{section.blurb}</p>
              </div>
              <div className="mt-8">
                {section.id === 'how-it-works' ? (
                  <HowItWorksLandingLink variant="card" />
                ) : section.id === 'trust-safety' ? (
                  <TrustCenterLandingLink variant="card" />
                ) : section.id === 'faq' ? (
                  <FaqLandingLink variant="card" />
                ) : (
                  <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-sm text-muted-foreground">
                    Section content arrives in the design &amp; marketing milestone.
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </section>
      ))}

      {/* -------------------------------------------------------- Final CTA */}
      <section id="cta" className="container py-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
            <div
              className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to send something the smart way?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              Join Wayly and connect with verified travelers and couriers heading your way.
            </p>
            <Link
              href="#"
              className="relative mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Create your first order
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
