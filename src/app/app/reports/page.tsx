'use client';

import { useState } from 'react';
import { FileText, Plus, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Select, TextInput } from '@/components/ui/field';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { ActiveBranchField } from '@/components/active-branch-field';
import { downloadPdf } from '@/lib/pdf';

type Row = {
  id: string;
  ref: string;
  title: string;
  type: string;
  period: string;
  site: string;
  status: string;
  preparedBy: string;
};

const empty = {
  title: '',
  type: 'Annual return',
  period: '2026',
  site: '',
  status: 'Draft',
  preparedBy: 'Wanjiru Kamau',
};

export default function ReportsPage() {
  const { items, loading, create } = useCollection<Row>('reports');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Row | null>(null);
  const [form, setForm] = useState(empty);

  const submit = async () => {
    if (!form.title) {
      toast.error('Report title is required');
      return;
    }
    await create(form);
    toast.success('DOSHS report drafted');
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="DOSHS-ready reports"
        description="One-click statutory packs aligned to OSHA 2007 returns."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New report</Button>}
      />
      {loading ? <CardGridSkeleton count={4} /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5"
            >
              <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
              <h3 className="mt-2 font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.type} · {item.period} · {item.site}</p>
              <div className="mt-4"><Badge tone={item.status}>{item.status}</Badge></div>
            </button>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Draft DOSHS report" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Annual return', 'Incident return', 'Audit dossier', 'Committee minutes pack'].map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Period"><TextInput value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></Field>
          <ActiveBranchField label="Site" />
        </div>
      </Modal>

      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title="Statutory pack"
        subtitle={view?.ref}
        footer={
          <Button onClick={() => {
            if (!view) return;
            downloadPdf(view.ref, view.title, [
              `Reference: ${view.ref}`,
              `Type: ${view.type}`,
              `Period: ${view.period}`,
              `Site coverage: ${view.site}`,
              `Prepared by: ${view.preparedBy}`,
              `Status: ${view.status}`,
              '',
              'This pack is prepared for DOSHS under the Occupational Safety and Health Act, 2007.',
              'Attach supporting registers from Productivity OSHAPP (incidents, CAPA, training, fire equipment) before filing.',
            ]);
            toast.success('PDF downloaded');
          }}>
            <Printer className="h-4 w-4" /> Download PDF
          </Button>
        }
      >
        {view ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 p-5 text-sm">
            <p className="flex items-center gap-2 font-bold"><FileText className="h-4 w-4 text-forest-600" /> {view.title}</p>
            <p>Prepared for DOSHS under OSHA 2007.</p>
            <p>Type: {view.type}</p>
            <p>Period: {view.period}</p>
            <p>Site coverage: {view.site}</p>
            <p>Prepared by: {view.preparedBy}</p>
            <p className="text-slate-500">Use the browser print dialog to save as PDF. Layout is print-optimised.</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
