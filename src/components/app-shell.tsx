'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Flame,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  HeartPulse,
  UserRoundCog,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ACCESS_TOKEN_TTL_SECONDS, IDLE_TIMEOUT_MS, PIN_LOCK_DELAY_MS } from '@/lib/auth-config';
import type { SessionUser } from '@/lib/session';
import { isAdmin } from '@/lib/roles';
import { OfflineBanner } from '@/components/offline-banner';
import { ReminderBell } from '@/components/reminder-bell';

const GROUPS = [
  {
    label: 'Command',
    items: [
      { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/app/forms', label: 'Forms & questionnaires', icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/app/incidents', label: 'Incidents', icon: AlertTriangle },
      { href: '/app/risk-assessments', label: 'Risk Assessments', icon: AlertTriangle },
      { href: '/app/jsa', label: 'JSA Register', icon: FileSpreadsheet },
      { href: '/app/toolbox-talks', label: 'AI Toolbox Talks', icon: Sparkles },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/app/compliance-calendar', label: 'Compliance Calendar', icon: CalendarCheck },
      { href: '/app/osh-audit', label: 'OSH Audit', icon: ClipboardCheck },
      { href: '/app/inspections', label: 'Inspections', icon: Search },
      { href: '/app/reports', label: 'DOSHS Reports', icon: FileText },
    ],
  },
  {
    label: 'People & plant',
    items: [
      { href: '/app/ppe', label: 'PPE Issuance', icon: HardHat },
      { href: '/app/fire-equipment', label: 'Fire Equipment', icon: Flame },
      { href: '/app/training', label: 'Safety Training', icon: Users },
      { href: '/app/personnel', label: 'First aiders & marshals', icon: HeartPulse },
      { href: '/app/committee', label: 'Committees & logs', icon: MessageSquare },
      { href: '/app/capa', label: 'CAPA Tracker', icon: Wrench },
    ],
  },
];

