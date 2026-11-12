import { cookies } from 'next/headers';
import { prisma } from './prisma';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  IDLE_TIMEOUT_MS,
  LEGACY_COOKIE,
  REFRESH_COOKIE,
  SESSION_TTL_SECONDS,
  createRefreshToken,
  decodeAccessToken,
  encodeAccessToken,
  hashRefreshToken,
  type SessionUser,
} from './session';
import { parseUnlockedFeatures } from './commerce-catalog';

export type { SessionUser };

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

export async function getSessionContext() {
  const store = await cookies();
  const claims = decodeAccessToken(store.get(ACCESS_COOKIE)?.value);
  if (!claims) return null;

  const authSession = await prisma.authSession.findUnique({
    where: { id: claims.sessionId },
    include: { user: true },
  });
  if (
    !authSession ||
    authSession.userId !== claims.userId ||
    authSession.user.status !== 'active' ||
    authSession.user.sessionVersion !== claims.sessionVersion ||
    authSession.expiresAt.getTime() <= Date.now() ||
    authSession.lastActivityAt.getTime() <= Date.now() - IDLE_TIMEOUT_MS
  ) {
    return null;
  }

  return {
    ...authSession,
    accessExpiresAt: new Date(claims.expiresAt * 1000),
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const authSession = await getSessionContext();
  if (!authSession) return null;

  const { user } = authSession;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    organisation: user.organisation,
    email: user.email,
    county: user.county,
    sessionVersion: user.sessionVersion,
    lastActivityAt: authSession.lastActivityAt.toISOString(),
    accessExpiresAt: authSession.accessExpiresAt.toISOString(),
    pinEnabled: Boolean(user.pinHash),
    auditAccess: user.auditAccess,
    unlockedFeatures: parseUnlockedFeatures(user.unlockedFeatures),
  };
}

export async function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function setSessionCookie(user: SessionUser) {
  const refreshToken = createRefreshToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const authSession = await prisma.authSession.create({
    data: {
      userId: user.id,
      sessionVersion: user.sessionVersion ?? 0,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(
    ACCESS_COOKIE,
    encodeAccessToken(authSession.id, user.id, user.sessionVersion ?? 0),
    cookieOptions(ACCESS_TOKEN_TTL_SECONDS),
  );
  store.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(SESSION_TTL_SECONDS),
  );
  store.delete(LEGACY_COOKIE);
}

export async function setRotatedSessionCookies(
  authSessionId: string,
  user: SessionUser,
  refreshToken: string,
  expiresAt: Date,
) {
  const store = await cookies();
  const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  store.set(
    ACCESS_COOKIE,
    encodeAccessToken(authSessionId, user.id, user.sessionVersion ?? 0),
    cookieOptions(Math.min(ACCESS_TOKEN_TTL_SECONDS, remainingSeconds)),
  );
  store.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(remainingSeconds),
  );
}

export async function clearSessionCookie() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const accessClaims = decodeAccessToken(store.get(ACCESS_COOKIE)?.value);

  if (accessClaims) {
    await prisma.authSession.deleteMany({
      where: { id: accessClaims.sessionId },
    });
  }
  if (refreshToken) {
    await prisma.authSession.deleteMany({
      where: { refreshTokenHash: hashRefreshToken(refreshToken) },
    });
  }

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(LEGACY_COOKIE);
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
