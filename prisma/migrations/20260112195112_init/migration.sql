-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "targetCompanies" JSONB NOT NULL,
    "timelineDays" INTEGER NOT NULL,
    "hoursPerDay" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "wDsa" DOUBLE PRECISION NOT NULL,
    "wApti" DOUBLE PRECISION NOT NULL,
    "wCs" DOUBLE PRECISION NOT NULL,
    "wDev" DOUBLE PRECISION NOT NULL,
    "difficultyCurve" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "parentId" INTEGER,
    "name" TEXT NOT NULL,
    "importanceScore" INTEGER NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "topicId" INTEGER,
    "title" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "topicId" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeTakenSec" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "mistakeTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttemptLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicStat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "attemptsTotal" INTEGER NOT NULL DEFAULT 0,
    "correctTotal" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSec" INTEGER NOT NULL DEFAULT 0,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "nextRevisionDate" TIMESTAMP(3),

    CONSTRAINT "TopicStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "dsa" DOUBLE PRECISION NOT NULL,
    "apti" DOUBLE PRECISION NOT NULL,
    "cs" DOUBLE PRECISION NOT NULL,
    "dev" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReadinessHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Topic_parentId_idx" ON "Topic"("parentId");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_date_idx" ON "Task"("date");

-- CreateIndex
CREATE INDEX "Task_topicId_idx" ON "Task"("topicId");

-- CreateIndex
CREATE INDEX "AttemptLog_userId_idx" ON "AttemptLog"("userId");

-- CreateIndex
CREATE INDEX "AttemptLog_topicId_idx" ON "AttemptLog"("topicId");

-- CreateIndex
CREATE INDEX "AttemptLog_createdAt_idx" ON "AttemptLog"("createdAt");

-- CreateIndex
CREATE INDEX "TopicStat_userId_idx" ON "TopicStat"("userId");

-- CreateIndex
CREATE INDEX "TopicStat_topicId_idx" ON "TopicStat"("topicId");

-- CreateIndex
CREATE INDEX "TopicStat_nextRevisionDate_idx" ON "TopicStat"("nextRevisionDate");

-- CreateIndex
CREATE UNIQUE INDEX "TopicStat_userId_topicId_key" ON "TopicStat"("userId", "topicId");

-- CreateIndex
CREATE INDEX "ReadinessHistory_userId_idx" ON "ReadinessHistory"("userId");

-- CreateIndex
CREATE INDEX "ReadinessHistory_date_idx" ON "ReadinessHistory"("date");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptLog" ADD CONSTRAINT "AttemptLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptLog" ADD CONSTRAINT "AttemptLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptLog" ADD CONSTRAINT "AttemptLog_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicStat" ADD CONSTRAINT "TopicStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicStat" ADD CONSTRAINT "TopicStat_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessHistory" ADD CONSTRAINT "ReadinessHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
