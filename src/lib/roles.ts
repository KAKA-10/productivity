import type { SessionUser } from './session';

export const ACCOUNT_ROLES = [
  'super_admin',
  'admin',
  'technical',
  'trainee',
  'client_super_admin',
  'workplace_admin',
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export function isAdmin(user: SessionUser | null | undefined) {
  return user?.role === 'super_admin' || user?.role === 'admin';
}

export function isSuperAdmin(user: SessionUser | null | undefined) {
  return user?.role === 'super_admin';
}

export function isInternalStaff(user: SessionUser | null | undefined) {
  return user?.role === 'technical' || user?.role === 'trainee';
}

export function isClientAccount(user: SessionUser | null | undefined) {
  return user?.role === 'client_super_admin' || user?.role === 'workplace_admin';
}

export function canEditWorkspace(user: SessionUser | null | undefined) {
  return isInternalStaff(user) || isClientAccount(user);
}

export function canSignClientAudit(user: SessionUser | null | undefined) {
  return isClientAccount(user);
}

export function canReviewAudits(user: SessionUser | null | undefined) {
  return isAdmin(user);
}

export function canManageAccounts(user: SessionUser | null | undefined) {
  return isAdmin(user);
}

export function canCreateRole(actor: SessionUser | null | undefined, targetRole: string) {
  if (isSuperAdmin(actor)) return (ACCOUNT_ROLES as readonly string[]).includes(targetRole);
  if (actor?.role === 'admin') {
    return ['technical', 'trainee', 'client_super_admin', 'workplace_admin'].includes(targetRole);
  }
  return false;
}

export function canManageTargetRole(actor: SessionUser | null | undefined, targetRole: string) {
  if (isSuperAdmin(actor)) return true;
  if (actor?.role === 'admin') {
    return ['technical', 'trainee', 'client_super_admin', 'workplace_admin'].includes(targetRole);
  }
  return false;
}

export function canDeleteTargetRole(actor: SessionUser | null | undefined, targetRole: string) {
  if (isSuperAdmin(actor)) return true;
  return actor?.role === 'admin' && ['technical', 'trainee'].includes(targetRole);
}

export function canDelete(user: SessionUser | null | undefined) {
  return isAdmin(user) || canEditWorkspace(user);
}

export function canApproveAudit(user: SessionUser | null | undefined) {
  return canReviewAudits(user);
}
