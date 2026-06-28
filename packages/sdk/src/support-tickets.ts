import type {
  SupportTicketListResponse,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
  SupportTicketSummary,
} from '@wayly/types';
import type { CreateSupportTicketInput, CreateSupportTicketMessageInput } from '@wayly/validation';

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

    listMessages: (ticketId: string, accessToken?: string | null) =>
      request<SupportTicketMessageListResponse>(`/support-tickets/${ticketId}/messages`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    createMessage: (
      ticketId: string,
      body: CreateSupportTicketMessageInput,
      accessToken?: string | null,
    ) =>
      request<SupportTicketMessageSummary>(`/support-tickets/${ticketId}/messages`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
  };
}

export type { SupportTicketsApi } from './support-tickets.types';
