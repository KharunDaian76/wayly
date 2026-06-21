import { UserRole, type UserRole as UserRoleType } from '@wayly/types';

/** True when the signed-in user may see the operations dashboard on `/app`. */
export function hasOperationsDashboardAccess(roles: readonly UserRoleType[]): boolean {
  return roles.includes(UserRole.ADMIN) || roles.includes(UserRole.ARBITRATOR);
}
