-- CreateEnum
CREATE TYPE "WaylerAvailabilityRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "wayler_availability_requests" (
    "id" UUID NOT NULL,
    "availabilityId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "waylerId" UUID NOT NULL,
    "status" "WaylerAvailabilityRequestStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "packageDescription" TEXT NOT NULL,
    "pickupCountry" TEXT NOT NULL,
    "pickupCity" TEXT NOT NULL,
    "pickupAddress" TEXT,
    "dropoffCountry" TEXT NOT NULL,
    "dropoffCity" TEXT NOT NULL,
    "dropoffAddress" TEXT,
    "desiredPickupFrom" TIMESTAMP(3),
    "desiredPickupTo" TIMESTAMP(3),
    "desiredDeliveryFrom" TIMESTAMP(3),
    "desiredDeliveryTo" TIMESTAMP(3),
    "proposedRewardCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "message" TEXT,
    "responseMessage" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wayler_availability_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wayler_availability_requests_availabilityId_idx" ON "wayler_availability_requests"("availabilityId");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_senderId_idx" ON "wayler_availability_requests"("senderId");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_waylerId_idx" ON "wayler_availability_requests"("waylerId");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_status_idx" ON "wayler_availability_requests"("status");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_createdAt_idx" ON "wayler_availability_requests"("createdAt");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_waylerId_status_idx" ON "wayler_availability_requests"("waylerId", "status");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_senderId_status_idx" ON "wayler_availability_requests"("senderId", "status");

-- CreateIndex
CREATE INDEX "wayler_availability_requests_availabilityId_status_idx" ON "wayler_availability_requests"("availabilityId", "status");

-- AddForeignKey
ALTER TABLE "wayler_availability_requests" ADD CONSTRAINT "wayler_availability_requests_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "wayler_availabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wayler_availability_requests" ADD CONSTRAINT "wayler_availability_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wayler_availability_requests" ADD CONSTRAINT "wayler_availability_requests_waylerId_fkey" FOREIGN KEY ("waylerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
