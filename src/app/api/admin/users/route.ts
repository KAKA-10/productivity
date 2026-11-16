import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { ACCOUNT_ROLES, canCreateRole, canManageAccounts, isSuperAdmin } from '@/lib/roles';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const users = await prisma.user.findMany({
    where: isSuperAdmin(session) ? {} : { role: { in: ['technical', 'trainee', 'client_super_admin', 'workplace_admin'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      organisation: true,
      organisationId: true,
      branchId: true,
      county: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      branch: { select: { name: true } },
      assignments: {
        select: {
          id: true,
          branchId: true,
          organisation: { select: { id: true, name: true } },
          branch: { select: { name: true } },
        },
      },
      auditSubmission: { orderBy: { updatedAt: 'desc' }, take: 1, select: { status: true, updatedAt: true } },
    },
  });

  return NextResponse.json(users, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid account details' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const organisation = typeof input.organisation === 'string' ? input.organisation.trim() : '';
  const county = typeof input.county === 'string' ? input.county : 'Nairobi';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const branchName = typeof input.branchName === 'string' ? input.branchName.trim() : '';
  const branchId = typeof input.branchId === 'string' ? input.branchId : '';
  const role = typeof input.role === 'string' ? input.role : '';

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: 'Username must be 3–32 letters, numbers, dots, underscores or hyphens' }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: 'Use a password between 12 and 128 characters' }, { status: 400 });
  }
  if (!fullName || fullName.length > 120 || phone.length > 32) {
    return NextResponse.json({ error: 'Enter a valid full name and phone number' }, { status: 400 });
  }
  if (!ACCOUNT_ROLES.includes(role as (typeof ACCOUNT_ROLES)[number]) || !canCreateRole(session, role)) {
    return NextResponse.json({ error: 'You cannot create this account role' }, { status: 403 });
  }
  if (!KENYAN_COUNTIES.includes(county as (typeof KENYAN_COUNTIES)[number])) {
    return NextResponse.json({ error: 'Choose a valid county' }, { status: 400 });
  }
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }
  if (['client_super_admin', 'workplace_admin'].includes(role) && (!organisation || organisation.length > 160)) {
    return NextResponse.json({ error: 'A client workplace is required for client accounts' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.$transaction(async (transaction) => {
      let organisationRecord: { id: string; name: string } | null = null;
      let selectedBranchId: string | null = null;
      if (role === 'client_super_admin' || role === 'workplace_admin') {
        organisationRecord = await transaction.organisation.upsert({
          where: { name: organisation },
          update: {},
          create: { name: organisation },
          select: { id: true, name: true },
        });

        if (role === 'workplace_admin' && branchId) {
          const branch = await transaction.branch.findFirst({
            where: { id: branchId, organisationId: organisationRecord.id, status: 'active' },
            select: { id: true },
          });
          if (!branch) throw new Error('Choose a branch belonging to this workplace');
          selectedBranchId = branch.id;
        } else {
          const name = branchName || 'Main branch';
          const branch = await transaction.branch.upsert({
            where: { organisationId_name: { organisationId: organisationRecord.id, name } },
            update: { status: 'active' },
            create: { organisationId: organisationRecord.id, name, county },
            select: { id: true },
          });
          selectedBranchId = role === 'workplace_admin' ? branch.id : null;
        }
      }

      return transaction.user.create({
        data: {
          username,
          passwordHash,
          fullName,
          organisation: organisationRecord?.name ?? organisation,
          organisationId: organisationRecord?.id,
          branchId: selectedBranchId,
          county,
          email,
          phone,
          role,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          organisation: true,
          organisationId: true,
          branchId: true,
          county: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          branch: { select: { name: true } },
        },
      });
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'That username is already in use' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'Choose a branch belonging to this workplace') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
