'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { I18nProvider } from '@/lib/i18n/i18n-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
