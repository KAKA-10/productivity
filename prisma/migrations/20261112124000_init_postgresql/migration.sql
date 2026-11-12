-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "county" TEXT NOT NULL DEFAULT 'Nairobi',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "pinHash" TEXT,
    "auditAccess" BOOLEAN NOT NULL DEFAULT true,
    "unlockedFeatures" TEXT NOT NULL DEFAULT '["incidents","risks","jsa","toolbox-talks","compliance","inspections","reports","ppe","fire","personnel","meetings","capa","training-records"]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL DEFAULT 'development_mock',
    "checkoutTokenHash" TEXT,
    "receiptReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionVersion" INTEGER NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pinFailures" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditSubmission" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "responses" TEXT NOT NULL DEFAULT '{}',
    "findings" TEXT NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditEvidence" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditSubmissionVersion" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditSubmissionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "occurredAt" TEXT NOT NULL,
    "injuredName" TEXT NOT NULL DEFAULT '',
    "occupation" TEXT NOT NULL DEFAULT '',
    "bodyPart" TEXT NOT NULL DEFAULT '',
    "lostTimeDays" INTEGER NOT NULL DEFAULT 0,
    "oshaSection" TEXT NOT NULL DEFAULT 'OSHA 2007 Sec. 6',
    "witnesses" TEXT NOT NULL DEFAULT '',
    "immediateCause" TEXT NOT NULL DEFAULT '',
    "rootCause" TEXT NOT NULL DEFAULT '',
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RiskAssessment" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "hazard" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "existingControls" TEXT NOT NULL,
    "residualRisk" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "personsAtRisk" TEXT NOT NULL DEFAULT '',
    "legalDuty" TEXT NOT NULL DEFAULT 'OSHA 2007 Sec. 6 — Duty of care',
    "reviewDate" TEXT NOT NULL DEFAULT '',
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jsa" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "stepsCount" INTEGER NOT NULL,
    "permitRequired" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewDate" TEXT NOT NULL,
    "steps" TEXT NOT NULL DEFAULT '[]',
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jsa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolboxTalk" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "attendeesCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolboxTalk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComplianceItem" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "regulator" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "lawReference" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OshAudit" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "cycleYear" TEXT NOT NULL,
    "auditor" TEXT NOT NULL,
    "auditorCredentials" TEXT NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "committeeSignOff" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "workplaceRegNo" TEXT NOT NULL DEFAULT '',
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "oshaSections" TEXT NOT NULL DEFAULT '',
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OshAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inspection" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "inspector" TEXT NOT NULL,
    "scheduled" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "findings" TEXT NOT NULL DEFAULT '',
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PpeRecord" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "employee" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "issuedOn" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PpeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FireEquipment" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "lastInspection" TEXT NOT NULL,
    "nextInspection" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FireEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Personnel" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommitteeMeeting" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "meetingDate" TEXT NOT NULL,
    "chair" TEXT NOT NULL,
    "attendees" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "minutes" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainingRecord" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "trainee" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "trainer" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Capa" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reminder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRef" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoshsReport" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL,
    "organisation" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoshsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutTokenHash_key" ON "public"."Payment"("checkoutTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptReference_key" ON "public"."Payment"("receiptReference");

-- CreateIndex
CREATE INDEX "Payment_userId_status_idx" ON "public"."Payment"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "public"."AuthSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "public"."AuthSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSubmission_reference_key" ON "public"."AuditSubmission"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSubmission_userId_key" ON "public"."AuditSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditEvidence_storageKey_key" ON "public"."AuditEvidence"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSubmissionVersion_submissionId_version_key" ON "public"."AuditSubmissionVersion"("submissionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_ref_key" ON "public"."Incident"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_ref_key" ON "public"."RiskAssessment"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Jsa_ref_key" ON "public"."Jsa"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "ToolboxTalk_ref_key" ON "public"."ToolboxTalk"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceItem_ref_key" ON "public"."ComplianceItem"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "OshAudit_ref_key" ON "public"."OshAudit"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_ref_key" ON "public"."Inspection"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "PpeRecord_ref_key" ON "public"."PpeRecord"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "FireEquipment_ref_key" ON "public"."FireEquipment"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_ref_key" ON "public"."Personnel"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMeeting_ref_key" ON "public"."CommitteeMeeting"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRecord_ref_key" ON "public"."TrainingRecord"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Capa_ref_key" ON "public"."Capa"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "DoshsReport_ref_key" ON "public"."DoshsReport"("ref");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmission" ADD CONSTRAINT "AuditSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditEvidence" ADD CONSTRAINT "AuditEvidence_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."AuditSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmissionVersion" ADD CONSTRAINT "AuditSubmissionVersion_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."AuditSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditSubmissionVersion" ADD CONSTRAINT "AuditSubmissionVersion_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
