/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Goal` table. All the data in the column will be lost.
  - Changed the type of `difficulty` on the `AttemptLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `difficulty` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdBy` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Topic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "AttemptLog_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Goal_userId_key";

-- DropIndex
DROP INDEX "ReadinessHistory_userId_date_idx";

-- DropIndex
DROP INDEX "Task_userId_date_idx";

-- AlterTable
ALTER TABLE "AttemptLog" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "CreatedBy";

-- DropEnum
DROP TYPE "TaskDifficulty";

-- DropEnum
DROP TYPE "TaskStatus";

-- DropEnum
DROP TYPE "TaskType";

-- DropEnum
DROP TYPE "TopicCategory";

-- CreateIndex
CREATE INDEX "AttemptLog_userId_idx" ON "AttemptLog"("userId");

-- CreateIndex
CREATE INDEX "AttemptLog_createdAt_idx" ON "AttemptLog"("createdAt");

-- CreateIndex
CREATE INDEX "ReadinessHistory_userId_idx" ON "ReadinessHistory"("userId");

-- CreateIndex
CREATE INDEX "ReadinessHistory_date_idx" ON "ReadinessHistory"("date");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_date_idx" ON "Task"("date");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Topic_parentId_idx" ON "Topic"("parentId");

-- CreateIndex
CREATE INDEX "TopicStat_nextRevisionDate_idx" ON "TopicStat"("nextRevisionDate");
