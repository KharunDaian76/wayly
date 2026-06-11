import type {
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestListResponse,
} from '@wayly/types';
import type {
  CreateWaylerAvailabilityRequestInput,
  RespondWaylerAvailabilityRequestInput,
  WaylerAvailabilityRequestsListQueryInput,
} from '@wayly/validation';

export type WaylerAvailabilityRequestsListQuery = Partial<WaylerAvailabilityRequestsListQueryInput>;

export interface WaylerAvailabilityRequestsApi {
  create(
    input: CreateWaylerAvailabilityRequestInput,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityRequestDetail>;
  mineAsSender(
    query?: WaylerAvailabilityRequestsListQuery,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityRequestListResponse>;
  mineAsWayler(
    query?: WaylerAvailabilityRequestsListQuery,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityRequestListResponse>;
  get(id: string, accessToken?: string | null): Promise<WaylerAvailabilityRequestDetail>;
  accept(
    id: string,
    input?: RespondWaylerAvailabilityRequestInput,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityRequestDetail>;
  decline(
    id: string,
    input?: RespondWaylerAvailabilityRequestInput,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityRequestDetail>;
  cancel(id: string, accessToken?: string | null): Promise<WaylerAvailabilityRequestDetail>;
}

export type {
  CreateWaylerAvailabilityRequestInput,
  RespondWaylerAvailabilityRequestInput,
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestListResponse,
};
