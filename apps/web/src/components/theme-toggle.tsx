'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const THEME_ORDER = ['light', 'dark', 'system'] as const;
type ThemeOption = (typeof THEME_ORDER)[number];

const ICONS: Record<ThemeOption, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="size-9" aria-hidden />;
  }

  const current = (THEME_ORDER.includes(theme as ThemeOption) ? theme : 'system') as ThemeOption;
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length]!;
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch theme (current: ${current})`}
      title={`Theme: ${current}`}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border border-border bg-background',
        'text-foreground transition-colors hover:bg-secondary focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
