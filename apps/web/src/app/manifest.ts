import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

/**
 * PWA manifest (served at /manifest.webmanifest, auto-linked by Next).
 * Icon assets are produced in a dedicated design pass — see public/icons/README.md.
 *
 * Offline strategy (deferred): a Workbox-based service worker with an app-shell
 * precache + runtime caching is added in the PWA milestone. This manifest makes
 * the app installable now.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0b',
    theme_color: '#7c5cff',
    categories: ['shopping', 'travel', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
