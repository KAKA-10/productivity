import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getModel, isResource, RESOURCE_PREFIX } from '@/lib/resources';
import { nextRef } from '@/lib/utils';

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') {
    return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  }

  const { resource } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

  const model = getModel(resource) as unknown as {
    findMany: (args: { where: { organisation: string }; orderBy: { createdAt: 'desc' } }) => Promise<unknown[]>;
  };
  const items = await model.findMany({
    where: { organisation: session.organisation },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') {
    return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });
  }

  const { resource } = await context.params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  }

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
      organisation: session.organisation,
      ref: rest.ref || nextRef(RESOURCE_PREFIX[resource], count),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
