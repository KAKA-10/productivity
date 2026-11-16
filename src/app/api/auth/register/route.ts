import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AUDIT_OPTIONS, getAuditBundle, KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { normalizeKenyanPhone } from '@/lib/payment-utils';
import { hashRefreshToken } from '@/lib/session';
import { canSimulatePayments } from '@/lib/payment-server-config';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

export async function POST(request: Request) {
  if (!canSimulatePayments(request)) {
    return NextResponse.json({ error: 'Live M-Pesa payments are not configured yet.' }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Enter your account and workplace details.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const organisation = typeof input.organisation === 'string' ? input.organisation.trim() : '';
  const county = typeof input.county === 'string' ? input.county : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const phoneNumber = typeof input.phoneNumber === 'string' ? normalizeKenyanPhone(input.phoneNumber) : null;
  const thirdAudit = typeof input.thirdAudit === 'string' ? input.thirdAudit : undefined;

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: 'Username must be 3–32 letters, numbers, dots, underscores or hyphens.' }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: 'Use a password between 12 and 128 characters.' }, { status: 400 });
  }
  if (!fullName || fullName.length > 120 || !organisation || organisation.length > 160) {
    return NextResponse.json({ error: 'Enter your name and workplace.' }, { status: 400 });
  }
  if (!KENYAN_COUNTIES.includes(county as (typeof KENYAN_COUNTIES)[number])) {
    return NextResponse.json({ error: 'Choose a valid workplace county.' }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Enter a valid Kenyan M-Pesa phone number.' }, { status: 400 });
  }

  const bundle = getAuditBundle(county, thirdAudit);
  if (!bundle) {
    return NextResponse.json({
      error: 'Select the third audit to complete your regional package.',
      thirdAuditOptions: AUDIT_OPTIONS.filter((audit) => audit.code !== 'safety' && audit.code !== 'fire'),
    }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const checkoutToken = randomBytes(32).toString('base64url');
  const checkoutExpires = new Date(Date.now() + 30 * 60 * 1000);
  const existingOrganisation = await prisma.organisation.findUnique({
    where: { name: organisation },
    select: { id: true },
  });
  if (existingOrganisation) {
    return NextResponse.json({ error: 'This workplace is already registered. Contact an administrator to add another account or branch.' }, { status: 409 });
  }

  try {
    const user = await prisma.$transaction(async (transaction) => {
      const organisationRecord = await transaction.organisation.create({
        data: { name: organisation },
        select: { id: true },
      });
      const branch = await transaction.branch.create({
        data: { organisationId: organisationRecord.id, name: 'Main branch', county },
        select: { id: true },
      });
      return transaction.user.create({
        data: {
          username,
          fullName,
          organisation,
          organisationId: organisationRecord.id,
          branchId: branch.id,
          county,
          email,
          phone: phoneNumber,
          passwordHash,
          role: 'workplace_admin',
          status: 'pending_payment',
          auditAccess: false,
          unlockedFeatures: '[]',
          payments: {
            create: {
              kind: 'audit_registration',
              amount: bundle.amount,
              phoneNumber,
              items: JSON.stringify(bundle.auditCodes),
              checkoutTokenHash: hashRefreshToken(checkoutToken),
              createdAt: new Date(),
            },
          },
        },
        select: {
          id: true,
          payments: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true } },
        },
      });
    });

    const response = NextResponse.json({
      paymentId: user.payments[0].id,
      amount: bundle.amount,
      auditCodes: bundle.auditCodes,
      checkoutExpiresAt: checkoutExpires.toISOString(),
      paymentMode: 'simulation',
    }, { status: 201 });
    response.cookies.set('todomu_checkout', checkoutToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60,
    });
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'That username or workplace is already registered.' }, { status: 409 });
    }
    throw error;
  }
}
