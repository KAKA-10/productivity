'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Clock3, FileText, Paperclip, Send, ShieldCheck, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea, TextInput } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { AUDIT_CATEGORIES, AUDIT_SECTIONS, getAuditProgress, isAuditSectionComplete, type AuditResponse, type AuditResponses, type AuditSectionId } from '@/lib/audit-template';
import { strictApi } from '@/lib/strict-api';

type Evidence = { id: string; sectionId: string; originalName: string; byteSize: number; uploadedAt: string };
type Submission = {
  id: string;
  reference: string;
  status: string;
  version: number;
  submittedAt: string | null;
  responses: AuditResponses;
  evidence: Evidence[];
  findings: Record<string, string>;
  progress: { completed: number; total: number; percent: number };
};

const DETAILS_FIELDS: Partial<Record<AuditSectionId, { key: string; label: string; required?: boolean }[]>> = {
  'workplace-identification': [
    { key: 'workplaceName', label: 'Registered workplace name', required: true },
    { key: 'registrationNumber', label: 'Workplace registration number', required: true },
    { key: 'industry', label: 'Industry / main activity', required: true },
    { key: 'kraPin', label: 'KRA PIN (optional)' },
  ],
  'contact-details': [
    { key: 'contactName', label: 'Primary contact person', required: true },
    { key: 'contactRole', label: 'Job title' },
    { key: 'contactEmail', label: 'Email address', required: true },
    { key: 'contactPhone', label: 'Phone number', required: true },
  ],
  'physical-location': [
    { key: 'county', label: 'County', required: true },
    { key: 'town', label: 'Town / locality', required: true },
    { key: 'streetAddress', label: 'Street address / directions' },
  ],
  'workers-data': [
    { key: 'totalWorkers', label: 'Total number of workers', required: true },
    { key: 'maleWorkers', label: 'Male workers' },
    { key: 'femaleWorkers', label: 'Female workers' },
    { key: 'contractWorkers', label: 'Contract workers' },
  ],
};

