import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie, setRotatedSessionCookies } from '@/lib/auth';
import {
  REFRESH_COOKIE,
  createRefreshToken,
  hashRefreshToken,
  type SessionUser,
  IDLE_TIMEOUT_MS,
} from '@/lib/session';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    await clearSessionCookie();
    return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
  }

  const authSession = await prisma.authSession.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
    include: { user: true },
  });
  if (!authSession) {
    return NextResponse.json({ error: 'Session token was already rotated.' }, { status: 409 });
  }
  if (
    authSession.expiresAt.getTime() <= Date.now() ||
    authSession.lastActivityAt.getTime() <= Date.now() - IDLE_TIMEOUT_MS ||
    authSession.user.status !== 'active' ||
    authSession.sessionVersion !== authSession.user.sessionVersion
  ) {
    if (authSession) {
      await prisma.authSession.deleteMany({ where: { id: authSession.id } });
    }
    await clearSessionCookie();
    return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
  }

  const nextRefreshToken = createRefreshToken();
  const updated = await prisma.authSession.updateMany({
    where: {
      id: authSession.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
    },
    data: { refreshTokenHash: hashRefreshToken(nextRefreshToken) },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: 'Session token was already rotated.' }, { status: 409 });
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
