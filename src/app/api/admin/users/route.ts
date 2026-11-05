import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

function isAdmin(role: string) {
  return role === 'admin';
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      organisation: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      auditSubmission: { select: { status: true, updatedAt: true } },
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid account details' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const organisation = typeof input.organisation === 'string' ? input.organisation.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const role = input.role;

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: 'Username must be 3–32 letters, numbers, dots, underscores or hyphens' }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: 'Use a password between 12 and 128 characters' }, { status: 400 });
  }
  if (!fullName || fullName.length > 120 || !organisation || organisation.length > 160) {
    return NextResponse.json({ error: 'Full name and workplace are required' }, { status: 400 });
  }
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }
  if (phone.length > 32 || (role !== 'admin' && role !== 'user')) {
    return NextResponse.json({ error: 'Invalid account details' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { username, passwordHash, fullName, organisation, email, phone, role },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        organisation: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'That username is already in use' }, { status: 409 });
    }
    throw error;
  }
}
