-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_PUBLISHED', 'ORDER_ACCEPTED', 'ORDER_IN_TRANSIT', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PROOF_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED', 'SYSTEM');

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "relatedOrderId" UUID,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "notifications"("readAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_relatedOrderId_idx" ON "notifications"("relatedOrderId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "delivery_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
