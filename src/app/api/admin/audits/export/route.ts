import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS, formatAuditAnswer, type AuditResponses } from '@/lib/audit-template';
import { canReviewAudits } from '@/lib/roles';

function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canReviewAudits(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const submissions = await prisma.auditSubmission.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { username: true, fullName: true, organisation: true } },
      branch: { select: { name: true } },
      evidence: { select: { sectionId: true, fieldKey: true, kind: true, originalName: true } },
    },
  });
  const rows = [
    ['Reference', 'Status', 'Username', 'Workplace', 'Organisation', 'Branch', 'Client signer', 'Signer role', 'Declaration confirmed', 'Signed at', 'Scanned signature file', 'Category', 'Section', 'Assessment', 'Answers', 'Notes', 'Finding', 'Evidence files'],
    ...submissions.flatMap((submission) => {
      const responses = JSON.parse(submission.responses) as AuditResponses;
      const findings = JSON.parse(submission.findings) as Record<string, string>;
      return AUDIT_SECTIONS.map((section) => [
        submission.reference,
        submission.status,
        submission.user.username,
        submission.user.fullName,
        submission.user.organisation,
        submission.branch?.name ?? '',
        submission.clientSignerName ?? '',
        submission.clientSignerRole ?? '',
        submission.clientDeclaration ? 'Yes' : 'No',
        submission.clientAttestedAt?.toISOString() ?? '',
        submission.evidence.find((item) => item.kind === 'signature')?.originalName ?? '',
        section.category,
        section.title,
        responses[section.id]?.assessment ?? '',
        JSON.stringify(Object.fromEntries(Object.entries(responses[section.id]?.answers ?? {}).map(([key, value]) => {
          const definition = section.fields.find((item) => item.key === key);
          return [definition?.label ?? key, formatAuditAnswer(definition, value)];
        }))),
        responses[section.id]?.notes ?? '',
        findings[section.id] ?? '',
        submission.evidence
          .filter((item) => item.kind === 'supporting' && item.sectionId === section.id)
          .map((item) => {
            const evidenceFields = 'evidenceFields' in section ? section.evidenceFields ?? [] : [];
            return `${evidenceFields.find((field) => field.key === item.fieldKey)?.label ?? 'Supporting evidence'}: ${item.originalName}`;
          })
          .join('; '),
      ]);
    }),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');

  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="productivity-oshapp-audit-submissions.csv"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
