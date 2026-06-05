-- AlterTable
ALTER TABLE "delivery_orders" ADD COLUMN     "proofConfirmationCode" TEXT,
ADD COLUMN     "proofNote" TEXT,
ADD COLUMN     "proofSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "proofSubmittedById" UUID;

-- CreateIndex
CREATE INDEX "delivery_orders_proofSubmittedById_idx" ON "delivery_orders"("proofSubmittedById");

-- AddForeignKey
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_proofSubmittedById_fkey" FOREIGN KEY ("proofSubmittedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
