'use client';

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  HardDrive,
  LifeBuoy,
  MapPin,
  Rocket,
  Scale,
  ScrollText,
  Shield,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type RoadmapBadge = 'available' | 'mockManual' | 'planned';

type RoadmapColumn = {
  id: string;
  badge: RoadmapBadge;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

const ROADMAP_COLUMNS: RoadmapColumn[] = [
  {
    id: 'available',
    badge: 'available',
    icon: CheckCircle2,
    titleKey: 'marketing.roadmap.availableTitle',
    bodyKey: 'marketing.roadmap.availableBody',
  },
  {
    id: 'mock-manual',
    badge: 'mockManual',
    icon: Wrench,
    titleKey: 'marketing.roadmap.mockManualTitle',
    bodyKey: 'marketing.roadmap.mockManualBody',
  },
  {
    id: 'planned',
    badge: 'planned',
    icon: Rocket,
    titleKey: 'marketing.roadmap.plannedTitle',
    bodyKey: 'marketing.roadmap.plannedBody',
  },
];

type HelpfulLink = {
  href: string;
  icon: LucideIcon;
  labelKey: TranslationKey;
};

const HELPFUL_LINKS: HelpfulLink[] = [
  { href: '/help', icon: LifeBuoy, labelKey: 'marketing.roadmap.helpCenter' },
  { href: '/policies', icon: ScrollText, labelKey: 'marketing.roadmap.policyCenter' },
  { href: '/fees', icon: CreditCard, labelKey: 'marketing.roadmap.fees' },
  { href: '/privacy', icon: HardDrive, labelKey: 'marketing.roadmap.privacy' },
  { href: '/support-disputes', icon: Scale, labelKey: 'marketing.roadmap.supportDisputes' },
  { href: '/restricted-items', icon: MapPin, labelKey: 'marketing.roadmap.restrictedItems' },
];

const BADGE_CONFIG: Record<RoadmapBadge, { labelKey: TranslationKey; className: string }> = {
  available: {
    labelKey: 'marketing.roadmap.badgeAvailable',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  mockManual: {
    labelKey: 'marketing.roadmap.badgeMockManual',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  planned: {
    labelKey: 'marketing.roadmap.badgePlanned',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
};

function SectionBody({ bodyKey }: { bodyKey: TranslationKey }) {
  const { t } = useI18n();
  const lines = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed text-muted-foreground">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

function StatusBadge({ badge }: { badge: RoadmapBadge }) {
  const { t } = useI18n();
  const config = BADGE_CONFIG[badge];

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        config.className,
      )}
    >
      {t(config.labelKey)}
    </span>
  );
}

export function RoadmapPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.roadmap.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.roadmap.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.roadmap.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.roadmap.openApp')}
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.roadmap.helpCenter')}
              </Link>
              <Link
                href="/policies"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.roadmap.policyCenter')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-10">
        <FadeIn>
          <div className="grid gap-6 lg:grid-cols-3">
            {ROADMAP_COLUMNS.map((column, index) => {
              const Icon = column.icon;
              return (
                <FadeIn key={column.id} delay={index * 0.04}>
                  <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                        aria-hidden
                      >
                        <Icon className="size-4" />
                      </span>
                      <StatusBadge badge={column.badge} />
                    </div>
                    <h2 className="mt-4 font-display text-lg font-bold tracking-tight sm:text-xl">
                      {t(column.titleKey)}
                    </h2>
                    <div className="mt-3 flex-1">
                      <SectionBody bodyKey={column.bodyKey} />
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-16">
        <FadeIn delay={0.08}>
          <article className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                aria-hidden
              >
                <Shield className="size-4" />
              </span>
              <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                {t('marketing.roadmap.safetyRoadmapTitle')}
              </h2>
              <StatusBadge badge="planned" />
            </div>
            <div className="mt-4">
              <SectionBody bodyKey="marketing.roadmap.safetyRoadmapBody" />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                aria-hidden
              >
                <ShieldAlert className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  {t('marketing.roadmap.noGuaranteesTitle')}
                </h2>
                <div className="mt-3">
                  <SectionBody bodyKey="marketing.roadmap.noGuaranteesBody" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <section>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t('marketing.roadmap.helpfulLinksTitle')}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HELPFUL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3.5',
                      'text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-card/70',
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-primary/80" aria-hidden />
                    <span className="min-w-0 flex-1">{t(link.labelKey)}</span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.14}>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.roadmap.backHome')}
          </Link>
        </FadeIn>
      </div>
    </>
  );
}
