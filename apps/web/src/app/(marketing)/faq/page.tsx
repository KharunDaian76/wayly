import { FaqPage } from '@/components/marketing/faq-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'FAQ',
  description: `Common questions about ${siteConfig.name} for Senders and Waylers — safety, payments, disputes, local data, and current platform limits.`,
  path: '/faq',
});

export default function FaqRoute() {
  return <FaqPage />;
}
