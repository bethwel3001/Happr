/*
  Warnings:

  - You are about to drop the column `account_name` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `BankAccount` table. All the data in the column will be lost.
  - Added the required column `encrypted_bank_account` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."BankAccount_account_number_key";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "account_name",
DROP COLUMN "account_number",
DROP COLUMN "bank_name",
ADD COLUMN     "encrypted_bank_account" TEXT NOT NULL;
