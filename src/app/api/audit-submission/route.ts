import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AUDIT_SECTIONS,
  getAuditProgress,
  getMissingAuditEvidence,
  validateAuditResponses,
  type AuditResponses,
} from '@/lib/audit-template';
import { nextRef } from '@/lib/utils';
import { canEditWorkspace, canSignClientAudit } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

const currentCycle = () => String(new Date().getFullYear());

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

async function getSelectedSubmission(request: Request, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return { branch: null, submission: null };
  const cycleYear = currentCycle();
  const submission = await prisma.auditSubmission.findFirst({
    where: { organisationId: branch.organisationId, branchId: branch.id, cycleYear },
    orderBy: { updatedAt: 'desc' },
  });
  return { branch, submission };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });
  if (session.role.startsWith('client_') || session.role === 'workplace_admin') {
    if (!session.auditAccess) {
      return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });
    }
  }

  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) {
    return NextResponse.json({ error: 'Choose an assigned client branch before opening the audit.' }, { status: 400 });
  }

  const cycleYear = currentCycle();
  let submission = await prisma.auditSubmission.findFirst({
    where: { organisationId: branch.organisationId, branchId: branch.id, cycleYear },
    orderBy: { updatedAt: 'desc' },
  });
  if (!submission) {
    const count = await prisma.auditSubmission.count();
    submission = await prisma.$transaction(async (transaction) => {
      const created = await transaction.auditSubmission.create({
        data: {
          userId: session.id,
          organisationId: branch.organisationId,
          branchId: branch.id,
          cycleYear,
          reference: nextRef('OSH', count),
        },
      });
      await transaction.auditSubmissionVersion.create({
        data: {
          submissionId: created.id,
          version: 0,
          actorId: session.id,
          action: 'created',
          snapshot: JSON.stringify({ responses: {}, findings: {}, status: created.status }),
        },
      });
      return created;
    });
  }

  const evidence = await prisma.auditEvidence.findMany({
    where: { submissionId: submission.id },
    orderBy: { uploadedAt: 'desc' },
    select: { id: true, sectionId: true, fieldKey: true, kind: true, originalName: true, mimeType: true, byteSize: true, uploadedAt: true },
  });
  const responses = parseJson<AuditResponses>(submission.responses);

  return NextResponse.json({
    id: submission.id,
    reference: submission.reference,
    status: submission.status,
    version: submission.version,
    cycleYear: submission.cycleYear,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
    responses,
    findings: ['returned', 'draft'].includes(submission.status)
      ? parseJson<Record<string, string>>(submission.findings)
      : {},
    evidence,
    progress: getAuditProgress(responses),
    categories: [...new Set(AUDIT_SECTIONS.map((section) => section.category))],
    branch: { id: branch.id, name: branch.name, organisation: branch.organisation },
    canSign: canSignClientAudit(session),
    signingUserName: canSignClientAudit(session) ? session.fullName : null,
    clientSignerName: submission.clientSignerName,
    clientAttestedAt: submission.clientAttestedAt,
    clientDeclaration: submission.clientDeclaration,
    clientSignatureEvidenceId: submission.clientSignatureEvidenceId,
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });
  if ((session.role === 'client_super_admin' || session.role === 'workplace_admin') && !session.auditAccess) {
    return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid audit responses' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (!input.responses || typeof input.responses !== 'object' || Array.isArray(input.responses)) {
    return NextResponse.json({ error: 'Audit responses are required' }, { status: 400 });
  }
  const validation = validateAuditResponses(input.responses);
  if (validation.errors.length) {
    return NextResponse.json({ error: validation.errors[0], details: validation.errors }, { status: 400 });
  }
  const encoded = JSON.stringify(validation.responses);
  if (encoded.length > 512_000) {
    return NextResponse.json({ error: 'Audit responses are too large' }, { status: 413 });
  }

  const { branch, submission } = await getSelectedSubmission(request, session);
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before saving.' }, { status: 400 });
  if (!submission) return NextResponse.json({ error: 'Audit submission not found' }, { status: 404 });
  if (!['draft', 'returned'].includes(submission.status)) {
    return NextResponse.json({ error: 'Submitted audits cannot be edited until they are returned' }, { status: 409 });
  }
  if (submission.responses === encoded) return NextResponse.json({ ok: true, version: submission.version });

  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.auditSubmission.update({
      where: { id: submission.id },
      data: {
        responses: encoded,
        status: 'draft',
        submittedAt: null,
        reviewedAt: null,
        clientDeclaration: false,
        clientSignerId: null,
        clientSignerName: null,
        clientSignerRole: null,
        clientAttestedAt: null,
        clientSignatureEvidenceId: null,
        version: { increment: 1 },
      },
    });
    await transaction.auditSubmissionVersion.create({
      data: {
        submissionId: submission.id,
        version: result.version,
        actorId: session.id,
        action: 'draft-save',
        snapshot: JSON.stringify({
          responses: validation.responses,
          findings: parseJson<Record<string, string>>(submission.findings),
          status: 'draft',
        }),
      },
    });
    return result;
  });

  return NextResponse.json({ ok: true, version: updated.version, updatedAt: updated.updatedAt });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canSignClientAudit(session)) {
    return NextResponse.json({ error: 'Only an authorised client account can sign and submit this audit.' }, { status: 403 });
  }
  if (!session.auditAccess) {
    return NextResponse.json({ error: 'Complete your audit registration payment before submitting.' }, { status: 402 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Client sign-off details are required.' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const signerName = typeof input.signerName === 'string' ? input.signerName.trim() : '';
  const declaration = input.declaration === true;
  const signatureEvidenceId = typeof input.signatureEvidenceId === 'string' ? input.signatureEvidenceId : '';
  if (!declaration) return NextResponse.json({ error: 'Confirm the declaration before signing.' }, { status: 400 });
  if (signerName.toLocaleLowerCase() !== session.fullName.trim().toLocaleLowerCase()) {
    return NextResponse.json({ error: 'Enter the name on your client account to confirm your identity.' }, { status: 400 });
  }

  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an authorised client branch before signing.' }, { status: 400 });
  const submission = await prisma.auditSubmission.findFirst({
    where: { organisationId: branch.organisationId, branchId: branch.id, cycleYear: currentCycle() },
  });
  if (!submission) return NextResponse.json({ error: 'Audit submission not found' }, { status: 404 });
  if (!['draft', 'returned'].includes(submission.status)) {
    return NextResponse.json({ error: 'This audit is no longer available for client sign-off.' }, { status: 409 });
  }

  const responses = parseJson<AuditResponses>(submission.responses);
  const progress = getAuditProgress(responses);
  if (progress.completed !== progress.total) {
    return NextResponse.json({
      error: `Complete all ${progress.total} audit sections before signing (${progress.total - progress.completed} remaining).`,
    }, { status: 400 });
  }
  const evidence = await prisma.auditEvidence.findMany({
    where: { submissionId: submission.id },
    select: { id: true, sectionId: true, fieldKey: true, kind: true },
  });
  const missingEvidence = getMissingAuditEvidence(
    responses,
    evidence.filter((item) => item.kind === 'supporting'),
  );
  if (missingEvidence.length) {
    return NextResponse.json({
      error: `Attach the required evidence: ${missingEvidence.map((item) => `${item.sectionTitle} — ${item.label}`).join('; ')}.`,
    }, { status: 400 });
  }
  const signature = evidence.find((item) => item.id === signatureEvidenceId && item.kind === 'signature' && item.sectionId === 'client-signoff');
  if (!signature) return NextResponse.json({ error: 'Upload your scanned signature before submitting.' }, { status: 400 });

  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.auditSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        reviewedAt: null,
        findings: '{}',
        clientSignerId: session.id,
        clientSignerName: signerName,
        clientSignerRole: session.role,
        clientAttestedAt: new Date(),
        clientDeclaration: true,
        clientSignatureEvidenceId: signature.id,
        version: { increment: 1 },
      },
    });
    await transaction.auditSubmissionVersion.create({
      data: {
        submissionId: submission.id,
        version: result.version,
        actorId: session.id,
        action: 'client-signed-submitted',
        snapshot: JSON.stringify({
          responses,
          status: 'submitted',
          clientSignerName: signerName,
          clientAttestedAt: result.clientAttestedAt,
          clientSignatureEvidenceId: signature.id,
        }),
      },
    });
    return result;
  });

  return NextResponse.json({
    status: updated.status,
    submittedAt: updated.submittedAt,
    version: updated.version,
    clientSignerName: updated.clientSignerName,
    clientAttestedAt: updated.clientAttestedAt,
  });
}
