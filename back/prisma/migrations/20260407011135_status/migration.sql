/*
  Warnings:

  - Added the required column `status` to the `sheuduling` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED');

-- AlterTable
ALTER TABLE "sheuduling" ADD COLUMN     "status" "status" NOT NULL;
