'use client';

import { useState } from 'react';
import { HardHat, Plus } from 'lucide-react';
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
  employee: string;
  department: string;
  item: string;
  size: string;
  issuedOn: string;
  expiryDate: string;
  status: string;
};

const empty = { employee: '', department: '', item: '', size: '', issuedOn: '', expiryDate: '', status: 'Active' };

export default function PpePage() {
  const { items, loading, create } = useCollection<Row>('ppe');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const submit = async () => {
    if (!form.employee || !form.item) {
      toast.error('Employee and PPE item are required');
      return;
    }
    await create(form);
    toast.success('PPE issuance recorded');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="People & plant" title="PPE issuance" description="Track issue, size and replacement dates." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Issue PPE</Button>} />
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><p className="font-semibold">{item.employee}</p><p className="text-[11px] text-slate-400">{item.department}</p></td>
                  <td className="px-4 py-3">{item.item} · {item.size}</td>
                  <td className="px-4 py-3">{formatDate(item.issuedOn)}</td>
                  <td className="px-4 py-3">{formatDate(item.expiryDate)}</td>
                  <td className="px-4 py-3"><Badge tone={item.status === 'Active' ? 'completed' : 'pending'}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Issue PPE" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><HardHat className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employee"><TextInput value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} /></Field>
          <Field label="Department"><TextInput value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
          <Field label="Item"><TextInput value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></Field>
          <Field label="Size"><TextInput value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Field>
          <Field label="Issued"><TextInput type="date" value={form.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} /></Field>
          <Field label="Expiry"><TextInput type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
