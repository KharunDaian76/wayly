import { HelpCenterPage } from '@/components/marketing/help-center-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Help Center',
  description: `Central hub for ${siteConfig.name} public guides — how it works, trust & safety, fees, disputes, privacy, and honest platform limits.`,
  path: '/help',
});

export default function HelpCenterRoute() {
  return <HelpCenterPage />;
}
