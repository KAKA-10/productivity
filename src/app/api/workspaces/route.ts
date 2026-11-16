import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAccessibleBranches } from '@/lib/workspace-access';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const workspaces = await getAccessibleBranches(session);
  return NextResponse.json(workspaces, { headers: { 'Cache-Control': 'private, no-store' } });
}
