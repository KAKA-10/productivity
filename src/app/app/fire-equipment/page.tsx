'use client';

import { useState } from 'react';
import { Flame, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ActiveBranchField } from '@/components/active-branch-field';
import { formatDate } from '@/lib/utils';

type Row = {
  id: string;
  ref: string;
  type: string;
  location: string;
  site: string;
  lastInspection: string;
  nextInspection: string;
  status: string;
};

const empty = { type: '9kg DCP extinguisher', location: '', site: '', lastInspection: '', nextInspection: '', status: 'Serviceable' };

export default function FireEquipmentPage() {
  const { items, loading, create } = useCollection<Row>('fire');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const submit = async () => {
    if (!form.location || !form.nextInspection) {
      toast.error('Location and next inspection date are required');
      return;
    }
    await create(form);
    toast.success('Extinguisher added to register');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="People & plant" title="Fire equipment" description="Extinguisher inspections under LN 59/2007." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add unit</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Last</th>
                <th className="px-4 py-3">Next</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><p className="font-mono text-[11px] text-slate-400">{item.ref}</p><p className="font-semibold">{item.type}</p></td>
                  <td className="px-4 py-3">{item.location}<p className="text-[11px] text-slate-400">{item.site}</p></td>
                  <td className="px-4 py-3">{formatDate(item.lastInspection)}</td>
                  <td className="px-4 py-3">{formatDate(item.nextInspection)}</td>
                  <td className="px-4 py-3"><Badge tone={item.status === 'Due' ? 'urgent' : 'completed'}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Register fire equipment" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><Flame className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type"><TextInput value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
          <ActiveBranchField label="Site" />
          <Field label="Location" className="sm:col-span-2"><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Last inspection"><TextInput type="date" value={form.lastInspection} onChange={(e) => setForm({ ...form, lastInspection: e.target.value })} /></Field>
          <Field label="Next inspection"><TextInput type="date" value={form.nextInspection} onChange={(e) => setForm({ ...form, nextInspection: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
