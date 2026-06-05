export { ApiClient, createApiClient } from './client';
export { ApiError, type ApiErrorBody } from './errors';
export { createAuthApi } from './auth';
export {
  type AuthApi,
  type LoginBody,
  type RegisterBody,
  type UpdateProfileBody,
  type UsersApi,
} from './auth.types';
export { createKycApi } from './kyc';
export { type KycApi, type KycMockRejectBody, type KycStartBody } from './kyc.types';
export { createConversationsApi } from './conversations';
export {
  type ConversationsApi,
  type ConversationsListQuery,
  type MarkConversationReadResponse,
} from './conversations.types';
export { createNotificationsApi } from './notifications';
export {
  type NotificationsApi,
  type NotificationsListQuery,
  type NotificationsMarkAllReadResponse,
  type NotificationsUnreadCountResponse,
} from './notifications.types';
export { createOrdersApi } from './orders';
export {
  type AcceptedDeliveryOrderSummary,
  type DeliveryOrderListResult,
  type OrdersApi,
  type OrdersListQuery,
  type OrdersMineQuery,
  type SubmitDeliveryProofInput,
} from './orders.types';
export { type HealthApi } from './health';
export type { ApiClientOptions, RequestOptions, TokenProvider, HealthResult } from './types';
export type {
  AuthResult,
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
  KycStatusView,
  KycVerificationSummary,
  NotificationListResponse,
  NotificationSummary,
  UserProfile,
} from '@wayly/types';
export type { SendChatMessageInput } from '@wayly/validation';
