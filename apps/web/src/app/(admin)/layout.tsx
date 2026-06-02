/**
 * Admin / Arbitrator shell (scaffold only — no screens yet).
 *
 * Hosts the admin dashboard under the /admin path segment. Future
 * responsibilities that attach HERE without restructuring:
 *   - Admin/arbitrator role guard (RBAC)
 *   - Desktop-first dashboard chrome: sidebar nav (see adminNav), data tables
 *   - Moderation, KYC review, dispute arbitration, fee config, audit log views
 *
 * Kept intentionally minimal so the foundation review stays focused.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
