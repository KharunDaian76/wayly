import Link from 'next/link';

import { ThemeToggle } from './theme-toggle';

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
          {/* Auth routes are wired in M1; placeholders for now. */}
          <Link
            href="#"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="#"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
