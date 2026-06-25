'use client';

import type { UserRole } from '@wayly/types';
import {
  DisputeStatus,
  KycStatus,
  OrderAdminReviewStatus,
  PaymentAdminReviewStatus,
  UserAccountStatus,
} from '@wayly/types';
import { Button, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

export type AdminOperationsOverviewPanelProps = {
  roles: UserRole[];
};

type KpiKey =
  | 'pendingKyc'
  | 'openDisputes'
  | 'suspendedUsers'
  | 'paymentsReview'
  | 'ordersReview'
  | 'riskOrders'
  | 'recentActions';

type KpiCardConfig = {
  key: KpiKey;
  labelKey: TranslationKey;
  helpKey: TranslationKey;
  symbol: string;
};

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: 'pendingKyc',
    labelKey: 'app.admin.adminOverviewPendingKyc',
    helpKey: 'app.admin.adminOverviewPendingKycHelp',
    symbol: '🪪',
  },
  {
    key: 'openDisputes',
    labelKey: 'app.admin.adminOverviewOpenDisputes',
    helpKey: 'app.admin.adminOverviewOpenDisputesHelp',
    symbol: '⚖️',
  },
  {
    key: 'suspendedUsers',
    labelKey: 'app.admin.adminOverviewSuspendedUsers',
    helpKey: 'app.admin.adminOverviewSuspendedUsersHelp',
    symbol: '🚫',
  },
  {
    key: 'paymentsReview',
    labelKey: 'app.admin.adminOverviewPaymentsReview',
    helpKey: 'app.admin.adminOverviewPaymentsReviewHelp',
    symbol: '💳',
  },
  {
    key: 'ordersReview',
    labelKey: 'app.admin.adminOverviewOrdersReview',
    helpKey: 'app.admin.adminOverviewOrdersReviewHelp',
    symbol: '📦',
  },
  {
    key: 'riskOrders',
    labelKey: 'app.admin.adminOverviewRiskOrders',
    helpKey: 'app.admin.adminOverviewRiskOrdersHelp',
    symbol: '⚠️',
  },
  {
    key: 'recentActions',
    labelKey: 'app.admin.adminOverviewRecentActions',
    helpKey: 'app.admin.adminOverviewRecentActionsHelp',
    symbol: '📋',
  },
];

type KpiValues = Record<KpiKey, number | null>;
type KpiErrors = Record<KpiKey, boolean>;

const INITIAL_VALUES: KpiValues = {
  pendingKyc: null,
  openDisputes: null,
  suspendedUsers: null,
  paymentsReview: null,
  ordersReview: null,
  riskOrders: null,
  recentActions: null,
};

const INITIAL_ERRORS: KpiErrors = {
  pendingKyc: false,
  openDisputes: false,
  suspendedUsers: false,
  paymentsReview: false,
  ordersReview: false,
  riskOrders: false,
  recentActions: false,
};

function extractTotal(result: PromiseSettledResult<{ total: number }>): number | null {
  if (result.status === 'fulfilled') {
    return result.value.total;
  }
  return null;
}

function formatLastUpdated(value: Date | null): string {
  if (!value) {
    return '—';
  }
  try {
    return value.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value.toISOString();
  }
}

function formatCount(value: number | null, loading: boolean): string {
  if (loading) {
    return '';
  }
  if (value === null) {
    return '—';
  }
  return value.toLocaleString();
}

