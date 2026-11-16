import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageAccounts } from '@/lib/roles';
import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const organisations = await prisma.organisation.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      status: true,
      branches: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, county: true, subCounty: true, town: true, poBox: true, status: true },
      },
    },
  });
  return NextResponse.json(organisations, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAccounts(session)) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid organisation details' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const branchName = typeof input.branchName === 'string' ? input.branchName.trim() : '';
  const county = typeof input.county === 'string' ? input.county : '';
  const subCounty = typeof input.subCounty === 'string' ? input.subCounty.trim() : '';
  const town = typeof input.town === 'string' ? input.town.trim() : '';
  const poBox = typeof input.poBox === 'string' ? input.poBox.trim() : '';
  if (!name || name.length > 160 || !branchName || branchName.length > 120) {
    return NextResponse.json({ error: 'Organisation and first branch names are required' }, { status: 400 });
  }
  if (!KENYAN_COUNTIES.includes(county as (typeof KENYAN_COUNTIES)[number])) {
    return NextResponse.json({ error: 'Choose a valid county' }, { status: 400 });
  }
  if ([subCounty, town, poBox].some((value) => value.length > 160)) {
    return NextResponse.json({ error: 'Branch location details are too long' }, { status: 400 });
  }

  try {
    const organisation = await prisma.organisation.create({
      data: {
        name,
        branches: { create: { name: branchName, county, subCounty, town, poBox } },
      },
      select: {
        id: true,
        name: true,
        status: true,
        branches: { select: { id: true, name: true, county: true, subCounty: true, town: true, poBox: true, status: true } },
      },
    });
    return NextResponse.json(organisation, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'An organisation with that name already exists' }, { status: 409 });
    }
    throw error;
  }
}
