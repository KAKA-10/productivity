'use client';

import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ChoiceCards, Field, Select, TextInput, Textarea } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';
import { formatDate } from '@/lib/utils';

type Row = {
  id: string;
  ref: string;
  title: string;
  source: string;
  site: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
  description: string;
};

const empty = {
  title: '',
  source: '',
  site: SITES[0],
  owner: '',
  dueDate: '',
  priority: 'Medium',
  status: 'Open',
  description: '',
};

export default function CapaPage() {
  const { items, loading, create, update } = useCollection<Row>('capa');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const submit = async () => {
    if (!form.title || !form.owner || !form.dueDate) {
      toast.error('Title, owner and due date are required');
      return;
    }
    await create(form);
    toast.success('CAPA opened');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Actions" title="Corrective & preventive actions" description="Close the loop from incidents, audits and inspections." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New CAPA</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><p className="font-mono text-[11px] text-slate-400">{item.ref}</p><p className="font-semibold">{item.title}</p></td>
                  <td className="px-4 py-3">{item.source}</td>
                  <td className="px-4 py-3">{item.owner}</td>
                  <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3"><Badge tone={item.priority}>{item.priority}</Badge></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={async () => {
                        const next = item.status === 'Closed' ? 'Open' : 'Closed';
                        await update(item.id, { status: next });
                        toast.success(`Marked ${next.toLowerCase()}`);
                      }}
                    >
                      <Badge tone={item.status}>{item.status}</Badge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Open CAPA" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><Wrench className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Source"><TextInput value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field>
          <Field label="Site"><Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>{SITES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Owner"><TextInput value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></Field>
          <Field label="Due"><TextInput type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Priority</p>
            <ChoiceCards value={form.priority} onChange={(priority) => setForm({ ...form, priority })} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]} />
          </div>
          <Field label="Description" className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
