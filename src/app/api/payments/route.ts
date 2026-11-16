import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isClientAccount } from '@/lib/roles';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isClientAccount(session)) return NextResponse.json({ error: 'Workplace account required.' }, { status: 403 });

  const payments = await prisma.payment.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      kind: true,
      amount: true,
      phoneNumber: true,
      items: true,
      status: true,
      receiptReference: true,
      createdAt: true,
      completedAt: true,
    },
  });
  return NextResponse.json(payments.map((payment) => ({
    ...payment,
    items: JSON.parse(payment.items) as string[],
  })));
}
