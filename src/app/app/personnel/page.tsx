'use client';

import { useMemo, useState } from 'react';
import { HeartPulse, Plus, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ActiveBranchField } from '@/components/active-branch-field';
import { formatDate } from '@/lib/utils';

type Person = {
  id: string;
  ref: string;
  name: string;
  role: string;
  site: string;
  department: string;
  certificate: string;
  expiryDate: string;
  phone: string;
};

const emptyForm = {
  name: '',
  role: 'First Aider',
  site: '',
  department: '',
  certificate: '',
  expiryDate: '',
  phone: '',
};

function certificateStatus(expiryDate: string) {
  if (!expiryDate) return 'Not recorded';
  const expiry = new Date(`${expiryDate}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) return 'Check date';
  const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Expired';
  if (days <= 60) return 'Expiring soon';
  return 'Valid';
}

export default function PersonnelPage() {
  const { items, loading, error, create } = useCollection<Person>('personnel');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => items.filter((person) =>
    `${person.name} ${person.role} ${person.site} ${person.department}`.toLowerCase().includes(query.toLowerCase()),
  ), [items, query]);
  const firstAiders = items.filter((person) => person.role.toLowerCase().includes('first aider')).length;
  const fireMarshals = items.filter((person) => person.role.toLowerCase().includes('fire marshal')).length;
  const needsRenewal = items.filter((person) => ['Expired', 'Expiring soon', 'Check date', 'Not recorded'].includes(certificateStatus(person.expiryDate))).length;

  const submit = async () => {
    if (!form.name.trim() || !form.role || !form.site || !form.certificate.trim() || !form.expiryDate) {
      toast.error('Name, role, site, certificate and expiry date are required');
      return;
    }
    setSaving(true);
    try {
      await create(form);
      toast.success('Emergency role holder added');
      setForm(emptyForm);
      setOpen(false);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to save this record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People & plant"
        title="First aiders & fire marshals"
        description="Keep workplace emergency contacts, safety roles and certificate renewals up to date."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add role holder</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="First aiders" value={firstAiders} hint="Workplace register" icon={HeartPulse} />
        <StatCard label="Fire marshals" value={fireMarshals} hint="Workplace register" icon={ShieldCheck} tone="safety" />
        <StatCard label="Renewal attention" value={needsRenewal} hint="Expired, missing or due within 60 days" icon={HeartPulse} tone={needsRenewal ? 'clay' : 'forest'} />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input aria-label="Search emergency role holders" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, role, department or site" className="w-full bg-transparent text-sm outline-none" />
        <span className="shrink-0 text-xs text-slate-400">{filtered.length} records</span>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">Could not load the register: {error}</p> : null}
      {loading ? <TableSkeleton /> : filtered.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Role holder</th><th className="px-4 py-3">Role & worksite</th><th className="px-4 py-3">Certificate</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((person) => {
                const status = certificateStatus(person.expiryDate);
                return <tr key={person.id}><td className="px-4 py-4"><p className="font-semibold text-ink">{person.name}</p><p className="text-xs text-slate-500">{person.phone || 'No phone recorded'}</p></td><td className="px-4 py-4"><p className="font-medium">{person.role}</p><p className="text-xs text-slate-500">{person.department || '—'} · {person.site}</p></td><td className="px-4 py-4">{person.certificate}</td><td className="px-4 py-4">{person.expiryDate ? formatDate(person.expiryDate) : '—'}</td><td className="px-4 py-4"><Badge tone={status === 'Valid' ? 'completed' : status === 'Expiring soon' ? 'pending' : 'clay'}>{status}</Badge></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon={HeartPulse} title="No role holders found" description={query ? 'Try another search or add a new emergency role holder.' : 'Add your workplace first aiders and fire marshals to begin the register.'} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add role holder</Button>} />}

      <Modal open={open} onClose={() => setOpen(false)} title="Add emergency role holder" subtitle="Record the appointed role and current certificate details." footer={<><Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void submit()} disabled={saving}>{saving ? 'Saving…' : 'Save role holder'}</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><TextInput required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Emergency role"><Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{['First Aider', 'Fire Marshal', 'Safety Officer', 'Other'].map((role) => <option key={role}>{role}</option>)}</Select></Field>
          <ActiveBranchField label="Worksite" />
          <Field label="Department"><TextInput maxLength={120} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></Field>
          <Field label="Certificate / qualification"><TextInput required maxLength={160} value={form.certificate} onChange={(event) => setForm({ ...form, certificate: event.target.value })} /></Field>
          <Field label="Certificate expiry"><TextInput required type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></Field>
          <Field label="Phone number"><TextInput type="tel" maxLength={32} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
