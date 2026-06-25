'use client';

import { ApiError } from '@wayly/sdk';
import type { WaylerAvailabilityRequestSummary } from '@wayly/types';
import { WaylerAvailabilityRequestStatus } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { AvailabilityRequestConvertedOrder } from '@/components/app/availability-request-converted-order';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import { RestrictedItemsSafetyNote } from '@/components/app/restricted-items-safety-note';
import { KycMarketplaceGateNotice, type KycGateProps } from '@/components/app/kyc-marketplace-gate';
import {
  WaylerRequestAcceptGuidance,
  WaylerRequestStatusNote,
  WaylerRequestSummary,
} from '@/components/app/wayler-request-summary';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const REQUEST_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'wayly-feed-item-enter',
);

const TEXTAREA_CLASS = cn(
  'flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

type ActionKind = 'accept' | 'decline';

type WaylerIncomingRequestsPanelProps = {
  kycGate: KycGateProps;
  waylerHasActiveAccess: boolean;
  /** Refresh parent accepted-order lists after accept creates a DeliveryOrder. */
  onRequestAccepted?: () => void;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function requestStatusKey(status: WaylerAvailabilityRequestStatus): TranslationKey {
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return 'app.availabilityRequests.statusPending';
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return 'app.availabilityRequests.statusAccepted';
    case WaylerAvailabilityRequestStatus.DECLINED:
      return 'app.availabilityRequests.statusDeclined';
    case WaylerAvailabilityRequestStatus.CANCELLED:
      return 'app.availabilityRequests.statusCancelled';
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return 'app.availabilityRequests.statusExpired';
    default:
      return 'app.availabilityRequests.requestStatus';
  }
}

function requestStatusBadgeClass(status: WaylerAvailabilityRequestStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return cn(base, 'wayly-status-open');
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return cn(base, 'wayly-status-accepted');
    case WaylerAvailabilityRequestStatus.DECLINED:
    case WaylerAvailabilityRequestStatus.CANCELLED:
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function resolveActionError(
  err: unknown,
  t: (key: TranslationKey) => string,
  action: ActionKind,
): string {
  if (!(err instanceof ApiError)) {
    return action === 'accept'
      ? t('app.availabilityRequests.acceptFailed')
      : t('app.availabilityRequests.declineFailed');
  }
  if (err.code === 'AVAILABILITY_REQUEST_NOT_PENDING') {
    return t('app.availabilityRequests.requestNotPending');
  }
  if (err.code === 'AVAILABILITY_REQUEST_FORBIDDEN') {
    return t('app.availabilityRequests.requestForbidden');
  }
  if (action === 'accept' && err.code === 'WAYLER_ACCESS_REQUIRED') {
    return t('app.availabilityRequests.accessRequiredAcceptRequestFailed');
  }
  return t('app.availabilityRequests.updateFailed');
}

function optionalResponseMessage(draft: string): { responseMessage?: string } {
  const trimmed = draft.trim();
  return trimmed.length > 0 ? { responseMessage: trimmed } : {};
}

export function WaylerIncomingRequestsPanel({
  kycGate,
  waylerHasActiveAccess,
  onRequestAccepted,
}: WaylerIncomingRequestsPanelProps) {
  const { t } = useI18n();
  const { isApproved, kycLoading } = kycGate;

  const [requests, setRequests] = useState<WaylerAvailabilityRequestSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<{ id: string; action: ActionKind } | null>(null);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});

  const loadRequests = useCallback(async () => {
    if (!isApproved) {
      setRequests([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const result = await api.waylerAvailabilityRequests.mineAsWayler({ limit: 10 });
      setRequests(result.items);
    } catch {
      setLoadError(t('app.availabilityRequests.waylerLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [isApproved, t]);

  useEffect(() => {
    if (!kycLoading && isApproved) {
      void loadRequests();
    }
  }, [kycLoading, isApproved, loadRequests]);

  const updateResponseDraft = (id: string, value: string) => {
    setResponseDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleAccept = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    setActionBusy({ id, action: 'accept' });
    try {
      await api.waylerAvailabilityRequests.accept(
        id,
        optionalResponseMessage(responseDrafts[id] ?? ''),
      );
      setActionSuccess(t('app.availabilityRequests.requestAccepted'));
      setResponseDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadRequests();
      onRequestAccepted?.();
    } catch (err) {
      setActionError(resolveActionError(err, t, 'accept'));
    } finally {
      setActionBusy(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    setActionBusy({ id, action: 'decline' });
    try {
      await api.waylerAvailabilityRequests.decline(
        id,
        optionalResponseMessage(responseDrafts[id] ?? ''),
      );
      setActionSuccess(t('app.availabilityRequests.requestDeclined'));
      setResponseDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadRequests();
    } catch (err) {
      setActionError(resolveActionError(err, t, 'decline'));
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!isApproved ? <KycMarketplaceGateNotice {...kycGate} /> : null}

      {actionSuccess ? <p className={ALERT_SUCCESS_CLASS}>{actionSuccess}</p> : null}
      {actionError ? <p className={ALERT_ERROR_CLASS}>{actionError}</p> : null}
      {loadError ? (
        <PanelErrorState
          message={loadError}
          retryLabel={t('app.availabilityRequests.retryWaylerRequests')}
          onRetry={() => void loadRequests()}
          retryDisabled={loading}
        />
      ) : null}

      {isApproved ? (
        <>
          {loading && requests.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                {t('app.availabilityRequests.waylerLoading')}
              </p>
              <RequestsListSkeleton rows={2} itemClassName="h-28 w-full rounded-lg" />
            </div>
          ) : !loading && !loadError && requests.length === 0 ? (
            <PanelEmptyState
              title={t('app.availabilityRequests.waylerEmptyTitle')}
              body={t('app.availabilityRequests.waylerEmptyBody')}
            />
          ) : requests.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {requests.map((request) => {
                const isPending = request.status === WaylerAvailabilityRequestStatus.PENDING;
                const isAccepted = request.status === WaylerAvailabilityRequestStatus.ACCEPTED;
                const isAccepting = actionBusy?.id === request.id && actionBusy.action === 'accept';
                const isDeclining =
                  actionBusy?.id === request.id && actionBusy.action === 'decline';
                const actionDisabled = actionBusy !== null;
                const acceptDisabled = actionDisabled || !waylerHasActiveAccess;

                return (
                  <li key={request.id} className={REQUEST_CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{request.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t('app.availabilityRequests.senderRequest')} ·{' '}
                          {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                      <span className={requestStatusBadgeClass(request.status)}>
                        {t(requestStatusKey(request.status))}
                      </span>
                    </div>

                    <WaylerRequestSummary compact className="mt-3" request={request} />

                    {request.responseMessage ? (
                      <p className="mt-3 break-words text-sm">
                        <span className="font-medium text-muted-foreground">
                          {t('app.availabilityRequests.responseMessage')}:{' '}
                        </span>
                        {request.responseMessage}
                      </p>
                    ) : null}

                    {request.deliveryOrderId ? (
                      <div className="mt-3 flex flex-col gap-1">
                        <AvailabilityRequestConvertedOrder
                          deliveryOrderId={request.deliveryOrderId}
                        />
                        <WaylerRequestStatusNote convertedToOrder />
                      </div>
                    ) : isAccepted ? (
                      <WaylerRequestStatusNote convertedToOrder={false} className="mt-3" />
                    ) : null}

                    {isPending ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-border/50 pt-4">
                        <RestrictedItemsSafetyNote variant="wayler" className="text-[11px]" />
                        <WaylerRequestAcceptGuidance compact />

                        <div>
                          <h4 className="text-sm font-medium">
                            {t('app.waylerRequests.requestActionsTitle')}
                          </h4>
                          <label className="mt-2 flex flex-col gap-1.5 text-sm">
                            <span className="font-medium text-muted-foreground">
                              {t('app.availabilityRequests.responseMessageField')}
                            </span>
                            <textarea
                              className={TEXTAREA_CLASS}
                              value={responseDrafts[request.id] ?? ''}
                              disabled={actionDisabled}
                              onChange={(e) => updateResponseDraft(request.id, e.target.value)}
                            />
                          </label>
                          <div className="wayly-action-group mt-3 flex-col sm:flex-row">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full sm:w-auto"
                              disabled={acceptDisabled}
                              onClick={() => void handleAccept(request.id)}
                            >
                              {isAccepting
                                ? t('app.waylerRequests.accepting')
                                : t('app.waylerRequests.acceptRequest')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              disabled={actionDisabled}
                              onClick={() => void handleDecline(request.id)}
                            >
                              {isDeclining
                                ? t('app.waylerRequests.declining')
                                : t('app.waylerRequests.declineRequest')}
                            </Button>
                          </div>
                          {!waylerHasActiveAccess ? (
                            <p className="mt-2 text-xs text-muted-foreground" role="note">
                              {t('app.availabilityRequests.accessRequiredForAcceptRequest')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="wayly-action-group">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => void loadRequests()}
            >
              {loading ? t('app.senderWaylers.loading') : t('app.senderWaylers.refresh')}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
