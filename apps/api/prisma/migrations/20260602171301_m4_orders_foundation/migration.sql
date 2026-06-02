-- CreateEnum
CREATE TYPE "DeliveryOrderStatus" AS ENUM ('DRAFT', 'OPEN', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "DeliveryOrderType" AS ENUM ('LOCAL', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "PackageSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'OVERSIZED');

-- CreateTable
CREATE TABLE "delivery_orders" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "acceptedWaylerId" UUID,
    "status" "DeliveryOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "DeliveryOrderType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "packageSize" "PackageSize",
    "packageWeightKg" DECIMAL(8,2),
    "pickupCountry" TEXT,
    "pickupCity" TEXT,
    "pickupAddressText" TEXT,
    "pickupLat" DECIMAL(10,7),
    "pickupLng" DECIMAL(10,7),
    "dropoffCountry" TEXT,
    "dropoffCity" TEXT,
    "dropoffAddressText" TEXT,
    "dropoffLat" DECIMAL(10,7),
    "dropoffLng" DECIMAL(10,7),
    "pickupDateFrom" TIMESTAMP(3),
    "pickupDateTo" TIMESTAMP(3),
    "deliveryDeadline" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "offeredRewardAmount" DECIMAL(10,2),
    "escrowRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "delivery_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_orders_senderId_idx" ON "delivery_orders"("senderId");

-- CreateIndex
CREATE INDEX "delivery_orders_acceptedWaylerId_idx" ON "delivery_orders"("acceptedWaylerId");

-- CreateIndex
CREATE INDEX "delivery_orders_status_idx" ON "delivery_orders"("status");

-- CreateIndex
CREATE INDEX "delivery_orders_type_idx" ON "delivery_orders"("type");

-- CreateIndex
CREATE INDEX "delivery_orders_pickupCountry_idx" ON "delivery_orders"("pickupCountry");

-- CreateIndex
CREATE INDEX "delivery_orders_pickupCity_idx" ON "delivery_orders"("pickupCity");

-- CreateIndex
CREATE INDEX "delivery_orders_dropoffCountry_idx" ON "delivery_orders"("dropoffCountry");

-- CreateIndex
CREATE INDEX "delivery_orders_dropoffCity_idx" ON "delivery_orders"("dropoffCity");

-- CreateIndex
CREATE INDEX "delivery_orders_createdAt_idx" ON "delivery_orders"("createdAt");

-- CreateIndex
CREATE INDEX "delivery_orders_publishedAt_idx" ON "delivery_orders"("publishedAt");

-- AddForeignKey
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_acceptedWaylerId_fkey" FOREIGN KEY ("acceptedWaylerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
