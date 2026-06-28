import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';

import { getSiteUrl } from './site-url';

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path including leading slash, e.g. `/help`. Use `/` for home. */
  path?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
}: PageMetadataInput): Metadata {
  const baseUrl = getSiteUrl();
  const normalizedPath = path === '/' ? '' : path;
  const url = `${baseUrl}${normalizedPath}`;

  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      title: `${title} · ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary',
      title: `${title} · ${siteConfig.name}`,
      description,
    },
  };
}

/** Public marketing and help routes included in the sitemap. */
export const publicMarketingPaths = [
  '/',
  '/help',
  '/how-it-works',
  '/trust',
  '/faq',
  '/restricted-items',
  '/fees',
  '/privacy-local-data',
  '/support-disputes',
  '/policies',
  '/terms',
  '/privacy',
  '/community-guidelines',
] as const;
