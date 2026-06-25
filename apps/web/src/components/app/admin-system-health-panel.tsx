'use client';

import type {
  AdminAuditLogAction,
  AdminAuditLogItem,
  AdminAuditLogStatus,
  AdminAuditLogTargetType,
  AdminHealthComponentStatus,
  AdminSystemHealthResponse,
  AdminSystemOverallStatus,
  UserRole,
} from '@wayly/types';
import {
  AdminAuditLogAction as AdminAuditLogActionEnum,
  AdminAuditLogStatus as AdminAuditLogStatusEnum,
  AdminAuditLogTargetType as AdminAuditLogTargetTypeEnum,
} from '@wayly/types';
import type { AdminAuditLogsListQuery } from '@wayly/sdk';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import type { AdminPanelRef } from '@/lib/admin/admin-triage';

import { adminPaymentStatusKey } from '@/components/app/admin-orders-queue-panel';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const CARD_CLASS = cn('wayly-order-card rounded-xl px-4 py-4 text-sm', 'wayly-feed-item-enter');

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const INPUT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm';

const AUDIT_PAGE_LIMIT = 20;

const AUDIT_ACTION_OPTIONS = Object.values(AdminAuditLogActionEnum);
const AUDIT_TARGET_TYPE_OPTIONS = Object.values(AdminAuditLogTargetTypeEnum);
const AUDIT_STATUS_OPTIONS = Object.values(AdminAuditLogStatusEnum);

type AuditFilterForm = {
  action: AdminAuditLogAction | '';
  targetType: AdminAuditLogTargetType | '';
  status: AdminAuditLogStatus | '';
  actorUserId: string;
  targetUserId: string;
  targetId: string;
  from: string;
  to: string;
};

const DEFAULT_AUDIT_FILTER_FORM: AuditFilterForm = {
  action: '',
  targetType: '',
  status: '',
  actorUserId: '',
  targetUserId: '',
  targetId: '',
  from: '',
  to: '',
};

function hasActiveAuditFilters(filters: AuditFilterForm): boolean {
  return Boolean(
    filters.action ||
    filters.targetType ||
    filters.status ||
    filters.actorUserId.trim() ||
    filters.targetUserId.trim() ||
    filters.targetId.trim() ||
    filters.from ||
    filters.to,
  );
}

