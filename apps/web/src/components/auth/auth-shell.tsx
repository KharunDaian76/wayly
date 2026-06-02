'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { LanguageSelect } from '@/components/language-select';
import { ThemeToggle } from '@/components/theme-toggle';
import { siteConfig } from '@/config/site';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container } from '@wayly/ui';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelect />
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <main className="relative z-10 flex flex-1 items-center py-12">
        <Container className="flex justify-center">
          <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </Container>
      </main>
    </div>
  );
}
