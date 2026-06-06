import type {
  WaylerAccessPassListResponse,
  WaylerAccessPassSummary,
  WaylerAccessState,
} from '@wayly/types';
import type { WaylerAccessPassesListQueryInput } from '@wayly/validation';

export type WaylerAccessPassesListQuery = Partial<WaylerAccessPassesListQueryInput>;

export interface WaylerAccessApi {
  today(accessToken?: string | null): Promise<WaylerAccessState>;
  mine(
    query?: WaylerAccessPassesListQuery,
    accessToken?: string | null,
  ): Promise<WaylerAccessPassListResponse>;
  mockActivateToday(accessToken?: string | null): Promise<WaylerAccessPassSummary>;
  cancel(id: string, accessToken?: string | null): Promise<WaylerAccessPassSummary>;
}

export type { WaylerAccessPassListResponse, WaylerAccessPassSummary, WaylerAccessState };
