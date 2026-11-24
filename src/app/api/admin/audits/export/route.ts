import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS, formatAuditAnswer, type AuditResponses } from '@/lib/audit-template';
import { canReviewAudits } from '@/lib/roles';
import { buildPdfDocument } from '@/lib/pdf';
import { isSuperAdmin } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canReviewAudits(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const requestedBranchId = new URL(request.url).searchParams.get('branchId') ?? request.headers.get('x-todomu-branch');
  const branch = isSuperAdmin(session) && requestedBranchId
    ? await resolveWorkspaceBranch(session, requestedBranchId)
    : null;
  if (isSuperAdmin(session) && requestedBranchId && !branch) {
    return NextResponse.json({ error: 'Choose an active client branch' }, { status: 400 });
  }
  const submissions = await prisma.auditSubmission.findMany({
    where: branch ? { branchId: branch.id } : undefined,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { username: true, fullName: true, organisation: true } },
      branch: { select: { name: true } },
      evidence: { select: { sectionId: true, fieldKey: true, kind: true, originalName: true } },
    },
  });
  const lines = submissions.flatMap((submission) => {
    const responses = JSON.parse(submission.responses) as AuditResponses;
    const findings = JSON.parse(submission.findings) as Record<string, string>;
    const submissionLines = [
      `Reference: ${submission.reference}`,
      `Status: ${submission.status}`,
      `Workplace: ${submission.user.organisation}`,
      `Prepared by: ${submission.user.fullName} (@${submission.user.username})`,
      `Branch: ${submission.branch?.name ?? 'Not recorded'}`,
      `Client signer: ${submission.clientSignerName ?? 'Not recorded'}`,
      `Signer role: ${submission.clientSignerRole ?? 'Not recorded'}`,
      `Declaration confirmed: ${submission.clientDeclaration ? 'Yes' : 'No'}`,
      `Signed at: ${submission.clientAttestedAt?.toLocaleString() ?? 'Not recorded'}`,
      `Scanned signature: ${submission.evidence.find((item) => item.kind === 'signature')?.originalName ?? 'Not attached'}`,
      '',
    ];
    for (const section of AUDIT_SECTIONS) {
      const response = responses[section.id];
      submissionLines.push(`${section.category} — ${section.title}`, `Legal reference: ${section.law}`, `Assessment: ${response?.assessment ?? 'Not assessed'}`);
      for (const [key, value] of Object.entries(response?.answers ?? {})) {
        const definition = section.fields.find((item) => item.key === key);
        submissionLines.push(`${definition?.label ?? key}: ${formatAuditAnswer(definition, value)}`);
      }
      if (response?.notes) submissionLines.push(`Notes: ${response.notes}`);
      if (findings[section.id]) submissionLines.push(`Finding: ${findings[section.id]}`);
      const evidence = submission.evidence.filter((item) => item.kind === 'supporting' && item.sectionId === section.id);
      for (const item of evidence) {
        const evidenceFields = 'evidenceFields' in section ? section.evidenceFields ?? [] : [];
        submissionLines.push(`Evidence: ${evidenceFields.find((field) => field.key === item.fieldKey)?.label ?? 'Supporting evidence'} — ${item.originalName}`);
      }
      submissionLines.push('');
    }
    return [...submissionLines, '', ''];
  });
  if (!lines.length) lines.push('No audit submissions are available.');
  const pdf = buildPdfDocument('OSH Audit Submissions', lines, 'Confidential workplace audit submissions');

  return new Response(Buffer.from(pdf, 'ascii'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="productivity-oshapp-audit-submissions.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
