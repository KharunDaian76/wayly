export const siteConfig = {
  name: 'Wayly',
  tagline: 'Send anything. Anywhere. With anyone going your way.',
  description:
    'Wayly is a peer-to-peer delivery marketplace connecting senders with trusted travelers and local couriers — secure escrow, verified identities, real-time tracking.',
  url: 'https://wayly.app',
  links: {
    twitter: 'https://twitter.com/wayly',
    instagram: 'https://instagram.com/wayly',
  },
} as const;

export type SiteConfig = typeof siteConfig;
