import type { SessionUser } from './session';

export function isAdmin(user: SessionUser | null | undefined) {
  return user?.role === 'admin';
}

export function canDelete(user: SessionUser | null | undefined) {
  return isAdmin(user);
}

export function canApproveAudit(user: SessionUser | null | undefined) {
  return isAdmin(user);
}
