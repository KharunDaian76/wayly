import type { Metadata } from 'next';

import { FeesPage } from '@/components/marketing/fees-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Fees & payment transparency',
  description: `Honest payment and fee information for ${siteConfig.name} — mock/manual status today, no escrow or guaranteed refunds, and future provider work.`,
};

export default function FeesRoute() {
  return <FeesPage />;
}
