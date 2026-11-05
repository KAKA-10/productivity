import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canDelete } from '@/lib/roles';
import { getModel, isResource } from '@/lib/resources';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') {
    return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  }

  const { resource, id } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const model = getModel(resource) as unknown as {
    findFirst: (args: { where: { id: string; organisation: string } }) => Promise<{ id: string } | null>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  };
  const { id: _id, createdAt: _c, updatedAt: _u, ref: _ref, ...rest } = payload as Record<string, unknown>;
  const existing = await model.findFirst({ where: { id, organisation: session.organisation } });
  if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  if (resource === 'audits' && rest.status === 'Approved & Filed') {
    return NextResponse.json({ error: 'Only a DOSHS auditor can approve filings' }, { status: 403 });
  }
  delete rest.organisation;
  const updated = await model.update({ where: { id }, data: rest });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') {
    return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  }
  if (!canDelete(session)) {
    return NextResponse.json({ error: 'Admin role required to delete records' }, { status: 403 });
  }

  const { resource, id } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const model = getModel(resource) as unknown as {
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
  await model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