export function AdminOperationsOverviewPanel({ roles }: AdminOperationsOverviewPanelProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<KpiValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<KpiErrors>(INITIAL_ERRORS);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasPartialFailure, setHasPartialFailure] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setHasPartialFailure(false);

    const [
      pendingKycResult,
      openDisputesResult,
      underReviewDisputesResult,
      suspendedUsersResult,
      paymentsReviewResult,
      ordersReviewResult,
      riskOrdersResult,
      recentActionsResult,
    ] = await Promise.allSettled([
      api.admin.listKycVerifications({ page: 1, limit: 1, status: KycStatus.PENDING }),
      api.admin.listDisputes({ page: 1, limit: 1, status: DisputeStatus.OPEN }),
      api.admin.listDisputes({ page: 1, limit: 1, status: DisputeStatus.UNDER_REVIEW }),
      api.admin.listUsers({ page: 1, limit: 1, accountStatus: UserAccountStatus.SUSPENDED }),
      api.admin.listPayments({
        page: 1,
        limit: 1,
        adminReviewStatus: PaymentAdminReviewStatus.MANUAL_REVIEW,
      }),
      api.admin.listOrders({
        page: 1,
        limit: 1,
        adminReviewStatus: OrderAdminReviewStatus.MANUAL_REVIEW,
      }),
      api.admin.listOrders({
        page: 1,
        limit: 1,
        adminReviewStatus: OrderAdminReviewStatus.RISK_FLAGGED,
      }),
      api.admin.listAuditLogs({ page: 1, limit: 1 }),
    ]);

    const openTotal = extractTotal(openDisputesResult);
    const underReviewTotal = extractTotal(underReviewDisputesResult);
    const openDisputesCombined =
      openTotal === null && underReviewTotal === null
        ? null
        : (openTotal ?? 0) + (underReviewTotal ?? 0);

    const nextValues: KpiValues = {
      pendingKyc: extractTotal(pendingKycResult),
      openDisputes: openDisputesCombined,
      suspendedUsers: extractTotal(suspendedUsersResult),
      paymentsReview: extractTotal(paymentsReviewResult),
      ordersReview: extractTotal(ordersReviewResult),
      riskOrders: extractTotal(riskOrdersResult),
      recentActions: extractTotal(recentActionsResult),
    };

    const nextErrors: KpiErrors = {
      pendingKyc: pendingKycResult.status === 'rejected',
      openDisputes:
        openDisputesResult.status === 'rejected' && underReviewDisputesResult.status === 'rejected',
      suspendedUsers: suspendedUsersResult.status === 'rejected',
      paymentsReview: paymentsReviewResult.status === 'rejected',
      ordersReview: ordersReviewResult.status === 'rejected',
      riskOrders: riskOrdersResult.status === 'rejected',
      recentActions: recentActionsResult.status === 'rejected',
    };

    setValues(nextValues);
    setErrors(nextErrors);
    setHasPartialFailure(Object.values(nextErrors).some(Boolean));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void fetchOverview();
    }
  }, [roles, fetchOverview]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-primary/15 bg-gradient-to-br from-muted/25 via-background to-muted/10 p-4 shadow-sm"
      aria-labelledby="admin-operations-overview-title"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3
            id="admin-operations-overview-title"
            className="text-sm font-semibold text-foreground"
          >
            {t('app.admin.adminOverviewTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.adminOverviewSubtitle')}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={loading}
            onClick={() => void fetchOverview()}
          >
            {t('app.admin.adminOverviewRefresh')}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            {t('app.admin.adminOverviewLastUpdated')}: {formatLastUpdated(lastUpdated)}
          </p>
        </div>
      </div>

      {hasPartialFailure && !loading ? (
        <p className="mb-3 text-xs text-destructive" role="status">
          {t('app.admin.adminOverviewLoadFailed')}
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {KPI_CARDS.map((card) => {
          const cardLoading = loading;
          const cardValue = values[card.key];
          const cardFailed = errors[card.key];

          return (
            <li
              key={card.key}
              className={cn(
                'flex flex-col rounded-lg border border-border/50 bg-background/80 p-3',
                'shadow-sm backdrop-blur-sm transition-colors',
                cardFailed && !cardLoading ? 'border-destructive/30' : '',
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                  {t(card.labelKey)}
                </span>
                <span className="text-sm leading-none opacity-70" aria-hidden="true">
                  {card.symbol}
                </span>
              </div>
              {cardLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p
                  className={cn(
                    'mt-2 text-2xl font-bold tabular-nums tracking-tight',
                    cardFailed ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {formatCount(cardValue, cardLoading)}
                </p>
              )}
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                {t(card.helpKey)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
