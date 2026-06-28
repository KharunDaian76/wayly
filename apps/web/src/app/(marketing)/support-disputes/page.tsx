import type { Metadata } from 'next';

import { SupportDisputesPage } from '@/components/marketing/support-disputes-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Support & dispute help',
  description: `What to do when a ${siteConfig.name} delivery needs attention — first steps, evidence guidance, and honest limits on disputes and refunds.`,
};

export default function SupportDisputesRoute() {
  return <SupportDisputesPage />;
}
