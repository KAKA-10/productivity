import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUser, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const input = body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown>
    : {};
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';

  if (!username || username.length > 32 || !password || password.length > 128) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = await findUser(username);
  if (
    !user ||
    user.status !== 'active' ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await setSessionCookie({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    organisation: user.organisation,
    email: user.email,
    sessionVersion: user.sessionVersion,
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    organisation: user.organisation,
  });
}
