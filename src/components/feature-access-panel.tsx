'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { FEATURE_PRICE_PLACEHOLDER } from '@/lib/commerce-catalog';
import { normalizeKenyanPhone } from '@/lib/payment-utils';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { canSimulatePaymentsInUi, isStagingPreview } from '@/lib/payment-config';

export function FeatureAccessPanel({
  featureCode,
  title,
  description,
}: {
  featureCode?: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');

  const purchase = async () => {
    if (!featureCode || !normalizeKenyanPhone(phone)) {
      setError(featureCode ? 'Enter a valid Kenyan M-Pesa phone number.' : 'Register and purchase your audit package to continue.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const startResponse = await fetch('/api/payments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'feature', featureCode, phoneNumber: phone }),
      });
      const payment: { id?: string; error?: string; paymentMode?: string } = await startResponse.json();
      if (!startResponse.ok || !payment.id) throw new Error(payment.error || 'Unable to start checkout.');
      if (payment.paymentMode !== 'simulation') {
        throw new Error('Live M-Pesa is not configured. No payment has been taken.');
      }

      const paymentResponse = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      });
      const result: { error?: string; receiptReference?: string } = await paymentResponse.json();
      if (!paymentResponse.ok || !result.receiptReference) throw new Error(result.error || 'Payment simulation failed.');
      setReceipt(result.receiptReference);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete checkout.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-safety-50 text-safety-700"><LockKeyhole className="h-5 w-5" /></span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Feature access</p>
      <h1 className="mt-2 text-2xl font-bold text-forest-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      {featureCode ? (
        <>
          <div className="mt-6 flex items-end justify-between rounded-xl bg-forest-50 p-4">
            <div><p className="text-xs font-semibold text-forest-700">One-time feature add-on</p><p className="mt-1 text-[10px] text-safety-800">Development placeholder · subject to approval</p></div>
            <p className="text-2xl font-bold text-forest-950">KSh {FEATURE_PRICE_PLACEHOLDER.toLocaleString()}</p>
          </div>
          <div className="mt-5">
            <Field label="M-Pesa phone number"><TextInput type="tel" inputMode="tel" placeholder="0712 345 678" value={phone} onChange={(event) => { setPhone(event.target.value); setError(''); }} /></Field>
          </div>
          <p className="mt-3 rounded-xl bg-safety-50 p-3 text-xs leading-5 text-safety-900">
            {canSimulatePaymentsInUi()
              ? `${isStagingPreview() ? 'Staging only:' : 'Development only:'} continuing simulates payment success. It does not send an STK prompt or charge your phone.`
              : 'Live M-Pesa checkout is not configured. No payment will be taken and access cannot be purchased yet.'}
          </p>
          {error ? <p role="alert" className="mt-3 text-sm text-clay-700">{error}</p> : null}
          {receipt ? <p role="status" className="mt-3 text-sm text-forest-700">Development payment reference: {receipt}</p> : null}
          <Button className="mt-5 w-full" disabled={busy || !canSimulatePaymentsInUi() || !normalizeKenyanPhone(phone)} onClick={() => void purchase()}>
            {busy ? 'Processing…' : canSimulatePaymentsInUi() ? 'Simulate one-time payment' : 'Live M-Pesa not configured'} <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Audit access is included with workplace registration.</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Contact your administrator if your registration payment has been completed but this audit is still locked.</p>
        </div>
      )}
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /> Live payment access requires a verified checkout. Simulations are limited to development and the separately configured staging site.</p>
    </section>
  );
}
