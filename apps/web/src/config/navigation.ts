/**
 * Navigation architecture (data only — no screens implemented here).
 *
 * Encodes the future information architecture for the three product modes and
 * the marketing site. Gating flags (`requiresKyc`, `requiresSubscription`)
 * capture Wayly's core access rules now so the eventual nav components and route
 * guards stay consistent. Routes referenced here are created in later milestones.
 */

export type UserMode = 'sender' | 'wayler' | 'admin';

export interface NavItem {
  label: string;
  /** Anchor (#section) for marketing, or a route path for app/admin. */
  href: string;
  /** lucide-react icon name; resolved by nav components later. */
  icon?: string;
  /** Hidden/locked until the user completes KYC verification. */
  requiresKyc?: boolean;
  /** Hidden/locked until the Wayler holds an active access package. */
  requiresSubscription?: boolean;
}

/** Marketing landing anchors — map 1:1 to the landing page sections. */
export const marketingNav: NavItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'International', href: '#international' },
  { label: 'Local', href: '#local' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Trust Center', href: '/trust' },
  { label: 'FAQ', href: '/faq' },
];

/** Sender mode (creates delivery requests). */
export const senderNav: NavItem[] = [
  { label: 'Home', href: '/home', icon: 'home' },
  { label: 'Create order', href: '/orders/new', icon: 'plus-circle', requiresKyc: true },
  { label: 'My orders', href: '/orders', icon: 'package', requiresKyc: true },
  { label: 'Messages', href: '/chat', icon: 'message-circle', requiresKyc: true },
  { label: 'Wallet', href: '/wallet', icon: 'wallet', requiresKyc: true },
];

/** Wayler mode (browses feed, accepts deliveries, publishes trips). */
export const waylerNav: NavItem[] = [
  { label: 'Feed', href: '/feed', icon: 'list', requiresKyc: true },
  { label: 'My trips', href: '/trips', icon: 'route', requiresKyc: true },
  {
    label: 'Deliveries',
    href: '/deliveries',
    icon: 'truck',
    requiresKyc: true,
    requiresSubscription: true,
  },
  { label: 'Messages', href: '/chat', icon: 'message-circle', requiresKyc: true },
  { label: 'Earnings', href: '/earnings', icon: 'wallet', requiresKyc: true },
];

/** Admin / Arbitrator mode. */
export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
  { label: 'Users', href: '/admin/users', icon: 'users' },
  { label: 'KYC review', href: '/admin/kyc', icon: 'shield-check' },
  { label: 'Orders', href: '/admin/orders', icon: 'package' },
  { label: 'Disputes', href: '/admin/disputes', icon: 'gavel' },
  { label: 'Payments', href: '/admin/payments', icon: 'credit-card' },
  { label: 'Fees', href: '/admin/fees', icon: 'percent' },
  { label: 'Audit log', href: '/admin/audit', icon: 'scroll-text' },
];

export const navigationByMode: Record<UserMode, NavItem[]> = {
  sender: senderNav,
  wayler: waylerNav,
  admin: adminNav,
};
