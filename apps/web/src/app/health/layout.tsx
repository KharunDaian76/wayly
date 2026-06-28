import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'System health',
  description:
    'Technical API health check for Wayly — operator diagnostics, not a public marketing page.',
  path: '/health',
  noIndex: true,
});

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
