import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getModel, isResource } from '@/lib/resources';
import { hasResourceAccess } from '@/lib/commerce-catalog';
import { canEditWorkspace, canDelete } from '@/lib/roles';
import { resolveWorkspaceBranch } from '@/lib/workspace-access';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });

  const { resource, id } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }
  if (!hasResourceAccess(resource, session)) {
    return NextResponse.json({ error: 'Purchase this feature to access its workplace records.' }, { status: 402 });
  }
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before editing this record.' }, { status: 400 });

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const model = getModel(resource) as unknown as {
    findFirst: (args: { where: { id: string; organisation: string; branchId: string } }) => Promise<{ id: string } | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  };
  const { id: _id, createdAt: _c, updatedAt: _u, ref: _ref, ...rest } = payload as Record<string, unknown>;
  const existing = await model.findFirst({ where: { id, organisation: branch.organisation, branchId: branch.id } });
  if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  if (resource === 'audits' && rest.status === 'Approved & Filed') {
    return NextResponse.json({ error: 'Only a DOSHS auditor can approve filings' }, { status: 403 });
  }
  delete rest.organisation;
  delete rest.branchId;
  const updated = await model.update({ where: { id }, data: rest });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditWorkspace(session)) return NextResponse.json({ error: 'Workplace or assigned staff access required' }, { status: 403 });
  if (!canDelete(session)) {
    return NextResponse.json({ error: 'You do not have permission to delete records' }, { status: 403 });
  }

  const { resource, id } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }
  if (!hasResourceAccess(resource, session)) {
    return NextResponse.json({ error: 'Purchase this feature to access its workplace records.' }, { status: 402 });
  }
  const branch = await resolveWorkspaceBranch(session, request.headers.get('x-todomu-branch'));
  if (!branch) return NextResponse.json({ error: 'Choose an assigned client branch before deleting this record.' }, { status: 400 });

  const model = getModel(resource) as unknown as {
    findFirst: (args: { where: { id: string; organisation: string; branchId: string } }) => Promise<{ id: string } | null>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
  const existing = await model.findFirst({ where: { id, organisation: branch.organisation, branchId: branch.id } });
  if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
