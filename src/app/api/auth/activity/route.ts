import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const authSession = await getSessionContext();
  if (!authSession) {
    return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
  }

  const result = await prisma.authSession.updateMany({
    where: { id: authSession.id, sessionVersion: authSession.user.sessionVersion },
    data: { lastActivityAt: new Date() },
  });
  if (result.count !== 1) {
    return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
