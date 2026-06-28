'use client';

import {
  AlertTriangle,
  ExternalLink,
  FileText,
  LifeBuoy,
  MessageCircle,
  Phone,
  Scale,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type SupportSection = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  avoidTitleKey?: TranslationKey;
  avoidBodyKey?: TranslationKey;
  variant?: 'default' | 'warning' | 'highlight';
};

const SECTIONS: SupportSection[] = [
  {
    id: 'first-steps',
    icon: MessageCircle,
    titleKey: 'marketing.supportDisputes.firstStepsTitle',
    bodyKey: 'marketing.supportDisputes.firstStepsBody',
  },
  {
    id: 'when-to-open',
    icon: Scale,
    titleKey: 'marketing.supportDisputes.whenToOpenTitle',
    bodyKey: 'marketing.supportDisputes.whenToOpenBody',
  },
  {
    id: 'evidence',
    icon: FileText,
    titleKey: 'marketing.supportDisputes.evidenceTitle',
    bodyKey: 'marketing.supportDisputes.evidenceBody',
    avoidTitleKey: 'marketing.supportDisputes.avoidUploadingTitle',
    avoidBodyKey: 'marketing.supportDisputes.avoidUploadingBody',
  },
  {
    id: 'tools',
    icon: ClipboardList,
    titleKey: 'marketing.supportDisputes.toolsTitle',
    bodyKey: 'marketing.supportDisputes.toolsBody',
  },
  {
    id: 'no-guarantees',
    icon: ShieldAlert,
    titleKey: 'marketing.supportDisputes.noGuaranteesTitle',
    bodyKey: 'marketing.supportDisputes.noGuaranteesBody',
    variant: 'warning',
  },
  {
    id: 'safety-escalation',
    icon: Phone,
    titleKey: 'marketing.supportDisputes.safetyEscalationTitle',
    bodyKey: 'marketing.supportDisputes.safetyEscalationBody',
    variant: 'highlight',
  },
];

type HelpfulLink = {
  href: string;
  labelKey: TranslationKey;
};

const HELPFUL_LINKS: HelpfulLink[] = [
  { href: '/help', labelKey: 'marketing.helpCenter.navLabel' },
  { href: '/trust', labelKey: 'marketing.supportDisputes.trustCenter' },
  { href: '/faq', labelKey: 'marketing.supportDisputes.faq' },
  { href: '/restricted-items', labelKey: 'marketing.supportDisputes.restrictedItems' },
  { href: '/fees', labelKey: 'marketing.supportDisputes.fees' },
  { href: '/privacy-local-data', labelKey: 'marketing.supportDisputes.privacyLocalData' },
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

export function SupportDisputesPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">
              {t('marketing.supportDisputes.navLabel')}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.supportDisputes.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.supportDisputes.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.supportDisputes.openApp')}
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.supportDisputes.trustCenter')}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
              >
                {t('marketing.supportDisputes.faq')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-amber-700/90 dark:text-amber-400/90"
              aria-hidden
            />
            <p>{t('marketing.supportDisputes.emergencyNotice')}</p>
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-10">
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
                    : section.variant === 'highlight'
                      ? 'border-primary/20 bg-primary/[0.04]'
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
                    {section.avoidTitleKey && section.avoidBodyKey ? (
                      <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          {t(section.avoidTitleKey)}
                        </h3>
                        <div className="mt-2">
                          <SectionBody bodyKey={section.avoidBodyKey} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            </FadeIn>
          );
        })}
      </div>

      <section className="container pb-16">
        <FadeIn delay={0.15}>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
              aria-hidden
            >
              <LifeBuoy className="size-4" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t('marketing.supportDisputes.helpfulLinksTitle')}
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HELPFUL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-border hover:bg-card/70"
              >
                <span>{t(link.labelKey)}</span>
                <ExternalLink
                  className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex w-fit items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {t('marketing.supportDisputes.backHome')}
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