const ADMIN_GROUPS = [
  {
    label: 'Administration',
    items: [{ href: '/app', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Audit administration',
    items: [
      { href: '/app/admin/audits', label: 'Audit submissions', icon: ClipboardCheck },
      { href: '/app/admin/users', label: 'User accounts', icon: UserRoundCog },
    ],
  },
];

const SITES = [
  'All sites',
  'Industrial Area Plant',
  'Thika Processing Plant',
  'Athi River Depot',
];

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = isAdmin(user);
  const groups = admin ? ADMIN_GROUPS : GROUPS;
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState(SITES[0]);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const lastActivityAt = useRef(user.lastActivityAt ? Date.parse(user.lastActivityAt) : Date.now());
  const lastActivitySyncAt = useRef(lastActivityAt.current);
  const nextRefreshAt = useRef(
    user.accessExpiresAt
      ? Date.parse(user.accessExpiresAt) - 2 * 60 * 1000
      : Date.now() + (ACCESS_TOKEN_TTL_SECONDS - 2 * 60) * 1000,
  );
  const lockedRef = useRef(false);
  const signedOutRef = useRef(false);
  const sessionChannel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let active = true;
    let refreshTask: Promise<boolean> | null = null;
    let lastBroadcastAt = 0;
    const channel = typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel('todomu-session');
    sessionChannel.current = channel;

    const signOut = async () => {
      if (signedOutRef.current) return;
      signedOutRef.current = true;
      channel?.postMessage({ type: 'logout' });
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
      if (!active) return;
      router.replace('/login?reason=idle');
      router.refresh();
    };

    const refresh = () => {
      if (refreshTask) return refreshTask;
      refreshTask = (async () => {
        const response = await fetch('/api/auth/refresh', { method: 'POST' });
        if (response.status === 401) {
          await signOut();
          return false;
        }
        if (response.status === 409) {
          nextRefreshAt.current = Date.now() + 60_000;
          return true;
        }
        if (!response.ok) throw new Error('Unable to renew your session.');
        nextRefreshAt.current = Date.now() + (ACCESS_TOKEN_TTL_SECONDS - 2 * 60) * 1000;
        return true;
      })().finally(() => {
        refreshTask = null;
      });
      return refreshTask;
    };

    const recordActivity = async () => {
      if (signedOutRef.current || lockedRef.current) return;
      const now = Date.now();
      const idleFor = now - lastActivityAt.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        await signOut();
        return;
      }
      if (user.pinEnabled && idleFor >= PIN_LOCK_DELAY_MS) {
        lockedRef.current = true;
        setLocked(true);
        return;
      }

      lastActivityAt.current = now;
      if (now - lastBroadcastAt >= 5_000) {
        channel?.postMessage({ type: 'activity' });
        lastBroadcastAt = now;
      }
      if (now - lastActivitySyncAt.current < 30_000) return;
      lastActivitySyncAt.current = now;

      try {
        let response = await fetch('/api/auth/activity', { method: 'POST' });
        if (response.status === 401) {
          if (!(await refresh())) return;
          response = await fetch('/api/auth/activity', { method: 'POST' });
        }
        if (response.status === 401) {
          await signOut();
          return;
        }
        if (!response.ok) throw new Error('Unable to verify your session activity.');
      } catch (reason) {
        toast.error(reason instanceof Error ? reason.message : 'Unable to verify your session activity.');
      }
    };

    const checkTimers = () => {
      const idleFor = Date.now() - lastActivityAt.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        void signOut();
        return;
      }
      if (user.pinEnabled && idleFor >= PIN_LOCK_DELAY_MS && !lockedRef.current) {
        lockedRef.current = true;
        setLocked(true);
      }
      if (!lockedRef.current && Date.now() >= nextRefreshAt.current) {
        void refresh().catch((reason: unknown) => {
          toast.error(reason instanceof Error ? reason.message : 'Unable to renew your session.');
          nextRefreshAt.current = Date.now() + 30_000;
        });
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkTimers();
    };
    const onChannelMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'activity') {
        lastActivityAt.current = Date.now();
      } else if (event.data?.type === 'logout') {
        signedOutRef.current = true;
        router.replace('/login');
        router.refresh();
      }
    };

    const interval = window.setInterval(checkTimers, 10_000);
    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('wheel', recordActivity, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    channel?.addEventListener('message', onChannelMessage);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('wheel', recordActivity);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      channel?.removeEventListener('message', onChannelMessage);
      channel?.close();
      sessionChannel.current = null;
    };
  }, [router, user.pinEnabled]);

  const logout = async () => {
    sessionChannel.current?.postMessage({ type: 'logout' });
    await fetch('/api/auth/logout', { method: 'POST' }).catch((reason: unknown) => {
      toast.error(reason instanceof Error ? reason.message : 'Unable to sign out securely.');
    });
    router.push('/login');
    router.refresh();
  };

  const unlockWithPin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUnlocking(true);
    setPinError('');
    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data: { error?: string; attemptsRemaining?: number; requiresPassword?: boolean } =
        await response.json();
      if (data.requiresPassword) {
        router.replace('/login?reason=pin');
        router.refresh();
        return;
      }
      if (!response.ok) {
        setPinError(
          data.attemptsRemaining === undefined
            ? data.error || 'Unable to unlock this session.'
            : `${data.error || 'Incorrect PIN.'} ${data.attemptsRemaining} attempts remaining.`,
        );
        setPin('');
        return;
      }

      const now = Date.now();
      lastActivityAt.current = now;
      lastActivitySyncAt.current = now;
      nextRefreshAt.current = now + (ACCESS_TOKEN_TTL_SECONDS - 2 * 60) * 1000;
      lockedRef.current = false;
      setLocked(false);
      setPin('');
      setPinError('');
    } catch (reason) {
      setPinError(reason instanceof Error ? reason.message : 'Unable to unlock this session.');
    } finally {
      setUnlocking(false);
    }
  };

  const Nav = () => (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-500/20 text-forest-200">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">TODOMU</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-forest-300">
            OSH Kenya
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/app'
                    ? pathname === '/app'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                      active
                        ? 'bg-forest-600 font-semibold text-white shadow-sm'
                        : 'text-forest-100 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user.fullName}</p>
            <p className="truncate text-[11px] text-forest-300">
              {isAdmin(user) ? 'Lead auditor' : 'HSE officer'} · {user.organisation}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl p-2 text-forest-300 transition hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col bg-forest-900 lg:flex">
        <Nav />
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-forest-950/50"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="relative flex h-full w-[272px] flex-col bg-forest-900"
            >
              <Nav />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {!admin ? (
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                <Building2 className="h-4 w-4 text-forest-600" />
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="bg-transparent outline-none"
                >
                  {SITES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            ) : (
              <span className="text-sm font-semibold text-slate-700">Audit administration</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!admin ? <ReminderBell /> : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-bold text-forest-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest-500" />
              {admin ? 'Lead auditor' : 'HSE'} · OSHA 2007
            </span>
          </div>
        </header>
        <OfflineBanner />
        <main className="mx-auto w-full max-w-7xl p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
      </div>
      {locked ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/85 p-4 backdrop-blur-sm">
          <form onSubmit={(event) => void unlockWithPin(event)} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Session paused</p>
            <h2 className="mt-1 text-xl font-bold text-ink">Welcome back, {user.fullName.split(' ')[0]}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your PIN to continue. Your session signs out after 15 minutes of inactivity.</p>
            <label htmlFor="session-pin" className="mb-1.5 mt-5 block text-xs font-semibold text-slate-700">Six-digit PIN</label>
            <input
              id="session-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 font-mono text-lg tracking-[0.35em] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            />
            {pinError ? <p role="alert" className="mt-2 text-sm text-clay-700">{pinError}</p> : null}
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={unlocking || pin.length !== 6} className="flex-1 rounded-xl bg-forest-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50">
                {unlocking ? 'Checking…' : 'Unlock'}
              </button>
              <button type="button" onClick={() => void logout()} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Sign out
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
