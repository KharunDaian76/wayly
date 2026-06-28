import { PrivacyLocalDataPage } from '@/components/marketing/privacy-local-data-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Privacy & local saved data',
  description: `How ${siteConfig.name} browser-local saved data works — templates, drafts, shortlist, user controls, and what is not stored on the server.`,
  path: '/privacy-local-data',
});

export default function PrivacyLocalDataRoute() {
  return <PrivacyLocalDataPage />;
}
