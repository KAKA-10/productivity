'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  HardHat,
  Plus,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, StatSkeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';

type Incident = {
  id: string;
  ref: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  occurredAt: string;
  lostTimeDays?: number;
};
type Capa = { id: string; title: string; dueDate: string; status: string; priority: string };
type Audit = { ref: string; facility: string; cycleYear: string; complianceScore: number; status: string; updatedAt: string };
type Talk = { id: string; topic: string; createdAt: string; status: string };
type Obligation = { id: string; title: string; dueDate: string; status: string; regulator: string };
type AuditSubmission = {
  reference: string;
  status: string;
  progress: { completed: number; total: number; percent: number };
};
type UserInfo = { fullName: string; organisation: string; auditAccess: boolean; unlockedFeatures: string[] };

function daysUntil(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function UserDashboard({ user }: { user: UserInfo }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [capa, setCapa] = useState<Capa[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [talks, setTalks] = useState<Talk[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [auditSubmission, setAuditSubmission] = useState<AuditSubmission | null>(null);

  useEffect(() => {
    let active = true;
    const hasFeature = (feature: string) => user.unlockedFeatures.includes(feature);
    Promise.all([
      hasFeature('incidents') ? strictApi<Incident[]>('/api/data/incidents') : Promise.resolve([]),
      hasFeature('capa') ? strictApi<Capa[]>('/api/data/capa') : Promise.resolve([]),
      user.auditAccess ? strictApi<Audit[]>('/api/data/audits') : Promise.resolve([]),
      hasFeature('toolbox-talks') ? strictApi<Talk[]>('/api/data/toolbox-talks') : Promise.resolve([]),
      hasFeature('compliance') ? strictApi<Obligation[]>('/api/data/compliance') : Promise.resolve([]),
      user.auditAccess ? strictApi<AuditSubmission>('/api/audit-submission') : Promise.resolve(null),
    ])
      .then(([incidentRows, capaRows, auditRows, talkRows, obligationRows, submission]) => {
        if (!active) return;
        setIncidents(incidentRows);
        setCapa(capaRows);
        setAudits(auditRows);
        setTalks(talkRows);
        setObligations(obligationRows);
        setAuditSubmission(submission);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load your workplace overview');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user.auditAccess, user.unlockedFeatures]);

  const openCapa = capa.filter((item) => item.status.toLowerCase() !== 'closed').length;
  const latestAudit = audits[0];
  const dueSoon = obligations.filter((item) => {
    const remaining = daysUntil(item.dueDate);
    return remaining !== null && remaining <= 30;
  });
  const latestLti = useMemo(
    () => incidents
      .filter((incident) => incident.type.toLowerCase().includes('lti') || (incident.lostTimeDays ?? 0) > 0)
      .map((incident) => ({ ...incident, time: new Date(incident.occurredAt).getTime() }))
      .filter((incident) => Number.isFinite(incident.time))
      .sort((a, b) => b.time - a.time)[0],
    [incidents],
  );
  const daysSinceLti = latestLti ? Math.max(0, Math.floor((Date.now() - latestLti.time) / 86_400_000)) : null;
  const recentActivity = useMemo(() => [
    ...incidents.map((item) => ({
      id: `incident-${item.id}`,
      title: item.title,
      detail: `${item.ref} · Incident reported`,
      date: item.occurredAt,
      tone: item.severity,
    })),
    ...talks.map((item) => ({
      id: `talk-${item.id}`,
      title: item.topic,
      detail: `Toolbox talk · ${item.status}`,
      date: item.createdAt,
      tone: 'forest',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [incidents, talks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <StatSkeleton key={index} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workplace dashboard"
        title={`Good to see you, ${user.fullName.split(' ')[0]}`}
        description={`Your safety and compliance workspace for ${user.organisation}.`}
        actions={
          <>
            <Link href="/app/forms"><Button variant="secondary"><ClipboardList className="h-4 w-4" /> Forms & questionnaires</Button></Link>
            <Link href="/app/incidents"><Button><Plus className="h-4 w-4" /> Report incident</Button></Link>
          </>
        }
      />

      {error ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-800 sm:flex-row sm:items-center sm:justify-between">
          <span>Some dashboard information could not be loaded: {error}</span>
          <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open corrective actions" value={openCapa} hint="Actions still in progress" icon={Wrench} tone={openCapa ? 'clay' : 'forest'} />
        <StatCard label="Latest audit rating" value={latestAudit ? `${latestAudit.complianceScore}%` : '—'} hint={latestAudit ? `${latestAudit.facility} · ${latestAudit.cycleYear}` : 'No statutory audit recorded'} icon={FileCheck2} />
        <StatCard label="OSH questionnaire" value={`${auditSubmission?.progress.percent ?? 0}%`} hint={`${auditSubmission?.progress.completed ?? 0} of ${auditSubmission?.progress.total ?? 0} sections assessed`} icon={ClipboardCheck} tone="safety" />
        <StatCard label="Obligations due soon" value={dueSoon.length} hint="Overdue or due within 30 days" icon={CalendarClock} tone={dueSoon.length ? 'clay' : 'forest'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-forest-900 p-6 text-white lg:col-span-2"
        >
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-forest-700/40 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-forest-300">Annual statutory audit</p>
              <h2 className="mt-2 text-xl font-bold">Your OSH audit questionnaire</h2>
              <p className="mt-2 text-sm text-forest-100/80">Save your progress as you complete workplace sections, attach evidence and submit for review.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/app/osh-audit"><Button className="bg-white text-forest-900 hover:bg-forest-50">{auditSubmission?.status === 'submitted' || auditSubmission?.status === 'in_review' ? 'View submission' : auditSubmission?.progress.completed ? 'Continue questionnaire' : 'Start questionnaire'} <ArrowRight className="h-4 w-4" /></Button></Link>
                <span className="text-xs text-forest-200">{auditSubmission?.progress.completed ?? 0}/{auditSubmission?.progress.total ?? 0} sections complete</span>
              </div>
            </div>
            <div className="flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border-[10px] border-forest-700 bg-forest-800 sm:self-auto">
              <div className="text-center"><p className="text-3xl font-bold">{auditSubmission?.progress.percent ?? 0}%</p><p className="text-[10px] uppercase tracking-wider text-forest-200">complete</p></div>
            </div>
          </div>
          <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-forest-700">
            <div className="h-full rounded-full bg-safety-400 transition-all" style={{ width: `${auditSubmission?.progress.percent ?? 0}%` }} />
          </div>
          {auditSubmission ? <p className="relative mt-2 text-[11px] text-forest-200">{auditSubmission.reference} · <span className="capitalize">{auditSubmission.status.replaceAll('_', ' ')}</span></p> : null}
        </motion.section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Safety snapshot</p><h2 className="mt-1 font-bold text-ink">Lost-time incidents</h2></div>
            <div className="rounded-xl bg-safety-50 p-2.5 text-safety-700"><HardHat className="h-5 w-5" /></div>
          </div>
          <p className="mt-5 text-4xl font-bold tracking-tight text-ink">{daysSinceLti === null ? '—' : daysSinceLti}</p>
          <p className="mt-1 text-sm text-slate-500">{daysSinceLti === null ? 'No lost-time incident recorded' : `days since ${latestLti?.ref}`}</p>
          <Link href="/app/incidents" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900">View incident register <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-bold text-ink">Upcoming obligations</h2><p className="mt-1 text-xs text-slate-500">Due dates that need attention</p></div>
            <Link href="/app/compliance-calendar" className="text-xs font-bold text-forest-700 hover:text-forest-900">View calendar <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {dueSoon.slice(0, 4).map((item) => {
              const remaining = daysUntil(item.dueDate);
              return <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5"><div className="flex min-w-0 items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{item.title}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.regulator} · {dateLabel(item.dueDate)}</p></div></div><Badge tone={remaining !== null && remaining < 0 ? 'clay' : 'safety'}>{remaining !== null && remaining < 0 ? 'Overdue' : remaining === 0 ? 'Today' : `${remaining} days`}</Badge></div>;
            })}
            {!dueSoon.length ? <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500"><CheckCircle2 className="h-5 w-5 text-forest-600" />No obligations are due in the next 30 days.</div> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-bold text-ink">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Latest reports and safety briefings</p></div>
            <ShieldAlert className="h-4 w-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{item.title}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.detail} · {dateLabel(item.date)}</p></div><Badge tone={item.tone}>{item.tone}</Badge></div>)}
            {!recentActivity.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">New reports and briefings will appear here.</p> : null}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest-600">Get work done</p><h2 className="mt-1 text-xl font-bold text-ink">Workplace forms & tools</h2></div>
          <Link href="/app/forms" className="text-sm font-bold text-forest-700 hover:text-forest-900">Browse all forms <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/app/incidents', title: 'Report an incident', detail: 'Record an injury, near miss or event.', icon: ShieldAlert, tone: 'bg-clay-50 text-clay-700' },
            { href: '/app/risk-assessments', title: 'Assess workplace risk', detail: 'Identify hazards and controls.', icon: HardHat, tone: 'bg-safety-50 text-safety-700' },
            { href: '/app/toolbox-talks', title: 'Create a toolbox talk', detail: 'Prepare and record a team briefing.', icon: Sparkles, tone: 'bg-forest-50 text-forest-700' },
            { href: '/app/capa', title: 'Track corrective action', detail: 'Assign and monitor follow-up work.', icon: Wrench, tone: 'bg-slate-100 text-slate-700' },
            { href: '/app/training', title: 'Request team training', detail: 'Choose safety, fire, first-aid and more.', icon: HardHat, tone: 'bg-safety-50 text-safety-700' },
          ].map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-sm"><span className={`rounded-xl p-2.5 ${item.tone}`}><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="flex items-center gap-1 text-sm font-bold text-ink">{item.title}<ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-forest-700" /></span><span className="mt-1 block text-xs text-slate-500">{item.detail}</span></span></Link>;
          })}
        </div>
      </section>
    </div>
  );
}
