import { SupportDisputesPage } from '@/components/marketing/support-disputes-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Support & dispute help',
  description: `What to do when a ${siteConfig.name} delivery needs attention — first steps, evidence guidance, and honest limits on dispute review (not legal advice).`,
  path: '/support-disputes',
});

export default function SupportDisputesRoute() {
  return <SupportDisputesPage />;
}
