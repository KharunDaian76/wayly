import { PolicyPage } from '@/components/marketing/policy-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Terms of Use (draft guidance)',
  description: `Draft ${siteConfig.name} terms guidance — responsible use, payment transparency limits, disputes, and restricted items. General platform guidance only, not legal advice.`,
  path: '/terms',
});

export default function TermsRoute() {
  return <PolicyPage variant="terms" />;
}
