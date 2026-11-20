import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAccessibleBranches } from '@/lib/workspace-access';
import { LOCAL_PREVIEW_BRANCH } from '@/lib/local-preview';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.localAuthBypass) {
    return NextResponse.json([LOCAL_PREVIEW_BRANCH], { headers: { 'Cache-Control': 'private, no-store' } });
  }
  const workspaces = await getAccessibleBranches(session);
  return NextResponse.json(workspaces, { headers: { 'Cache-Control': 'private, no-store' } });
}
