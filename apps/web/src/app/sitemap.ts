import type { MetadataRoute } from 'next';

import { publicMarketingPaths } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return publicMarketingPaths.map((path) => ({
    url: path === '/' ? baseUrl : `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/help' ? 0.9 : 0.8,
  }));
}
