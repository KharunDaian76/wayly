import type { ISODateString } from './common';
import type { KycStatus } from './enums';

/**
 * Safe, serializable KYC verification record returned by the API.
 * Never includes rawProviderPayload, providerApplicantId, or providerReviewId.
 */
export interface KycVerificationSummary {
  id: string;
  status: KycStatus;
  provider: string | null;
  levelName: string | null;
  country: string | null;
  documentType: string | null;
  rejectionReason: string | null;
  submittedAt: ISODateString | null;
  reviewedAt: ISODateString | null;
  expiresAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Full KYC status payload from GET /kyc/status and mock approve/reject routes.
 */
export interface KycStatusView {
  verified: boolean;
  kycStatus: KycStatus;
  latestVerification: KycVerificationSummary | null;
  canCreateOrder: boolean;
  canBrowseOrders: boolean;
  canAcceptOrder: boolean;
  canChat: boolean;
  canContact: boolean;
  canReceivePayout: boolean;
}

/** Paginated admin KYC review queue (GET /admin/kyc-verifications). */
export interface AdminKycListResponse {
  items: AdminKycQueueItem[];
  page: number;
  limit: number;
  total: number;
}

/** Compact KYC row for admin/arbitrator operations queue (read-only). */
export interface AdminKycQueueItem {
  id: string;
  userId: string;
  userDisplayName: string | null;
  userEmail: string | null;
  status: KycStatus;
  country: string | null;
  rejectionReason: string | null;
  submittedAt: ISODateString | null;
  reviewedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * High-level KYC gating snapshot derived from User.verified / User.kycStatus.
 * Used by future guards and UI to explain what is blocked until verification.
 */
export interface KycRequirementStatus {
  kycStatus: KycStatus;
  verified: boolean;
  /** True when all gated features (orders, chat, payouts, etc.) may be accessed. */
  isFullyVerified: boolean;
  blocks: {
    createDeliveries: boolean;
    browseOrders: boolean;
    acceptOrders: boolean;
    chat: boolean;
    contactUsers: boolean;
    receivePayouts: boolean;
  };
}
