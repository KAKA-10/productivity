'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput, Textarea } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ActiveBranchField } from '@/components/active-branch-field';
import { formatDate } from '@/lib/utils';

type Row = {
  id: string;
  ref: string;
  title: string;
  area: string;
  site: string;
  inspector: string;
  scheduled: string;
  status: string;
  findings: string;
};

const empty = { title: '', area: '', site: '', inspector: '', scheduled: '', status: 'Scheduled', findings: '' };

export default function InspectionsPage() {
  const { items, loading, create } = useCollection<Row>('inspections');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const submit = async () => {
    if (!form.title || !form.inspector || !form.scheduled) {
      toast.error('Title, inspector and date are required');
      return;
    }
    await create(form);
    toast.success('Inspection scheduled');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compliance" title="Workplace inspections" description="Walkthroughs, findings and follow-up." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Schedule</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Inspection</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><p className="font-mono text-[11px] text-slate-400">{item.ref}</p><p className="font-semibold">{item.title}</p></td>
                  <td className="px-4 py-3">{item.area}<p className="text-[11px] text-slate-400">{item.site}</p></td>
                  <td className="px-4 py-3">{item.inspector}</td>
                  <td className="px-4 py-3">{formatDate(item.scheduled)}</td>
                  <td className="px-4 py-3"><Badge tone={item.status}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Schedule inspection" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Area"><TextInput value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
          <ActiveBranchField label="Site" />
          <Field label="Inspector"><TextInput value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} /></Field>
          <Field label="Date"><TextInput type="date" value={form.scheduled} onChange={(e) => setForm({ ...form, scheduled: e.target.value })} /></Field>
          <Field label="Findings" className="sm:col-span-2"><Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
