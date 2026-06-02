'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppModeProvider } from '@/lib/app-mode/app-mode-context';
import { I18nProvider } from '@/lib/i18n/i18n-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <AuthProvider>
          <AppModeProvider>{children}</AppModeProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
