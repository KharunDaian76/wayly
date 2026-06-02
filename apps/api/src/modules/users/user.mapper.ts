import type { User } from '@prisma/client';
import type { UserProfile } from '@wayly/types';
import { KycStatus, UserRole } from '@wayly/types';

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
    createdAt: user.createdAt.toISOString(),
  };
}
