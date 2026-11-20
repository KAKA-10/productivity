import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  IDLE_TIMEOUT_MS,
  MAX_PIN_FAILURES,
  PIN_LOCK_DELAY_MS,
  SESSION_TTL_SECONDS,
} from './auth-config';

export {
  ACCESS_TOKEN_TTL_SECONDS,
  IDLE_TIMEOUT_MS,
  MAX_PIN_FAILURES,
  PIN_LOCK_DELAY_MS,
  SESSION_TTL_SECONDS,
} from './auth-config';

export type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  organisation: string;
  organisationId?: string | null;
  branchId?: string | null;
  county?: string;
  email: string;
  sessionVersion?: number;
  lastActivityAt?: string;
  accessExpiresAt?: string;
  pinEnabled?: boolean;
  auditAccess?: boolean;
  unlockedFeatures?: string[];
  localAuthBypass?: boolean;
};

export type AccessTokenClaims = {
  sessionId: string;
  userId: string;
  sessionVersion: number;
  expiresAt: number;
};

export const ACCESS_COOKIE = 'todomu_access';
export const REFRESH_COOKIE = 'todomu_refresh';
export const LEGACY_COOKIE = 'todomu_session';

const configuredSecret = process.env.AUTH_SECRET;
if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('AUTH_SECRET must contain at least 32 characters in production');
}
const SECRET = configuredSecret || 'todomu-local-development-secret-change-before-production';

function sign(body: string) {
  return createHmac('sha256', SECRET).update(body).digest('base64url');
}

export function encodeAccessToken(
  sessionId: string,
  userId: string,
  sessionVersion: number,
  expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
) {
  const body = Buffer.from(
    JSON.stringify({ sessionId, userId, sessionVersion, expiresAt }),
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function decodeAccessToken(token: string | undefined | null): AccessTokenClaims | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0 || separator === token.length - 1) return null;

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(body);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return null;
  }

  try {
    const claims: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (
      typeof claims !== 'object' ||
      claims === null ||
      !('sessionId' in claims) ||
      typeof claims.sessionId !== 'string' ||
      !('userId' in claims) ||
      typeof claims.userId !== 'string' ||
      !('sessionVersion' in claims) ||
      typeof claims.sessionVersion !== 'number' ||
      !('expiresAt' in claims) ||
      typeof claims.expiresAt !== 'number' ||
      claims.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      sessionId: claims.sessionId,
      userId: claims.userId,
      sessionVersion: claims.sessionVersion,
      expiresAt: claims.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createRefreshToken() {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
