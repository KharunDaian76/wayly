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
          <Link href="/trust" className="transition-colors hover:text-foreground">
            {t('marketing.trustCenter.navLabel')}
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            {t('marketing.faq.navLabel')}
          </Link>
          {/* Legal pages are added in a later milestone. */}
          <Link href="#" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
