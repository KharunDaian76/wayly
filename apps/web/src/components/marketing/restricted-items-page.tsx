'use client';

import {
  AlertTriangle,
  Ban,
  CircleHelp,
  Package,
  ShieldAlert,
  Truck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type ContentSection = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  variant?: 'default' | 'warning' | 'chips';
};

const SECTIONS: ContentSection[] = [
  {
    id: 'responsible-use',
    icon: ShieldAlert,
    titleKey: 'marketing.restrictedItems.responsibleUseTitle',
    bodyKey: 'marketing.restrictedItems.responsibleUseBody',
  },
  {
    id: 'not-suitable',
    icon: Ban,
    titleKey: 'marketing.restrictedItems.notSuitableTitle',
    bodyKey: 'marketing.restrictedItems.notSuitableBody',
    variant: 'chips',
  },
  {
    id: 'caution',
    icon: AlertTriangle,
    titleKey: 'marketing.restrictedItems.cautionTitle',
    bodyKey: 'marketing.restrictedItems.cautionBody',
    variant: 'chips',
  },
  {
    id: 'sender-responsibilities',
    icon: Package,
    titleKey: 'marketing.restrictedItems.senderResponsibilitiesTitle',
    bodyKey: 'marketing.restrictedItems.senderResponsibilitiesBody',
  },
  {
    id: 'wayler-responsibilities',
    icon: Truck,
    titleKey: 'marketing.restrictedItems.waylerResponsibilitiesTitle',
    bodyKey: 'marketing.restrictedItems.waylerResponsibilitiesBody',
  },
  {
    id: 'no-guarantees',
    icon: Ban,
    titleKey: 'marketing.restrictedItems.noGuaranteesTitle',
    bodyKey: 'marketing.restrictedItems.noGuaranteesBody',
    variant: 'warning',
  },
  {
    id: 'if-unsure',
    icon: CircleHelp,
    titleKey: 'marketing.restrictedItems.ifUnsureTitle',
    bodyKey: 'marketing.restrictedItems.ifUnsureBody',
  },
];

function SectionBody({
  bodyKey,
  variant = 'default',
}: {
  bodyKey: TranslationKey;
  variant?: ContentSection['variant'];
}) {
  const { t } = useI18n();
  const lines = t(bodyKey)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (variant === 'chips') {
    return (
      <div className="flex flex-wrap gap-2">
        {lines.map((line) => (
          <span
            key={line}
            className="inline-flex rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {line}
          </span>
        ))}
      </div>
    );
  }

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

export function RestrictedItemsPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">
              {t('marketing.restrictedItems.navLabel')}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.restrictedItems.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.restrictedItems.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="container flex flex-col gap-3 py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t('marketing.restrictedItems.noLegalAdvice')}
          </div>
        </FadeIn>
        <FadeIn delay={0.03}>
          <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t('marketing.restrictedItems.noLegalityVerification')}
          </div>
        </FadeIn>
        <FadeIn delay={0.06}>
          <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <UserCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{t('marketing.restrictedItems.checkOfficialRules')}</span>
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-16">
        {SECTIONS.map((section, index) => {
          const Icon = section.icon;
          const isNotSuitable = section.id === 'not-suitable';

          return (
            <FadeIn key={section.id} delay={index * 0.03}>
              <article
                id={section.id}
                className={cn(
                  'rounded-2xl border p-5 sm:p-6',
                  section.variant === 'warning'
                    ? 'border-amber-500/25 bg-amber-500/[0.04]'
                    : isNotSuitable
                      ? 'border-destructive/20 bg-destructive/[0.03]'
                      : 'border-border/60 bg-card/40',
                  'transition-colors hover:border-border hover:bg-card/60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30',
                      isNotSuitable
                        ? 'border-destructive/30 text-destructive'
                        : 'border-border/60 text-primary',
                    )}
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                      {t(section.titleKey)}
                    </h2>
                    <div className="mt-3">
                      <SectionBody bodyKey={section.bodyKey} variant={section.variant} />
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          );
        })}

        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {t('marketing.restrictedItems.backHome')}
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              {t('marketing.restrictedItems.openApp')}
            </Link>
            <Link
              href="/trust"
              className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
            >
              {t('marketing.restrictedItems.trustCenter')}
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
            >
              {t('marketing.restrictedItems.faq')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
