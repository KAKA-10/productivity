'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection } from '@/hooks/use-collection';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ChoiceCards, Field, Select, TextInput, Textarea } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { SITES } from '@/lib/resources';
import { formatDate } from '@/lib/utils';
import { downloadPdf } from '@/lib/pdf';

type Incident = {
  id: string;
  ref: string;
  title: string;
  type: string;
  site: string;
  severity: string;
  status: string;
  reporter: string;
  summary: string;
  occurredAt: string;
  injuredName?: string;
  occupation?: string;
  bodyPart?: string;
  lostTimeDays?: number;
  oshaSection?: string;
  witnesses?: string;
  immediateCause?: string;
  rootCause?: string;
};

const empty = {
  title: '',
  type: 'Near-Miss',
  site: SITES[0],
  severity: 'Medium',
  reporter: '',
  summary: '',
  occurredAt: new Date().toISOString().slice(0, 10),
  status: 'Under Investigation',
  injuredName: '',
  occupation: '',
  bodyPart: '',
  lostTimeDays: 0,
  oshaSection: 'OSHA 2007 Sec. 6',
  witnesses: '',
  immediateCause: '',
  rootCause: '',
};

export default function IncidentsPage() {
  const { items, loading, create } = useCollection<Incident>('incidents');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<Incident | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.ref} ${item.title} ${item.site}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  );

  const submit = async () => {
    if (!form.title || !form.reporter || !form.summary) {
      toast.error('Title, reporter and summary are required');
      return;
    }
    setSaving(true);
    try {
      await create(form);
      toast.success('Flash incident logged');
      setOpen(false);
      setForm(empty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Incident register"
        description="Flash reports, severity classification and investigation tracking."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Log incident
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total logged" value={items.length} icon={AlertTriangle} />
            <StatCard
              label="Active investigations"
              value={items.filter((i) => i.status !== 'Closed').length}
              icon={AlertTriangle}
              tone="safety"
            />
            <StatCard
              label="Closed"
              value={items.filter((i) => i.status === 'Closed').length}
              icon={AlertTriangle}
              tone="forest"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ref, title or site"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No incidents match"
              description="Adjust search or log a new flash report."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ref & event</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Site</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-[11px] text-slate-400">{item.ref}</p>
                        <p className="font-semibold">{item.title}</p>
                      </td>
                      <td className="px-4 py-3">{item.type}</td>
                      <td className="px-4 py-3">{item.site}</td>
                      <td className="px-4 py-3">
                        <Badge tone={item.severity}>{item.severity}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={item.status}>{item.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setFlash(item)}>
                          Flash report
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log flash incident"
        subtitle="Immediate containment first. Investigation follows."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? 'Saving…' : 'Submit report'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event title" className="sm:col-span-2">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Near-Miss', 'First Aid', 'LTI', 'Property Damage'].map((t) => (
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
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Severity
            </p>
            <ChoiceCards
              value={form.severity}
              onChange={(severity) => setForm({ ...form, severity })}
              options={[
                { value: 'Low', label: 'Low', hint: 'First aid / near miss' },
                { value: 'Medium', label: 'Medium', hint: 'Medical / damage' },
                { value: 'High', label: 'High', hint: 'LTI / major' },
              ]}
            />
          </div>
          <Field label="Reporter">
            <TextInput value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} />
          </Field>
          <Field label="Date">
            <TextInput
              type="date"
              value={form.occurredAt}
              onChange={(e) => setForm({ ...form, occurredAt: e.target.value })}
            />
          </Field>
          <Field label="Summary & containment" className="sm:col-span-2">
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </Field>
          <Field label="Injured person">
            <TextInput value={form.injuredName} onChange={(e) => setForm({ ...form, injuredName: e.target.value })} />
          </Field>
          <Field label="Occupation">
            <TextInput value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
          </Field>
          <Field label="Body part">
            <TextInput value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value })} />
          </Field>
          <Field label="Lost time days">
            <TextInput type="number" value={form.lostTimeDays} onChange={(e) => setForm({ ...form, lostTimeDays: Number(e.target.value) })} />
          </Field>
          <Field label="OSHA section">
            <Select value={form.oshaSection} onChange={(e) => setForm({ ...form, oshaSection: e.target.value })}>
              {['OSHA 2007 Sec. 6', 'OSHA 2007 Sec. 13', 'OSHA 2007 Sec. 21', 'LN 31/2004'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Witnesses">
            <TextInput value={form.witnesses} onChange={(e) => setForm({ ...form, witnesses: e.target.value })} />
          </Field>
          <Field label="Immediate cause" className="sm:col-span-2">
            <TextInput value={form.immediateCause} onChange={(e) => setForm({ ...form, immediateCause: e.target.value })} />
          </Field>
          <Field label="Root cause" className="sm:col-span-2">
            <TextInput value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!flash}
        onClose={() => setFlash(null)}
        title="Flash report dossier"
        subtitle={flash?.ref}
        footer={
          <Button
            onClick={() => {
              if (!flash) return;
              downloadPdf(flash.ref, `Flash report ${flash.ref}`, [
                `Reference: ${flash.ref}`,
                `Title: ${flash.title}`,
                `Type: ${flash.type}    Severity: ${flash.severity}`,
                `Site: ${flash.site}`,
                `Date: ${flash.occurredAt}`,
                `Reporter: ${flash.reporter}`,
                `OSHA: ${flash.oshaSection || 'OSHA 2007 Sec. 6'}`,
                `Injured person: ${flash.injuredName || 'N/A'}  Occupation: ${flash.occupation || 'N/A'}`,
                `Body part: ${flash.bodyPart || 'N/A'}  Lost days: ${flash.lostTimeDays ?? 0}`,
                `Witnesses: ${flash.witnesses || 'N/A'}`,
                '',
                'Summary / containment:',
                flash.summary,
                '',
                `Immediate cause: ${flash.immediateCause || 'Pending investigation'}`,
                `Root cause: ${flash.rootCause || 'Pending investigation'}`,
              ]);
              toast.success('PDF downloaded');
            }}
          >
            <Printer className="h-4 w-4" /> Download PDF
          </Button>
        }
      >
        {flash ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-lg font-bold">{flash.title}</h3>
            <p className="text-sm text-slate-600">{flash.summary}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-slate-400">Type</span>
                <br />
                {flash.type}
              </p>
              <p>
                <span className="text-slate-400">Site</span>
                <br />
                {flash.site}
              </p>
              <p>
                <span className="text-slate-400">When</span>
                <br />
                {formatDate(flash.occurredAt)}
              </p>
              <p>
                <span className="text-slate-400">Reporter</span>
                <br />
                {flash.reporter}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
