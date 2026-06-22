import type { AdminDisputeQueueItem } from '@wayly/types';
import type { AdminDisputeResolveInput } from '@wayly/validation';

/** Body for POST /admin/disputes/:id/resolve. */
export type AdminDisputeResolveBody = AdminDisputeResolveInput;

export type { AdminDisputeQueueItem };
