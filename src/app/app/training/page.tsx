'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpenCheck, Check, Clock3, Flame, HeartPulse, Leaf, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { TRAINING_PACKAGES } from '@/lib/commerce-catalog';
import { normalizeKenyanPhone } from '@/lib/payment-utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { strictApi } from '@/lib/strict-api';
import { canSimulatePaymentsInUi, isStagingPreview } from '@/lib/payment-config';

type PaymentRecord = {
  id: string;
  kind: string;
  amount: number;
  items: string[];
  status: string;
  receiptReference: string | null;
  createdAt: string;
};

const categoryIcon = {
  Safety: ShieldCheck,
  Fire: Flame,
  'First aid': HeartPulse,
  Environment: Leaf,
};

export default function TrainingRequestPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [receipt, setReceipt] = useState('');
  const chosenPackages = useMemo(() => TRAINING_PACKAGES.filter((item) => selected.includes(item.code)), [selected]);
  const total = chosenPackages.reduce((sum, item) => sum + item.price, 0);

  const loadPayments = async () => {
    try {
      const records = await strictApi<PaymentRecord[]>('/api/payments');
      setPayments(records.filter((payment) => payment.kind === 'training'));
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to load previous requests');
    }
  };
  useEffect(() => { void loadPayments(); }, []);

  const togglePackage = (code: string) => {
    setSelected((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  };

  const requestTraining = async () => {
    if (!selected.length) {
      setError('Select at least one training package.');
      return;
    }
    if (!normalizeKenyanPhone(phone)) {
      setError('Enter a valid Kenyan mobile number, such as 0712 345 678.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payment = await strictApi<{ id: string; paymentMode: string }>('/api/payments/start', {
        method: 'POST',
        body: JSON.stringify({ kind: 'training', items: selected, phoneNumber: phone }),
      });
      if (payment.paymentMode !== 'simulation') {
        setError('Live M-Pesa is not configured. No payment has been taken.');
        return;
      }

      const result = await strictApi<{ receiptReference: string }>('/api/payments/mock', {
        method: 'POST',
        body: JSON.stringify({ paymentId: payment.id }),
      });
      setReceipt(result.receiptReference);
      setStep(2);
      setSelected([]);
      await loadPayments();
      toast.success('Training request recorded');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit your training request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="People & plant"
        title="Request workplace training"
        description="Build a practical training plan for your team. Select one or more sessions and review the combined estimate."
        actions={<Link href="/app/training/records"><Button variant="secondary"><BookOpenCheck className="h-4 w-4" /> Training records</Button></Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <ol className="mb-5 grid grid-cols-3 text-xs font-semibold">
            {['Choose sessions', 'Review request', 'M-Pesa'].map((label, index) => (
              <li key={label} className={`border-t-2 pt-3 ${index <= Math.min(step, 2) ? 'border-forest-600 text-forest-800' : 'border-slate-200 text-slate-400'}`}>
                <span className="block">{label}</span>
              </li>
            ))}
          </ol>

          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {TRAINING_PACKAGES.map((course) => {
                const Icon = categoryIcon[course.category];
                const active = selected.includes(course.code);
                return (
                  <button
                    key={course.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePackage(course.code)}
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-forest-500 ring-2 ring-forest-100' : 'border-slate-200 hover:border-forest-200'}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700"><Icon className="h-5 w-5" /></span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? 'border-forest-600 bg-forest-600 text-white' : 'border-slate-300 text-transparent'}`}><Check className="h-3.5 w-3.5" /></span>
                    </span>
                    <span className="mt-4 block text-[10px] font-bold uppercase tracking-[0.14em] text-forest-600">{course.category}</span>
                    <span className="mt-1 block text-base font-bold text-forest-950">{course.title}</span>
                    <span className="mt-2 block min-h-10 text-sm leading-5 text-slate-600">{course.description}</span>
                    <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{course.duration}</span>
                      <span className="text-sm font-bold text-forest-900">KSh {course.price.toLocaleString()} <span className="block text-right text-[9px] font-medium text-safety-700">indicative</span></span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 1 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700"><WalletCards className="h-5 w-5" /></span>
                <div><h2 className="font-bold text-forest-950">Review your training request</h2><p className="mt-1 text-sm text-slate-500">Check the sessions and combined indicative estimate.</p></div>
              </div>
              <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {chosenPackages.map((course) => <div key={course.code} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="text-sm font-semibold text-forest-950">{course.title}</p><p className="mt-0.5 text-xs text-slate-500">{course.category} · {course.duration}</p></div><p className="shrink-0 text-sm font-bold">KSh {course.price.toLocaleString()}</p></div>)}
                <div className="flex items-center justify-between gap-4 bg-forest-50/70 px-4 py-4"><p className="text-sm font-bold text-forest-950">Estimated total</p><p className="text-xl font-bold text-forest-950">KSh {total.toLocaleString()}</p></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">These draft prices are for development preview only. Final training fees will be confirmed by Productivity Consulting.</p>
            </section>
          ) : null}

          {step === 2 ? (
            <section role="status" className="rounded-2xl border border-forest-200 bg-white p-6 text-center shadow-sm sm:p-9">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700"><BadgeCheck className="h-7 w-7" /></span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Request recorded</p>
              <h2 className="mt-2 text-2xl font-bold text-forest-950">We’ll coordinate next steps.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Your {isStagingPreview() ? 'staging' : 'development'} payment was simulated. This did not make a real M-Pesa charge. Our training team can confirm schedules and final pricing.</p>
              {receipt ? <p className="mt-4 font-mono text-xs text-slate-500">Reference: {receipt}</p> : null}
              <Button className="mt-6" onClick={() => { setStep(0); setReceipt(''); }}>Make another request</Button>
            </section>
          ) : null}

          {step !== 2 ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => step === 1 ? setStep(0) : setSelected([])} disabled={busy}>
                {step === 1 ? <><ArrowLeft className="h-4 w-4" /> Edit selection</> : 'Clear selection'}
              </Button>
              {step === 0 ? (
                <Button size="lg" disabled={!selected.length} onClick={() => { setError(''); setStep(1); }}>
                  Review {selected.length ? `${selected.length} selected` : 'request'} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="h-fit rounded-2xl bg-forest-950 p-5 text-white xl:sticky xl:top-24">
          {step < 2 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-300">Your selection</p>
              <p className="mt-3 text-3xl font-bold">KSh {total.toLocaleString()}</p>
              <p className="mt-1 text-xs text-forest-200">{selected.length} training package{selected.length === 1 ? '' : 's'} selected</p>
              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {chosenPackages.length ? chosenPackages.map((course) => <div key={course.code} className="flex justify-between gap-3 text-xs"><span className="text-forest-100">{course.title}</span><span className="shrink-0 text-forest-200">{course.price.toLocaleString()}</span></div>) : <p className="text-xs leading-5 text-forest-200">Choose a session to begin. You can combine packages for one request.</p>}
              </div>
              {step === 1 ? (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <Field label="M-Pesa phone number"><TextInput className="border-white/20 bg-white text-ink" type="tel" inputMode="tel" placeholder="0712 345 678" value={phone} onChange={(event) => { setPhone(event.target.value); setError(''); }} /></Field>
                  <p className="mt-3 rounded-lg bg-white/10 p-3 text-[11px] leading-5 text-forest-100">
                    {canSimulatePaymentsInUi()
                      ? `${isStagingPreview() ? 'Staging only:' : 'Development only:'} continue simulates a successful M-Pesa payment. No real STK prompt or charge is made.`
                      : 'Live M-Pesa checkout is not configured. No payment will be taken.'}
                  </p>
                  {error ? <p role="alert" className="mt-3 text-xs text-safety-300">{error}</p> : null}
                  <Button className="mt-4 w-full bg-safety-400 text-forest-950 hover:bg-safety-300" disabled={busy || !canSimulatePaymentsInUi() || !normalizeKenyanPhone(phone)} onClick={() => void requestTraining()}>{busy ? 'Processing…' : canSimulatePaymentsInUi() ? 'Simulate payment' : 'Live M-Pesa not configured'} <ArrowRight className="h-4 w-4" /></Button>
                </div>
              ) : null}
            </>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-300">Development preview</p>
              <p className="mt-3 text-lg font-semibold">Indicative prices only</p>
              <p className="mt-2 text-xs leading-5 text-forest-100">No payment was collected. Confirm approved course rates and availability before enabling live checkout.</p>
            </div>
          )}
        </aside>
      </div>

      {step === 1 && error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-3 text-sm text-clay-800">{error}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-bold text-forest-950">Previous requests</h2><p className="mt-1 text-xs text-slate-500">Training requests and payment status for this account.</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{payments.length} requests</span>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {payments.map((payment) => {
            const names = payment.items.map((code) => TRAINING_PACKAGES.find((item) => item.code === code)?.title ?? code);
            return <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-forest-950">{names.join(' · ')}</p><p className="mt-1 text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()} · {payment.receiptReference ?? 'Awaiting payment'}</p></div><div className="text-right"><p className="text-sm font-bold">KSh {payment.amount.toLocaleString()}</p><p className={`mt-1 text-xs font-semibold ${payment.status === 'completed' ? 'text-forest-700' : 'text-safety-700'}`}>{payment.status}</p></div></div>;
          })}
          {!payments.length ? <p className="py-5 text-sm text-slate-500">No training requests yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
