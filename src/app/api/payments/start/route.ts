import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FEATURE_PRODUCTS, TRAINING_PACKAGES } from '@/lib/commerce-catalog';
import { normalizeKenyanPhone } from '@/lib/payment-utils';
import { getSession } from '@/lib/auth';
import { canSimulatePayments } from '@/lib/payment-server-config';

export async function POST(request: Request) {
  if (!canSimulatePayments(request)) {
    return NextResponse.json({ error: 'Live M-Pesa payments are not configured yet.' }, { status: 503 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in before starting checkout.' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required.' }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const phoneNumber = typeof input.phoneNumber === 'string' ? normalizeKenyanPhone(input.phoneNumber) : null;
  const kind = input.kind;
  if (!phoneNumber) return NextResponse.json({ error: 'Enter a valid Kenyan M-Pesa phone number.' }, { status: 400 });

  let amount = 0;
  let items: string[] = [];
  if (kind === 'training') {
    const requested = input.items;
    if (!Array.isArray(requested) || requested.length < 1 || requested.length > TRAINING_PACKAGES.length) {
      return NextResponse.json({ error: 'Choose at least one training package.' }, { status: 400 });
    }
    if (!requested.every((item) => typeof item === 'string')) {
      return NextResponse.json({ error: 'Invalid training selection.' }, { status: 400 });
    }
    items = [...new Set(requested as string[])];
    if (items.length !== requested.length) return NextResponse.json({ error: 'Duplicate training packages are not allowed.' }, { status: 400 });
    const packages = items.map((code) => TRAINING_PACKAGES.find((item) => item.code === code));
    if (packages.some((item) => !item)) return NextResponse.json({ error: 'A selected training package is unavailable.' }, { status: 400 });
    amount = packages.reduce((sum, item) => sum + (item?.price ?? 0), 0);
  } else if (kind === 'feature') {
    const featureCode = typeof input.featureCode === 'string' ? input.featureCode : '';
    const feature = FEATURE_PRODUCTS.find((item) => item.code === featureCode);
    if (!feature) return NextResponse.json({ error: 'Choose a valid feature add-on.' }, { status: 400 });
    if ((session.unlockedFeatures ?? []).includes(feature.code)) {
      return NextResponse.json({ error: 'This feature is already available in your account.' }, { status: 409 });
    }
    items = [feature.code];
    amount = 5_000;
  } else {
    return NextResponse.json({ error: 'Unsupported payment type.' }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.id,
      kind,
      amount,
      phoneNumber,
      items: JSON.stringify(items),
      provider: process.env.APP_ENV === 'staging' ? 'staging_mock' : 'development_mock',
    },
    select: { id: true, amount: true, phoneNumber: true, kind: true, items: true },
  });
  return NextResponse.json({
    ...payment,
    items: JSON.parse(payment.items) as string[],
    paymentMode: 'simulation',
  }, { status: 201 });
}
