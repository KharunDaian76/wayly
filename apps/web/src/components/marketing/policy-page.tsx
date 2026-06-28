'use client';

import {
  Ban,
  CheckCircle,
  CreditCard,
  Database,
  FileQuestion,
  HardDrive,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  Rocket,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type PolicyDocumentVariant = 'terms' | 'privacy' | 'communityGuidelines';

type PolicySection = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  variant?: 'default' | 'warning';
  linkHref?: string;
  linkLabelKey?: TranslationKey;
};

type PolicyDocumentConfig = {
  navLabelKey: TranslationKey;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  noticeKey: TranslationKey;
  sections: PolicySection[];
};

const POLICY_DOCUMENTS: Record<PolicyDocumentVariant, PolicyDocumentConfig> = {
  terms: {
    navLabelKey: 'marketing.terms.navLabel',
    titleKey: 'marketing.terms.title',
    subtitleKey: 'marketing.terms.subtitle',
    noticeKey: 'marketing.policies.draftNotice',
    sections: [
      {
        id: 'using-responsibly',
        icon: Shield,
        titleKey: 'marketing.terms.usingResponsiblyTitle',
        bodyKey: 'marketing.terms.usingResponsiblyBody',
      },
      {
        id: 'sender-responsibilities',
        icon: Package,
        titleKey: 'marketing.terms.senderResponsibilitiesTitle',
        bodyKey: 'marketing.terms.senderResponsibilitiesBody',
      },
      {
        id: 'wayler-responsibilities',
        icon: Truck,
        titleKey: 'marketing.terms.waylerResponsibilitiesTitle',
        bodyKey: 'marketing.terms.waylerResponsibilitiesBody',
      },
      {
        id: 'payments-fees',
        icon: CreditCard,
        titleKey: 'marketing.terms.paymentsTitle',
        bodyKey: 'marketing.terms.paymentsBody',
        linkHref: '/fees',
        linkLabelKey: 'marketing.fees.navLabel',
      },
      {
        id: 'disputes-evidence',
        icon: Scale,
        titleKey: 'marketing.terms.disputesTitle',
        bodyKey: 'marketing.terms.disputesBody',
        linkHref: '/support-disputes',
        linkLabelKey: 'marketing.supportDisputes.navLabel',
      },
      {
        id: 'restricted-items',
        icon: MapPin,
        titleKey: 'marketing.terms.restrictedItemsTitle',
        bodyKey: 'marketing.terms.restrictedItemsBody',
        linkHref: '/restricted-items',
        linkLabelKey: 'marketing.restrictedItems.navLabel',
      },
      {
        id: 'platform-limits',
        icon: ShieldAlert,
        titleKey: 'marketing.terms.platformLimitsTitle',
        bodyKey: 'marketing.terms.platformLimitsBody',
        variant: 'warning',
      },
      {
        id: 'no-guarantee',
        icon: ShieldAlert,
        titleKey: 'marketing.terms.noGuaranteeTitle',
        bodyKey: 'marketing.terms.noGuaranteeBody',
        variant: 'warning',
      },
    ],
  },
  privacy: {
    navLabelKey: 'marketing.privacy.navLabel',
    titleKey: 'marketing.privacy.title',
    subtitleKey: 'marketing.privacy.subtitle',
    noticeKey: 'marketing.policies.draftNotice',
    sections: [
      {
        id: 'account-data',
        icon: Database,
        titleKey: 'marketing.privacy.accountDataTitle',
        bodyKey: 'marketing.privacy.accountDataBody',
      },
      {
        id: 'local-saved-data',
        icon: HardDrive,
        titleKey: 'marketing.privacy.localSavedDataTitle',
        bodyKey: 'marketing.privacy.localSavedDataBody',
        linkHref: '/privacy-local-data',
        linkLabelKey: 'marketing.privacyLocalData.navLabel',
      },
      {
        id: 'local-data-not-included',
        icon: FileQuestion,
        titleKey: 'marketing.privacy.localDataNotIncludedTitle',
        bodyKey: 'marketing.privacy.localDataNotIncludedBody',
      },
      {
        id: 'user-controls',
        icon: Settings,
        titleKey: 'marketing.privacy.userControlsTitle',
        bodyKey: 'marketing.privacy.userControlsBody',
      },
      {
        id: 'sensitive-info',
        icon: Lock,
        titleKey: 'marketing.privacy.sensitiveInfoTitle',
        bodyKey: 'marketing.privacy.sensitiveInfoBody',
      },
      {
        id: 'future-work',
        icon: Rocket,
        titleKey: 'marketing.privacy.futureWorkTitle',
        bodyKey: 'marketing.privacy.futureWorkBody',
      },
    ],
  },
  communityGuidelines: {
    navLabelKey: 'marketing.communityGuidelines.navLabel',
    titleKey: 'marketing.communityGuidelines.title',
    subtitleKey: 'marketing.communityGuidelines.subtitle',
    noticeKey: 'marketing.policies.draftNotice',
    sections: [
      {
        id: 'honest-items',
        icon: CheckCircle,
        titleKey: 'marketing.communityGuidelines.honestItemsTitle',
        bodyKey: 'marketing.communityGuidelines.honestItemsBody',
      },
      {
        id: 'communication',
        icon: MessageCircle,
        titleKey: 'marketing.communityGuidelines.communicationTitle',
        bodyKey: 'marketing.communityGuidelines.communicationBody',
      },
      {
        id: 'laws-customs',
        icon: Scale,
        titleKey: 'marketing.communityGuidelines.lawsCustomsTitle',
        bodyKey: 'marketing.communityGuidelines.lawsCustomsBody',
        linkHref: '/restricted-items',
        linkLabelKey: 'marketing.restrictedItems.navLabel',
      },
      {
        id: 'payment-details',
        icon: CreditCard,
        titleKey: 'marketing.communityGuidelines.paymentDetailsTitle',
        bodyKey: 'marketing.communityGuidelines.paymentDetailsBody',
      },
      {
        id: 'decline-unsafe',
        icon: ShieldAlert,
        titleKey: 'marketing.communityGuidelines.declineUnsafeTitle',
        bodyKey: 'marketing.communityGuidelines.declineUnsafeBody',
      },
      {
        id: 'disputes-respect',
        icon: Scale,
        titleKey: 'marketing.communityGuidelines.disputesRespectTitle',
        bodyKey: 'marketing.communityGuidelines.disputesRespectBody',
        linkHref: '/support-disputes',
        linkLabelKey: 'marketing.supportDisputes.navLabel',
      },
      {
        id: 'prohibited-conduct',
        icon: Ban,
        titleKey: 'marketing.communityGuidelines.prohibitedConductTitle',
        bodyKey: 'marketing.communityGuidelines.prohibitedConductBody',
        variant: 'warning',
      },
    ],
  },
};

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

type PolicyPageProps = {
  variant: PolicyDocumentVariant;
};

export function PolicyPage({ variant }: PolicyPageProps) {
  const { t } = useI18n();
  const config = POLICY_DOCUMENTS[variant];

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
            <p className="text-sm font-medium text-primary">{t(config.navLabelKey)}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t(config.titleKey)}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t(config.subtitleKey)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/policies"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {t('marketing.policies.navLabel')}
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                {t('marketing.policies.openApp')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container py-8">
        <FadeIn>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {t(config.noticeKey)}
          </div>
        </FadeIn>
      </section>

      <div className="container flex flex-col gap-6 pb-16">
        {config.sections.map((section, index) => {
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
                    {section.linkHref && section.linkLabelKey ? (
                      <Link
                        href={section.linkHref}
                        className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {t(section.linkLabelKey)} →
                      </Link>
                    ) : null}
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
              {t('marketing.policies.backHome')}
            </Link>
            <Link
              href="/policies"
              className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
            >
              {t('marketing.policies.navLabel')}
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80"
            >
              {t('marketing.helpCenter.navLabel')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
