import { siteConfig } from '@/config/site';

/** Canonical public site URL for metadata, sitemap, and robots. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.url;
  return url.replace(/\/$/, '');
}
