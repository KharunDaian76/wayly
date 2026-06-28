import { PolicyPage } from '@/components/marketing/policy-page';
import { siteConfig } from '@/config/site';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Privacy guidance (draft)',
  description: `Draft ${siteConfig.name} privacy guidance — account data, browser-local saved data, user controls, and future production privacy work. Not a full legal privacy policy.`,
  path: '/privacy',
});

export default function PrivacyRoute() {
  return <PolicyPage variant="privacy" />;
}
