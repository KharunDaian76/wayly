import type {
  ActiveWaylerCountSummary,
  WaylerAvailabilityDetail,
  WaylerAvailabilityListResponse,
} from '@wayly/types';
import type {
  ActiveWaylerCountsQueryInput,
  CreateWaylerAvailabilityInput,
  WaylerAvailabilitiesMineQueryInput,
  WaylerAvailabilitiesPublicQueryInput,
} from '@wayly/validation';

export type WaylerAvailabilitiesMineQuery = Partial<WaylerAvailabilitiesMineQueryInput>;
export type WaylerAvailabilitiesPublicQuery = Partial<WaylerAvailabilitiesPublicQueryInput>;
export type ActiveWaylerCountsQuery = Partial<ActiveWaylerCountsQueryInput>;

export interface WaylerAvailabilitiesApi {
  create(
    body: CreateWaylerAvailabilityInput,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityDetail>;
  mine(
    query?: WaylerAvailabilitiesMineQuery,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityListResponse>;
  publicList(
    query?: WaylerAvailabilitiesPublicQuery,
    accessToken?: string | null,
  ): Promise<WaylerAvailabilityListResponse>;
  activeCounts(
    query?: ActiveWaylerCountsQuery,
    accessToken?: string | null,
  ): Promise<ActiveWaylerCountSummary[]>;
  detail(id: string, accessToken?: string | null): Promise<WaylerAvailabilityDetail>;
  publish(id: string, accessToken?: string | null): Promise<WaylerAvailabilityDetail>;
  pause(id: string, accessToken?: string | null): Promise<WaylerAvailabilityDetail>;
  cancel(id: string, accessToken?: string | null): Promise<WaylerAvailabilityDetail>;
}

export type {
  ActiveWaylerCountSummary,
  CreateWaylerAvailabilityInput,
  WaylerAvailabilityDetail,
  WaylerAvailabilityListResponse,
};
