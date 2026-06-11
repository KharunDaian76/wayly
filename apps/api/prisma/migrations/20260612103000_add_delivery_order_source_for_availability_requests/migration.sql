-- CreateEnum
CREATE TYPE "DeliveryOrderSource" AS ENUM ('SENDER_POSTED_ORDER', 'WAYLER_AVAILABILITY_REQUEST');

-- AlterTable
ALTER TABLE "delivery_orders" ADD COLUMN     "sourceType" "DeliveryOrderSource" NOT NULL DEFAULT 'SENDER_POSTED_ORDER',
ADD COLUMN     "availabilityRequestId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "delivery_orders_availabilityRequestId_key" ON "delivery_orders"("availabilityRequestId");

-- CreateIndex
CREATE INDEX "delivery_orders_sourceType_idx" ON "delivery_orders"("sourceType");

-- AddForeignKey
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_availabilityRequestId_fkey" FOREIGN KEY ("availabilityRequestId") REFERENCES "wayler_availability_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
