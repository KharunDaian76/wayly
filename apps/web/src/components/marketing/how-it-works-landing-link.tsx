'use client';

import Link from 'next/link';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type HowItWorksLandingLinkProps = {
  className?: string;
  variant?: 'inline' | 'card';
};

export function HowItWorksLandingLink({
  className,
  variant = 'inline',
}: HowItWorksLandingLinkProps) {
  const { t } = useI18n();

  if (variant === 'card') {
    return (
      <Link
        href="/how-it-works"
        className={cn(
          'group flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/30 hover:bg-card/80',
          className,
        )}
      >
        <span className="text-sm font-semibold text-foreground group-hover:text-primary">
          {t('marketing.howItWorks.navLabel')}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('marketing.landing.howItWorksLink')}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/how-it-works"
      className={cn(
        'text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline',
        className,
      )}
    >
      {t('marketing.landing.howItWorksLink')}
    </Link>
  );
}
