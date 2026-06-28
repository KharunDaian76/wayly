import type { Metadata } from 'next';

import { HowItWorksPage } from '@/components/marketing/how-it-works-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'How it works',
  description: `How ${siteConfig.name} works for Senders and Waylers — request, order, chat, delivery, and honest limits on payments and guarantees.`,
};

export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
