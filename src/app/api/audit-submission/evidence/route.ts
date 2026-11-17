import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS } from '@/lib/audit-template';
import { canEditWorkspace, canSignClientAudit } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

function hasExpectedSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === 'application/pdf') return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (mimeType === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mimeType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });
  if (canSignClientAudit(session) && !session.auditAccess) {
    return NextResponse.json({ error: 'Complete your audit registration payment to upload audit evidence.' }, { status: 402 });
  }

  const form = await request.formData();
  const sectionId = form.get('sectionId');
  const rawFieldKey = form.get('fieldKey');
  const rawKind = form.get('kind');
  if (rawFieldKey !== null && (typeof rawFieldKey !== 'string' || !rawFieldKey.trim())) {
    return NextResponse.json({ error: 'Choose a valid evidence field' }, { status: 400 });
  }
  const fieldKey = typeof rawFieldKey === 'string' ? rawFieldKey : null;
  if (rawKind !== null && rawKind !== 'supporting' && rawKind !== 'signature') {
    return NextResponse.json({ error: 'Choose a valid evidence type' }, { status: 400 });
  }
  const kind = rawKind === 'signature' ? 'signature' : 'supporting';
  const file = form.get('file');
  const validSection = typeof sectionId === 'string' && AUDIT_SECTIONS.some((section) => section.id === sectionId);
  const validEvidenceField = !fieldKey || (
    kind === 'supporting' &&
    typeof sectionId === 'string' &&
    AUDIT_SECTIONS.some((section) =>
      section.id === sectionId &&
      'evidenceFields' in section &&
      section.evidenceFields?.some((item) => item.key === fieldKey),
    )
  );
  if (!validEvidenceField) {
    return NextResponse.json({ error: 'Choose an evidence field from the selected audit section' }, { status: 400 });
  }
  if (kind === 'signature' && (!canSignClientAudit(session) || sectionId !== 'client-signoff')) {
    return NextResponse.json({ error: 'Only a client account can upload a client signature.' }, { status: 403 });
  }
  if (kind === 'supporting' && !validSection) {
    return NextResponse.json({ error: 'Choose a valid audit section' }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 });
  if (kind === 'signature' && !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Upload a scanned signature as a PDF, JPEG, PNG or WebP file.' }, { status: 415 });
  }
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Evidence files must be between 1 byte and 10 MB' }, { status: 413 });
  }
  if (!MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Upload a PDF, JPEG, PNG or WebP file' }, { status: 415 });
  }

  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before uploading.' }, { status: 400 });
  const submission = await prisma.auditSubmission.findFirst({
    where: {
      organisationId: branch.organisationId,
      branchId: branch.id,
      cycleYear: String(new Date().getFullYear()),
    },
  });
  if (!submission) return NextResponse.json({ error: 'Audit submission not found' }, { status: 404 });
  if (!['draft', 'returned'].includes(submission.status)) {
    return NextResponse.json({ error: 'Evidence cannot be changed after submission' }, { status: 409 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasExpectedSignature(file.type, bytes)) {
    return NextResponse.json({ error: 'The file contents do not match the selected file type' }, { status: 415 });
  }

  const storageKey = randomUUID();
  const originalName = file.name.replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 180) || 'evidence';
  const evidence = await prisma.auditEvidence.create({
    data: {
      submissionId: submission.id,
      sectionId: sectionId as string,
      fieldKey,
      kind,
      storageKey,
      fileData: Buffer.from(bytes),
      originalName,
      mimeType: file.type,
      byteSize: file.size,
    },
    select: { id: true, sectionId: true, fieldKey: true, originalName: true, mimeType: true, byteSize: true, uploadedAt: true },
  });
  return NextResponse.json(evidence, { status: 201 });
}
