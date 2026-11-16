import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getSession, setSessionCookie } from '@/lib/auth';
import { FEATURE_PRODUCTS, parseUnlockedFeatures } from '@/lib/commerce-catalog';
import { hashRefreshToken } from '@/lib/session';
import { nextRef } from '@/lib/utils';
import { canSimulatePayments } from '@/lib/payment-server-config';

class PaymentAlreadyProcessedError extends Error {}

export async function POST(request: Request) {
  if (!canSimulatePayments(request)) {
    return NextResponse.json({ error: 'Payment simulation is available only in development or the configured staging site.' }, { status: 404 });
  }

  const body: unknown = await request.json().catch(() => null);
  const paymentId = body && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>).paymentId
    : null;
  if (typeof paymentId !== 'string' || paymentId.length > 64) {
    return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 });
  }

  const session = await getSession();
  const store = await cookies();
  const checkoutToken = store.get('todomu_checkout')?.value;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });
  if (!payment || (session?.id !== payment.userId && payment.checkoutTokenHash !== (checkoutToken ? hashRefreshToken(checkoutToken) : null))) {
    return NextResponse.json({ error: 'Payment request not found.' }, { status: 404 });
  }
  if (payment.kind === 'audit_registration' && Date.now() - payment.createdAt.getTime() > 30 * 60 * 1000) {
    return NextResponse.json({ error: 'This registration checkout has expired. Start a new registration.' }, { status: 410 });
  }
  if (payment.status !== 'pending') {
    return NextResponse.json({ error: 'This payment request has already been processed.' }, { status: 409 });
  }

  const receiptReference = `DEV-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
  const items = JSON.parse(payment.items) as string[];
  try {
    await prisma.$transaction(async (transaction) => {
      const updated = await transaction.payment.updateMany({
        where: { id: payment.id, status: 'pending' },
        data: { status: 'completed', receiptReference, completedAt: new Date() },
      });
      if (updated.count !== 1) throw new PaymentAlreadyProcessedError();

      if (payment.kind === 'audit_registration') {
        await transaction.user.update({
          where: { id: payment.userId },
          data: {
            status: 'active',
            auditAccess: true,
            unlockedFeatures: '[]',
          },
        });
        const cycleYear = String(new Date().getFullYear());
        const existing = await transaction.auditSubmission.findFirst({
          where: {
            organisationId: payment.user.organisationId,
            branchId: payment.user.branchId,
            cycleYear,
          },
        });
        if (!existing) {
          const count = await transaction.auditSubmission.count();
          const submission = await transaction.auditSubmission.create({
            data: {
              userId: payment.userId,
              organisationId: payment.user.organisationId,
              branchId: payment.user.branchId,
              reference: nextRef('OSH', count),
              cycleYear,
            },
          });
          await transaction.auditSubmissionVersion.create({
            data: {
              submissionId: submission.id,
              version: 0,
              actorId: payment.userId,
              action: 'created',
              snapshot: JSON.stringify({ responses: {}, findings: {}, status: submission.status }),
            },
          });
        }
      } else if (payment.kind === 'feature') {
        const product = FEATURE_PRODUCTS.find((feature) => items.includes(feature.code));
        if (!product || items.length !== 1) throw new Error('Invalid feature payment items.');
        const current = await transaction.user.findUniqueOrThrow({
          where: { id: payment.userId },
          select: { unlockedFeatures: true },
        });
        const unlocked = new Set(parseUnlockedFeatures(current.unlockedFeatures));
        unlocked.add(product.code);
        await transaction.user.update({
          where: { id: payment.userId },
          data: { unlockedFeatures: JSON.stringify([...unlocked]) },
        });
      } else if (payment.kind !== 'training') {
        throw new Error('Unsupported payment type.');
      }
    });
  } catch (error) {
    if (error instanceof PaymentAlreadyProcessedError) {
      return NextResponse.json({ error: 'This payment request has already been processed.' }, { status: 409 });
    }
    throw error;
  }

  const response = NextResponse.json({
    ok: true,
    paymentId: payment.id,
    receiptReference,
    amount: payment.amount,
    kind: payment.kind,
    items,
  });
  response.cookies.delete('todomu_checkout');

  if (payment.kind === 'audit_registration') {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: payment.userId } });
    await setSessionCookie({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      organisation: user.organisation,
      county: user.county,
      email: user.email,
      sessionVersion: user.sessionVersion,
    });
  }
  return response;
}
