import type { Metadata } from 'next';

import { RestrictedItemsPage } from '@/components/marketing/restricted-items-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Restricted Items',
  description: `Responsible use guidance for ${siteConfig.name} — what not to send, user responsibilities, and honest limits. General guidance only; not legal advice.`,
};

export default function RestrictedItemsRoute() {
  return <RestrictedItemsPage />;
}
