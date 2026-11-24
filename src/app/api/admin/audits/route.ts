import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAuditProgress } from '@/lib/audit-template';
import { canReviewAudits, isSuperAdmin } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canReviewAudits(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const requestedBranchId = request.headers.get('x-todomu-branch');
  const branch = isSuperAdmin(session) && requestedBranchId
    ? await resolveWorkspaceBranch(session, requestedBranchId)
    : null;
  if (isSuperAdmin(session) && requestedBranchId && !branch) {
    return NextResponse.json({ error: 'Choose an active client branch' }, { status: 400 });
  }
  const submissions = await prisma.auditSubmission.findMany({
    where: branch ? { branchId: branch.id } : undefined,
    orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
    include: {
      user: { select: { id: true, username: true, fullName: true, organisation: true, email: true } },
      organisation: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, county: true, subCounty: true, town: true } },
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
      cycleYear: submission.cycleYear,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      user: submission.user,
      organisation: submission.organisation,
      branch: submission.branch,
      clientSignerName: submission.clientSignerName,
      clientAttestedAt: submission.clientAttestedAt,
      completedSections: progress.completed,
      totalSections: progress.total,
      completion: progress.percent,
      evidenceCount: submission.evidence.length,
    };
  }));
}
