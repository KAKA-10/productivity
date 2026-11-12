import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AUDIT_SECTIONS } from '@/lib/audit-template';

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
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  if (!session.auditAccess) return NextResponse.json({ error: 'Complete your audit registration payment to upload audit evidence.' }, { status: 402 });

  const form = await request.formData();
  const sectionId = form.get('sectionId');
  const file = form.get('file');
  if (typeof sectionId !== 'string' || !AUDIT_SECTIONS.some((section) => section.id === sectionId)) {
    return NextResponse.json({ error: 'Choose a valid audit section' }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 });
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Evidence files must be between 1 byte and 10 MB' }, { status: 413 });
  }
  if (!MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Upload a PDF, JPEG, PNG or WebP file' }, { status: 415 });
  }

  const submission = await prisma.auditSubmission.findUnique({ where: { userId: session.id } });
  if (!submission) return NextResponse.json({ error: 'Audit submission not found' }, { status: 404 });
  if (!['draft', 'returned'].includes(submission.status)) {
    return NextResponse.json({ error: 'Evidence cannot be changed after submission' }, { status: 409 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasExpectedSignature(file.type, bytes)) {
    return NextResponse.json({ error: 'The file contents do not match the selected file type' }, { status: 415 });
  }

  const storageKey = randomUUID();
  const storageDirectory = path.resolve(process.env.TODOMU_UPLOAD_DIR || path.join(process.cwd(), '.data', 'audit-evidence'));
  const storagePath = path.join(storageDirectory, storageKey);
  const originalName = file.name.replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 180) || 'evidence';
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(storagePath, bytes, { flag: 'wx', mode: 0o600 });

  try {
    const evidence = await prisma.auditEvidence.create({
      data: {
        submissionId: submission.id,
        sectionId,
        storageKey,
        originalName,
        mimeType: file.type,
        byteSize: file.size,
      },
      select: { id: true, sectionId: true, originalName: true, mimeType: true, byteSize: true, uploadedAt: true },
    });
    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    await unlink(storagePath);
    throw error;
  }
}
