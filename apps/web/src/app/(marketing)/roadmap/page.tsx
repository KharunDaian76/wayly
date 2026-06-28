import { RoadmapPage } from '@/components/marketing/roadmap-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Launch status & roadmap',
  description: `Transparent ${siteConfig.name} launch status — what is available today, what is mock or manual, planned production work, and honest limits on guarantees.`,
  path: '/roadmap',
});

export default function RoadmapRoute() {
  return <RoadmapPage />;
}
