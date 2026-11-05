'use client';

import { useState } from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';

type Jsa = {
  id: string;
  ref: string;
  taskTitle: string;
  site: string;
  department: string;
  supervisor: string;
  stepsCount: number;
  permitRequired: string;
  status: string;
  reviewDate: string;
};

const empty = {
  taskTitle: '',
  site: SITES[0],
  department: 'Operations',
  supervisor: '',
  stepsCount: 4,
  permitRequired: 'Hot Work Permit',
  status: 'Pending Approval',
  reviewDate: new Date().toISOString().slice(0, 10),
};

export default function JsaPage() {
  const { items, loading, create } = useCollection<Jsa>('jsa');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const submit = async () => {
    if (!form.taskTitle || !form.supervisor) {
      toast.error('Task title and supervisor are required');
      return;
    }
    await create(form);
    toast.success('JSA added to register');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Job safety analysis" description="Task breakdown, permits and supervisor sign-off." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New JSA</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Permit</th>
                <th className="px-4 py-3">Supervisor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
                    <p className="font-semibold">{item.taskTitle}</p>
                  </td>
                  <td className="px-4 py-3">{item.site}</td>
                  <td className="px-4 py-3">{item.permitRequired}</td>
                  <td className="px-4 py-3">{item.supervisor}</td>
                  <td className="px-4 py-3"><Badge tone={item.status}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Create JSA" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><FileSpreadsheet className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Task title" className="sm:col-span-2"><TextInput value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} /></Field>
          <Field label="Site"><Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>{SITES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Department"><TextInput value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
          <Field label="Supervisor"><TextInput value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></Field>
          <Field label="Permit">
            <Select value={form.permitRequired} onChange={(e) => setForm({ ...form, permitRequired: e.target.value })}>
              {['Hot Work Permit', 'Confined Space Permit', 'Working at Heights Permit', 'Electrical Isolation'].map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
