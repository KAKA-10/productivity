'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput, Textarea } from '@/components/ui/field';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';

type Risk = {
  id: string;
  ref: string;
  activity: string;
  location: string;
  hazard: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  existingControls: string;
  residualRisk: string;
  status: string;
  personsAtRisk?: string;
  legalDuty?: string;
  reviewDate?: string;
};

const empty = {
  activity: '',
  location: SITES[0],
  hazard: '',
  likelihood: 3,
  severity: 3,
  existingControls: '',
  residualRisk: 'Medium',
  status: 'Open',
  personsAtRisk: '',
  legalDuty: 'OSHA 2007 Sec. 6 — Duty of care',
  reviewDate: '',
};

function band(score: number) {
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export default function RiskAssessmentsPage() {
  const { items, loading, create } = useCollection<Risk>('risks');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const score = form.likelihood * form.severity;

  const filtered = useMemo(
    () => items.filter((r) => `${r.activity} ${r.hazard} ${r.ref}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const submit = async () => {
    if (!form.activity || !form.hazard) {
      toast.error('Activity and hazard are required');
      return;
    }
    await create({ ...form, riskScore: score, residualRisk: band(score) });
    toast.success('Risk assessment recorded');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Workplace risk assessments"
        description="5×5 matrix aligned to OSHA 2007 hazard identification."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New assessment</Button>}
      />
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hazards" className="w-full bg-transparent text-sm outline-none" />
      </div>
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Hazard</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Residual</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
                    <p className="font-semibold">{item.activity}</p>
                    <p className="text-[11px] text-slate-400">{item.location}</p>
                  </td>
                  <td className="px-4 py-3">{item.hazard}</td>
                  <td className="px-4 py-3 font-bold">{item.riskScore}</td>
                  <td className="px-4 py-3"><Badge tone={item.residualRisk}>{item.residualRisk}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={item.status}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Digital risk assessment" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Activity" className="sm:col-span-2"><TextInput value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} /></Field>
          <Field label="Location"><Select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>{SITES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Hazard"><TextInput value={form.hazard} onChange={(e) => setForm({ ...form, hazard: e.target.value })} /></Field>
          <Field label="Likelihood 1–5"><TextInput type="number" min={1} max={5} value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })} /></Field>
          <Field label="Severity 1–5"><TextInput type="number" min={1} max={5} value={form.severity} onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })} /></Field>
          <div className="sm:col-span-2 rounded-2xl bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">
            Inherent score {score} · {band(score)}
          </div>
          <Field label="Persons at risk"><TextInput value={form.personsAtRisk} onChange={(e) => setForm({ ...form, personsAtRisk: e.target.value })} /></Field>
          <Field label="Review date"><TextInput type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} /></Field>
          <Field label="Legal duty" className="sm:col-span-2">
            <Select value={form.legalDuty} onChange={(e) => setForm({ ...form, legalDuty: e.target.value })}>
              {['OSHA 2007 Sec. 6 — Duty of care', 'OSHA 2007 Sec. 13 — Risk assessment', 'OSHA 2007 Sec. 101 — PPE', 'LN 59/2007 Fire risk reduction'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Existing controls" className="sm:col-span-2"><Textarea value={form.existingControls} onChange={(e) => setForm({ ...form, existingControls: e.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  );
}