function prettyStatus(status: string) {
  return status.replaceAll('_', ' ');
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OshAuditPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [responses, setResponses] = useState<AuditResponses>({});
  const [category, setCategory] = useState<string>(AUDIT_CATEGORIES[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('All changes saved');
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveRevision = useRef(0);

  const load = useCallback(async () => {
    try {
      const current = await strictApi<Submission>('/api/audit-submission');
      setSubmission(current);
      setResponses(current.responses || {});
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load your audit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const editable = submission ? ['draft', 'returned'].includes(submission.status) : false;
  const progress = useMemo(() => getAuditProgress(responses), [responses]);
  const currentCategory = AUDIT_CATEGORIES.find((item) => item.id === category) ?? AUDIT_CATEGORIES[0];
  const sections = AUDIT_SECTIONS.filter((section) => section.category === currentCategory.id);
  const savedFindings = submission?.findings ?? {};

  const save = useCallback(async (snapshot: AuditResponses) => {
    const revision = ++saveRevision.current;
    setSaving(true);
    setSaveMessage('Saving changes…');
    const operation = saveQueue.current.then(async () => {
      const result = await strictApi<{ version: number; updatedAt?: string }>('/api/audit-submission', {
        method: 'PATCH',
        body: JSON.stringify({ responses: snapshot }),
      });
      if (revision === saveRevision.current) {
        setSubmission((current) => current ? { ...current, version: result.version } : current);
        setSaving(false);
        setSaveMessage('All changes saved');
      }
    });
    saveQueue.current = operation.catch(() => undefined);
    try {
      await operation;
    } catch (reason) {
      if (revision === saveRevision.current) {
        setSaving(false);
        setSaveMessage('Changes not saved');
      }
      throw reason;
    }
  }, []);

  useEffect(() => {
    if (!editable || loading) return;
    const timeout = window.setTimeout(() => {
      void save(responses).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [editable, loading, responses, save]);

  const updateResponse = (sectionId: AuditSectionId, patch: Partial<AuditResponse>) => {
    setResponses((current) => ({
      ...current,
      [sectionId]: { ...current[sectionId], ...patch },
    }));
  };

  const uploadEvidence = async (sectionId: AuditSectionId, file?: File) => {
    if (!file) return;
    setUploading(sectionId);
    try {
      const form = new FormData();
      form.append('sectionId', sectionId);
      form.append('file', file);
      const response = await fetch('/api/audit-submission/evidence', { method: 'POST', body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to upload evidence');
      setSubmission((current) => current ? { ...current, evidence: [result as Evidence, ...current.evidence] } : current);
      toast.success('Evidence attached');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to upload evidence');
    } finally {
      setUploading(null);
    }
  };

  const submitAudit = async () => {
    if (!submission || progress.completed !== progress.total) {
      toast.error(`Complete all ${progress.total - progress.completed} remaining sections before submitting`);
      return;
    }
    setSubmitting(true);
    try {
      await save(responses);
      const result = await strictApi<{ status: string; submittedAt: string }>('/api/audit-submission', { method: 'POST' });
      setSubmission((current) => current ? { ...current, status: result.status, submittedAt: result.submittedAt } : current);
      toast.success('Audit submitted for review');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to submit your audit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-5"><Skeleton className="h-10 w-72" /><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance · Annual statutory audit"
        title="Workplace OSH audit"
        description="Complete the three audit parts, attach supporting evidence and submit your workplace assessment for review."
        actions={editable ? <Button disabled={submitting || progress.completed !== progress.total} onClick={() => void submitAudit()}><Send className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit for review'}</Button> : null}
      />
      {error ? <div role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}<Button size="sm" variant="ghost" className="ml-2" onClick={() => void load()}>Try again</Button></div> : null}
      {submission ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><div className="rounded-xl bg-forest-50 p-3 text-forest-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-mono text-xs text-slate-400">{submission.reference}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="font-bold capitalize text-ink">{submission.status.replaceAll('_', ' ')}</h2><Badge tone={submission.status}>{prettyStatus(submission.status)}</Badge></div><p className="mt-1 text-xs text-slate-500">{submission.submittedAt ? `Submitted ${new Date(submission.submittedAt).toLocaleString()}` : 'Your work is saved to this account.'}</p></div></div>
              <div className="min-w-[180px]"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">Audit progress</span><span className="font-bold text-forest-700">{progress.completed}/{progress.total}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest-600 transition-all" style={{ width: `${progress.percent}%` }} /></div><p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">{saving ? <Clock3 className="h-3 w-3" /> : <Check className="h-3 w-3" />}{saveMessage}</p></div>
            </div>
            {savedFindings.__returnNote && ['returned', 'draft'].includes(submission.status) ? <div className="mt-5 rounded-xl border border-safety-200 bg-safety-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-safety-800">Reviewer feedback</p><p className="mt-1 text-sm text-safety-900">{savedFindings.__returnNote}</p></div> : null}
            {submission.status === 'approved' ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-forest-50 p-3 text-sm font-medium text-forest-800"><CheckCircle2 className="h-4 w-4" /> Your audit has been reviewed and approved.</p> : null}
            {['submitted', 'in_review'].includes(submission.status) ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Your responses are locked while this audit is being reviewed.</p> : null}
          </section>

          <div className="grid gap-2 sm:grid-cols-3">
            {AUDIT_CATEGORIES.map((item) => {
              const total = AUDIT_SECTIONS.filter((section) => section.category === item.id).length;
              const complete = AUDIT_SECTIONS.filter((section) => section.category === item.id && isAuditSectionComplete(section.id, responses)).length;
              const active = category === item.id;
              return <button key={item.id} type="button" aria-pressed={active} onClick={() => setCategory(item.id)} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-forest-500 bg-forest-50 shadow-sm' : 'border-slate-200 bg-white hover:border-forest-200'}`}><div className="flex items-center justify-between"><span className="text-sm font-bold">{item.title}</span><span className="text-xs font-semibold text-slate-500">{complete}/{total}</span></div><p className="mt-1 text-xs text-slate-500">{item.description}</p></button>;
            })}
          </div>

          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">{currentCategory.title}</h2><p className="text-xs text-slate-500">{currentCategory.description}</p></div><span className="text-xs text-slate-400">{sections.length} sections</span></div>
          <div className="space-y-4">
            {sections.map((section) => {
              const response = responses[section.id] ?? {};
              const evidence = submission.evidence.filter((item) => item.sectionId === section.id);
              const fields = DETAILS_FIELDS[section.id] ?? [];
              return (
                <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-bold text-ink">{section.title}</h3><p className="mt-1 text-xs text-slate-500">{section.law}</p></div><Badge tone={isAuditSectionComplete(section.id, responses) ? 'completed' : 'pending'}>{isAuditSectionComplete(section.id, responses) ? 'Complete' : 'Incomplete'}</Badge></div>
                  {fields.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <Field key={field.key} label={field.label}><TextInput required={field.required} disabled={!editable} min="0" type={field.key === 'contactEmail' ? 'email' : field.key.endsWith('Workers') || field.key === 'totalWorkers' ? 'number' : 'text'} value={response.answers?.[field.key] ?? ''} onChange={(event) => updateResponse(section.id, { answers: { ...response.answers, [field.key]: event.target.value } })} /></Field>)}</div> : null}
                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
                    <Field label="Assessment">
                      <Select disabled={!editable} value={response.assessment ?? ''} onChange={(event) => updateResponse(section.id, { assessment: (event.target.value || undefined) as AuditResponse['assessment'] })}>
                        <option value="">Select assessment…</option><option value="compliant">Compliant</option><option value="needs_attention">Needs attention</option><option value="not_applicable">Not applicable</option>
                      </Select>
                    </Field>
                    <Field label="Observations / corrective actions">
                      <Textarea disabled={!editable} maxLength={4000} placeholder="Summarise the evidence observed, any gaps, and action needed." value={response.notes ?? ''} onChange={(event) => updateResponse(section.id, { notes: event.target.value })} />
                    </Field>
                  </div>
                  {['returned', 'draft'].includes(submission.status) && savedFindings[section.id] ? <p className="mt-4 rounded-lg border border-safety-200 bg-safety-50 p-3 text-sm text-safety-900"><strong>Reviewer finding:</strong> {savedFindings[section.id]}</p> : null}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Paperclip className="h-4 w-4" /> Supporting evidence <span className="font-normal text-slate-400">PDF, JPEG, PNG or WebP · 10 MB max</span></div>
                      {editable ? <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><UploadCloud className="h-4 w-4" />{uploading === section.id ? 'Uploading…' : 'Attach file'}<input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={uploading === section.id} onChange={(event) => { void uploadEvidence(section.id, event.target.files?.[0]); event.currentTarget.value = ''; }} /></label> : null}
                    </div>
                    {evidence.length ? <div className="mt-3 space-y-2">{evidence.map((item) => <a key={item.id} href={`/api/audit-submission/evidence/${item.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs hover:bg-forest-50"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-forest-600" /><span className="truncate font-medium">{item.originalName}</span></span><span className="shrink-0 text-slate-400">{formatBytes(item.byteSize)} <ChevronRight className="ml-1 inline h-3 w-3" /></span></a>)}</div> : <p className="mt-3 text-xs text-slate-400">No evidence attached to this section.</p>}
                  </div>
                </section>
              );
            })}
          </div>
          {editable ? <div className="flex justify-end"><Button size="lg" disabled={submitting || progress.completed !== progress.total} onClick={() => void submitAudit()}><Send className="h-4 w-4" />{submitting ? 'Submitting…' : `Submit audit · ${progress.completed}/${progress.total}`}</Button></div> : null}
        </>
      ) : null}
    </div>
  );
}
