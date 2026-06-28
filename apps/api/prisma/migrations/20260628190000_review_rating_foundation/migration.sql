-- Trust reviews & ratings foundation v1.

CREATE TYPE "ReviewPartyRole" AS ENUM ('SENDER', 'WAYLER');

CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "revieweeId" UUID NOT NULL,
    "reviewerRole" "ReviewPartyRole" NOT NULL,
    "revieweeRole" "ReviewPartyRole" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" TIMESTAMP(3),
    "hiddenById" UUID,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_orderId_reviewerId_revieweeId_key" ON "reviews"("orderId", "reviewerId", "revieweeId");
CREATE INDEX "reviews_orderId_idx" ON "reviews"("orderId");
CREATE INDEX "reviews_reviewerId_idx" ON "reviews"("reviewerId");
CREATE INDEX "reviews_revieweeId_idx" ON "reviews"("revieweeId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_isHidden_idx" ON "reviews"("isHidden");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "delivery_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
