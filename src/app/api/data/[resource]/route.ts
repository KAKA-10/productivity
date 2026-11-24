import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getModel, isResource, RESOURCE_PREFIX } from '@/lib/resources';
import { nextRef } from '@/lib/utils';
import { hasResourceAccess } from '@/lib/commerce-catalog';
import { canEditWorkspace, isSuperAdmin } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session) && !isSuperAdmin(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });

  const { resource } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }
  if (!hasResourceAccess(resource, session)) {
    return NextResponse.json({ error: 'Purchase this feature to access its workplace records.' }, { status: 402 });
  }
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before opening this register.' }, { status: 400 });

  const model = getModel(resource) as unknown as {
    findMany: (args: { where: { organisation: string; branchId: string }; orderBy: { createdAt: 'desc' } }) => Promise<unknown[]>;
  };
  const items = await model.findMany({
    where: { organisation: branch.organisation, branchId: branch.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items.map((item) => {
    if (!item || typeof item !== 'object' || !('site' in item)) return item;
    return { ...item, site: branch.name };
  }), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });

  const { resource } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }
  if (!hasResourceAccess(resource, session)) {
    return NextResponse.json({ error: 'Purchase this feature to access its workplace records.' }, { status: 402 });
  }
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before adding a record.' }, { status: 400 });

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const model = getModel(resource) as unknown as {
    count: () => Promise<number>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  const count = await model.count();
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = payload as Record<string, unknown>;
  const created = await model.create({
    data: {
      ...rest,
      ...(Object.hasOwn(rest, 'site') ? { site: branch.name } : {}),
      organisation: branch.organisation,
      branchId: branch.id,
      ref: rest.ref || nextRef(RESOURCE_PREFIX[resource], count),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
