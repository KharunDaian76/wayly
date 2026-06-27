import type { Metadata } from 'next';

import { TrustCenterPage } from '@/components/marketing/trust-center-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Trust Center',
  description: `How ${siteConfig.name} handles marketplace safety, payments, disputes, and local data — with honest limits on what the platform guarantees today.`,
};

export default function TrustCenterRoute() {
  return <TrustCenterPage />;
}
