import type { User } from '@prisma/client';
import type { AdminUserQueueItem, UserProfile } from '@wayly/types';
import { KycStatus, UserAccountStatus, UserRole } from '@wayly/types';

/** Maps a Prisma User with counts to the admin trust & safety queue shape. */
export function toAdminUserQueueItem(
  user: Pick<
    User,
    | 'id'
    | 'email'
    | 'displayName'
    | 'roles'
    | 'kycStatus'
    | 'verified'
    | 'accountStatus'
    | 'suspendedAt'
    | 'createdAt'
    | 'updatedAt'
  > & {
    _count: {
      sentDeliveryOrders: number;
      acceptedDeliveryOrders: number;
      disputesOpened: number;
    };
  },
): AdminUserQueueItem {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    roles: user.roles as UserRole[],
    kycStatus: user.kycStatus as KycStatus,
    verified: user.verified,
    accountStatus: user.accountStatus as UserAccountStatus,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    postedOrdersCount: user._count.sentDeliveryOrders,
    acceptedOrdersCount: user._count.acceptedDeliveryOrders,
    disputesCount: user._count.disputesOpened,
    latestActivityAt: user.updatedAt.toISOString(),
  };
}

/** Maps a Prisma User to the safe API UserProfile (never exposes passwordHash). */
export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    roles: user.roles as UserRole[],
    verified: user.verified,
    kycStatus: user.kycStatus as KycStatus,
    phoneVerified: user.phoneVerified,
    connectOnboarded: user.connectOnboarded,
    locale: user.locale,
    country: user.country,
    accountStatus: user.accountStatus as UserAccountStatus,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
