import type { Dispute, DisputeEvidence, DisputeMessage } from '@prisma/client';
import type {
  AdminDisputeQueueItem,
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeMessageSummary,
  DisputeSummary,
} from '@wayly/types';
import { DisputeReason, DisputeResolution, DisputeStatus } from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma Dispute with order parties to the admin operations queue shape. */
export function toAdminDisputeQueueItem(
  record: Dispute & {
    order: {
      title: string;
      pickupCity: string | null;
      pickupCountry: string | null;
      dropoffCity: string | null;
      dropoffCountry: string | null;
      sender: { displayName: string; email: string };
      acceptedWayler: { displayName: string; email: string } | null;
    };
  },
): AdminDisputeQueueItem {
  return {
    id: record.id,
    orderId: record.orderId,
    orderTitle: record.order.title,
    pickupCity: record.order.pickupCity,
    pickupCountry: record.order.pickupCountry,
    dropoffCity: record.order.dropoffCity,
    dropoffCountry: record.order.dropoffCountry,
    status: record.status as DisputeStatus,
    reason: record.reason as DisputeReason,
    openedAt: record.createdAt.toISOString(),
    senderDisplayName: record.order.sender.displayName,
    senderEmail: record.order.sender.email,
    waylerDisplayName: record.order.acceptedWayler?.displayName ?? null,
    waylerEmail: record.order.acceptedWayler?.email ?? null,
    resolution: (record.resolution as DisputeResolution | null) ?? null,
    resolutionNote: record.resolutionNote,
    resolvedAt: toIso(record.resolvedAt),
  };
}

/** Maps a Prisma Dispute to the safe API summary shape. */
export function toDisputeSummary(record: Dispute): DisputeSummary {
  return {
    id: record.id,
    orderId: record.orderId,
    openedById: record.openedById,
    assignedArbitratorId: record.assignedArbitratorId,
    status: record.status as DisputeStatus,
    reason: record.reason as DisputeReason,
    description: record.description,
    resolution: (record.resolution as DisputeResolution | null) ?? null,
    resolutionNote: record.resolutionNote,
    resolvedAt: toIso(record.resolvedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Maps a Prisma DisputeMessage to the safe API summary shape. */
export function toDisputeMessageSummary(record: DisputeMessage): DisputeMessageSummary {
  return {
    id: record.id,
    disputeId: record.disputeId,
    senderId: record.senderId,
    body: record.body,
    createdAt: record.createdAt.toISOString(),
  };
}

/** Maps a Prisma DisputeEvidence to the safe API summary shape. */
export function toDisputeEvidenceSummary(record: DisputeEvidence): DisputeEvidenceSummary {
  return {
    id: record.id,
    disputeId: record.disputeId,
    submittedById: record.submittedById,
    title: record.title,
    description: record.description,
    fileUrl: record.fileUrl,
    createdAt: record.createdAt.toISOString(),
  };
}

/** Maps a Prisma Dispute with messages and evidence to the safe API detail shape. */
export function toDisputeDetail(
  record: Dispute,
  messages: DisputeMessage[],
  evidence: DisputeEvidence[],
): DisputeDetail {
  return {
    ...toDisputeSummary(record),
    messages: messages.map(toDisputeMessageSummary),
    evidence: evidence.map(toDisputeEvidenceSummary),
  };
}
