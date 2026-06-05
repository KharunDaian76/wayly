import type {
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeListResponse,
  DisputeMessageSummary,
} from '@wayly/types';
import type {
  AddDisputeEvidenceInput,
  AddDisputeMessageInput,
  DisputesListQueryInput,
  OpenDisputeInput,
} from '@wayly/validation';

/** GET /disputes query parameters. */
export type DisputesListQuery = Partial<DisputesListQueryInput>;

export interface DisputesApi {
  open(body: OpenDisputeInput, accessToken?: string | null): Promise<DisputeDetail>;
  list(query?: DisputesListQuery, accessToken?: string | null): Promise<DisputeListResponse>;
  detail(id: string, accessToken?: string | null): Promise<DisputeDetail>;
  addMessage(
    id: string,
    body: AddDisputeMessageInput,
    accessToken?: string | null,
  ): Promise<DisputeMessageSummary>;
  addEvidence(
    id: string,
    body: AddDisputeEvidenceInput,
    accessToken?: string | null,
  ): Promise<DisputeEvidenceSummary>;
}

export type {
  AddDisputeEvidenceInput,
  AddDisputeMessageInput,
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeListResponse,
  DisputeMessageSummary,
  OpenDisputeInput,
};
