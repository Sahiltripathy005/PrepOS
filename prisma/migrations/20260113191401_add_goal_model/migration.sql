/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `createdBy` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Goal` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `difficulty` on the `AttemptLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `difficulty` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Topic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TopicCategory" AS ENUM ('DSA', 'APTI', 'CS', 'DEV');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('SOLVE', 'REVISE', 'MOCK', 'NOTES', 'PROJECT');

-- CreateEnum
CREATE TYPE "TaskDifficulty" AS ENUM ('EASY', 'MED', 'HARD');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CreatedBy" AS ENUM ('SYSTEM', 'MANUAL');

-- DropIndex
DROP INDEX "AttemptLog_createdAt_idx";

-- DropIndex
DROP INDEX "AttemptLog_userId_idx";

-- DropIndex
DROP INDEX "ReadinessHistory_date_idx";

-- DropIndex
DROP INDEX "ReadinessHistory_userId_idx";

-- DropIndex
DROP INDEX "Task_date_idx";

-- DropIndex
DROP INDEX "Task_userId_idx";

-- DropIndex
DROP INDEX "Topic_category_idx";

-- DropIndex
DROP INDEX "Topic_parentId_idx";

-- DropIndex
DROP INDEX "TopicStat_nextRevisionDate_idx";

-- AlterTable
ALTER TABLE "AttemptLog" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "TaskDifficulty" NOT NULL;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "type",
ADD COLUMN     "type" "TaskType" NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "TaskDifficulty" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" "CreatedBy" NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "category",
ADD COLUMN     "category" "TopicCategory" NOT NULL;

-- CreateIndex
CREATE INDEX "AttemptLog_userId_createdAt_idx" ON "AttemptLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_key" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "ReadinessHistory_userId_date_idx" ON "ReadinessHistory"("userId", "date");

-- CreateIndex
CREATE INDEX "Task_userId_date_idx" ON "Task"("userId", "date");
