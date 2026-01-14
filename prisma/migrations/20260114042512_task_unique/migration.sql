/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,title]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "createdBy" SET DEFAULT 'system';

-- CreateIndex
CREATE INDEX "Task_userId_date_idx" ON "Task"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_date_title_key" ON "Task"("userId", "date", "title");
