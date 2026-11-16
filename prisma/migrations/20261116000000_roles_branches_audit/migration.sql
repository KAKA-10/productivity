-- DropIndex
DROP INDEX "public"."AuditSubmission_userId_key";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "public"."AuditSubmission" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "clientAttestedAt" TIMESTAMP(3),
ADD COLUMN     "clientDeclaration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientSignatureEvidenceId" TEXT,
ADD COLUMN     "clientSignerId" TEXT,
ADD COLUMN     "clientSignerName" TEXT,
ADD COLUMN     "clientSignerRole" TEXT,
ADD COLUMN     "cycleYear" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "public"."AuditEvidence" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'supporting',
ADD COLUMN     "fileData" BYTEA;

-- AlterTable
ALTER TABLE "public"."Incident" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."RiskAssessment" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."Jsa" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."ToolboxTalk" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."ComplianceItem" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."OshAudit" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."Inspection" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."PpeRecord" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."FireEquipment" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."Personnel" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."CommitteeMeeting" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."TrainingRecord" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."Capa" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."Reminder" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."EmailLog" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "public"."DoshsReport" ADD COLUMN     "branchId" TEXT;

-- CreateTable
CREATE TABLE "public"."Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Branch" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT NOT NULL DEFAULT 'Nairobi',
    "subCounty" TEXT NOT NULL DEFAULT '',
    "town" TEXT NOT NULL DEFAULT '',
    "poBox" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientAssignment" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_name_key" ON "public"."Organisation"("name");

-- CreateIndex
CREATE INDEX "Branch_organisationId_status_idx" ON "public"."Branch"("organisationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_organisationId_name_key" ON "public"."Branch"("organisationId", "name");

-- CreateIndex
CREATE INDEX "ClientAssignment_staffId_organisationId_idx" ON "public"."ClientAssignment"("staffId", "organisationId");

-- CreateIndex
CREATE INDEX "ClientAssignment_branchId_idx" ON "public"."ClientAssignment"("branchId");

-- CreateIndex
CREATE INDEX "AuditSubmission_organisationId_branchId_status_idx" ON "public"."AuditSubmission"("organisationId", "branchId", "status");

-- CreateIndex
CREATE INDEX "AuditSubmission_userId_updatedAt_idx" ON "public"."AuditSubmission"("userId", "updatedAt");

-- CreateIndex
-- Data migration: preserve existing workplace records and grant the bootstrap administrator the top-level role.
UPDATE "public"."User" SET "role" = 'workplace_admin' WHERE "role" = 'user';

WITH "candidate" AS (
    SELECT "id"
    FROM "public"."User"
    WHERE "role" = 'admin'
    ORDER BY CASE WHEN "username" = 'productivityAdmin' THEN 0 ELSE 1 END, "createdAt" ASC
    LIMIT 1
)
UPDATE "public"."User"
SET "role" = 'super_admin'
WHERE "id" = (SELECT "id" FROM "candidate");

INSERT INTO "public"."Organisation" ("id", "name", "status", "createdAt", "updatedAt")
SELECT 'org_' || md5(trim("organisation")), trim("organisation"), 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "public"."User"
WHERE "role" IN ('workplace_admin', 'client_super_admin') AND trim("organisation") <> ''
GROUP BY trim("organisation")
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "public"."Branch" ("id", "organisationId", "name", "county", "subCounty", "town", "poBox", "status", "createdAt", "updatedAt")
SELECT
    'branch_' || md5(o."id" || ':main'),
    o."id",
    'Main branch',
    COALESCE(min(u."county"), 'Nairobi'),
    '',
    '',
    '',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "public"."Organisation" o
JOIN "public"."User" u ON trim(u."organisation") = o."name"
WHERE u."role" IN ('workplace_admin', 'client_super_admin')
GROUP BY o."id"
ON CONFLICT ("organisationId", "name") DO NOTHING;

UPDATE "public"."User" u
SET "organisationId" = o."id"
FROM "public"."Organisation" o
WHERE trim(u."organisation") = o."name"
  AND u."role" IN ('workplace_admin', 'client_super_admin');

UPDATE "public"."User" u
SET "branchId" = b."id"
FROM "public"."Branch" b
WHERE u."organisationId" = b."organisationId"
  AND b."name" = 'Main branch'
  AND u."role" = 'workplace_admin';

UPDATE "public"."AuditSubmission" s
SET
    "organisationId" = u."organisationId",
    "branchId" = u."branchId",
    "cycleYear" = EXTRACT(YEAR FROM s."createdAt")::text
FROM "public"."User" u
WHERE s."userId" = u."id"
  AND u."role" = 'workplace_admin';

UPDATE "public"."Incident" r SET "branchId" = b."id" FROM "public"."Branch" b WHERE trim(r."organisation") = (SELECT o."name" FROM "public"."Organisation" o WHERE o."id" = b."organisationId") AND b."name" = 'Main branch';
UPDATE "public"."RiskAssessment" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."Jsa" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."ToolboxTalk" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."ComplianceItem" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."OshAudit" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."Inspection" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."PpeRecord" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."FireEquipment" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."Personnel" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."CommitteeMeeting" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."TrainingRecord" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."Capa" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."Reminder" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."EmailLog" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';
UPDATE "public"."DoshsReport" r SET "branchId" = b."id" FROM "public"."Branch" b JOIN "public"."Organisation" o ON o."id" = b."organisationId" WHERE trim(r."organisation") = o."name" AND b."name" = 'Main branch';

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmission" ADD CONSTRAINT "AuditSubmission_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmission" ADD CONSTRAINT "AuditSubmission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmission" ADD CONSTRAINT "AuditSubmission_clientSignerId_fkey" FOREIGN KEY ("clientSignerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiskAssessment" ADD CONSTRAINT "RiskAssessment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Jsa" ADD CONSTRAINT "Jsa_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplianceItem" ADD CONSTRAINT "ComplianceItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OshAudit" ADD CONSTRAINT "OshAudit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inspection" ADD CONSTRAINT "Inspection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PpeRecord" ADD CONSTRAINT "PpeRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FireEquipment" ADD CONSTRAINT "FireEquipment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Personnel" ADD CONSTRAINT "Personnel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommitteeMeeting" ADD CONSTRAINT "CommitteeMeeting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingRecord" ADD CONSTRAINT "TrainingRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Capa" ADD CONSTRAINT "Capa_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reminder" ADD CONSTRAINT "Reminder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoshsReport" ADD CONSTRAINT "DoshsReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
