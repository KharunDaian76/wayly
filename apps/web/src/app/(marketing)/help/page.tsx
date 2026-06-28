import type { Metadata } from 'next';

import { HelpCenterPage } from '@/components/marketing/help-center-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Help Center',
  description: `Central hub for ${siteConfig.name} guides — how it works, safety, fees, disputes, and honest platform limits.`,
};

export default function HelpCenterRoute() {
  return <HelpCenterPage />;
}
