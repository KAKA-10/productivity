import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin' && !session.auditAccess) {
    return NextResponse.json({ error: 'Complete your audit registration payment to access audit evidence.' }, { status: 402 });
  }

  const { id } = await context.params;
  const evidence = await prisma.auditEvidence.findUnique({
    where: { id },
    include: { submission: { select: { userId: true } } },
  });
  if (!evidence) return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
  if (session.role !== 'admin' && evidence.submission.userId !== session.id) {
    return NextResponse.json({ error: 'You cannot access this evidence' }, { status: 403 });
  }

  const storageDirectory = path.resolve(process.env.TODOMU_UPLOAD_DIR || path.join(process.cwd(), '.data', 'audit-evidence'));
  const storagePath = path.join(storageDirectory, evidence.storageKey);
  const contents = await readFile(storagePath);
  return new Response(new Uint8Array(contents), {
    headers: {
      'Content-Type': evidence.mimeType,
      'Content-Length': String(evidence.byteSize),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(evidence.originalName)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
