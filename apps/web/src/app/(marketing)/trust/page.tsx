import { TrustCenterPage } from '@/components/marketing/trust-center-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Trust Center',
  description: `How ${siteConfig.name} handles marketplace safety, payment status, disputes, and local data — with honest limits on what the platform guarantees today.`,
  path: '/trust',
});

export default function TrustCenterRoute() {
  return <TrustCenterPage />;
}
