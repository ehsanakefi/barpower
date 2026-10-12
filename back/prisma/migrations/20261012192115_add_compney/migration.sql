/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[companyId,code]` on the table `feeders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `datasets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `feeders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `schedule_runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'USER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropIndex
DROP INDEX "feeders_code_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "datasets" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "feeders" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedule_runs" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE INDEX "datasets_companyId_idx" ON "datasets"("companyId");

-- CreateIndex
CREATE INDEX "feeders_companyId_idx" ON "feeders"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "feeders_companyId_code_key" ON "feeders"("companyId", "code");

-- CreateIndex
CREATE INDEX "schedule_runs_companyId_idx" ON "schedule_runs"("companyId");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeders" ADD CONSTRAINT "feeders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_runs" ADD CONSTRAINT "schedule_runs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
