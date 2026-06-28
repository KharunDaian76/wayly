-- Support ticket threaded replies v1.

CREATE TYPE "SupportTicketMessageAuthorRole" AS ENUM ('USER', 'ADMIN');

CREATE TABLE "support_ticket_messages" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "authorRole" "SupportTicketMessageAuthorRole" NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_ticket_messages_ticketId_idx" ON "support_ticket_messages"("ticketId");
CREATE INDEX "support_ticket_messages_authorId_idx" ON "support_ticket_messages"("authorId");
CREATE INDEX "support_ticket_messages_ticketId_createdAt_idx" ON "support_ticket_messages"("ticketId", "createdAt");
CREATE INDEX "support_ticket_messages_authorRole_idx" ON "support_ticket_messages"("authorRole");
CREATE INDEX "support_ticket_messages_isInternal_idx" ON "support_ticket_messages"("isInternal");

ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
