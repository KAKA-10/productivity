'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download, ExternalLink, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';
import { useActiveWorkspace } from '@/lib/workspace-context';

type Submission = {
  id: string;
  reference: string;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
  completion: number;
  completedSections: number;
  totalSections: number;
  evidenceCount: number;
  user: { fullName: string; username: string; organisation: string };
  branch: { name: string } | null;
  clientSignerName: string | null;
};
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleDateString() : 'Not submitted';

export default function AdminAuditsPage() {
  const branch = useActiveWorkspace();
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    strictApi<Submission[]>('/api/admin/audits')
      .then(setRows)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load submissions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((row) =>
    (status === 'all' || row.status === status) &&
    `${row.reference} ${row.user.fullName} ${row.user.organisation} ${row.branch?.name ?? ''} ${row.clientSignerName ?? ''} ${row.user.username}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Audit submissions" description="Review workplace responses, evidence and section-level findings." actions={<a href={`/api/admin/audits/export${branch ? `?branchId=${encodeURIComponent(branch.id)}` : ''}`}><Button variant="secondary"><Download className="h-4 w-4" /> Export PDF</Button></a>} />
      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400" /><input aria-label="Search submissions" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search workplace or reference" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <select aria-label="Filter by status" className="field" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{['draft', 'submitted', 'in_review', 'returned', 'approved'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select>
      </div>
      {loading ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Workplace</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => <tr key={row.id}><td className="px-4 py-4"><p className="font-mono text-[11px] text-slate-400">{row.reference}</p><p className="mt-1 font-semibold">{row.user.organisation}</p><p className="text-xs text-slate-500">{row.branch?.name ? `${row.branch.name} · ` : ''}{row.user.fullName} · @{row.user.username}</p>{row.clientSignerName ? <p className="mt-1 text-xs text-forest-700">Signed by {row.clientSignerName}</p> : null}</td><td className="px-4 py-4"><p className="font-semibold">{row.completion}%</p><p className="text-xs text-slate-500">{row.completedSections} / {row.totalSections} sections</p></td><td className="px-4 py-4">{row.evidenceCount} files</td><td className="px-4 py-4 text-xs text-slate-600">{dateLabel(row.submittedAt)}</td><td className="px-4 py-4"><Badge tone={row.status}>{row.status.replaceAll('_', ' ')}</Badge></td><td className="px-4 py-4 text-right"><Link href={`/app/admin/audits/${row.id}`}><Button size="sm" variant="secondary">Open <ExternalLink className="h-3.5 w-3.5" /></Button></Link></td></tr>)}
              {!filtered.length ? <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No submissions match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
