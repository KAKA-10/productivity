import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS, type AuditResponses } from '@/lib/audit-template';

function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const submissions = await prisma.auditSubmission.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { username: true, fullName: true, organisation: true } } },
  });
  const rows = [
    ['Reference', 'Status', 'Username', 'Workplace', 'Organisation', 'Category', 'Section', 'Assessment', 'Answers', 'Notes', 'Finding'],
    ...submissions.flatMap((submission) => {
      const responses = JSON.parse(submission.responses) as AuditResponses;
      const findings = JSON.parse(submission.findings) as Record<string, string>;
      return AUDIT_SECTIONS.map((section) => [
        submission.reference,
        submission.status,
        submission.user.username,
        submission.user.fullName,
        submission.user.organisation,
        section.category,
        section.title,
        responses[section.id]?.assessment ?? '',
        JSON.stringify(responses[section.id]?.answers ?? {}),
        responses[section.id]?.notes ?? '',
        findings[section.id] ?? '',
      ]);
    }),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');

  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="todomu-audit-submissions.csv"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
