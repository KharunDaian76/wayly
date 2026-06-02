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
export { type HealthApi } from './health';
export type { ApiClientOptions, RequestOptions, TokenProvider, HealthResult } from './types';
export type { AuthResult, UserProfile } from '@wayly/types';
