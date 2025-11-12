/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_bank_account_id_fkey";

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_user_id_key" ON "BankAccount"("user_id");

-- CreateIndex
CREATE INDEX "BankAccount_user_id_idx" ON "BankAccount"("user_id");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
