'use client';

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, TextInput } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

type Row = {
  id: string;
  ref: string;
  course: string;
  trainee: string;
  department: string;
  trainer: string;
  date: string;
  expiryDate: string;
  status: string;
};

const empty = { course: '', trainee: '', department: '', trainer: '', date: '', expiryDate: '', status: 'Valid' };

export default function TrainingRecordsPage() {
  const { items, loading, create } = useCollection<Row>('training');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const submit = async () => {
    if (!form.course || !form.trainee) {
      toast.error('Course and trainee are required');
      return;
    }
    await create(form);
    toast.success('Training record saved');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="People & plant" title="Safety training matrix" description="Competence, recertification and expiry alerts." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add record</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Trainee</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><p className="font-mono text-[11px] text-slate-400">{item.ref}</p><p className="font-semibold">{item.course}</p></td>
                  <td className="px-4 py-3">{item.trainee}<p className="text-[11px] text-slate-400">{item.department}</p></td>
                  <td className="px-4 py-3">{formatDate(item.date)}</td><td className="px-4 py-3">{formatDate(item.expiryDate)}</td>
                  <td className="px-4 py-3"><Badge tone={item.status === 'Valid' ? 'completed' : 'pending'}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Log training" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><Users className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course" className="sm:col-span-2"><TextInput value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} /></Field>
          <Field label="Trainee"><TextInput value={form.trainee} onChange={(event) => setForm({ ...form, trainee: event.target.value })} /></Field>
          <Field label="Department"><TextInput value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></Field>
          <Field label="Trainer"><TextInput value={form.trainer} onChange={(event) => setForm({ ...form, trainer: event.target.value })} /></Field>
          <Field label="Date"><TextInput type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
          <Field label="Expiry"><TextInput type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
