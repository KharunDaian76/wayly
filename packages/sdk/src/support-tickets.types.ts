import type {
  SupportTicketListResponse,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
  SupportTicketSummary,
} from '@wayly/types';
import type { CreateSupportTicketInput, CreateSupportTicketMessageInput } from '@wayly/validation';

export interface SupportTicketsApi {
  create(
    body: CreateSupportTicketInput,
    accessToken?: string | null,
  ): Promise<SupportTicketSummary>;
  listMine(accessToken?: string | null): Promise<SupportTicketListResponse>;
  listMessages(
    ticketId: string,
    accessToken?: string | null,
  ): Promise<SupportTicketMessageListResponse>;
  createMessage(
    ticketId: string,
    body: CreateSupportTicketMessageInput,
    accessToken?: string | null,
  ): Promise<SupportTicketMessageSummary>;
}

export type { CreateSupportTicketInput, CreateSupportTicketMessageInput };
