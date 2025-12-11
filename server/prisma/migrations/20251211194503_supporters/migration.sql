/*
  Warnings:

  - You are about to drop the column `email` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `smile_count` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smile_price` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smile_count" INTEGER NOT NULL,
ADD COLUMN     "smile_price" INTEGER NOT NULL,
ADD COLUMN     "supporter_name" TEXT,
ADD COLUMN     "supporter_xhandle" TEXT;
