'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronLeft, CircleCheck, Leaf, LockKeyhole, ShieldCheck } from 'lucide-react';
import { AUDIT_OPTIONS, getAuditBundle, KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { normalizeKenyanPhone } from '@/lib/payment-utils';
import { canSimulatePaymentsInUi, isStagingPreview } from '@/lib/payment-config';
import { Button } from '@/components/ui/button';
import { Field, Select, TextInput } from '@/components/ui/field';

type Registration = {
  fullName: string;
  username: string;
  organisation: string;
  county: string;
  email: string;
  password: string;
  confirmPassword: string;
  thirdAudit: string;
  phoneNumber: string;
};

const INITIAL: Registration = {
  fullName: '',
  username: '',
  organisation: '',
  county: '',
  email: '',
  password: '',
  confirmPassword: '',
  thirdAudit: '',
  phoneNumber: '',
};

const STEPS = ['Account', 'Audit package', 'M-Pesa'];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [receipt, setReceipt] = useState('');
  const canSimulatePayments = canSimulatePaymentsInUi();
  const bundle = useMemo(() => getAuditBundle(form.county, form.thirdAudit), [form.county, form.thirdAudit]);
  const isOutsideRegion = Boolean(form.county && form.county !== 'Nairobi' && !['Machakos', 'Kajiado', 'Kiambu'].includes(form.county));

  const update = <K extends keyof Registration>(key: K, value: Registration[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const continueAccount = () => {
    if (!form.fullName.trim() || !form.organisation.trim() || !form.county || !form.email.trim()) {
      setError('Complete your name, workplace, county and email to continue.');
      return;
    }
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(form.username.trim())) {
      setError('Choose a username with 3–32 letters, numbers, dots, underscores or hyphens.');
      return;
    }
    if (form.password.length < 12 || form.password.length > 128) {
      setError('Use a password between 12 and 128 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setStep(1);
  };

  const continuePackage = () => {
    if (!bundle) {
      setError('Choose a third audit to complete this county package.');
      return;
    }
    setStep(2);
  };

  const startRegistrationPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!normalizeKenyanPhone(form.phoneNumber)) {
      setError('Enter a valid Kenyan mobile number, such as 0712 345 678.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      let currentPaymentId = paymentId;
      if (!currentPaymentId) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
            fullName: form.fullName,
            organisation: form.organisation,
            county: form.county,
            email: form.email,
            phoneNumber: form.phoneNumber,
            thirdAudit: form.thirdAudit || undefined,
          }),
        });
        const data: { error?: string; paymentId?: string } = await response.json();
        if (!response.ok || !data.paymentId) throw new Error(data.error || 'Unable to start registration.');
        currentPaymentId = data.paymentId;
        setPaymentId(currentPaymentId);
      }

      const response = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: currentPaymentId }),
      });
      const data: { error?: string; receiptReference?: string } = await response.json();
      if (!response.ok || !data.receiptReference) throw new Error(data.error || 'Payment simulation failed.');
      setReceipt(data.receiptReference);
      router.replace('/app/osh-audit');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete registration.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f3]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-white"><ShieldCheck className="h-5 w-5" /></span>
            <span><span className="block text-sm font-bold text-forest-950">Productivity OSHAPP</span><span className="block text-[10px] text-slate-500">Workplace OSH</span></span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-forest-700 hover:text-forest-900">Already registered? Sign in</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <section>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-forest-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Workplace registration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">Start with a safer workplace.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Create your workplace account and get the audit package required for your county.</p>

          <ol className="mt-8 grid grid-cols-3">
            {STEPS.map((label, index) => (
              <li key={label} className={`relative border-t-2 pt-3 text-xs font-semibold ${index <= step ? 'border-forest-600 text-forest-800' : 'border-slate-200 text-slate-400'}`}>
                <span className={`absolute -top-3 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] ${index < step ? 'border-forest-600 bg-forest-600 text-white' : index === step ? 'border-forest-600 bg-white text-forest-700' : 'border-slate-200 bg-white'}`}>
                  {index < step ? <Check className="h-3.5 w-3.5" /> : `0${index + 1}`}
                </span>
                <span className="block pt-1">{label}</span>
              </li>
            ))}
          </ol>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {step === 0 ? (
              <>
                <h2 className="text-lg font-bold text-forest-950">Your account and workplace</h2>
                <p className="mt-1 text-sm text-slate-500">We use your county to determine the right audit bundle.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name"><TextInput autoComplete="name" required maxLength={120} value={form.fullName} onChange={(event) => update('fullName', event.target.value)} /></Field>
                  <Field label="Username"><TextInput autoComplete="username" autoCapitalize="none" required minLength={3} maxLength={32} value={form.username} onChange={(event) => update('username', event.target.value)} /></Field>
                  <Field label="Workplace / organisation"><TextInput required maxLength={160} value={form.organisation} onChange={(event) => update('organisation', event.target.value)} /></Field>
                  <Field label="Workplace county"><Select required value={form.county} onChange={(event) => { update('county', event.target.value); update('thirdAudit', ''); }}><option value="">Choose county</option>{KENYAN_COUNTIES.map((county) => <option key={county} value={county}>{county}</option>)}</Select></Field>
                  <Field label="Email address"><TextInput type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => update('email', event.target.value)} /></Field>
                  <Field label="Password"><TextInput type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={form.password} onChange={(event) => update('password', event.target.value)} /></Field>
                  <Field label="Confirm password"><TextInput type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} /></Field>
                </div>
                <div className="mt-6 flex justify-end"><Button size="lg" onClick={continueAccount}>Choose audit package <ArrowRight className="h-4 w-4" /></Button></div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h2 className="text-lg font-bold text-forest-950">Your county audit package</h2>
                <p className="mt-1 text-sm text-slate-500">The workplace county sets the required package. Audit prices are fixed for registration.</p>
                {bundle ? (
                  <div className="mt-5 rounded-2xl border border-forest-200 bg-forest-50/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-700">{form.county} county</p><p className="mt-1 text-sm font-semibold text-forest-950">{bundle.auditCodes.length} audit{bundle.auditCodes.length > 1 ? 's' : ''} included</p></div>
                      <p className="text-2xl font-bold text-forest-950">KSh {bundle.amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {bundle.auditCodes.map((code) => {
                        const audit = AUDIT_OPTIONS.find((option) => option.code === code);
                        return audit ? <div key={code} className="flex items-start gap-2.5 rounded-xl bg-white px-3 py-3"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /><div><p className="text-sm font-semibold text-forest-950">{audit.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{audit.description}</p></div></div> : null;
                      })}
                    </div>
                  </div>
                ) : null}
                {isOutsideRegion ? (
                  <fieldset className="mt-5">
                    <legend className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Choose your third audit</legend>
                    <p className="mt-1 text-sm text-slate-500">Safety and Fire are included. Pick one additional audit for your county package.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {AUDIT_OPTIONS.filter((audit) => audit.code !== 'safety' && audit.code !== 'fire').map((audit) => (
                        <button key={audit.code} type="button" onClick={() => update('thirdAudit', audit.code)} className={`rounded-xl border p-4 text-left transition ${form.thirdAudit === audit.code ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-100' : 'border-slate-200 hover:border-forest-200'}`}>
                          <span className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-forest-950">{audit.title}</span>{form.thirdAudit === audit.code ? <Check className="h-4 w-4 text-forest-700" /> : null}</span>
                          <span className="mt-2 block text-xs leading-5 text-slate-500">{audit.description}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
                <div className="mt-6 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(0)}><ChevronLeft className="h-4 w-4" /> Back</Button>
                  <Button size="lg" onClick={continuePackage} disabled={!bundle}>Continue to payment <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <form onSubmit={(event) => void startRegistrationPayment(event)}>
                <h2 className="text-lg font-bold text-forest-950">Pay with M-Pesa</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the number you want to use for the STK prompt.</p>
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-forest-950"><BadgeCheck className="h-4 w-4 text-forest-600" /> County audit package</div>
                  <p className="mt-2 text-xs text-slate-600">{bundle?.auditCodes.map((code) => AUDIT_OPTIONS.find((audit) => audit.code === code)?.title).join(' · ')}</p>
                  <p className="mt-3 text-xl font-bold text-forest-950">KSh {bundle?.amount.toLocaleString()}</p>
                </div>
                <Field label="M-Pesa phone number">
                  <TextInput type="tel" inputMode="tel" autoComplete="tel" required placeholder="0712 345 678" value={form.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} />
                </Field>
                <p className="mt-3 rounded-xl bg-safety-50 px-3 py-2.5 text-xs leading-5 text-safety-900">
                  {canSimulatePayments
                    ? `${isStagingPreview() ? 'Staging' : 'Development'} preview: the button below simulates a successful payment. No real M-Pesa prompt or charge is made.`
                    : 'Live M-Pesa checkout is not configured. Registration is currently unavailable, and no account or payment request will be created.'}
                </p>
                {error ? <p role="alert" className="mt-3 rounded-xl border border-clay-200 bg-clay-50 px-3 py-2.5 text-sm text-clay-800">{error}</p> : null}
                <div className="mt-6 flex justify-between">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={busy}><ChevronLeft className="h-4 w-4" /> Back</Button>
                  <Button type="submit" size="lg" disabled={busy || !canSimulatePayments}>{busy ? 'Processing…' : !canSimulatePayments ? 'Live M-Pesa not configured' : paymentId ? 'Retry simulated payment' : 'Simulate STK push'} <LockKeyhole className="h-4 w-4" /></Button>
                </div>
                {receipt ? <p role="status" className="mt-4 text-sm text-forest-700">Payment simulated: {receipt}</p> : null}
              </form>
            ) : null}
            {error && step !== 2 ? <p role="alert" className="mt-4 rounded-xl border border-clay-200 bg-clay-50 px-3 py-2.5 text-sm text-clay-800">{error}</p> : null}
          </section>
        </section>

        <aside className="h-fit rounded-2xl bg-forest-950 p-5 text-white sm:p-6 lg:sticky lg:top-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-300">Included to get started</p>
          <h2 className="mt-3 text-xl font-semibold">Your audit, ready to begin.</h2>
          <ul className="mt-5 space-y-3">
            {['County-matched audit package', 'Workplace dashboard', 'Secure account and saved progress'].map((item) => <li key={item} className="flex items-start gap-2.5 text-sm text-forest-100"><Check className="mt-0.5 h-4 w-4 shrink-0 text-safety-400" />{item}</li>)}
          </ul>
          <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-forest-200">
            Other Productivity OSHAPP modules remain visible. Each will require its own one-time feature purchase before it can be used.
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] text-forest-300"><Leaf className="h-4 w-4" /> Kenyan workplace support</div>
        </aside>
      </div>
    </main>
  );
}
