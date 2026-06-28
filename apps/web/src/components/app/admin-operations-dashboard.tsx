'use client';

import type { UserRole } from '@wayly/types';
import { UserRole as UserRoleEnum } from '@wayly/types';
import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdminDisputesQueuePanel } from '@/components/app/admin-disputes-queue-panel';
import { AdminReviewsQueuePanel } from '@/components/app/admin-reviews-queue-panel';
import { AdminSupportTicketsQueuePanel } from '@/components/app/admin-support-tickets-queue-panel';
import { AdminKycQueuePanel } from '@/components/app/admin-kyc-queue-panel';
import { AdminOperationsOverviewPanel } from '@/components/app/admin-operations-overview-panel';
import { AdminOrdersQueuePanel } from '@/components/app/admin-orders-queue-panel';
import { AdminPaymentsQueuePanel } from '@/components/app/admin-payments-queue-panel';
import { AdminSystemHealthPanel } from '@/components/app/admin-system-health-panel';
import { AdminUsersQueuePanel } from '@/components/app/admin-users-queue-panel';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import {
  type AdminPanelRef,
  type AdminTriageKpiKey,
  type AdminTriageRequest,
  type AdminTriageTarget,
  buildTriageFromKpi,
} from '@/lib/admin/admin-triage';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

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
  const [triageRequest, setTriageRequest] = useState<AdminTriageRequest | null>(null);
  const [highlightTarget, setHighlightTarget] = useState<AdminTriageTarget | null>(null);
  const [triageBannerKey, setTriageBannerKey] = useState<TranslationKey | null>(null);

  const kycPanelRef = useRef<HTMLElement>(null);
  const disputesPanelRef = useRef<HTMLElement>(null);
  const usersPanelRef = useRef<HTMLElement>(null);
  const ordersPanelRef = useRef<HTMLElement>(null);
  const paymentsPanelRef = useRef<HTMLElement>(null);
  const systemHealthPanelRef = useRef<HTMLElement>(null);

  const panelRefs = useMemo(
    (): Record<AdminTriageTarget, AdminPanelRef> => ({
      kyc: kycPanelRef,
      disputes: disputesPanelRef,
      users: usersPanelRef,
      orders: ordersPanelRef,
      payments: paymentsPanelRef,
      systemHealth: systemHealthPanelRef,
    }),
    [],
  );

  const handleTriageShortcut = useCallback(
    (kpiKey: AdminTriageKpiKey) => {
      const spec = buildTriageFromKpi(kpiKey);
      const request: AdminTriageRequest = { ...spec, token: Date.now() };
      setTriageRequest(request);
      setTriageBannerKey(spec.messageKey);
      setHighlightTarget(spec.target);
      window.setTimeout(() => setHighlightTarget(null), 3000);
      panelRefs[spec.target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [panelRefs],
  );

  useEffect(() => {
    if (!triageBannerKey) {
      return;
    }
    const timer = window.setTimeout(() => setTriageBannerKey(null), 5000);
    return () => window.clearTimeout(timer);
  }, [triageBannerKey]);

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
        {triageBannerKey ? (
          <p
            className={cn(
              'rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground',
            )}
            role="status"
          >
            {t(triageBannerKey)}
          </p>
        ) : null}
        <AdminOperationsOverviewPanel roles={roles} onTriageShortcut={handleTriageShortcut} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminDisputesQueuePanel
            roles={roles}
            triageRequest={triageRequest}
            highlighted={highlightTarget === 'disputes'}
            panelRef={panelRefs.disputes}
          />
          <AdminKycQueuePanel
            roles={roles}
            triageRequest={triageRequest}
            highlighted={highlightTarget === 'kyc'}
            panelRef={panelRefs.kyc}
          />
          <AdminOrdersQueuePanel
            roles={roles}
            triageRequest={triageRequest}
            highlighted={highlightTarget === 'orders'}
            panelRef={panelRefs.orders}
          />
          <AdminUsersQueuePanel
            roles={roles}
            triageRequest={triageRequest}
            highlighted={highlightTarget === 'users'}
            panelRef={panelRefs.users}
          />
          <AdminPaymentsQueuePanel
            roles={roles}
            triageRequest={triageRequest}
            highlighted={highlightTarget === 'payments'}
            panelRef={panelRefs.payments}
          />
          <AdminSystemHealthPanel
            roles={roles}
            highlighted={highlightTarget === 'systemHealth'}
            panelRef={panelRefs.systemHealth}
          />
          <AdminSupportTicketsQueuePanel roles={roles} />
          <AdminReviewsQueuePanel roles={roles} />
        </div>
      </CardContent>
    </Card>
  );
}
