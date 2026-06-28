import { PolicyPage } from '@/components/marketing/policy-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Community Guidelines (draft)',
  description: `Draft ${siteConfig.name} community guidelines — honest listings, in-platform communication, lawful conduct, and respectful dispute use. General guidance only, not legal advice.`,
  path: '/community-guidelines',
});

export default function CommunityGuidelinesRoute() {
  return <PolicyPage variant="communityGuidelines" />;
}
