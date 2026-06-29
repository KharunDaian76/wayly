import Link from 'next/link';

import { SiteHeaderAuthActions } from '@/components/site-header-auth-actions';
import { ThemeToggle } from '@/components/theme-toggle';

import { marketingNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {marketingNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SiteHeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
