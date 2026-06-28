import { PolicyCenterPage } from '@/components/marketing/policy-center-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Policy Center',
  description: `Draft platform rules, privacy guidance, and responsible-use policies for ${siteConfig.name} — general guidance only, not legal advice or a final lawyer-reviewed agreement.`,
  path: '/policies',
});

export default function PolicyCenterRoute() {
  return <PolicyCenterPage />;
}
