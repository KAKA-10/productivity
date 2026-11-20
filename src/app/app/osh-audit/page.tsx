'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Clock3, FileText, Paperclip, Send, ShieldCheck, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea, TextInput } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AUDIT_CATEGORIES,
  AUDIT_SECTIONS,
  getMissingAuditEvidence,
  getAuditProgress,
  isAuditFieldRequired,
  isOptionalAuditSection,
  isAuditSectionComplete,
  parseAuditMultiSelect,
  type AuditResponse,
  type AuditField,
  type AuditResponses,
  type AuditSectionId,
} from '@/lib/audit-template';
import { activeWorkspaceHeaders, strictApi } from '@/lib/strict-api';

type Evidence = {
  id: string;
  sectionId: string;
  fieldKey: string | null;
  kind: 'supporting' | 'signature';
  originalName: string;
  byteSize: number;
  uploadedAt: string;
};
type Submission = {
  id: string;
  reference: string;
  status: string;
  version: number;
  cycleYear: string;
  submittedAt: string | null;
  responses: AuditResponses;
  evidence: Evidence[];
  findings: Record<string, string>;
  progress: { completed: number; total: number; percent: number };
  branch: { id: string; name: string; organisation: string };
  canSign: boolean;
  signingUserName: string | null;
  clientSignerName: string | null;
  clientAttestedAt: string | null;
  clientDeclaration: boolean;
  clientSignatureEvidenceId: string | null;
};

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayStatus(status: string) {
  return status.replaceAll('_', ' ');
}

