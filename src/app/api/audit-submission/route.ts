import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS, getAuditProgress, type AuditResponses } from '@/lib/audit-template';
import { nextRef } from '@/lib/utils';

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  if (!session.auditAccess) return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });

  let submission = await prisma.auditSubmission.findUnique({ where: { userId: session.id } });
  if (!submission) {
    const count = await prisma.auditSubmission.count();
    submission = await prisma.auditSubmission.create({
      data: { userId: session.id, reference: nextRef('OSH', count) },
    });
    await prisma.auditSubmissionVersion.create({
      data: {
        submissionId: submission.id,
        version: 0,
        actorId: session.id,
        action: 'created',
        snapshot: JSON.stringify({ responses: {}, findings: {}, status: submission.status }),
      },
    });
  }

  const evidence = await prisma.auditEvidence.findMany({
    where: { submissionId: submission.id },
    orderBy: { uploadedAt: 'desc' },
    select: { id: true, sectionId: true, originalName: true, mimeType: true, byteSize: true, uploadedAt: true },
  });
  const responses = parseJson<AuditResponses>(submission.responses);

  return NextResponse.json({
    id: submission.id,
    reference: submission.reference,
    status: submission.status,
    version: submission.version,
    submittedAt: submission.submittedAt,
    updatedAt: submission.updatedAt,
    responses,
    findings: ['returned', 'draft'].includes(submission.status)
      ? parseJson<Record<string, string>>(submission.findings)
      : {},
    evidence,
    progress: getAuditProgress(responses),
    categories: [
      ...new Set(AUDIT_SECTIONS.map((section) => section.category)),
    ],
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  if (!session.auditAccess) return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid audit responses' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (!input.responses || typeof input.responses !== 'object' || Array.isArray(input.responses)) {
    return NextResponse.json({ error: 'Audit responses are required' }, { status: 400 });
  }
  const encoded = JSON.stringify(input.responses);
  if (encoded.length > 512_000) {
    return NextResponse.json({ error: 'Audit responses are too large' }, { status: 413 });
  }

  const allowedIds = new Set<string>(AUDIT_SECTIONS.map((section) => section.id));
  const responses = input.responses as Record<string, unknown>;
  for (const [sectionId, answer] of Object.entries(responses)) {
    if (!allowedIds.has(sectionId) || !answer || typeof answer !== 'object' || Array.isArray(answer)) {
      return NextResponse.json({ error: 'Invalid section response' }, { status: 400 });
    }
    const response = answer as Record<string, unknown>;
    if (
      (response.assessment !== undefined &&
        !['compliant', 'needs_attention', 'not_applicable'].includes(String(response.assessment))) ||
      (response.notes !== undefined &&
        (typeof response.notes !== 'string' || response.notes.length > 4000)) ||
      (response.answers !== undefined &&
        (!response.answers ||
          typeof response.answers !== 'object' ||
          Array.isArray(response.answers) ||
          Object.keys(response.answers).length > 20 ||
          Object.values(response.answers).some((value) => typeof value !== 'string' || value.length > 1000)))
    ) {
      return NextResponse.json({ error: 'Invalid section response' }, { status: 400 });
    }
    if (response.answers && typeof response.answers === 'object' && !Array.isArray(response.answers)) {
      const answers = response.answers as Record<string, string>;
      if (answers.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.contactEmail)) {
        return NextResponse.json({ error: 'Enter a valid workplace contact email' }, { status: 400 });
      }
      if (sectionId === 'workers-data') {
        const workerCounts = ['totalWorkers', 'maleWorkers', 'femaleWorkers', 'contractWorkers'];
        if (workerCounts.some((key) => answers[key] && (!/^\d{1,7}$/.test(answers[key]) || Number(answers[key]) > 1_000_000))) {
          return NextResponse.json({ error: 'Worker counts must be non-negative whole numbers' }, { status: 400 });
        }
      }
    }
  }

  const submission = await prisma.auditSubmission.findUnique({ where: { userId: session.id } });
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
          responses: input.responses,
          findings: parseJson<Record<string, string>>(submission.findings),
          status: 'draft',
        }),
      },
    });
    return result;
  });

  return NextResponse.json({ ok: true, version: updated.version, updatedAt: updated.updatedAt });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  if (!session.auditAccess) return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });

  const submission = await prisma.auditSubmission.findUnique({ where: { userId: session.id } });
  if (!submission) return NextResponse.json({ error: 'Audit submission not found' }, { status: 404 });
  if (!['draft', 'returned'].includes(submission.status)) {
    return NextResponse.json({ error: 'This audit has already been submitted for review' }, { status: 409 });
  }

  const responses = parseJson<AuditResponses>(submission.responses);
  const progress = getAuditProgress(responses);
  if (progress.completed !== progress.total) {
    return NextResponse.json({
      error: `Complete all ${progress.total} audit sections before submitting (${progress.total - progress.completed} remaining)`,
    }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.auditSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        reviewedAt: null,
        findings: '{}',
        version: { increment: 1 },
      },
    });
    await transaction.auditSubmissionVersion.create({
      data: {
        submissionId: submission.id,
        version: result.version,
        actorId: session.id,
        action: 'submitted',
        snapshot: JSON.stringify({ responses, findings: {}, status: 'submitted' }),
      },
    });
    return result;
  });

  return NextResponse.json({ status: updated.status, submittedAt: updated.submittedAt, version: updated.version });
}
