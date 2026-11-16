'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardCheck, Download, FileClock, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Submission = {
  id: string;
  reference: string;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
  user: { fullName: string; organisation: string; username: string };
  completion: number;
};
type Account = { id: string; role: string; status: string };

export function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api<Submission[]>('/api/admin/audits'), api<Account[]>('/api/admin/users')])
      .then(([auditRows, accountRows]) => {
        setSubmissions(auditRows);
        setAccounts(accountRows);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load administrator overview'))
      .finally(() => setLoading(false));
  }, []);

  const waiting = submissions.filter((submission) => ['submitted', 'in_review'].includes(submission.status)).length;
  const activeUsers = accounts.filter((account) => ['client_super_admin', 'workplace_admin'].includes(account.role) && account.status === 'active').length;
  const reviewed = submissions.filter((submission) => submission.status === 'approved').length;

  if (loading) {
    return <div className="space-y-5"><Skeleton className="h-10 w-64" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton className="h-32 rounded-2xl" key={item} />)}</div></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Review centre"
        description="Manage workplace accounts and move OSH audit submissions through review."
        actions={<a href="/api/admin/audits/export"><Button variant="secondary"><Download className="h-4 w-4" /> Export responses</Button></a>}
      />
      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={waiting} hint="Submitted or in review" icon={FileClock} tone="clay" />
        <StatCard label="Active client accounts" value={activeUsers} hint="Client Super Admins and Workplace Admins" icon={UsersRound} />
        <StatCard label="Approved audits" value={reviewed} hint="Completed review" icon={ClipboardCheck} tone="safety" />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-bold text-ink">Recent submissions</h2><p className="mt-1 text-xs text-slate-500">Latest workplace audit activity</p></div>
          <Link href="/app/admin/audits" className="text-sm font-semibold text-forest-700 hover:text-forest-900">All submissions <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
        {submissions.length ? (
          <div className="divide-y divide-slate-100">
            {submissions.slice(0, 6).map((submission) => (
              <Link key={submission.id} href={`/app/admin/audits/${submission.id}`} className="flex flex-col gap-2 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-mono text-xs text-slate-400">{submission.reference}</p><p className="mt-1 text-sm font-semibold">{submission.user.organisation}</p><p className="text-xs text-slate-500">{submission.user.fullName} · {submission.completion}% complete</p></div>
                <Badge tone={submission.status}>{submission.status.replaceAll('_', ' ')}</Badge>
              </Link>
            ))}
          </div>
        ) : <p className="px-5 py-10 text-center text-sm text-slate-500">No audit submissions yet.</p>}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/app/admin/users"><Button><UsersRound className="h-4 w-4" /> Manage accounts</Button></Link>
        <Link href="/app/admin/audits"><Button variant="secondary"><ClipboardCheck className="h-4 w-4" /> Review submissions</Button></Link>
      </div>
    </div>
  );
}
