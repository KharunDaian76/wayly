import type { SupportTicketListResponse, SupportTicketSummary } from '@wayly/types';
import type { CreateSupportTicketInput } from '@wayly/validation';

import type { RequestOptions } from './types';
import type { SupportTicketsApi } from './support-tickets.types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createSupportTicketsApi(request: Requester): SupportTicketsApi {
  return {
    create: (body: CreateSupportTicketInput, accessToken?: string | null) =>
      request<SupportTicketSummary>('/support-tickets', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    listMine: (accessToken?: string | null) =>
      request<SupportTicketListResponse>('/support-tickets/me', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { SupportTicketsApi } from './support-tickets.types';
