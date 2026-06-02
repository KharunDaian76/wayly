import { Inter, Sora } from 'next/font/google';

/**
 * Font strategy:
 *  - `Inter` for UI/body text (excellent legibility at small sizes, tabular nums).
 *  - `Sora` for display/headlines (geometric, premium, modern-startup feel).
 *
 * Both are exposed as CSS variables consumed by the Tailwind preset
 * (`--font-sans`, `--font-display`).
 */
export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontDisplay = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700', '800'],
});
