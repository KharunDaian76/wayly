import type { Metadata } from 'next';

import { FaqPage } from '@/components/marketing/faq-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'FAQ',
  description: `Common questions about ${siteConfig.name} for Senders and Waylers — safety, payments, disputes, local data, and current platform limits.`,
};

export default function FaqRoute() {
  return <FaqPage />;
}
