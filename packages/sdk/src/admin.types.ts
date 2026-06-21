import type { AdminDisputeListResponse } from '@wayly/types';

import type { DisputesListQuery } from './disputes.types';

/** Admin / operations endpoints (read-only in current batches). */
export interface AdminApi {
  listDisputes(
    query?: DisputesListQuery,
    accessToken?: string | null,
  ): Promise<AdminDisputeListResponse>;
}

export type { AdminDisputeListResponse };
