-- CreateEnum
CREATE TYPE "CreditSource" AS ENUM ('MANUAL', 'SALE_CONVERSION');

-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "source" "CreditSource" NOT NULL DEFAULT 'MANUAL';
