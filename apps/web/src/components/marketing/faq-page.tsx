'use client';

import {
  CreditCard,
  HardDrive,
  HelpCircle,
  MapPin,
  Package,
  Rocket,
  Scale,
  Shield,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { FadeIn } from '@/components/motion';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type FaqItem = {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
};

type FaqGroup = {
  id: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  items: FaqItem[];
};

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    icon: Rocket,
    titleKey: 'marketing.faq.gettingStartedTitle',
    items: [
      {
        questionKey: 'marketing.faq.whatIsWaylyQuestion',
        answerKey: 'marketing.faq.whatIsWaylyAnswer',
      },
      {
        questionKey: 'marketing.faq.whoCanUseQuestion',
        answerKey: 'marketing.faq.whoCanUseAnswer',
      },
      {
        questionKey: 'marketing.faq.requestToOrderQuestion',
        answerKey: 'marketing.faq.requestToOrderAnswer',
      },
    ],
  },
  {
    id: 'senders',
    icon: Package,
    titleKey: 'marketing.faq.sendersTitle',
    items: [
      {
        questionKey: 'marketing.faq.findWaylerQuestion',
        answerKey: 'marketing.faq.findWaylerAnswer',
      },
      {
        questionKey: 'marketing.faq.requestIncludeQuestion',
        answerKey: 'marketing.faq.requestIncludeAnswer',
      },
      {
        questionKey: 'marketing.faq.saveRequestTemplatesQuestion',
        answerKey: 'marketing.faq.saveRequestTemplatesAnswer',
      },
    ],
  },
  {
    id: 'waylers',
    icon: Truck,
    titleKey: 'marketing.faq.waylersTitle',
    items: [
      {
        questionKey: 'marketing.faq.publishAvailabilityQuestion',
        answerKey: 'marketing.faq.publishAvailabilityAnswer',
      },
      {
        questionKey: 'marketing.faq.tripVsLocalQuestion',
        answerKey: 'marketing.faq.tripVsLocalAnswer',
      },
      {
        questionKey: 'marketing.faq.saveAvailabilityTemplatesQuestion',
        answerKey: 'marketing.faq.saveAvailabilityTemplatesAnswer',
      },
    ],
  },
  {
    id: 'safety',
    icon: Shield,
    titleKey: 'marketing.faq.safetyTitle',
    items: [
      {
        questionKey: 'marketing.faq.itemsNotAllowedQuestion',
        answerKey: 'marketing.faq.itemsNotAllowedAnswer',
      },
      {
        questionKey: 'marketing.faq.verifyLegalityQuestion',
        answerKey: 'marketing.faq.verifyLegalityAnswer',
      },
      {
        questionKey: 'marketing.faq.communicateSafelyQuestion',
        answerKey: 'marketing.faq.communicateSafelyAnswer',
      },
    ],
  },
  {
    id: 'payments',
    icon: CreditCard,
    titleKey: 'marketing.faq.paymentsTitle',
    items: [
      {
        questionKey: 'marketing.faq.realEscrowQuestion',
        answerKey: 'marketing.faq.realEscrowAnswer',
      },
      {
        questionKey: 'marketing.faq.refundsGuaranteedQuestion',
        answerKey: 'marketing.faq.refundsGuaranteedAnswer',
      },
      {
        questionKey: 'marketing.faq.paymentStatusQuestion',
        answerKey: 'marketing.faq.paymentStatusAnswer',
      },
    ],
  },
  {
    id: 'disputes',
    icon: Scale,
    titleKey: 'marketing.faq.disputesTitle',
    items: [
      {
        questionKey: 'marketing.faq.whenOpenDisputeQuestion',
        answerKey: 'marketing.faq.whenOpenDisputeAnswer',
      },
      {
        questionKey: 'marketing.faq.whatEvidenceQuestion',
        answerKey: 'marketing.faq.whatEvidenceAnswer',
      },
      {
        questionKey: 'marketing.faq.legalAdviceQuestion',
        answerKey: 'marketing.faq.legalAdviceAnswer',
      },
    ],
  },
  {
    id: 'local-data',
    icon: HardDrive,
    titleKey: 'marketing.faq.localDataTitle',
    items: [
      {
        questionKey: 'marketing.faq.whatDataLocalQuestion',
        answerKey: 'marketing.faq.whatDataLocalAnswer',
      },
      {
        questionKey: 'marketing.faq.localDataSyncedQuestion',
        answerKey: 'marketing.faq.localDataSyncedAnswer',
      },
      {
        questionKey: 'marketing.faq.clearSavedDataQuestion',
        answerKey: 'marketing.faq.clearSavedDataAnswer',
      },
    ],
  },
  {
    id: 'limitations',
    icon: MapPin,
    titleKey: 'marketing.faq.limitationsTitle',
    items: [
      {
        questionKey: 'marketing.faq.mockManualQuestion',
        answerKey: 'marketing.faq.mockManualAnswer',
      },
      {
        questionKey: 'marketing.faq.plannedIntegrationsQuestion',
        answerKey: 'marketing.faq.plannedIntegrationsAnswer',
      },
      {
        questionKey: 'marketing.faq.commercialLaunchQuestion',
        answerKey: 'marketing.faq.commercialLaunchAnswer',
      },
    ],
  },
];

function FaqAccordionItem({ questionKey, answerKey }: FaqItem) {
  const { t } = useI18n();

  return (
    <details className="group rounded-xl border border-border/60 bg-background/40 open:bg-card/50">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span className="flex-1">{t(questionKey)}</span>
      </summary>
      <div className="border-t border-border/40 px-4 pb-4 pl-11 pt-2">
        <p className="text-sm leading-relaxed text-muted-foreground">{t(answerKey)}</p>
      </div>
    </details>
  );
}

export function FaqPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="container relative py-16 sm:py-20">
          <FadeIn>
            <p className="text-sm font-medium text-primary">{t('marketing.faq.navLabel')}</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('marketing.faq.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('marketing.faq.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="container flex flex-col gap-10 pb-16 pt-8">
        {FAQ_GROUPS.map((group, groupIndex) => {
          const Icon = group.icon;
          return (
            <FadeIn key={group.id} delay={groupIndex * 0.03}>
              <section id={group.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-primary"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                    {t(group.titleKey)}
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <FaqAccordionItem key={item.questionKey} {...item} />
                  ))}
                </div>
              </section>
            </FadeIn>
          );
        })}

        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {t('marketing.faq.backHome')}
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              {t('marketing.faq.openApp')}
            </Link>
            <Link
              href="/trust"
              className={cn(
                'inline-flex items-center justify-center rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card/80',
              )}
            >
              {t('marketing.faq.trustCenter')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
