'use client';

import { useEffect, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';
import { useActiveWorkspace } from '@/lib/workspace-context';
import { RESOURCE_KEYS, type ResourceKey } from '@/lib/resources';

type BranchRecord = Record<string, unknown> & { id: string };

const resourceLabels: Record<ResourceKey, string> = {
  incidents: 'Incidents',
  risks: 'Risk assessments',
  jsa: 'Job safety analyses',
  'toolbox-talks': 'Toolbox talks',
  compliance: 'Compliance obligations',
  audits: 'DOSHS audit records',
  inspections: 'Inspections',
  ppe: 'PPE records',
  fire: 'Fire equipment',
  personnel: 'Emergency role holders',
  meetings: 'Committee meetings',
  training: 'Training records',
  capa: 'Corrective actions',
  reports: 'DOSHS reports',
};

const titleFields = ['title', 'topic', 'activity', 'taskTitle', 'type', 'employee', 'name', 'course'];
const detailFields = ['ref', 'type', 'category', 'severity', 'status', 'owner', 'department', 'site'];

function text(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function recordTitle(record: BranchRecord) {
  for (const key of titleFields) {
    const value = text(record[key]);
    if (value) return value;
  }
  return record.id;
}

export function BranchDataBrowser() {
  const branch = useActiveWorkspace();
  const [resource, setResource] = useState<ResourceKey>('incidents');
  const [records, setRecords] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    strictApi<BranchRecord[]>(`/api/data/${resource}`)
      .then((items) => {
        if (active) setRecords(items);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load branch records');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [resource, branch?.id]);

  const filtered = records.filter((record) =>
    `${recordTitle(record)} ${detailFields.map((key) => text(record[key])).join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client workspace · Read only"
        title="Branch records"
        description="Review workplace register data for the selected client branch. Change branches in the workspace selector above."
      />
      {branch ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-forest-50 p-2.5 text-forest-700"><Building2 className="h-5 w-5" /></span>
            <div><p className="text-xs text-slate-500">{branch.organisation}</p><p className="font-semibold text-ink">{branch.name}</p></div>
          </div>
          <label className="w-full sm:w-64">
            <span className="sr-only">Register type</span>
            <Select value={resource} onChange={(event) => setResource(event.target.value as ResourceKey)}>
              {RESOURCE_KEYS.map((key) => <option key={key} value={key}>{resourceLabels[key]}</option>)}
            </Select>
          </label>
        </div>
      ) : <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">Select an active client branch from the workspace selector.</p>}

      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input aria-label="Search branch records" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search this register" value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="text-xs text-slate-400">{filtered.length} records</span>
      </div>

      {loading ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3">Record</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => {
                const status = text(record.status);
                const details = detailFields.filter((key) => key !== 'status').map((key) => text(record[key])).filter(Boolean).join(' · ');
                const updated = text(record.updatedAt || record.createdAt);
                return (
                  <tr key={record.id}>
                    <td className="px-4 py-4 font-semibold text-ink">{recordTitle(record)}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">{text(record.ref) || '—'}</td>
                    <td className="max-w-md truncate px-4 py-4 text-xs text-slate-500">{details || '—'}</td>
                    <td className="px-4 py-4">{status ? <Badge tone={status}>{status}</Badge> : '—'}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">{updated ? new Date(updated).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
              {!filtered.length ? <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No {resourceLabels[resource].toLowerCase()} found for this branch.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
