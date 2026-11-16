import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canReviewAudits, isClientAccount } from '@/lib/roles';
import { getAccessibleBranches } from '@/lib/workspace-access';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (isClientAccount(session) && !session.auditAccess) {
    return NextResponse.json({ error: 'Complete your audit registration payment to access audit evidence.' }, { status: 402 });
  }

  const { id } = await context.params;
  const evidence = await prisma.auditEvidence.findUnique({
    where: { id },
    select: {
      id: true,
      storageKey: true,
      fileData: true,
      mimeType: true,
      byteSize: true,
      originalName: true,
      submission: { select: { userId: true, branchId: true } },
    },
  });
  if (!evidence) return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
  if (!canReviewAudits(session)) {
    const accessibleBranches = await getAccessibleBranches(session);
    if (!evidence.submission.branchId || !accessibleBranches.some((branch) => branch.id === evidence.submission.branchId)) {
      return NextResponse.json({ error: 'You cannot access this evidence' }, { status: 403 });
    }
  }
  if (!canReviewAudits(session) && !evidence.submission.branchId) {
    return NextResponse.json({ error: 'You cannot access this evidence' }, { status: 403 });
  }

  let contents = evidence.fileData;
  if (!contents) {
    const storageDirectory = path.resolve(/*turbopackIgnore: true*/ process.env.TODOMU_UPLOAD_DIR || path.join(process.cwd(), '.data', 'audit-evidence'));
    const storagePath = path.join(/*turbopackIgnore: true*/ storageDirectory, evidence.storageKey);
    try {
      contents = await readFile(/*turbopackIgnore: true*/ storagePath);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ error: 'This legacy evidence file is no longer available. Ask the workplace to upload it again.' }, { status: 410 });
      }
      throw error;
    }
  }
  return new Response(new Uint8Array(contents), {
    headers: {
      'Content-Type': evidence.mimeType,
      'Content-Length': String(evidence.byteSize),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(evidence.originalName)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
