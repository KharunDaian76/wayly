'use client';

import type { KycStatusView } from '@wayly/types';
import { KycStatus } from '@wayly/types';

import { PanelEmptyState, PanelErrorState } from '@/components/app/panel-status-states';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

export type KycGatePhase = 'loading' | 'error' | 'approved' | 'pending' | 'rejected' | 'required';

export type KycActionHint =
  | 'postOrder'
  | 'requestWayler'
  | 'publishAvailability'
  | 'acceptPostedOrder'
  | 'acceptAvailabilityRequest'
  | 'browseFeed'
  | 'viewSenderOrders';

export type KycGateProps = {
  kycLoading: boolean;
  kycError: string | null;
  kycStatus: KycStatusView | null;
  isApproved: boolean;
  onRetryKyc: () => void;
};

const ACTION_HINT_KEYS: Record<
  KycActionHint,
  Record<'required' | 'pending' | 'rejected', TranslationKey>
> = {
  postOrder: {
    required: 'app.kycGate.actionPostOrderRequired',
    pending: 'app.kycGate.actionPostOrderPending',
    rejected: 'app.kycGate.actionPostOrderRejected',
  },
  requestWayler: {
    required: 'app.kycGate.actionRequestWaylerRequired',
    pending: 'app.kycGate.actionRequestWaylerPending',
    rejected: 'app.kycGate.actionRequestWaylerRejected',
  },
  publishAvailability: {
    required: 'app.kycGate.actionPublishAvailabilityRequired',
    pending: 'app.kycGate.actionPublishAvailabilityPending',
    rejected: 'app.kycGate.actionPublishAvailabilityRejected',
  },
  acceptPostedOrder: {
    required: 'app.kycGate.actionAcceptPostedOrderRequired',
    pending: 'app.kycGate.actionAcceptPostedOrderPending',
    rejected: 'app.kycGate.actionAcceptPostedOrderRejected',
  },
  acceptAvailabilityRequest: {
    required: 'app.kycGate.actionAcceptAvailabilityRequestRequired',
    pending: 'app.kycGate.actionAcceptAvailabilityRequestPending',
    rejected: 'app.kycGate.actionAcceptAvailabilityRequestRejected',
  },
  browseFeed: {
    required: 'app.kycGate.actionBrowseFeedRequired',
    pending: 'app.kycGate.actionBrowseFeedPending',
    rejected: 'app.kycGate.actionBrowseFeedRejected',
  },
  viewSenderOrders: {
    required: 'app.kycGate.actionViewSenderOrdersRequired',
    pending: 'app.kycGate.actionViewSenderOrdersPending',
    rejected: 'app.kycGate.actionViewSenderOrdersRejected',
  },
};

export function resolveKycGatePhase({
  kycLoading,
  isApproved,
  kycError,
  kycStatus,
}: KycGateProps): KycGatePhase {
  if (kycLoading) {
    return 'loading';
  }
  if (isApproved) {
    return 'approved';
  }
  if (kycError && !kycStatus) {
    return 'error';
  }

  const status = kycStatus?.kycStatus;
  const latestStatus = kycStatus?.latestVerification?.status;

  if (status === KycStatus.REJECTED || latestStatus === KycStatus.REJECTED) {
    return 'rejected';
  }
  if (status === KycStatus.PENDING || latestStatus === KycStatus.PENDING) {
    return 'pending';
  }

  return 'required';
}

export function KycMarketplaceGateNotice(props: KycGateProps) {
  const { t } = useI18n();
  const phase = resolveKycGatePhase(props);

  if (phase === 'approved') {
    return null;
  }

  if (phase === 'loading') {
    return (
      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {t('app.kycGate.kycLoading')}
      </p>
    );
  }

  if (phase === 'error') {
    return (
      <PanelErrorState
        message={props.kycError ?? t('app.kycPanel.loadFailed')}
        retryLabel={t('app.kycGate.retryKycStatus')}
        onRetry={props.onRetryKyc}
        retryDisabled={props.kycLoading}
      />
    );
  }

  if (phase === 'pending') {
    return (
      <PanelEmptyState
        title={t('app.kycGate.kycPendingTitle')}
        body={t('app.kycGate.kycPendingBody')}
      />
    );
  }

  if (phase === 'rejected') {
    return (
      <PanelEmptyState
        title={t('app.kycGate.kycRejectedTitle')}
        body={t('app.kycGate.kycRejectedBody')}
      />
    );
  }

  return (
    <PanelEmptyState
      title={t('app.kycGate.kycRequiredTitle')}
      body={t('app.kycGate.kycRequiredBody')}
    />
  );
}

export function KycActionBlockedHint({
  actionHint,
  ...gateProps
}: KycGateProps & { actionHint: KycActionHint }) {
  const { t } = useI18n();
  const phase = resolveKycGatePhase(gateProps);

  if (phase === 'approved' || phase === 'loading' || phase === 'error') {
    return null;
  }

  const hintPhase =
    phase === 'pending' ? 'pending' : phase === 'rejected' ? 'rejected' : 'required';

  return (
    <p className="text-xs text-muted-foreground" role="note">
      {t(ACTION_HINT_KEYS[actionHint][hintPhase])}
    </p>
  );
}
