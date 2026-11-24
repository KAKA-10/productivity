import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/lib/session';
import { isClientAccount, isInternalStaff, isSuperAdmin } from '@/lib/roles';

export type WorkspaceBranch = {
  id: string;
  name: string;
  organisationId: string;
  organisation: string;
  county: string;
  subCounty: string;
  town: string;
  poBox: string;
};

function toWorkspaceBranch(branch: {
  id: string;
  name: string;
  organisationId: string;
  county: string;
  subCounty: string;
  town: string;
  poBox: string;
  organisation: { name: string };
}): WorkspaceBranch {
  return {
    id: branch.id,
    name: branch.name,
    organisationId: branch.organisationId,
    organisation: branch.organisation.name,
    county: branch.county,
    subCounty: branch.subCounty,
    town: branch.town,
    poBox: branch.poBox,
  };
}

export async function getAccessibleBranches(session: SessionUser): Promise<WorkspaceBranch[]> {
  if (isSuperAdmin(session)) {
    const branches = await prisma.branch.findMany({
      where: { status: 'active', organisation: { status: 'active' } },
      include: { organisation: { select: { name: true } } },
      orderBy: [{ organisation: { name: 'asc' } }, { name: 'asc' }],
    });
    return branches.map(toWorkspaceBranch);
  }
  if (!isClientAccount(session) && !isInternalStaff(session)) return [];

  if (session.role === 'client_super_admin' && session.organisationId) {
    const branches = await prisma.branch.findMany({
      where: { organisationId: session.organisationId, status: 'active', organisation: { status: 'active' } },
      include: { organisation: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
    return branches.map(toWorkspaceBranch);
  }

  if (session.role === 'workplace_admin' && session.branchId) {
    const branch = await prisma.branch.findFirst({
      where: {
        id: session.branchId,
        status: 'active',
        organisation: { status: 'active' },
      },
      include: { organisation: { select: { name: true } } },
    });
    return branch ? [toWorkspaceBranch(branch)] : [];
  }

  if (!isInternalStaff(session)) return [];
  const assignments = await prisma.clientAssignment.findMany({
    where: { staffId: session.id, organisation: { status: 'active' } },
    select: { organisationId: true, branchId: true },
  });
  if (!assignments.length) return [];

  const branchIds = assignments.flatMap((assignment) => assignment.branchId ? [assignment.branchId] : []);
  const organisationIds = [...new Set(assignments.filter((assignment) => !assignment.branchId).map((assignment) => assignment.organisationId))];
  const branches = await prisma.branch.findMany({
    where: {
      status: 'active',
      organisation: { status: 'active' },
      OR: [
        ...(branchIds.length ? [{ id: { in: branchIds } }] : []),
        ...(organisationIds.length ? [{ organisationId: { in: organisationIds } }] : []),
      ],
    },
    include: { organisation: { select: { name: true } } },
    orderBy: [{ organisation: { name: 'asc' } }, { name: 'asc' }],
  });
  return branches.map(toWorkspaceBranch);
}

export async function resolveWorkspaceBranch(session: SessionUser, requestedBranchId?: string | null) {
  const branches = await getAccessibleBranches(session);
  const selectedId = requestedBranchId || session.branchId || (branches.length === 1 ? branches[0].id : null);
  if (!selectedId) return null;
  return branches.find((branch) => branch.id === selectedId) ?? null;
}
