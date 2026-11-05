'use client';

import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput, Textarea } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';
import { formatDate } from '@/lib/utils';

type Meeting = {
  id: string;
  ref: string;
  title: string;
  site: string;
  meetingDate: string;
  chair: string;
  attendees: number;
  status: string;
  minutes: string;
};

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

export default function CommitteePage() {
  const meetings = useCollection<Meeting>('meetings');
  const people = useCollection<Person>('personnel');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: 'OSH Committee',
    site: SITES[0],
    meetingDate: '',
    chair: '',
    attendees: 8,
    status: 'Scheduled',
    minutes: '',
  });

  const submit = async () => {
    if (!form.title || !form.meetingDate || !form.chair) {
      toast.error('Title, date and chair are required');
      return;
    }
    await meetings.create(form);
    toast.success('Meeting logged');
    setOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People & plant"
        title="Committees & registers"
        description="OSH committee minutes plus first aider and fire marshal registers."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Record meeting</Button>}
      />

      {meetings.loading ? <TableSkeleton rows={3} /> : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Committee meetings</h2>
          <div className="space-y-3">
            {meetings.items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.site} · {formatDate(item.meetingDate)} · {item.chair}</p>
                  </div>
                  <Badge tone={item.status}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.minutes}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {people.loading ? <TableSkeleton rows={3} /> : (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <h2 className="px-4 pt-4 font-bold">First aiders & fire marshals</h2>
          <table className="mt-2 w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {people.items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{p.name}<p className="text-[11px] font-normal text-slate-400">{p.phone}</p></td>
                  <td className="px-4 py-3">{p.role}</td>
                  <td className="px-4 py-3">{p.site}</td>
                  <td className="px-4 py-3">{p.certificate}</td>
                  <td className="px-4 py-3">{formatDate(p.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="OSH committee minutes" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}><MessageSquare className="h-4 w-4" /> Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Site"><Select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>{SITES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Date"><TextInput type="date" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} /></Field>
          <Field label="Chair"><TextInput value={form.chair} onChange={(e) => setForm({ ...form, chair: e.target.value })} /></Field>
          <Field label="Attendees"><TextInput type="number" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: Number(e.target.value) })} /></Field>
          <Field label="Minutes" className="sm:col-span-2"><Textarea value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
