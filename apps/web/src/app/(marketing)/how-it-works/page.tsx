import { HowItWorksPage } from '@/components/marketing/how-it-works-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'How it works',
  description: `How ${siteConfig.name} works for Senders and Waylers — requests, orders, chat, delivery proof, and transparent limits on payments and guarantees.`,
  path: '/how-it-works',
});

export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