function buildAuditLogsQuery(page: number, filters: AuditFilterForm): AdminAuditLogsListQuery {
  const query: AdminAuditLogsListQuery = { page, limit: AUDIT_PAGE_LIMIT };
  if (filters.action) {
    query.action = filters.action;
  }
  if (filters.targetType) {
    query.targetType = filters.targetType;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  const actorUserId = filters.actorUserId.trim();
  if (actorUserId) {
    query.actorUserId = actorUserId;
  }
  const targetUserId = filters.targetUserId.trim();
  if (targetUserId) {
    query.targetUserId = targetUserId;
  }
  const targetId = filters.targetId.trim();
  if (targetId) {
    query.targetId = targetId;
  }
  if (filters.from) {
    query.from = new Date(`${filters.from}T00:00:00`);
  }
  if (filters.to) {
    query.to = new Date(`${filters.to}T23:59:59.999`);
  }
  return query;
}

export type AdminSystemHealthPanelProps = {
  roles: UserRole[];
  highlighted?: boolean;
  panelRef?: AdminPanelRef;
};

export function adminAuditActionKey(action: AdminAuditLogAction): TranslationKey {
  const map: Record<AdminAuditLogAction, TranslationKey> = {
    KYC_APPROVED: 'app.admin.adminAuditActionKycApproved',
    KYC_REJECTED: 'app.admin.adminAuditActionKycRejected',
    DISPUTE_RESOLVED: 'app.admin.adminAuditActionDisputeResolved',
    USER_SUSPENDED: 'app.admin.adminAuditActionUserSuspended',
    USER_UNSUSPENDED: 'app.admin.adminAuditActionUserUnsuspended',
    PAYMENT_MANUAL_REVIEW_MARKED: 'app.admin.adminAuditActionPaymentManualReviewMarked',
    PAYMENT_MANUAL_REVIEW_CLEARED: 'app.admin.adminAuditActionPaymentManualReviewCleared',
    PAYMENT_REFUND_DECISION_RECORDED: 'app.admin.adminAuditActionPaymentRefundDecisionRecorded',
    PAYMENT_RELEASE_DECISION_RECORDED: 'app.admin.adminAuditActionPaymentReleaseDecisionRecorded',
    ORDER_MANUAL_REVIEW_MARKED: 'app.admin.adminAuditActionOrderManualReviewMarked',
    ORDER_MANUAL_REVIEW_CLEARED: 'app.admin.adminAuditActionOrderManualReviewCleared',
    ORDER_DECISION_RECORDED: 'app.admin.adminAuditActionOrderDecisionRecorded',
    ORDER_RISK_FLAGGED: 'app.admin.adminAuditActionOrderRiskFlagged',
    ORDER_RISK_CLEARED: 'app.admin.adminAuditActionOrderRiskCleared',
  };
  return map[action];
}

export function adminAuditTargetKey(targetType: AdminAuditLogTargetType): TranslationKey {
  const map: Record<AdminAuditLogTargetType, TranslationKey> = {
    KYC_VERIFICATION: 'app.admin.adminAuditTargetKycVerification',
    DISPUTE: 'app.admin.adminAuditTargetDispute',
    USER: 'app.admin.adminAuditTargetUser',
    PAYMENT_INTENT: 'app.admin.adminAuditTargetPaymentIntent',
    DELIVERY_ORDER: 'app.admin.adminAuditTargetDeliveryOrder',
  };
  return map[targetType];
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function formatActor(item: AdminAuditLogItem): string {
  if (item.actorDisplaySnapshot && item.actorEmailSnapshot) {
    return `${item.actorDisplaySnapshot} (${item.actorEmailSnapshot})`;
  }
  return item.actorDisplaySnapshot || item.actorEmailSnapshot || '—';
}

function componentStatusKey(status: AdminHealthComponentStatus): TranslationKey {
  if (status === 'ok') {
    return 'app.admin.statusHealthy';
  }
  if (status === 'degraded' || status === 'error') {
    return 'app.admin.statusDegraded';
  }
  return 'app.admin.statusUnknown';
}

function overallStatusKey(status: AdminSystemOverallStatus): TranslationKey {
  if (status === 'healthy') {
    return 'app.admin.statusHealthy';
  }
  if (status === 'degraded') {
    return 'app.admin.statusDegraded';
  }
  return 'app.admin.statusUnknown';
}

function overallStatusBadgeClass(status: AdminSystemOverallStatus): string {
  if (status === 'healthy') {
    return 'wayly-status-delivered';
  }
  if (status === 'degraded') {
    return 'wayly-status-cancelled';
  }
  return 'wayly-status-default';
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium sm:text-right">{value}</dd>
    </div>
  );
}

export function AdminSystemHealthPanel({
  roles,
  highlighted = false,
  panelRef,
}: AdminSystemHealthPanelProps) {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<AdminSystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [auditItems, setAuditItems] = useState<AdminAuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLoadError, setAuditLoadError] = useState<string | null>(null);
  const [auditLoadedOnce, setAuditLoadedOnce] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditFilterForm, setAuditFilterForm] =
    useState<AuditFilterForm>(DEFAULT_AUDIT_FILTER_FORM);
  const [appliedAuditFilters, setAppliedAuditFilters] =
    useState<AuditFilterForm>(DEFAULT_AUDIT_FILTER_FORM);

  const loadSystemHealth = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.admin.getSystemHealth();
      setSnapshot(response);
      setLoadedOnce(true);
    } catch {
      setLoadError(t('app.admin.systemHealthLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchAuditLogs = useCallback(
    async (page: number, filters: AuditFilterForm) => {
      setAuditLoading(true);
      setAuditLoadError(null);
      try {
        const response = await api.admin.listAuditLogs(buildAuditLogsQuery(page, filters));
        setAuditItems(response.items);
        setAuditPage(response.page);
        setAuditTotal(response.total);
        setAuditLoadedOnce(true);
      } catch {
        setAuditLoadError(t('app.admin.adminAuditLogLoadFailed'));
      } finally {
        setAuditLoading(false);
      }
    },
    [t],
  );

  const loadAuditLogs = useCallback(() => {
    void fetchAuditLogs(auditPage, appliedAuditFilters);
  }, [auditPage, appliedAuditFilters, fetchAuditLogs]);

  const handleApplyAuditFilters = useCallback(() => {
    setAppliedAuditFilters(auditFilterForm);
    void fetchAuditLogs(1, auditFilterForm);
  }, [auditFilterForm, fetchAuditLogs]);

  const handleClearAuditFilters = useCallback(() => {
    setAuditFilterForm(DEFAULT_AUDIT_FILTER_FORM);
    setAppliedAuditFilters(DEFAULT_AUDIT_FILTER_FORM);
    void fetchAuditLogs(1, DEFAULT_AUDIT_FILTER_FORM);
  }, [fetchAuditLogs]);

  useEffect(() => {
    if (hasOperationsDashboardAccess(roles)) {
      void loadSystemHealth();
      void fetchAuditLogs(1, DEFAULT_AUDIT_FILTER_FORM);
    }
  }, [roles, loadSystemHealth, fetchAuditLogs]);

  if (!hasOperationsDashboardAccess(roles)) {
    return null;
  }

  const showInitialLoading = loading && !loadedOnce;
  const showAuditInitialLoading = auditLoading && !auditLoadedOnce;
  const auditFiltersActive = hasActiveAuditFilters(appliedAuditFilters);
  const showAuditEmpty =
    auditLoadedOnce && !auditLoadError && auditItems.length === 0 && !auditFiltersActive;
  const showAuditFilteredEmpty =
    auditLoadedOnce && !auditLoadError && auditItems.length === 0 && auditFiltersActive;
  const auditTotalPages = Math.max(1, Math.ceil(auditTotal / AUDIT_PAGE_LIMIT));

  return (
    <section
      ref={panelRef}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-1 sm:col-span-2',
        'transition-shadow duration-300',
        highlighted ? 'ring-2 ring-primary/45 border-primary/35' : '',
      )}
      aria-labelledby="admin-system-health-title"
    >
      <div className="flex flex-col gap-1 px-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="admin-system-health-title" className="text-sm font-semibold text-foreground">
            {t('app.admin.systemHealthTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('app.admin.systemHealthDescription')}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{t('app.admin.readOnlyQueue')}</span>
      </div>

      <div className="px-1 pb-1">
        {loadError ? (
          <PanelErrorState
            message={loadError}
            retryLabel={t('app.admin.retrySystemHealth')}
            onRetry={() => void loadSystemHealth()}
            retryDisabled={loading}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="px-3 pb-3" role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 text-sm text-muted-foreground">
              {t('app.admin.systemHealthLoading')}
            </p>
            <RequestsListSkeleton rows={2} itemClassName="h-24 w-full rounded-lg" />
          </div>
        ) : null}

        {!showInitialLoading && !loadError && snapshot ? (
          <div className="flex flex-col gap-2 px-2 pb-2">
            <div className={CARD_CLASS}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{t('app.admin.systemHealthTitle')}</p>
                <span
                  className={cn(
                    'wayly-status-badge shrink-0 text-xs',
                    overallStatusBadgeClass(snapshot.overallStatus),
                  )}
                >
                  {t(overallStatusKey(snapshot.overallStatus))}
                </span>
              </div>

              <dl className="mt-3 flex flex-col gap-1.5">
                <HealthRow
                  label={t('app.admin.apiStatus')}
                  value={t(componentStatusKey(snapshot.apiStatus))}
                />
                <HealthRow
                  label={t('app.admin.databaseStatus')}
                  value={t(componentStatusKey(snapshot.databaseStatus))}
                />
                <HealthRow
                  label={t('app.admin.lastChecked')}
                  value={formatDateTime(snapshot.checkedAt)}
                />
                <HealthRow label={t('app.admin.environment')} value={snapshot.environment} />
                {snapshot.appVersion ? (
                  <HealthRow label={t('app.admin.appVersion')} value={snapshot.appVersion} />
                ) : null}
              </dl>
            </div>

            {snapshot.operationalCounts ? (
              <div className={CARD_CLASS}>
                <p className="font-medium text-foreground">{t('app.admin.operationalCounts')}</p>
                <dl className="mt-3 flex flex-col gap-1.5">
                  <HealthRow
                    label={t('app.admin.usersCount')}
                    value={String(snapshot.operationalCounts.usersCount)}
                  />
                  <HealthRow
                    label={t('app.admin.pendingKycCount')}
                    value={String(snapshot.operationalCounts.pendingKycCount)}
                  />
                  <HealthRow
                    label={t('app.admin.openOrdersCount')}
                    value={String(snapshot.operationalCounts.openOrdersCount)}
                  />
                  <HealthRow
                    label={t('app.admin.openDisputesCount')}
                    value={String(snapshot.operationalCounts.openDisputesCount)}
                  />
                </dl>

                {snapshot.operationalCounts.paymentIntentsByStatus.length > 0 ? (
                  <div className="mt-3 border-t border-border/40 pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {t('app.admin.paymentsCount')}
                    </p>
                    <dl className="flex flex-col gap-1.5">
                      {snapshot.operationalCounts.paymentIntentsByStatus.map((row) => (
                        <HealthRow
                          key={row.status}
                          label={t(adminPaymentStatusKey(row.status))}
                          value={String(row.count)}
                        />
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            ) : null}

            {snapshot.recentActivity ? (
              <div className={CARD_CLASS}>
                <p className="font-medium text-foreground">{t('app.admin.recentActivity')}</p>
                <dl className="mt-3 flex flex-col gap-1.5">
                  <HealthRow
                    label={t('app.admin.latestUser')}
                    value={formatDateTime(snapshot.recentActivity.latestUserCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestOrder')}
                    value={formatDateTime(snapshot.recentActivity.latestOrderCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestDispute')}
                    value={formatDateTime(snapshot.recentActivity.latestDisputeCreatedAt)}
                  />
                  <HealthRow
                    label={t('app.admin.latestPayment')}
                    value={formatDateTime(snapshot.recentActivity.latestPaymentCreatedAt)}
                  />
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-1 border-t border-border/30 px-2 pb-2 pt-3">
          <div className="mb-2 px-1">
            <h4 className="text-sm font-semibold text-foreground">
              {t('app.admin.recentAdminActions')}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">{t('app.admin.adminAuditLogs')}</p>
          </div>

          <div className="mb-3 px-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t('app.admin.adminAuditFilters')}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditActionFilter')}
                </span>
                <select
                  className={SELECT_CLASS}
                  value={auditFilterForm.action}
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({
                      ...prev,
                      action: event.target.value as AuditFilterForm['action'],
                    }))
                  }
                >
                  <option value="">{t('app.admin.adminAuditAllActions')}</option>
                  {AUDIT_ACTION_OPTIONS.map((action) => (
                    <option key={action} value={action}>
                      {t(adminAuditActionKey(action))}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditTargetTypeFilter')}
                </span>
                <select
                  className={SELECT_CLASS}
                  value={auditFilterForm.targetType}
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({
                      ...prev,
                      targetType: event.target.value as AuditFilterForm['targetType'],
                    }))
                  }
                >
                  <option value="">{t('app.admin.adminAuditAllTargetTypes')}</option>
                  {AUDIT_TARGET_TYPE_OPTIONS.map((targetType) => (
                    <option key={targetType} value={targetType}>
                      {t(adminAuditTargetKey(targetType))}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditStatusFilter')}
                </span>
                <select
                  className={SELECT_CLASS}
                  value={auditFilterForm.status}
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({
                      ...prev,
                      status: event.target.value as AuditFilterForm['status'],
                    }))
                  }
                >
                  <option value="">{t('app.admin.adminAuditAllStatuses')}</option>
                  {AUDIT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === AdminAuditLogStatusEnum.SUCCESS
                        ? t('app.admin.adminAuditStatusSuccess')
                        : t('app.admin.adminAuditStatusFailed')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditActorUserIdFilter')}
                </span>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  value={auditFilterForm.actorUserId}
                  placeholder="UUID"
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({ ...prev, actorUserId: event.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditTargetUserIdFilter')}
                </span>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  value={auditFilterForm.targetUserId}
                  placeholder="UUID"
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({ ...prev, targetUserId: event.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">
                  {t('app.admin.adminAuditTargetIdFilter')}
                </span>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  value={auditFilterForm.targetId}
                  placeholder="UUID"
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({ ...prev, targetId: event.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">{t('app.admin.adminAuditFromFilter')}</span>
                <input
                  type="date"
                  className={INPUT_CLASS}
                  value={auditFilterForm.from}
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({ ...prev, from: event.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">{t('app.admin.adminAuditToFilter')}</span>
                <input
                  type="date"
                  className={INPUT_CLASS}
                  value={auditFilterForm.to}
                  onChange={(event) =>
                    setAuditFilterForm((prev) => ({ ...prev, to: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="h-8 text-xs"
                disabled={auditLoading}
                onClick={handleApplyAuditFilters}
              >
                {t('app.admin.adminAuditApplyFilters')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={auditLoading}
                onClick={handleClearAuditFilters}
              >
                {t('app.admin.adminAuditClearFilters')}
              </Button>
            </div>
          </div>

          {auditLoadError ? (
            <PanelErrorState
              message={auditLoadError}
              retryLabel={t('app.admin.retrySystemHealth')}
              onRetry={() => void loadAuditLogs()}
              retryDisabled={auditLoading}
            />
          ) : null}

          {showAuditInitialLoading ? (
            <div className="px-1 pb-2" role="status" aria-live="polite" aria-busy="true">
              <RequestsListSkeleton rows={3} itemClassName="h-20 w-full rounded-lg" />
            </div>
          ) : null}

          {showAuditEmpty ? (
            <PanelEmptyState
              title={t('app.admin.adminAuditLogEmpty')}
              body={t('app.admin.adminAuditLogs')}
            />
          ) : null}

          {showAuditFilteredEmpty ? (
            <PanelEmptyState
              title={t('app.admin.adminAuditNoFilteredResults')}
              body={t('app.admin.adminAuditLogs')}
            />
          ) : null}

          {!showAuditInitialLoading && !auditLoadError && auditItems.length > 0 ? (
            <ul className="flex flex-col gap-2 px-1 pb-2">
              {auditItems.map((item) => (
                <li key={item.id} className={CARD_CLASS}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{formatActor(item)}</p>
                    <span className="wayly-status-badge wayly-status-default shrink-0 text-xs">
                      {t(adminAuditActionKey(item.action))}
                    </span>
                  </div>
                  <dl className="mt-3 flex flex-col gap-1.5">
                    <HealthRow
                      label={t('app.admin.adminAuditLogTime')}
                      value={formatDateTime(item.createdAt)}
                    />
                    <HealthRow
                      label={t('app.admin.adminAuditLogTarget')}
                      value={`${t(adminAuditTargetKey(item.targetType))} · ${item.targetId}`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">
                        {t('app.admin.adminAuditLogSummary')}
                      </dt>
                      <dd className="whitespace-pre-wrap break-words">{item.summary}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : null}

          {!showAuditInitialLoading &&
          (auditLoadedOnce || auditItems.length > 0) &&
          !auditLoadError ? (
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
              {auditTotalPages > 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={auditLoading || auditPage <= 1}
                    onClick={() => void fetchAuditLogs(auditPage - 1, appliedAuditFilters)}
                  >
                    {t('app.admin.adminAuditPreviousPage')}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t('app.admin.adminAuditPageLabel')
                      .replace('{page}', String(auditPage))
                      .replace('{total}', String(auditTotalPages))}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={auditLoading || auditPage >= auditTotalPages}
                    onClick={() => void fetchAuditLogs(auditPage + 1, appliedAuditFilters)}
                  >
                    {t('app.admin.adminAuditNextPage')}
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={auditLoading}
                onClick={loadAuditLogs}
              >
                {auditLoading
                  ? t('app.admin.systemHealthLoading')
                  : t('app.admin.adminAuditLogRefresh')}
              </Button>
            </div>
          ) : null}
        </div>

        {!showInitialLoading && snapshot && !loadError ? (
          <div className="flex justify-end px-3 pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
              onClick={() => {
                void loadSystemHealth();
                loadAuditLogs();
              }}
            >
              {loading ? t('app.admin.systemHealthLoading') : t('app.admin.refreshSystemHealth')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
