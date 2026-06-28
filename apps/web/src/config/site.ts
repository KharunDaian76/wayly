export const siteConfig = {
  name: 'Wayly',
  tagline: 'Send anything. Anywhere. With anyone going your way.',
  description:
    'Wayly is a peer-to-peer delivery marketplace connecting Senders with travelers and local Waylers — verified profiles, clear payment status, dispute review tools, trust & safety guidance, and public help resources. Payment and KYC limits are documented honestly.',
  url: 'https://wayly-web.vercel.app',
  links: {
    twitter: 'https://twitter.com/wayly',
    instagram: 'https://instagram.com/wayly',
  },
} as const;

export type SiteConfig = typeof siteConfig;
