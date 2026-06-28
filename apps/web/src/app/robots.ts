import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/login', '/register', '/health'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
