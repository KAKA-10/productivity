import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAuditProgress } from '@/lib/audit-template';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const submissions = await prisma.auditSubmission.findMany({
    orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
    include: {
      user: { select: { id: true, username: true, fullName: true, organisation: true, email: true } },
      evidence: { select: { id: true } },
    },
  });

  return NextResponse.json(submissions.map((submission) => {
    const progress = getAuditProgress(JSON.parse(submission.responses));
    return {
      id: submission.id,
      reference: submission.reference,
      status: submission.status,
      version: submission.version,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      user: submission.user,
      completedSections: progress.completed,
      totalSections: progress.total,
      completion: progress.percent,
      evidenceCount: submission.evidence.length,
    };
  }));
}
