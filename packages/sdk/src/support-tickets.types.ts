import type { SupportTicketListResponse, SupportTicketSummary } from '@wayly/types';
import type { CreateSupportTicketInput } from '@wayly/validation';

export interface SupportTicketsApi {
  create(
    body: CreateSupportTicketInput,
    accessToken?: string | null,
  ): Promise<SupportTicketSummary>;
  listMine(accessToken?: string | null): Promise<SupportTicketListResponse>;
}

export type { CreateSupportTicketInput };
