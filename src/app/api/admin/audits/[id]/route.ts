import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS, getAuditProgress, isOptionalAuditSection } from '@/lib/audit-template';
import { canReviewAudits } from '@/lib/roles';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canReviewAudits(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const submission = await prisma.auditSubmission.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, fullName: true, organisation: true, email: true } },
      organisation: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, county: true, subCounty: true, town: true } },
      evidence: {
        orderBy: { uploadedAt: 'desc' },
        select: { id: true, sectionId: true, fieldKey: true, kind: true, originalName: true, mimeType: true, byteSize: true, uploadedAt: true },
      },
      versions: { orderBy: { version: 'desc' }, take: 20, select: { version: true, action: true, createdAt: true, actor: { select: { username: true } } } },
    },
  });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  return NextResponse.json({
    ...submission,
    responses: JSON.parse(submission.responses),
    findings: JSON.parse(submission.findings),
    progress: getAuditProgress(JSON.parse(submission.responses)),
    sections: AUDIT_SECTIONS,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canReviewAudits(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid review action' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const action = input.action;
  const allowedActions = ['start-review', 'save-findings', 'return', 'approve'];
  if (typeof action !== 'string' || !allowedActions.includes(action)) {
    return NextResponse.json({ error: 'Unsupported review action' }, { status: 400 });
  }
  const submission = await prisma.auditSubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  if (action === 'start-review' && !['submitted', 'in_review'].includes(submission.status)) {
    return NextResponse.json({ error: 'Only submitted audits can enter review' }, { status: 409 });
  }
  if (action === 'save-findings' && submission.status !== 'in_review') {
    return NextResponse.json({ error: 'Start the review before saving findings' }, { status: 409 });
  }
  if (action === 'return' && !['submitted', 'in_review'].includes(submission.status)) {
    return NextResponse.json({ error: 'Only submitted audits can be returned' }, { status: 409 });
  }
  if (action === 'approve' && submission.status !== 'in_review') {
    return NextResponse.json({ error: 'Start the review before approving an audit' }, { status: 409 });
  }

  const existingFindings = JSON.parse(submission.findings) as Record<string, string>;
  const nextFindings = { ...existingFindings };
  if (input.findings && typeof input.findings === 'object' && !Array.isArray(input.findings)) {
    const findings = input.findings as Record<string, unknown>;
    for (const [sectionId, finding] of Object.entries(findings)) {
      if (sectionId !== '__returnNote' && !AUDIT_SECTIONS.some((section) => section.id === sectionId)) {
        return NextResponse.json({ error: 'Unknown audit section in review findings' }, { status: 400 });
      }
      if (typeof finding !== 'string' || finding.length > 4000) {
        return NextResponse.json({ error: 'Review findings must be under 4,000 characters' }, { status: 400 });
      }
      nextFindings[sectionId] = finding.trim();
    }
  }

  if (action === 'return') {
    const returnNote = typeof input.returnNote === 'string' ? input.returnNote.trim() : '';
    if (returnNote.length < 8 || returnNote.length > 2000) {
      return NextResponse.json({ error: 'Provide a return note of at least 8 characters' }, { status: 400 });
    }
    nextFindings.__returnNote = returnNote;
  }
  if (action === 'approve') {
    const incomplete = AUDIT_SECTIONS.filter((section) => !isOptionalAuditSection(section) && !nextFindings[section.id]);
    if (incomplete.length) {
      return NextResponse.json({ error: `Record a finding or “No finding” for all required sections (${incomplete.length} remaining)` }, { status: 400 });
    }
  }

  const status = action === 'start-review' || action === 'save-findings'
    ? 'in_review'
    : action === 'return'
      ? 'returned'
      : 'approved';
  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.auditSubmission.update({
      where: { id },
      data: {
        status,
        findings: JSON.stringify(nextFindings),
        reviewedAt: action === 'return' || action === 'approve' ? new Date() : null,
        version: { increment: 1 },
      },
    });
    await transaction.auditSubmissionVersion.create({
      data: {
        submissionId: id,
        version: result.version,
        actorId: session.id,
        action: action === 'save-findings' ? 'findings-saved' : status,
        snapshot: JSON.stringify({ responses: JSON.parse(result.responses), findings: nextFindings, status }),
      },
    });
    return result;
  });

  return NextResponse.json({ id: updated.id, status: updated.status, version: updated.version, findings: nextFindings });
}
