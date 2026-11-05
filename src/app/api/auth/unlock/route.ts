import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { clearSessionCookie, setRotatedSessionCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  IDLE_TIMEOUT_MS,
  MAX_PIN_FAILURES,
  REFRESH_COOKIE,
  createRefreshToken,
  hashRefreshToken,
  type SessionUser,
} from '@/lib/session';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const pin = body && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>).pin
    : null;
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: 'Enter your 6-digit PIN.' }, { status: 400 });
  }

  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    await clearSessionCookie();
    return NextResponse.json({ error: 'Your session has expired. Sign in with your password.', requiresPassword: true }, { status: 401 });
  }

  const authSession = await prisma.authSession.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
    include: { user: true },
  });
  if (
    !authSession ||
    authSession.expiresAt.getTime() <= Date.now() ||
    authSession.lastActivityAt.getTime() <= Date.now() - IDLE_TIMEOUT_MS ||
    authSession.user.status !== 'active' ||
    authSession.sessionVersion !== authSession.user.sessionVersion
  ) {
    if (authSession) {
      await prisma.authSession.deleteMany({ where: { id: authSession.id } });
    }
    await clearSessionCookie();
    return NextResponse.json({ error: 'Your session has expired. Sign in with your password.', requiresPassword: true }, { status: 401 });
  }
  if (!authSession.user.pinHash) {
    return NextResponse.json({ error: 'A PIN has not been set for this account. Sign in with your password.' }, { status: 409 });
  }
  if (authSession.pinFailures >= MAX_PIN_FAILURES) {
    await prisma.authSession.deleteMany({ where: { id: authSession.id } });
    await clearSessionCookie();
    return NextResponse.json({ error: 'PIN attempts exceeded. Sign in with your password.', requiresPassword: true }, { status: 401 });
  }

  if (!(await bcrypt.compare(pin, authSession.user.pinHash))) {
    const updated = await prisma.authSession.updateMany({
      where: {
        id: authSession.id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        pinFailures: { lt: MAX_PIN_FAILURES },
      },
      data: { pinFailures: { increment: 1 } },
    });
    const failedSession = await prisma.authSession.findUnique({
      where: { id: authSession.id },
      select: { pinFailures: true },
    });
    if (updated.count !== 1 || !failedSession || failedSession.pinFailures >= MAX_PIN_FAILURES) {
      await prisma.authSession.deleteMany({ where: { id: authSession.id } });
      await clearSessionCookie();
      return NextResponse.json({ error: 'PIN attempts exceeded. Sign in with your password.', requiresPassword: true }, { status: 401 });
    }

    return NextResponse.json({
      error: 'That PIN is incorrect.',
      attemptsRemaining: MAX_PIN_FAILURES - failedSession.pinFailures,
    }, { status: 401 });
  }

  const nextRefreshToken = createRefreshToken();
  const now = new Date();
  const updated = await prisma.authSession.updateMany({
    where: {
      id: authSession.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      pinFailures: { lt: MAX_PIN_FAILURES },
    },
    data: {
      refreshTokenHash: hashRefreshToken(nextRefreshToken),
      lastActivityAt: now,
      pinFailures: 0,
    },
  });
  if (updated.count !== 1) {
    await clearSessionCookie();
    return NextResponse.json({ error: 'PIN unlock failed. Sign in with your password.', requiresPassword: true }, { status: 401 });
  }

  const user: SessionUser = {
    id: authSession.user.id,
    username: authSession.user.username,
    fullName: authSession.user.fullName,
    role: authSession.user.role,
    organisation: authSession.user.organisation,
    email: authSession.user.email,
    sessionVersion: authSession.user.sessionVersion,
  };
  await setRotatedSessionCookies(authSession.id, user, nextRefreshToken, authSession.expiresAt);

  return NextResponse.json({ ok: true });
}
