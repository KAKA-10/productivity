import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageAccounts, isSuperAdmin } from '@/lib/roles';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const assignments = await prisma.clientAssignment.findMany({
    where: isSuperAdmin(session) ? {} : { staff: { role: { in: ['technical', 'trainee'] } } },
    include: {
      staff: { select: { id: true, username: true, fullName: true, role: true, status: true } },
      organisation: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(assignments, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid assignment details' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const staffId = typeof input.staffId === 'string' ? input.staffId : '';
  const organisationId = typeof input.organisationId === 'string' ? input.organisationId : '';
  const branchId = typeof input.branchId === 'string' && input.branchId ? input.branchId : null;
  const [staff, organisation] = await Promise.all([
    prisma.user.findUnique({ where: { id: staffId }, select: { id: true, role: true, status: true } }),
    prisma.organisation.findUnique({ where: { id: organisationId }, select: { id: true, status: true } }),
  ]);
  if (!staff || !['technical', 'trainee', ...(isSuperAdmin(session) ? ['intern'] : [])].includes(staff.role) || staff.status !== 'active') {
    return NextResponse.json({ error: 'Choose an active Technical, Trainee or Intern account' }, { status: 400 });
  }
  if (!organisation || organisation.status !== 'active') {
    return NextResponse.json({ error: 'Choose an active client organisation' }, { status: 400 });
  }
  if (branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, organisationId, status: 'active' }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: 'Choose a branch belonging to that organisation' }, { status: 400 });
  }

  const existing = await prisma.clientAssignment.findFirst({
    where: { staffId, organisationId, branchId },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: 'That client assignment already exists' }, { status: 409 });

  const assignment = await prisma.clientAssignment.create({
    data: { staffId, organisationId, branchId, assignedById: session.id },
    include: {
      staff: { select: { id: true, username: true, fullName: true, role: true } },
      organisation: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  const id = body && typeof body === 'object' && 'id' in body && typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'Assignment id is required' }, { status: 400 });
  const assignment = await prisma.clientAssignment.findUnique({ where: { id }, select: { id: true, staff: { select: { role: true } } } });
  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  if (!isSuperAdmin(session) && !['technical', 'trainee'].includes(assignment.staff.role)) {
    return NextResponse.json({ error: 'You cannot remove this assignment' }, { status: 403 });
  }
  await prisma.clientAssignment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
