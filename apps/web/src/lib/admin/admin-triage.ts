import type {
  DisputeStatus,
  KycStatus,
  OrderAdminReviewStatus,
  PaymentAdminReviewStatus,
  UserAccountStatus,
} from '@wayly/types';
import {
  DisputeStatus as DisputeStatusEnum,
  KycStatus as KycStatusEnum,
  OrderAdminReviewStatus as OrderAdminReviewStatusEnum,
  PaymentAdminReviewStatus as PaymentAdminReviewStatusEnum,
  UserAccountStatus as UserAccountStatusEnum,
} from '@wayly/types';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** Ref for admin queue panel root `<section>` elements (triage scroll/highlight). */
export type AdminPanelRef = RefObject<HTMLElement>;

export type AdminTriageTarget =
  | 'kyc'
  | 'disputes'
  | 'users'
  | 'orders'
  | 'payments'
  | 'systemHealth';

export type AdminTriageKpiKey =
  | 'pendingKyc'
  | 'openDisputes'
  | 'suspendedUsers'
  | 'paymentsReview'
  | 'ordersReview'
  | 'riskOrders'
  | 'recentActions';

export type AdminTriageRequest = {
  token: number;
  target: AdminTriageTarget;
  messageKey: TranslationKey;
  kycFilters?: {
    status?: KycStatus | '';
    userId?: string;
    country?: string;
  };
  disputeFilters?: {
    status?: DisputeStatus | '';
    orderId?: string;
    openedById?: string;
  };
  userFilters?: {
    accountStatus?: UserAccountStatus | '';
  };
  orderFilters?: {
    adminReviewStatus?: OrderAdminReviewStatus | '';
  };
  paymentFilters?: {
    adminReviewStatus?: PaymentAdminReviewStatus | '';
  };
};

export function buildTriageFromKpi(key: AdminTriageKpiKey): Omit<AdminTriageRequest, 'token'> {
  switch (key) {
    case 'pendingKyc':
      return {
        target: 'kyc',
        messageKey: 'app.admin.adminTriageShowingPendingKyc',
        kycFilters: { status: KycStatusEnum.PENDING },
      };
    case 'openDisputes':
      return {
        target: 'disputes',
        messageKey: 'app.admin.adminTriageShowingOpenDisputes',
        disputeFilters: { status: DisputeStatusEnum.OPEN },
      };
    case 'suspendedUsers':
      return {
        target: 'users',
        messageKey: 'app.admin.adminTriageShowingSuspendedUsers',
        userFilters: { accountStatus: UserAccountStatusEnum.SUSPENDED },
      };
    case 'paymentsReview':
      return {
        target: 'payments',
        messageKey: 'app.admin.adminTriageShowingPaymentsReview',
        paymentFilters: { adminReviewStatus: PaymentAdminReviewStatusEnum.MANUAL_REVIEW },
      };
    case 'ordersReview':
      return {
        target: 'orders',
        messageKey: 'app.admin.adminTriageShowingOrdersReview',
        orderFilters: { adminReviewStatus: OrderAdminReviewStatusEnum.MANUAL_REVIEW },
      };
    case 'riskOrders':
      return {
        target: 'orders',
        messageKey: 'app.admin.adminTriageShowingRiskOrders',
        orderFilters: { adminReviewStatus: OrderAdminReviewStatusEnum.RISK_FLAGGED },
      };
    case 'recentActions':
      return {
        target: 'systemHealth',
        messageKey: 'app.admin.adminTriageShowingRecentActions',
      };
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function useAdminTriageEffect<T extends Record<string, unknown>>(
  triageRequest: AdminTriageRequest | null | undefined,
  target: AdminTriageTarget,
  defaultFilters: T,
  extractFilters: (request: AdminTriageRequest) => Partial<T> | undefined,
  onApply: (filters: T) => void,
) {
  const lastTokenRef = useRef(0);

  useEffect(() => {
    if (!triageRequest || triageRequest.target !== target) {
      return;
    }
    if (triageRequest.token === lastTokenRef.current) {
      return;
    }
    lastTokenRef.current = triageRequest.token;
    const partial = extractFilters(triageRequest);
    if (!partial) {
      return;
    }
    onApply({ ...defaultFilters, ...partial });
  }, [triageRequest, target, defaultFilters, extractFilters, onApply]);
}
