'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCheck, Download, FileText, MessageSquareWarning, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';
import { AUDIT_SECTIONS, type AuditResponse, type AuditResponses, type AuditSectionId } from '@/lib/audit-template';

type Section = (typeof AUDIT_SECTIONS)[number];
type Evidence = { id: string; sectionId: string; kind: string; originalName: string; byteSize: number; uploadedAt: string };
type Submission = {
  id: string;
  reference: string;
  status: string;
  version: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  updatedAt: string;
  responses: AuditResponses;
  findings: Record<string, string>;
  progress: { completed: number; total: number; percent: number };
  sections: Section[];
  evidence: Evidence[];
  user: { username: string; fullName: string; organisation: string; email: string };
  branch: { name: string; county: string; subCounty: string; town: string } | null;
  clientSignerName: string | null;
  clientSignerRole: string | null;
  clientAttestedAt: string | null;
  clientDeclaration: boolean;
  clientSignatureEvidenceId: string | null;
  versions: { version: number; action: string; createdAt: string; actor: { username: string } }[];
};

export default function AdminAuditReviewPage() {
  const params = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [findings, setFindings] = useState<Record<string, string>>({});
  const [returnNote, setReturnNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const current = await strictApi<Submission>(`/api/admin/audits/${params.id}`);
      setSubmission(current);
      setFindings(current.findings || {});
      setReturnNote(current.findings?.__returnNote || '');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load this submission');
    } finally {
      setLoading(false);
    }
  }, [params.id]);
  useEffect(() => { void load(); }, [load]);

  const canReview = !!submission && ['submitted', 'in_review'].includes(submission.status);
  const incompleteFindings = useMemo(() => submission?.sections.filter((section) => !findings[section.id]?.trim()).length ?? 0, [findings, submission]);
  const setFinding = (id: AuditSectionId, value: string) => setFindings((current) => ({ ...current, [id]: value }));

  const performAction = async (action: 'start-review' | 'save-findings' | 'approve' | 'return') => {
    if (!submission) return;
    if (action === 'return' && returnNote.trim().length < 8) {
      toast.error('Add a return note with at least 8 characters');
      return;
    }
    if (action === 'approve' && incompleteFindings) {
      toast.error(`Record a finding or “No finding” for all sections (${incompleteFindings} remaining)`);
      return;
    }
    setBusy(true);
    try {
      const result = await strictApi<{ status: string; version: number; findings: Record<string, string> }>(`/api/admin/audits/${submission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, findings, returnNote }),
      });
      setSubmission((current) => current ? { ...current, status: result.status, version: result.version } : current);
      setFindings(result.findings || findings);
      toast.success(action === 'start-review' ? 'Review started' : action === 'save-findings' ? 'Findings saved' : action === 'approve' ? 'Audit approved' : 'Audit returned for revision');
      if (action === 'approve' || action === 'return') await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to update this review');
    } finally {
      setBusy(false);
    }
  };

  const downloadResponses = () => {
    if (!submission) return;
    const report = {
      reference: submission.reference,
      workplace: submission.user.organisation,
      branch: submission.branch,
      submittedBy: submission.user.fullName,
      status: submission.status,
      clientSignOff: {
        signerName: submission.clientSignerName,
        signerRole: submission.clientSignerRole,
        attestedAt: submission.clientAttestedAt,
        declarationConfirmed: submission.clientDeclaration,
        scannedSignatureEvidenceId: submission.clientSignatureEvidenceId,
      },
      responses: submission.sections.map((section) => ({
        category: section.category,
        section: section.title,
        legalReference: section.law,
        response: submission.responses[section.id] ?? {},
        finding: findings[section.id] ?? '',
      })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${submission.reference}-responses.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) return <div className="space-y-5"><Skeleton className="h-10 w-72" /><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;
  if (error || !submission) return <div className="space-y-5"><p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error || 'Submission not found'}</p><Link href="/app/admin/audits"><Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Back to submissions</Button></Link></div>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration · Submission review" title={submission.reference} description={`${submission.user.organisation}${submission.branch ? ` · ${submission.branch.name}` : ''} · prepared by ${submission.user.fullName} (@${submission.user.username})`} actions={<><Link href="/app/admin/audits"><Button variant="ghost"><ArrowLeft className="h-4 w-4" /> All submissions</Button></Link><Button variant="secondary" onClick={downloadResponses}><Download className="h-4 w-4" /> Download responses</Button></>} />
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch location</p><p className="mt-1 font-semibold">{submission.branch?.name ?? 'Branch not recorded'}</p><p className="text-sm text-slate-500">{submission.branch ? [submission.branch.county, submission.branch.subCounty, submission.branch.town].filter(Boolean).join(' · ') : '—'}</p></div>
        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client declaration and signature</p>{submission.clientSignerName ? <><p className="mt-1 font-semibold">{submission.clientSignerName} <span className="font-normal text-slate-500">({submission.clientSignerRole?.replaceAll('_', ' ')})</span></p><p className="text-sm text-slate-500">{submission.clientAttestedAt ? new Date(submission.clientAttestedAt).toLocaleString() : 'Signed time not recorded'} · {submission.clientDeclaration ? 'Declaration confirmed' : 'Declaration not confirmed'}</p>{submission.clientSignatureEvidenceId ? <a className="mt-2 inline-flex text-sm font-semibold text-forest-700 hover:text-forest-900" href={`/api/audit-submission/evidence/${submission.clientSignatureEvidenceId}`}>Download scanned signature</a> : <p className="mt-2 text-sm text-clay-700">Scanned signature is missing.</p>}</> : <p className="mt-1 text-sm text-slate-500">Not signed by a client account.</p>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-forest-50 p-3 text-forest-700"><ShieldCheck className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><h2 className="font-bold capitalize">{submission.status.replaceAll('_', ' ')}</h2><Badge tone={submission.status}>{submission.status.replaceAll('_', ' ')}</Badge></div><p className="mt-1 text-xs text-slate-500">{submission.progress.completed} / {submission.progress.total} sections assessed · {submission.evidence.length} evidence files · version {submission.version}</p></div></div>
          <div className="flex flex-wrap gap-2">
            {submission.status === 'submitted' ? <Button disabled={busy} onClick={() => void performAction('start-review')}><ShieldCheck className="h-4 w-4" /> Start review</Button> : null}
            {submission.status === 'in_review' ? <><Button disabled={busy} variant="secondary" onClick={() => void performAction('save-findings')}><Save className="h-4 w-4" /> Save findings</Button><Button disabled={busy || incompleteFindings > 0} onClick={() => void performAction('approve')}><CheckCheck className="h-4 w-4" /> Approve</Button></> : null}
          </div>
        </div>
        {submission.status === 'draft' ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">This workplace has not submitted the audit. Review actions become available after submission.</p> : null}
        {submission.status === 'returned' && findings.__returnNote ? <p className="mt-4 rounded-lg bg-safety-50 p-3 text-sm text-safety-900"><strong>Previous return note:</strong> {findings.__returnNote}</p> : null}
      </section>

      {canReview ? (
        <div className="rounded-2xl border border-safety-200 bg-safety-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3"><MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-safety-700" /><div className="w-full"><Field label="Return for revision (required to return)"><Textarea maxLength={2000} placeholder="Explain what the workplace must clarify or correct before resubmission." value={returnNote} onChange={(event) => setReturnNote(event.target.value)} /></Field><div className="mt-3 flex justify-end"><Button variant="warning" disabled={busy} onClick={() => void performAction('return')}>Return to workplace</Button></div></div></div>
        </div>
      ) : null}

      {submission.sections.map((section) => {
        const answer: AuditResponse = submission.responses[section.id] ?? {};
        const sectionFiles = submission.evidence.filter((file) => file.sectionId === section.id);
        return (
          <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-forest-700">{section.category}</p><h3 className="mt-1 font-bold text-ink">{section.title}</h3><p className="mt-1 text-xs text-slate-500">{section.law}</p></div><Badge tone={answer.assessment === 'compliant' ? 'completed' : answer.assessment === 'needs_attention' ? 'clay' : 'slate'}>{answer.assessment?.replaceAll('_', ' ') || 'not assessed'}</Badge></div>
            {answer.answers && Object.keys(answer.answers).length ? <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">{Object.entries(answer.answers).map(([key, value]) => <div key={key}><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{key.replaceAll(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 text-sm text-slate-700">{value || '—'}</dd></div>)}</dl> : null}
            <div className="mt-4 rounded-xl border border-slate-100 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Workplace observations</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{answer.notes || 'No observations provided.'}</p></div>
            {sectionFiles.length ? <div className="mt-4 space-y-2">{sectionFiles.map((file) => <a key={file.id} href={`/api/audit-submission/evidence/${file.id}`} className="flex items-center gap-2 rounded-lg bg-forest-50 px-3 py-2 text-xs font-medium text-forest-800 hover:bg-forest-100"><FileText className="h-4 w-4" />{file.originalName}<Download className="ml-auto h-4 w-4" /></a>)}</div> : null}
            <div className="mt-4"><Field label="Administrator finding"><Textarea disabled={!canReview} maxLength={4000} placeholder="Record the finding or enter “No finding”." value={findings[section.id] ?? ''} onChange={(event) => setFinding(section.id, event.target.value)} /></Field></div>
          </section>
        );
      })}
      {submission.status === 'in_review' ? <div className="flex justify-end"><Button size="lg" disabled={busy || incompleteFindings > 0} onClick={() => void performAction('approve')}><CheckCheck className="h-4 w-4" />{incompleteFindings ? `${incompleteFindings} findings remaining` : 'Approve audit'}</Button></div> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-ink">Audit history</h2><div className="mt-4 space-y-3">{submission.versions.map((version) => <div key={`${version.version}-${version.action}`} className="flex flex-col gap-1 border-l-2 border-forest-200 pl-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium">{version.action.replaceAll('-', ' ')} <span className="font-normal text-slate-500">by {version.actor.username} · v{version.version}</span></p><time className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleString()}</time></div>)}</div></section>
    </div>
  );
}
