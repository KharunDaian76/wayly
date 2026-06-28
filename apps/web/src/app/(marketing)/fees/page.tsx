import { FeesPage } from '@/components/marketing/fees-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Fees & payment transparency',
  description: `Honest payment and fee information for ${siteConfig.name} — mock/manual payment status today, no real escrow, and documented limits on refunds or payouts.`,
  path: '/fees',
});

export default function FeesRoute() {
  return <FeesPage />;
}
