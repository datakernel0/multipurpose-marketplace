/*
  Warnings:

  - Added the required column `billingEmail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingFirstName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingLastName` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "billingAddress1" TEXT,
ADD COLUMN     "billingAddress2" TEXT,
ADD COLUMN     "billingCity" TEXT,
ADD COLUMN     "billingCompany" TEXT,
ADD COLUMN     "billingCountry" TEXT,
ADD COLUMN     "billingEmail" TEXT NOT NULL,
ADD COLUMN     "billingFirstName" TEXT NOT NULL,
ADD COLUMN     "billingLastName" TEXT NOT NULL,
ADD COLUMN     "billingPostalCode" TEXT;
