import type { Metadata } from 'next';

import { PrivacyLocalDataPage } from '@/components/marketing/privacy-local-data-page';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy & local saved data',
  description: `How ${siteConfig.name} browser-local saved data works — templates, drafts, shortlist, and clear controls. Not synced to your account.`,
};

export default function PrivacyLocalDataRoute() {
  return <PrivacyLocalDataPage />;
}