export default function OshAuditPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [responses, setResponses] = useState<AuditResponses>({});
  const [category, setCategory] = useState<string>(AUDIT_CATEGORIES[0].id);
  const [activeSectionId, setActiveSectionId] = useState<AuditSectionId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('All changes saved');
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [error, setError] = useState('');
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveRevision = useRef(0);

  const load = useCallback(async () => {
    try {
      const current = await strictApi<Submission>('/api/audit-submission');
      setSubmission(current);
      setResponses(current.responses || {});
      setSignerName(current.clientSignerName || current.signingUserName || '');
      setDeclaration(current.clientDeclaration);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load your audit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const editable = Boolean(submission && ['draft', 'returned'].includes(submission.status));
  const progress = useMemo(() => getAuditProgress(responses), [responses]);
  const currentCategory = AUDIT_CATEGORIES.find((item) => item.id === category) ?? AUDIT_CATEGORIES[0];
  const sections = AUDIT_SECTIONS.filter((section) => section.category === currentCategory.id);
  const activeSection = sections.find((section) => section.id === activeSectionId) ??
    sections.find((section) => !isOptionalAuditSection(section) && !isAuditSectionComplete(section.id, responses)) ??
    sections[0];
  const activeSectionIndex = activeSection ? sections.findIndex((section) => section.id === activeSection.id) : -1;
  const conditionSections = AUDIT_SECTIONS.filter((section) => section.category === 'conditions');
  const finalConditionSection = conditionSections[conditionSections.length - 1];
  const savedFindings = submission?.findings ?? {};
  const missingEvidence = submission ? getMissingAuditEvidence(responses, submission.evidence) : [];
  const signature = submission?.evidence.find((item) =>
    item.kind === 'signature' && item.id === submission.clientSignatureEvidenceId,
  ) ?? submission?.evidence.find((item) => item.kind === 'signature');
  const canSign = Boolean(submission?.canSign);

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

  const chooseCategory = (categoryId: string) => {
    setCategory(categoryId);
  };

  const chooseSection = (section: (typeof AUDIT_SECTIONS)[number]) => {
    setActiveSectionId(section.id);
  };

  const goToClientSignOff = () => {
    if (!finalConditionSection) return;
    setCategory(finalConditionSection.category);
    setActiveSectionId(finalConditionSection.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadEvidence = async (
    sectionId: string,
    file?: File,
    kind: 'supporting' | 'signature' = 'supporting',
    fieldKey?: string,
  ) => {
    if (!file) return;
    setUploading(sectionId);
    try {
      const form = new FormData();
      form.append('sectionId', sectionId);
      form.append('kind', kind);
      if (fieldKey) form.append('fieldKey', fieldKey);
      form.append('file', file);
      const response = await fetch('/api/audit-submission/evidence', {
        method: 'POST',
        headers: activeWorkspaceHeaders(),
        body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to upload evidence');
      setSubmission((current) => current ? { ...current, evidence: [result as Evidence, ...current.evidence] } : current);
      toast.success(kind === 'signature' ? 'Client signature uploaded' : 'Evidence attached');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to upload evidence');
    } finally {
      setUploading(null);
    }
  };

  const signAndSubmit = async () => {
    if (!submission || !signature || progress.completed !== progress.total || missingEvidence.length || !declaration) return;
    setSubmitting(true);
    try {
      await save(responses);
      const result = await strictApi<{
        status: string;
        submittedAt: string;
        clientSignerName: string;
        clientAttestedAt: string;
      }>('/api/audit-submission', {
        method: 'POST',
        body: JSON.stringify({
          signerName,
          declaration,
          signatureEvidenceId: signature.id,
        }),
      });
      setSubmission((current) => current ? {
        ...current,
        status: result.status,
        submittedAt: result.submittedAt,
        clientSignerName: result.clientSignerName,
        clientAttestedAt: result.clientAttestedAt,
        clientDeclaration: true,
        canSign: false,
      } : current);
      toast.success('Client signed and submitted the audit for review');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to sign and submit this audit');
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
        description="Complete every required area, attach supporting documents and have an authorised client representative sign before review."
        actions={canSign && editable
          ? <Button variant="secondary" onClick={goToClientSignOff}><ArrowRight className="h-4 w-4" /> Review and submit</Button>
          : null}
      />
      {error ? <div role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}<Button size="sm" variant="ghost" className="ml-2" onClick={() => void load()}>Try again</Button></div> : null}
      {submission ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-forest-50 p-3 text-forest-700"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <p className="font-mono text-xs text-slate-400">{submission.reference} · {submission.cycleYear}</p>
                  <h2 className="mt-1 font-bold capitalize text-ink">{submission.branch.organisation} · {submission.branch.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2"><Badge tone={submission.status}>{displayStatus(submission.status)}</Badge><span className="text-xs text-slate-500">{submission.submittedAt ? `Submitted ${new Date(submission.submittedAt).toLocaleString()}` : 'Draft saved to this branch.'}</span></div>
                </div>
              </div>
              <div className="min-w-[180px]">
                <div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">Audit progress</span><span className="font-bold text-forest-700">{progress.completed}/{progress.total}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest-600 transition-all" style={{ width: `${progress.percent}%` }} /></div>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">{saving ? <Clock3 className="h-3 w-3" /> : <Check className="h-3 w-3" />}{saveMessage}</p>
              </div>
            </div>
            {missingEvidence.length ? <p className="mt-4 rounded-xl border border-safety-200 bg-safety-50 p-3 text-xs text-safety-900">Required documents are missing: {missingEvidence.map((item) => `${item.sectionTitle} — ${item.label}`).join('; ')}.</p> : null}
            {savedFindings.__returnNote && ['returned', 'draft'].includes(submission.status) ? <div className="mt-5 rounded-xl border border-safety-200 bg-safety-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-safety-800">Reviewer feedback</p><p className="mt-1 text-sm text-safety-900">{savedFindings.__returnNote}</p></div> : null}
            {submission.status === 'approved' ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-forest-50 p-3 text-sm font-medium text-forest-800"><CheckCircle2 className="h-4 w-4" /> Your audit has been reviewed and approved.</p> : null}
            {['submitted', 'in_review'].includes(submission.status) ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Your responses are locked while this audit is being reviewed.</p> : null}
            {submission.clientSignerName && submission.clientAttestedAt ? <p className="mt-4 rounded-xl bg-forest-50 p-3 text-sm text-forest-800">Signed by {submission.clientSignerName} on {new Date(submission.clientAttestedAt).toLocaleString()}.</p> : null}
          </section>

          <ol className="grid gap-3 md:grid-cols-3" aria-label="Audit stages">
            {AUDIT_CATEGORIES.map((item, index) => {
              const sectionsInCategory = AUDIT_SECTIONS.filter((section) => section.category === item.id);
              const requiredSections = sectionsInCategory.filter((section) => !isOptionalAuditSection(section));
              const complete = requiredSections.filter((section) => isAuditSectionComplete(section.id, responses)).length;
              const active = category === item.id;
              const percent = requiredSections.length ? Math.round((complete / requiredSections.length) * 100) : 0;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? 'step' : undefined}
                    aria-pressed={active}
                    onClick={() => chooseCategory(item.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest-100 ${active ? 'border-forest-400 bg-white shadow-[0_12px_30px_-18px_rgba(27,67,50,0.65)]' : 'border-slate-200 bg-white/80 hover:border-forest-200 hover:bg-white'}`}
                  >
                    <span className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${complete === requiredSections.length ? 'bg-forest-100 text-forest-800' : active ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {complete === requiredSections.length ? <Check className="h-4 w-4" /> : `0${index + 1}`}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-ink">{item.title}</span>
                          <span className="text-[11px] font-semibold tabular-nums text-slate-500">{complete}/{requiredSections.length}</span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                      </span>
                    </span>
                    <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span className="block h-full rounded-full bg-forest-600 transition-all duration-500" style={{ width: `${percent}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div id="audit-workspace" className="grid scroll-mt-6 items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="min-w-0">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">Section guide</p>
                    <p className="mt-1 text-xs text-slate-500">{currentCategory.title}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-slate-600">
                    {activeSectionIndex >= 0 ? activeSectionIndex + 1 : 0}/{sections.length}
                  </span>
                </div>
                <label className="block px-2 pb-3 lg:hidden">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Jump to section</span>
                  <Select
                    value={activeSection?.id ?? ''}
                    aria-label={`${currentCategory.title} section`}
                    onChange={(event) => {
                      const section = sections.find((item) => item.id === event.target.value);
                      if (section) chooseSection(section);
                    }}
                  >
                    {sections.map((section) => <option key={section.id} value={section.id}>{section.title}{isOptionalAuditSection(section) ? ' · Optional' : ''}</option>)}
                  </Select>
                </label>
                <nav aria-label={`${currentCategory.title} sections`} className="hidden max-h-[calc(100vh-13rem)] flex-col gap-1 overflow-y-auto lg:flex">
                  {sections.map((section) => {
                    const complete = isAuditSectionComplete(section.id, responses);
                    const optional = isOptionalAuditSection(section);
                    const active = activeSection?.id === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        aria-current={active ? 'step' : undefined}
                        onClick={() => chooseSection(section)}
                        className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest-100 ${active ? 'border-forest-300 bg-forest-50/80' : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-forest-100 text-forest-700' : active ? 'bg-white text-forest-700' : 'bg-slate-100 text-slate-400'}`}>
                          {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold leading-5 text-ink">{section.title}</span>
                          <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                            {optional ? 'Supplemental · optional' : complete ? 'Complete' : 'Required · in progress'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">
                    Stage {AUDIT_CATEGORIES.findIndex((item) => item.id === currentCategory.id) + 1} of {AUDIT_CATEGORIES.length}
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">{currentCategory.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{currentCategory.description}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-600">
                  Section {activeSectionIndex >= 0 ? activeSectionIndex + 1 : 0} of {sections.length}
                </span>
              </div>

              {sections.filter((section) => section.id === activeSection?.id).map((section, index) => {
              const response = responses[section.id] ?? {};
              const sectionEvidence = submission.evidence.filter((item) => item.sectionId === section.id && item.kind === 'supporting');
              const evidenceFields = 'evidenceFields' in section ? section.evidenceFields ?? [] : [];
              const group = 'group' in section ? section.group : null;
              const previousSection = index > 0 ? sections[index - 1] : undefined;
              const previousGroup = previousSection && 'group' in previousSection ? previousSection.group : null;
              const showGroup = group && group !== previousGroup;
              const groupTitle = group === 'safety' ? 'Occupational safety at the workplace' : 'Occupational health and hygiene conditions';
              const optionalSection = isOptionalAuditSection(section);
              const renderField = (item: AuditField) => {
                const required = isAuditFieldRequired(section.id, item, response.answers);
                const value = response.answers?.[item.key] ?? '';
                const setValue = (nextValue: string) => updateResponse(section.id, { answers: { ...response.answers, [item.key]: nextValue } });
                if (item.kind === 'multi-select') {
                  const selected = parseAuditMultiSelect(value);
                  return (
                    <fieldset key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:col-span-2" disabled={!editable}>
                      <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}{required ? ' *' : ''}</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {(item.options ?? []).map((option) => {
                          const checked = selected.includes(option.value);
                          return (
                            <label key={option.value} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 accent-forest-700"
                                checked={checked}
                                disabled={!editable}
                                onChange={() => {
                                  const exclusive = item.exclusiveOptions?.includes(option.value) ?? false;
                                  const next = exclusive
                                    ? checked ? [] : [option.value]
                                    : checked
                                      ? selected.filter((current) => current !== option.value)
                                      : [...selected.filter((current) => !item.exclusiveOptions?.includes(current)), option.value];
                                  setValue(JSON.stringify(next));
                                }}
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                }
                const yesNoOptions = item.options ?? [];
                const isYesNoChoice = item.kind === 'select' &&
                  yesNoOptions.length === 3 &&
                  ['yes', 'no', 'not_applicable'].every((option) => yesNoOptions.some((itemOption) => itemOption.value === option));
                if (isYesNoChoice) {
                  return (
                    <fieldset key={item.key} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4" disabled={!editable}>
                      <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}{required ? ' *' : ''}</legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {yesNoOptions.map((option) => (
                          <label key={option.value} className="cursor-pointer">
                            <input
                              className="peer sr-only"
                              type="radio"
                              name={`${section.id}-${item.key}`}
                              value={option.value}
                              required={required}
                              checked={value === option.value}
                              disabled={!editable}
                              onChange={() => setValue(option.value)}
                            />
                            <span className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-forest-200 hover:bg-forest-50/60 peer-checked:border-forest-400 peer-checked:bg-forest-50 peer-checked:text-forest-900 peer-focus-visible:ring-4 peer-focus-visible:ring-forest-100">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current">
                                {value === option.value ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
                              </span>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {item.hint ? <span className="block text-xs text-slate-500">{item.hint}</span> : null}
                    </fieldset>
                  );
                }
                return (
                  <Field key={item.key} label={`${item.label}${required ? ' *' : ''}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {item.kind === 'textarea' ? (
                      <Textarea required={required} disabled={!editable} maxLength={4000} value={value} onChange={(event) => setValue(event.target.value)} />
                    ) : item.kind === 'select' ? (
                      <Select required={required} disabled={!editable} value={value} onChange={(event) => setValue(event.target.value)}>
                        <option value="">Choose…</option>
                        {item.allowCustomOption && value && !item.options?.some((option) => option.value === value) ? <option value={value}>{value} (saved response)</option> : null}
                        {(item.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    ) : (
                      <TextInput
                        required={required}
                        disabled={!editable}
                        maxLength={item.kind === 'number' || item.kind === 'decimal' ? undefined : 500}
                        min={item.kind === 'number' ? '0' : undefined}
                        step={item.kind === 'decimal' ? 'any' : item.kind === 'number' ? '1' : undefined}
                        type={item.kind === 'decimal' ? 'number' : item.kind}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                      />
                    )}
                    {item.hint ? <span className="mt-1 block text-[11px] text-slate-500">{item.hint}</span> : null}
                  </Field>
                );
              };
              const activeFields = section.fields.filter((item) =>
                !item.legacy ||
                (section.id === 'workplace-identification' && item.key === 'industry' && response.answers?.industryType === 'Other') ||
                (section.id === 'contact-details' && item.key === 'otherCountryCode' && response.answers?.countryCode === 'other'),
              );
              const legacyFields = section.fields.filter((item) => item.legacy && !activeFields.includes(item));
              return (
                <Fragment key={section.id}>
                  {showGroup ? <h3 className="pt-4 text-base font-bold text-forest-800">{groupTitle}</h3> : null}
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.38)] sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div><h3 className="font-bold text-ink">{section.title}{optionalSection ? <span className="ml-2 text-xs font-medium text-slate-500">Supplemental · optional</span> : null}</h3><p className="mt-1 text-xs text-slate-500">{section.law}</p></div>
                      {optionalSection ? <Badge tone="slate">Optional</Badge> : <Badge tone={isAuditSectionComplete(section.id, responses) ? 'completed' : 'pending'}>{isAuditSectionComplete(section.id, responses) ? 'Complete' : 'Incomplete'}</Badge>}
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {activeFields.map(renderField)}
                    </div>
                    {legacyFields.length ? (
                      <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-600">Supplemental fields (optional)</summary>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">{legacyFields.map(renderField)}</div>
                      </details>
                    ) : null}
                    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
                      <Field label="Overall assessment" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Select disabled={!editable} required={!optionalSection} value={response.assessment ?? ''} onChange={(event) => updateResponse(section.id, { assessment: (event.target.value || undefined) as AuditResponse['assessment'] })}>
                          <option value="">Select assessment…</option><option value="compliant">Compliant</option><option value="needs_attention">Needs attention</option><option value="not_applicable">Not applicable</option>
                        </Select>
                      </Field>
                      <Field label="Observations / corrective actions" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Textarea disabled={!editable} maxLength={4000} placeholder="Summarise evidence observed, gaps and action needed." value={response.notes ?? ''} onChange={(event) => updateResponse(section.id, { notes: event.target.value })} />
                      </Field>
                    </div>
                    {['returned', 'draft'].includes(submission.status) && savedFindings[section.id] ? <p className="mt-4 rounded-lg border border-safety-200 bg-safety-50 p-3 text-sm text-safety-900"><strong>Reviewer finding:</strong> {savedFindings[section.id]}</p> : null}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Paperclip className="h-4 w-4" /> Supporting evidence <span className="font-normal text-slate-400">PDF, JPEG, PNG or WebP · 10 MB max</span></div>
                        {editable ? <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><UploadCloud className="h-4 w-4" />{uploading === section.id ? 'Uploading…' : 'Attach file'}<input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={uploading === section.id} onChange={(event) => { void uploadEvidence(section.id, event.target.files?.[0]); event.currentTarget.value = ''; }} /></label> : null}
                      </div>
                      {evidenceFields.length ? (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {evidenceFields.map((item) => {
                            const files = sectionEvidence.filter((file) => file.fieldKey === item.key);
                            const required = missingEvidence.some((missing) => missing.sectionId === section.id && missing.key === item.key);
                            const requiredByAnswer = Boolean(item.requiredIf && item.requiredIf.values.includes(response.answers?.[item.requiredIf.answerKey] ?? ''));
                            return (
                              <div key={item.key} className="block space-y-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}{item.required || requiredByAnswer ? ' *' : ''}</span>
                                {editable ? <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><UploadCloud className="h-4 w-4" />{uploading === section.id ? 'Uploading…' : 'Attach document'}<input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={uploading === section.id} onChange={(event) => { void uploadEvidence(section.id, event.target.files?.[0], 'supporting', item.key); event.currentTarget.value = ''; }} /></label> : null}
                                {required ? <span className="block text-[11px] text-clay-700">This document is required before client sign-off.</span> : null}
                                {files.length ? <div className="mt-2 space-y-2">{files.map((file) => <a key={file.id} href={`/api/audit-submission/evidence/${file.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs hover:bg-forest-50"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-forest-600" /><span className="truncate font-medium">{file.originalName}</span></span><span className="shrink-0 text-slate-400">{formatBytes(file.byteSize)}</span></a>)}</div> : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                      {sectionEvidence.some((item) => !item.fieldKey) ? <div className="mt-3 space-y-2">{sectionEvidence.filter((item) => !item.fieldKey).map((item) => <a key={item.id} href={`/api/audit-submission/evidence/${item.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs hover:bg-forest-50"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-forest-600" /><span className="truncate font-medium">{item.originalName}</span></span><span className="shrink-0 text-slate-400">{formatBytes(item.byteSize)}</span></a>)}</div> : null}
                    </div>
                  </section>
                </Fragment>
              );
            })}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Button
                  variant="ghost"
                  disabled={activeSectionIndex <= 0}
                  onClick={() => {
                    const previous = sections[activeSectionIndex - 1];
                    if (!previous) return;
                    setActiveSectionId(previous.id);
                    document.getElementById('audit-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <ArrowLeft className="h-4 w-4" /> Previous section
                </Button>
                <p className="hidden text-xs text-slate-500 sm:block">{saving ? 'Saving your progress…' : saveMessage}</p>
                <Button
                  disabled={activeSectionIndex < 0 || activeSectionIndex >= sections.length - 1}
                  onClick={() => {
                    const next = sections[activeSectionIndex + 1];
                    if (!next) return;
                    setActiveSectionId(next.id);
                    document.getElementById('audit-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Next section <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
          </div>
          </div>

          {canSign && editable && activeSection?.id === finalConditionSection?.id ? (
            <section className="rounded-2xl border border-forest-200 bg-forest-50 p-5">
              <h2 className="font-bold text-forest-950">Client review and declaration</h2>
              <p className="mt-1 text-sm text-forest-900">The authorised client representative must review the completed audit, upload a scanned signature and submit it. Productivity staff can prepare the draft but cannot sign for the client.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Client representative’s full name">
                  <TextInput required maxLength={120} value={signerName} onChange={(event) => setSignerName(event.target.value)} />
                </Field>
                <Field label="Scanned signature">
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-forest-200 bg-white px-3 text-sm font-semibold text-forest-800">
                    <UploadCloud className="h-4 w-4" />{uploading === 'client-signoff' ? 'Uploading…' : signature ? 'Replace scanned signature' : 'Upload scanned signature'}
                    <input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" disabled={uploading === 'client-signoff'} onChange={(event) => { void uploadEvidence('client-signoff', event.target.files?.[0], 'signature'); event.currentTarget.value = ''; }} />
                  </label>
                  {signature ? <a className="mt-2 block truncate text-xs text-forest-800 underline" href={`/api/audit-submission/evidence/${signature.id}`}>{signature.originalName}</a> : <span className="mt-1 block text-[11px] text-slate-500">PDF, JPEG, PNG or WebP · 10 MB max</span>}
                </Field>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm text-forest-950">
                <input className="mt-1 h-4 w-4 accent-forest-700" type="checkbox" checked={declaration} onChange={(event) => setDeclaration(event.target.checked)} />
                <span>I have reviewed this information and confirm it is true and complete to the best of my knowledge.</span>
              </label>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-forest-800">{progress.completed}/{progress.total} required sections complete{missingEvidence.length ? ` · ${missingEvidence.length} required evidence item(s) missing` : ''}</p>
                <Button disabled={submitting || progress.completed !== progress.total || missingEvidence.length > 0 || !signature || !declaration || !signerName.trim()} onClick={() => void signAndSubmit()}><Send className="h-4 w-4" />{submitting ? 'Submitting…' : 'Sign and submit for review'}</Button>
              </div>
            </section>
          ) : null}
          {!canSign && editable && activeSection?.id === finalConditionSection?.id ? <p className="rounded-xl border border-safety-200 bg-safety-50 p-4 text-sm text-safety-900">Draft preparation is available to assigned Productivity staff. An authorised client account must upload the scanned signature and sign the declaration before review.</p> : null}
        </>
      ) : null}
    </div>
  );
}
