'use client';

import Link from 'next/link';

import { useI18n } from '@/lib/i18n/i18n-context';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/help" className="transition-colors hover:text-foreground">
            {t('marketing.helpCenter.navLabel')}
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-foreground">
            {t('marketing.howItWorks.navLabel')}
          </Link>
          <Link href="/trust" className="transition-colors hover:text-foreground">
            {t('marketing.trustCenter.navLabel')}
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            {t('marketing.faq.navLabel')}
          </Link>
          <Link href="/restricted-items" className="transition-colors hover:text-foreground">
            {t('marketing.restrictedItems.navLabel')}
          </Link>
          <Link href="/fees" className="transition-colors hover:text-foreground">
            {t('marketing.fees.navLabel')}
          </Link>
          <Link href="/privacy-local-data" className="transition-colors hover:text-foreground">
            {t('marketing.privacyLocalData.navLabel')}
          </Link>
          <Link href="/support-disputes" className="transition-colors hover:text-foreground">
            {t('marketing.supportDisputes.navLabel')}
          </Link>
          <Link href="/policies" className="transition-colors hover:text-foreground">
            {t('marketing.policies.navLabel')}
          </Link>
          <Link href="/roadmap" className="transition-colors hover:text-foreground">
            {t('marketing.roadmap.navLabel')}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            {t('marketing.terms.navLabel')}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            {t('marketing.privacy.navLabel')}
          </Link>
          <Link href="/community-guidelines" className="transition-colors hover:text-foreground">
            {t('marketing.communityGuidelines.navLabel')}
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
