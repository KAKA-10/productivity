import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canEditWorkspace, isClientAccount } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import {
  createFireSafetyAuditDefaults,
  getFireSafetyAuditProgress,
  validateFireSafetyAuditData,
  type FireSafetyAuditData,
} from '@/lib/fire-safety-audit';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';
import { getLocalPreviewFireAudit, saveLocalPreviewFireAudit } from '@/lib/local-preview';

const currentCycle = () => String(new Date().getFullYear());

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function hasAuditAccess(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  return !isClientAccount(session) || session.auditAccess;
}

async function getSelectedAudit(request: Request, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return { branch: null, audit: null };
  const cycleYear = currentCycle();
  const existing = await prisma.fireSafetyAudit.findUnique({
    where: { branchId_cycleYear: { branchId: branch.id, cycleYear } },
  });
  if (existing) return { branch, audit: existing };

  const workplaceAudit = await prisma.auditSubmission.findFirst({
    where: { organisationId: branch.organisationId, branchId: branch.id, cycleYear },
    orderBy: { updatedAt: 'desc' },
    select: { responses: true },
  });
  const existingResponses = workplaceAudit
    ? parseJson<Record<string, { answers?: Record<string, string> }>>(workplaceAudit.responses)
    : undefined;
  const defaults = createFireSafetyAuditDefaults(branch, existingResponses);
  const audit = await prisma.fireSafetyAudit.upsert({
    where: { branchId_cycleYear: { branchId: branch.id, cycleYear } },
    create: {
      userId: session.id,
      organisationId: branch.organisationId,
      branchId: branch.id,
      cycleYear,
      employerDetails: JSON.stringify(defaults.employerDetails),
      workersData: JSON.stringify(defaults.workersData),
      checklistAnswers: JSON.stringify(defaults.checklistAnswers),
      furtherInformation: JSON.stringify(defaults.furtherInformation),
    },
    update: {},
  });
  return { branch, audit };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required.' }, { status: 403 });
  if (!hasAuditAccess(session)) {
    return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });
  }
  if (session.localAuthBypass) {
    return NextResponse.json(getLocalPreviewFireAudit(), { headers: { 'Cache-Control': 'private, no-store' } });
  }

  const { branch, audit } = await getSelectedAudit(request, session);
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before opening the fire safety audit.' }, { status: 400 });
  if (!audit) return NextResponse.json({ error: 'Fire safety audit could not be loaded.' }, { status: 500 });
  const data: FireSafetyAuditData = {
    employerDetails: parseJson(audit.employerDetails),
    workersData: parseJson(audit.workersData),
    checklistAnswers: parseJson(audit.checklistAnswers),
    furtherInformation: parseJson(audit.furtherInformation),
  };

  return NextResponse.json({
    id: audit.id,
    cycleYear: audit.cycleYear,
    version: audit.version,
    updatedAt: audit.updatedAt,
    data,
    progress: getFireSafetyAuditProgress(data.checklistAnswers),
    branch: { id: branch.id, name: branch.name, organisation: branch.organisation },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required.' }, { status: 403 });
  if (!hasAuditAccess(session)) {
    return NextResponse.json({ error: 'Complete your audit registration payment to access this questionnaire.' }, { status: 402 });
  }

  const input: unknown = await request.json().catch(() => null);
  const validation = validateFireSafetyAuditData(input);
  if (validation.errors.length || !validation.data) {
    return NextResponse.json({ error: validation.errors[0] ?? 'Invalid fire safety audit data.', details: validation.errors }, { status: 400 });
  }
  const encoded = {
    employerDetails: JSON.stringify(validation.data.employerDetails),
    workersData: JSON.stringify(validation.data.workersData),
    checklistAnswers: JSON.stringify(validation.data.checklistAnswers),
    furtherInformation: JSON.stringify(validation.data.furtherInformation),
  };
  if (Object.values(encoded).reduce((total, value) => total + value.length, 0) > 512_000) {
    return NextResponse.json({ error: 'Fire safety audit data is too large.' }, { status: 413 });
  }
  if (session.localAuthBypass) {
    return NextResponse.json({ ok: true, ...saveLocalPreviewFireAudit(validation.data) });
  }

  const { branch, audit } = await getSelectedAudit(request, session);
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before saving.' }, { status: 400 });
  if (!audit) return NextResponse.json({ error: 'Fire safety audit could not be found.' }, { status: 404 });
  const updated = await prisma.fireSafetyAudit.update({
    where: { id: audit.id, branchId: branch.id },
    data: { ...encoded, version: { increment: 1 } },
  });

  return NextResponse.json({
    ok: true,
    version: updated.version,
    updatedAt: updated.updatedAt,
    progress: getFireSafetyAuditProgress(validation.data.checklistAnswers),
  });
}
