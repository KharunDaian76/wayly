'use client';

import type { UserRole } from '@wayly/types';
import { UserRole as UserRoleEnum } from '@wayly/types';
import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';

import { AdminDisputesQueuePanel } from '@/components/app/admin-disputes-queue-panel';
import { AdminKycQueuePanel } from '@/components/app/admin-kyc-queue-panel';
import { AdminOrdersQueuePanel } from '@/components/app/admin-orders-queue-panel';
import { AdminPaymentsQueuePanel } from '@/components/app/admin-payments-queue-panel';
import { AdminSystemHealthPanel } from '@/components/app/admin-system-health-panel';
import { AdminUsersQueuePanel } from '@/components/app/admin-users-queue-panel';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';

export type AdminOperationsDashboardProps = {
  roles: UserRole[];
};

function formatOperationsRoles(roles: UserRole[], t: (key: TranslationKey) => string): string {
  const labels: string[] = [];
  if (roles.includes(UserRoleEnum.ADMIN)) {
    labels.push(t('app.admin.roleAdmin'));
  }
  if (roles.includes(UserRoleEnum.ARBITRATOR)) {
    labels.push(t('app.admin.roleArbitrator'));
  }
  return labels.join(' · ');
}

export function AdminOperationsDashboard({ roles }: AdminOperationsDashboardProps) {
  const { t } = useI18n();

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const roleLabel = formatOperationsRoles(roles, t);

  return (
    <Card className="wayly-app-panel border-primary/20">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{t('app.admin.operationsTitle')}</CardTitle>
          <span className="wayly-status-badge wayly-status-default text-xs">
            {t('app.admin.adminOnly')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t('app.admin.operationsSubtitle')}</p>
        {roleLabel ? (
          <p className="text-xs font-medium text-muted-foreground" role="note">
            {roleLabel}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminDisputesQueuePanel roles={roles} />
          <AdminKycQueuePanel roles={roles} />
          <AdminOrdersQueuePanel roles={roles} />
          <AdminUsersQueuePanel roles={roles} />
          <AdminPaymentsQueuePanel roles={roles} />
          <AdminSystemHealthPanel roles={roles} />
        </div>
      </CardContent>
    </Card>
  );
}
