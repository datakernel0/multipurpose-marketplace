/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "behanceUrl" TEXT,
ADD COLUMN     "billingAddress1" TEXT,
ADD COLUMN     "billingAddress2" TEXT,
ADD COLUMN     "billingCity" TEXT,
ADD COLUMN     "billingCompany" TEXT,
ADD COLUMN     "billingCountry" TEXT,
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "billingFirstName" TEXT,
ADD COLUMN     "billingLastName" TEXT,
ADD COLUMN     "billingZipCode" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "dribbbleUrl" TEXT,
ADD COLUMN     "emailCommentNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailItemReviewNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailNewsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailRatingReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailReviewNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailSupportNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailUpdateNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailWeeklySummary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "googlePlusUrl" TEXT,
ADD COLUMN     "profileHeading" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
