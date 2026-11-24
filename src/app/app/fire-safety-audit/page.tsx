'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Clock3, Download, Flame, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea, TextInput } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FIRE_EMPLOYER_FIELDS,
  FIRE_FURTHER_FIELDS,
  FIRE_PRIORITY_FIELDS,
  FIRE_SAFETY_SECTIONS,
  FIRE_WORKER_FIELDS,
  getFireSafetyAuditProgress,
  type FireAnswer,
  type FireSafetyAuditData,
} from '@/lib/fire-safety-audit';
import { strictApi } from '@/lib/strict-api';
import { downloadPdf } from '@/lib/pdf';

type FireAuditRecord = {
  id: string;
  cycleYear: string;
  version: number;
  updatedAt: string;
  data: FireSafetyAuditData;
  progress: { completed: number; total: number; percent: number };
  branch: { id: string; name: string; organisation: string };
};

const STEPS = [
  { id: 'employer-details', title: 'Employer / occupier details', description: 'Workplace identity, location and contact details.', type: 'employer' },
  { id: 'workers-data', title: 'Workers data', description: 'Workforce counts, audit dates and registration details.', type: 'workers' },
  ...FIRE_SAFETY_SECTIONS.map((section) => ({ ...section, type: 'checklist' })),
  { id: 'further-information', title: 'Further information', description: 'Recommendations, follow-up owner, completion date and priority.', type: 'further' },
] as const;

const CHOICE_LABELS: Record<string, string> = {
  yes: 'Yes',
  no: 'No',
  not_applicable: 'N/A',
  further_information: 'F/I',
};

function isNarrationSuggested(answer: FireAnswer) {
  return answer.choice === 'no' || answer.choice === 'further_information';
}

