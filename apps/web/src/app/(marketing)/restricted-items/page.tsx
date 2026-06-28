import { RestrictedItemsPage } from '@/components/marketing/restricted-items-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Restricted Items',
  description: `Responsible use guidance for ${siteConfig.name} — user responsibilities for laws, customs, and transport rules. General guidance only; not legal advice.`,
  path: '/restricted-items',
});

export default function RestrictedItemsRoute() {
  return <RestrictedItemsPage />;
}
