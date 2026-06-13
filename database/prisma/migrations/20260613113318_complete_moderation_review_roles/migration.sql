/*
  Warnings:

  - The `kycStatus` column on the `SellerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[providerChargeId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "ContentStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "SellerProfile" DROP COLUMN "kycStatus",
ADD COLUMN     "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student';

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_providerChargeId_key" ON "PaymentTransaction"("providerChargeId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