export default function FireSafetyAuditPage() {
  const [record, setRecord] = useState<FireAuditRecord | null>(null);
  const [data, setData] = useState<FireSafetyAuditData | null>(null);
  const [activeStepId, setActiveStepId] = useState<string>(STEPS[0].id);
  const [expandedNarration, setExpandedNarration] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('All changes saved');
  const [error, setError] = useState('');
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveRevision = useRef(0);

  const load = useCallback(async () => {
    try {
      const current = await strictApi<FireAuditRecord>('/api/fire-safety-audit');
      setRecord(current);
      setData(current.data);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load the fire safety audit.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const progress = useMemo(
    () => getFireSafetyAuditProgress(data?.checklistAnswers ?? {}),
    [data],
  );
  const activeStep = STEPS.find((step) => step.id === activeStepId) ?? STEPS[0];
  const activeStepIndex = STEPS.findIndex((step) => step.id === activeStep.id);

  const save = useCallback(async (snapshot: FireSafetyAuditData) => {
    const revision = ++saveRevision.current;
    setSaving(true);
    setSaveMessage('Saving changes…');
    const operation = saveQueue.current.then(async () => {
      const result = await strictApi<{ version: number; updatedAt: string }>('/api/fire-safety-audit', {
        method: 'PATCH',
        body: JSON.stringify(snapshot),
      });
      if (revision === saveRevision.current) {
        setRecord((current) => current ? { ...current, version: result.version, updatedAt: result.updatedAt } : current);
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
    if (!record || !data || loading) return;
    const timeout = window.setTimeout(() => {
      void save(data).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [record?.id, data, loading, save]);

  const updateGroup = (group: keyof FireSafetyAuditData, key: string, value: string) => {
    setData((current) => current ? {
      ...current,
      [group]: { ...current[group], [key]: value },
    } : current);
  };

  const updateChecklist = (key: string, patch: Partial<FireAnswer>) => {
    setData((current) => current ? {
      ...current,
      checklistAnswers: {
        ...current.checklistAnswers,
        [key]: { ...current.checklistAnswers[key], ...patch },
      },
    } : current);
  };

  const showStep = (stepId: string) => {
    setActiveStepId(stepId);
  };

  const downloadAudit = async () => {
    if (!record || !data) return;
    try {
      await save(data);
      const lines = [
        `Organisation: ${record.branch.organisation}`,
        `Branch: ${record.branch.name}`,
        `Audit cycle: ${record.cycleYear}`,
        `Progress: ${progress.completed}/${progress.total} (${progress.percent}%)`,
        `Last updated: ${new Date(record.updatedAt).toLocaleString()}`,
        '',
        'EMPLOYER / OCCUPIER DETAILS',
        ...FIRE_EMPLOYER_FIELDS.map((field) => `${field.label}: ${data.employerDetails[field.key] || 'Not provided'}`),
        '',
        'WORKERS DATA',
        ...FIRE_WORKER_FIELDS.map((field) => `${field.label}: ${data.workersData[field.key] || 'Not provided'}`),
        '',
      ];
      for (const section of FIRE_SAFETY_SECTIONS) {
        lines.push(section.title.toUpperCase(), section.description);
        for (const question of section.questions ?? []) {
          const answer = data.checklistAnswers[question.key];
          lines.push(`${question.label}: ${answer?.choice ? CHOICE_LABELS[answer.choice] ?? answer.choice : 'Not answered'}`);
          if (answer?.narration) lines.push(`Notes: ${answer.narration}`);
        }
        lines.push('');
      }
      lines.push(
        'FURTHER INFORMATION',
        ...[...FIRE_FURTHER_FIELDS, ...FIRE_PRIORITY_FIELDS].map((field) => `${field.label}: ${data.furtherInformation[field.key] || 'Not provided'}`),
      );
      downloadPdf(
        `fire-safety-audit-${record.cycleYear}`,
        `Fire Safety Audit - ${record.branch.name}`,
        lines,
        `Confidential fire safety audit for ${record.branch.organisation}`,
      );
      toast.success('Fire safety audit PDF downloaded');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to download the fire safety audit.');
    }
  };

  const renderSimpleFields = (
    fields: readonly { key: string; label: string; type: string }[],
    group: 'employerDetails' | 'workersData' | 'furtherInformation',
  ) => {
    if (!data) return null;
    const values = data[group];
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {field.type === 'textarea' ? (
              <Textarea
                maxLength={4000}
                value={values[field.key] ?? ''}
                onChange={(event) => updateGroup(group, field.key, event.target.value)}
                className="min-h-24"
              />
            ) : (
              <TextInput
                type={field.type}
                min={field.type === 'number' ? '0' : undefined}
                step={field.type === 'number' ? '1' : undefined}
                maxLength={field.type === 'number' || field.type === 'date' ? undefined : 500}
                value={values[field.key] ?? ''}
                onChange={(event) => updateGroup(group, field.key, event.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
    );
  };

  const currentStepCount = () => {
    if (!data) return '';
    if (activeStep.type === 'checklist' && 'questions' in activeStep) {
      const questions = activeStep.questions ?? [];
      const complete = questions.filter((question) => {
        const answer = data.checklistAnswers[question.key]?.choice;
        return question.choices.some((choice) => choice.value === answer);
      }).length;
      return `${complete}/${questions.length} answered`;
    }
    if (activeStep.type === 'employer') {
      const complete = FIRE_EMPLOYER_FIELDS.filter((field) => data.employerDetails[field.key]?.trim()).length;
      return `${complete}/${FIRE_EMPLOYER_FIELDS.length} filled`;
    }
    if (activeStep.type === 'workers') {
      const complete = FIRE_WORKER_FIELDS.filter((field) => data.workersData[field.key]?.trim()).length;
      return `${complete}/${FIRE_WORKER_FIELDS.length} filled`;
    }
    const furtherCount = [...FIRE_FURTHER_FIELDS, ...FIRE_PRIORITY_FIELDS]
      .filter((field) => data.furtherInformation[field.key]?.trim()).length;
    return `${furtherCount}/${FIRE_FURTHER_FIELDS.length + FIRE_PRIORITY_FIELDS.length} filled`;
  };

  if (loading) {
    return <div className="space-y-5"><Skeleton className="h-10 w-72" /><Skeleton className="h-28 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance · Fire safety"
        title="Fire Safety Audit"
        description="A dedicated fire audit, separate from the annual OSH questionnaire. Your responses save automatically as you work."
        actions={record && data ? (
          <>
            <Button
              variant="secondary"
              onClick={() => void save(data).then(() => toast.success('Fire safety audit saved')).catch((reason: unknown) => toast.error(reason instanceof Error ? reason.message : 'Unable to save the audit.'))}
            >
              <Save className="h-4 w-4" /> Save now
            </Button>
            <Button variant="secondary" disabled={saving} onClick={() => void downloadAudit()}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </>
        ) : null}
      />

      {error ? (
        <div role="alert" className="rounded-2xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">
          {error}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => void load()}>Try again</Button>
        </div>
      ) : null}

      {record && data ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-orange-50 p-3 text-orange-700"><Flame className="h-5 w-5" /></span>
                <div>
                  <p className="font-mono text-xs text-slate-400">Fire safety audit · {record.cycleYear}</p>
                  <h2 className="mt-1 font-bold text-ink">{record.branch.organisation} · {record.branch.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    {saving ? <Clock3 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 text-forest-700" />}
                    {saveMessage}
                  </p>
                </div>
              </div>
              <div className="w-full md:max-w-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Required checklist answers</span>
                  <span className="font-bold tabular-nums text-forest-700">{progress.completed}/{progress.total}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-forest-600 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                </div>
                <p className="mt-1.5 text-right text-[11px] text-slate-500">{progress.percent}% answered</p>
              </div>
            </div>
          </section>

          <div className="grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="min-w-0">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Audit guide</p>
                    <p className="mt-1 text-xs text-slate-500">Move between sections at any time.</p>
                  </div>
                  <Badge tone={progress.completed === progress.total ? 'completed' : 'slate'}>
                    {progress.completed}/{progress.total}
                  </Badge>
                </div>
                <label className="block px-2 pb-3 lg:hidden">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Jump to section</span>
                  <Select value={activeStep.id} onChange={(event) => showStep(event.target.value)} aria-label="Fire audit section">
                    {STEPS.map((step) => <option key={step.id} value={step.id}>{step.title}</option>)}
                  </Select>
                </label>
                <nav aria-label="Fire safety audit sections" className="hidden max-h-[calc(100vh-13rem)] flex-col gap-1 overflow-y-auto lg:flex">
                  {STEPS.map((step, index) => {
                    const active = step.id === activeStep.id;
                    const questions = step.type === 'checklist' && 'questions' in step ? step.questions ?? [] : [];
                    const questionCount = questions.length;
                    const answered = questionCount
                      ? questions.filter((question) => data.checklistAnswers[question.key]?.choice).length
                      : 0;
                    const complete = questionCount > 0 && answered === questionCount;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        aria-current={active ? 'step' : undefined}
                        onClick={() => showStep(step.id)}
                        className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 ${active ? 'border-orange-200 bg-orange-50/70' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-forest-100 text-forest-700' : active ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                          {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold leading-5 text-ink">{step.title}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-500">
                            {questionCount ? `${answered}/${questionCount} answered` : step.id === 'further-information' ? 'Optional follow-up' : 'Details · optional'}
                          </span>
                        </span>
                        <span className="pt-1 text-[10px] font-semibold tabular-nums text-slate-400">{index + 1}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div id="fire-audit-section" className="min-w-0 scroll-mt-6 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Section {activeStepIndex + 1} of {STEPS.length}</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">{activeStep.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{activeStep.description}</p>
                </div>
                <Badge tone={activeStep.type === 'checklist' ? 'safety' : 'slate'}>{currentStepCount()}</Badge>
              </div>

              {activeStep.id === 'employer-details' ? (
                <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-ink">Workplace information</h3>
                    <p className="mt-1 text-xs text-slate-500">Common details are prefilled from your active branch and OSH audit where available. You can edit them for this fire audit.</p>
                  </div>
                  {renderSimpleFields(FIRE_EMPLOYER_FIELDS, 'employerDetails')}
                </section>
              ) : null}

              {activeStep.id === 'workers-data' ? (
                <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-ink">Workforce and audit details</h3>
                    <p className="mt-1 text-xs text-slate-500">Enter available workforce counts, audit history and workplace registration details.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {FIRE_WORKER_FIELDS.filter((field) =>
                      field.key !== 'under18Ages' || Number(data.workersData.under18Count) > 0,
                    ).map((field) => (
                      <Field key={field.key} label={field.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <TextInput
                          type={field.type}
                          min={field.type === 'number' ? '0' : undefined}
                          step={field.type === 'number' ? '1' : undefined}
                          maxLength={field.type === 'number' || field.type === 'date' ? undefined : 500}
                          value={data.workersData[field.key] ?? ''}
                          onChange={(event) => updateGroup('workersData', field.key, event.target.value)}
                        />
                      </Field>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeStep.type === 'checklist' && 'questions' in activeStep ? (
                <section className="space-y-3">
                  {(activeStep.questions ?? []).map((question, questionIndex) => {
                    const answer = data.checklistAnswers[question.key] ?? { choice: '', narration: '' };
                    const narrationVisible = isNarrationSuggested(answer) || Boolean(answer.narration) || expandedNarration[question.key];
                    return (
                      <article key={question.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-800">{questionIndex + 1}</span>
                            <h3 className="pt-0.5 text-sm font-semibold leading-6 text-ink">{question.label}</h3>
                          </div>
                          <fieldset className="space-y-2 pl-0 sm:pl-10">
                            <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Response <span aria-hidden="true">*</span></legend>
                            <div className={`grid gap-2 ${question.choices.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                              {question.choices.map((choice) => {
                                const checked = answer.choice === choice.value;
                                return (
                                  <label key={choice.value} className="cursor-pointer">
                                    <input
                                      className="peer sr-only"
                                      type="radio"
                                      name={`fire-${question.key}`}
                                      value={choice.value}
                                      required
                                      checked={checked}
                                      onChange={() => updateChecklist(question.key, { choice: choice.value })}
                                    />
                                    <span className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition peer-focus-visible:ring-4 peer-focus-visible:ring-orange-100 ${checked ? choice.value === 'no' ? 'border-clay-300 bg-clay-50 text-clay-700' : 'border-forest-300 bg-forest-50 text-forest-800' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                                      {checked ? <Check className="h-4 w-4" /> : null}
                                      {CHOICE_LABELS[choice.value]}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                          <div className="pl-0 sm:pl-10">
                            {narrationVisible ? (
                              <Field label={`Narration · ${isNarrationSuggested(answer) ? 'recommended' : 'optional'}`}>
                                <Textarea
                                  maxLength={4000}
                                  placeholder="Add observations, context or the location of the issue."
                                  value={answer.narration}
                                  onChange={(event) => updateChecklist(question.key, { narration: event.target.value })}
                                  className="min-h-20"
                                />
                              </Field>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setExpandedNarration((current) => ({ ...current, [question.key]: true }))}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-forest-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest-100"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add optional narration
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              ) : null}

              {activeStep.id === 'further-information' ? (
                <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-ink">Further information and actions</h3>
                    <p className="mt-1 text-xs text-slate-500">Optional follow-up information for recommendations and priority actions.</p>
                  </div>
                  {renderSimpleFields(FIRE_FURTHER_FIELDS, 'furtherInformation')}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {FIRE_PRIORITY_FIELDS.map((field) => (
                      <Field key={field.key} label={field.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Select
                          value={data.furtherInformation[field.key] ?? ''}
                          onChange={(event) => updateGroup('furtherInformation', field.key, event.target.value)}
                        >
                          <option value="">Choose priority…</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </Select>
                      </Field>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Button
                  variant="ghost"
                  disabled={activeStepIndex <= 0}
                  onClick={() => {
                    const previous = STEPS[activeStepIndex - 1];
                    if (!previous) return;
                    showStep(previous.id);
                    document.getElementById('fire-audit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <ArrowLeft className="h-4 w-4" /> Previous section
                </Button>
                <p className="hidden text-xs text-slate-500 sm:block">{saving ? 'Saving your progress…' : `${progress.completed} of ${progress.total} checklist responses complete`}</p>
                <Button
                  disabled={activeStepIndex >= STEPS.length - 1}
                  onClick={() => {
                    const next = STEPS[activeStepIndex + 1];
                    if (!next) return;
                    showStep(next.id);
                    document.getElementById('fire-audit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Next section <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
