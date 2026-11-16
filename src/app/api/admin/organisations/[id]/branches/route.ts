import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageAccounts } from '@/lib/roles';
import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const branch = await prisma.branch.findUnique({ where: { id }, select: { id: true, organisation: { select: { status: true } } } });
  if (!branch || branch.organisation.status !== 'active') {
    return NextResponse.json({ error: 'Branch or active organisation not found' }, { status: 404 });
  }
  const updated = await prisma.branch.update({ where: { id }, data: { status: 'active' } });
  return NextResponse.json({ id: updated.id, status: updated.status });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid branch details' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const county = typeof input.county === 'string' ? input.county : '';
  const subCounty = typeof input.subCounty === 'string' ? input.subCounty.trim() : '';
  const town = typeof input.town === 'string' ? input.town.trim() : '';
  const poBox = typeof input.poBox === 'string' ? input.poBox.trim() : '';
  if (!name || name.length > 120 || !KENYAN_COUNTIES.includes(county as (typeof KENYAN_COUNTIES)[number])) {
    return NextResponse.json({ error: 'Enter a branch name and valid county' }, { status: 400 });
  }
  if ([subCounty, town, poBox].some((value) => value.length > 160)) {
    return NextResponse.json({ error: 'Branch location details are too long' }, { status: 400 });
  }

  const organisation = await prisma.organisation.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!organisation || organisation.status !== 'active') {
    return NextResponse.json({ error: 'Active organisation not found' }, { status: 404 });
  }
  try {
    const branch = await prisma.branch.create({
      data: { organisationId: id, name, county, subCounty, town, poBox },
    });
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'That branch name already exists for this organisation' }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const { id } = await context.params;
  const branch = await prisma.branch.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
  const updated = await prisma.branch.update({ where: { id }, data: { status: 'suspended' } });
  return NextResponse.json({ id: updated.id, status: updated.status });
}
