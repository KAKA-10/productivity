'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, FileCheck2, LockKeyhole, ShieldCheck, Siren, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { PageLoader } from '@/components/ui/skeleton';

const WORKSPACE_TOOLS = [
  { icon: Siren, label: 'Incidents and near misses' },
  { icon: FileCheck2, label: 'Audits and inspections' },
  { icon: Wrench, label: 'Corrective actions' },
];

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/app';
  }
  return value;
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = safeNextPath(search.get('next'));
  const shouldRestore = search.get('refresh') === '1';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(shouldRestore);
  const restoreRequest = useRef<Promise<Response> | null>(null);

  useEffect(() => {
    if (!shouldRestore) return;
    let active = true;

    restoreRequest.current ??= fetch('/api/auth/refresh', { method: 'POST' });
    restoreRequest.current
      .then(async (response) => {
        if (!active) return;
        if (response.ok) {
          router.replace(nextPath);
          router.refresh();
          return;
        }
        if (response.status !== 401) {
          const data: { error?: string } = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to restore your session.');
        }
      })
      .catch((reason: unknown) => {
        if (active) toast.error(reason instanceof Error ? reason.message : 'Unable to restore your session.');
      })
      .finally(() => {
        if (active) setRestoring(false);
      });

    return () => { active = false; };
  }, [nextPath, router, shouldRestore]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      toast.error('Enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: { error?: string; fullName?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      toast.success(`Welcome, ${data.fullName || 'back'}`);
      router.replace(nextPath);
      router.refresh();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f3] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-[25rem] flex-col bg-forest-950 px-6 py-7 text-white sm:px-10 sm:py-9 lg:min-h-screen lg:px-14 lg:py-10 xl:px-20">
        <Link href="/" className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-safety-400">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-safety-400 text-forest-950">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide">TODOMU</span>
            <span className="mt-0.5 block text-[10px] text-forest-200">by Productivity Consulting</span>
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-300">Workplace safety · Kenya</p>
          <h1 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            A steady view of safety across every site.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-forest-100">
            Keep the records, follow-ups and audit work your teams rely on in one practical workspace.
          </p>

          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {WORKSPACE_TOOLS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-safety-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-forest-50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-[11px] text-forest-300">
          <span>Productivity Consulting Limited · Kenya</span>
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Main website
          </Link>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-forest-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Productivity Consulting
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_48px_-32px_rgba(13,36,28,0.3)] sm:p-9">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-forest-600">TODOMU workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forest-950 sm:text-3xl">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your account credentials to continue to your OSH workspace.
            </p>

            {search.get('reason') === 'idle' || search.get('reason') === 'pin' ? (
              <p role="status" className="mt-5 rounded-xl border border-safety-200 bg-safety-50 px-4 py-3 text-sm text-safety-900">
                {search.get('reason') === 'pin'
                  ? 'PIN attempts exceeded. Sign in with your password to continue.'
                  : 'Your session expired after 15 minutes of inactivity. Sign in again to continue.'}
              </p>
            ) : null}

            {restoring ? (
              <p role="status" className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Restoring your secure session…
              </p>
            ) : (
              <form onSubmit={(event) => void onSubmit(event)} className="mt-7 space-y-4">
                <Field label="Username">
                  <TextInput
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="h-12 rounded-xl border-slate-200 px-4 shadow-none"
                  />
                </Field>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <TextInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 rounded-xl border-slate-200 py-2.5 pl-4 pr-12 shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-controls="password"
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-forest-600"
                    >
                      {showPassword
                        ? <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
                        : <Eye aria-hidden="true" className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="h-12 w-full rounded-xl bg-forest-700 font-bold hover:bg-forest-800" disabled={loading}>
                  {loading ? 'Checking credentials…' : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
            )}

            <p className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
              Your session is protected and signs out after 15 minutes without activity.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}
