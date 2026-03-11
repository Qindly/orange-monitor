-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('js', 'api', 'resource');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('open', 'resolved', 'ignored');

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "groupingKey" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedMessage" TEXT NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "affectedPages" INTEGER NOT NULL,
    "affectedUsers" INTEGER NOT NULL,
    "firstSeenAt" BIGINT NOT NULL,
    "lastSeenAt" BIGINT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'open',
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    "details" JSONB,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "groupingKey" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "normalizedMessage" TEXT NOT NULL,
    "rawStack" TEXT,
    "stackFrames" JSONB,
    "stackTopFrame" TEXT,
    "filename" TEXT,
    "lineno" INTEGER,
    "colno" INTEGER,
    "timestamp" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT,
    "pageKey" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "tags" JSONB,
    "extra" JSONB,
    "details" JSONB,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueUser" (
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "IssueUser_pkey" PRIMARY KEY ("issueId","userId")
);

-- CreateTable
CREATE TABLE "IssuePage" (
    "issueId" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "IssuePage_pkey" PRIMARY KEY ("issueId","pageKey")
);

-- CreateIndex
CREATE INDEX "issue_project_last_seen_idx" ON "Issue"("projectId", "lastSeenAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "issue_project_grouping_key_unique" ON "Issue"("projectId", "groupingKey");

-- CreateIndex
CREATE INDEX "event_issue_timestamp_idx" ON "Event"("issueId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "event_project_idx" ON "Event"("projectId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueUser" ADD CONSTRAINT "IssueUser_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuePage" ADD CONSTRAINT "IssuePage_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

