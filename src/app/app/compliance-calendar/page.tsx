'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Item = {
  id: string;
  ref: string;
  title: string;
  category: string;
  site: string;
  regulator: string;
  dueDate: string;
  status: string;
  assignedTo: string;
  lawReference: string;
};

const TABS = ['All', 'Statutory Audit', 'Equipment Inspection', 'Environmental Compliance'];

const empty = {
  title: '',
  category: 'Statutory Audit',
  site: SITES[0],
  regulator: 'DOSHS',
  dueDate: '',
  status: 'pending',
  assignedTo: '',
  lawReference: 'OSHA 2007',
};

export default function ComplianceCalendarPage() {
  const { items, loading, create } = useCollection<Item>('compliance');
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchTab = tab === 'All' || item.category === tab;
        const matchQ = `${item.title} ${item.ref} ${item.site}`.toLowerCase().includes(q.toLowerCase());
        return matchTab && matchQ;
      }),
    [items, tab, q],
  );

  const submit = async () => {
    if (!form.title || !form.dueDate || !form.assignedTo) {
      toast.error('Title, due date and officer are required');
      return;
    }
    await create(form);
    toast.success('Inspection scheduled');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Compliance calendar"
        description="Statutory inspections, AIA plant checks and NEMA filings."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule audit
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition',
              tab === t ? 'bg-forest-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search obligations" className="w-full bg-transparent text-sm outline-none" />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Ref & title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Regulator</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.lawReference}</p>
                  </td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.site}</td>
                  <td className="px-4 py-3">{item.regulator}</td>
                  <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.status}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule inspection"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void submit()}>
              <CalendarCheck className="h-4 w-4" /> Save
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {TABS.slice(1).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Regulator">
            <Select value={form.regulator} onChange={(e) => setForm({ ...form, regulator: e.target.value })}>
              {['DOSHS', 'NEMA', 'AIA'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Site">
            <Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>
              {SITES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Due date">
            <TextInput type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <Field label="Lead officer" className="sm:col-span-2">
            <TextInput value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
