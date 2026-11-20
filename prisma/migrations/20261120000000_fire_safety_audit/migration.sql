CREATE TABLE "FireSafetyAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT,
    "branchId" TEXT,
    "cycleYear" TEXT NOT NULL,
    "employerDetails" TEXT NOT NULL DEFAULT '{}',
    "workersData" TEXT NOT NULL DEFAULT '{}',
    "checklistAnswers" TEXT NOT NULL DEFAULT '{}',
    "furtherInformation" TEXT NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FireSafetyAudit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FireSafetyAudit_branchId_cycleYear_key" ON "FireSafetyAudit"("branchId", "cycleYear");
CREATE INDEX "FireSafetyAudit_organisationId_branchId_cycleYear_idx" ON "FireSafetyAudit"("organisationId", "branchId", "cycleYear");
CREATE INDEX "FireSafetyAudit_userId_updatedAt_idx" ON "FireSafetyAudit"("userId", "updatedAt");

ALTER TABLE "FireSafetyAudit" ADD CONSTRAINT "FireSafetyAudit_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FireSafetyAudit" ADD CONSTRAINT "FireSafetyAudit_organisationId_fkey"
  FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FireSafetyAudit" ADD CONSTRAINT "FireSafetyAudit_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
