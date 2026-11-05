import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid account action' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const action = input.action;
  if (action === 'set_pin') {
    const pin = input.pin;
    if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must contain exactly 6 digits' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const pinHash = await bcrypt.hash(pin, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { pinHash } }),
      prisma.authSession.deleteMany({ where: { userId: id } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action !== 'suspend' && action !== 'restore') {
    return NextResponse.json({ error: 'Unsupported account action' }, { status: 400 });
  }
  if (id === session.id && action === 'suspend') {
    return NextResponse.json({ error: 'You cannot suspend your own account' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } });
  if (!target) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  if (action === 'suspend' && target.role === 'admin' && target.status === 'active') {
    const activeAdministrators = await prisma.user.count({ where: { role: 'admin', status: 'active' } });
    if (activeAdministrators <= 1) {
      return NextResponse.json({ error: 'At least one active administrator must remain' }, { status: 409 });
    }
  }

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        status: action === 'suspend' ? 'suspended' : 'active',
        sessionVersion: { increment: 1 },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        organisation: true,
        email: true,
        phone: true,
        status: true,
      },
    }),
    prisma.authSession.deleteMany({ where: { userId: id } }),
  ]);
  return NextResponse.json(user);
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const temporaryPassword = randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    }),
    prisma.authSession.deleteMany({ where: { userId: id } }),
  ]);

  return NextResponse.json({ temporaryPassword });
}
