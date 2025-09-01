-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isInterviewer" BOOLEAN NOT NULL DEFAULT false,
    "interviewerName" TEXT,
    "respondentName" TEXT,
    "respondentDepartment" TEXT,
    "f1Answers" TEXT,
    "f2Answers" TEXT,
    "f3Answers" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "configSnapshot" TEXT
);

-- CreateTable
CREATE TABLE "configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forms" TEXT NOT NULL,
    "lookups" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewId" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "categoryScores" TEXT NOT NULL,
    "satisfactionScore" REAL NOT NULL,
    "functionalityScore" REAL NOT NULL,
    "integrationScore" REAL NOT NULL,
    "usageScore" REAL NOT NULL,
    "insights" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    CONSTRAINT "analyses_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
