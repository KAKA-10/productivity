'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  Flame,
  HardHat,
  HeartPulse,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

type FormLink = {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  featured?: boolean;
};

const GROUPS: { title: string; description: string; forms: FormLink[] }[] = [
  {
    title: 'Assessments & planning',
    description: 'Review workplace conditions, identify hazards and prepare safe work.',
    forms: [
      { href: '/app/osh-audit', title: 'Annual OSH audit', description: 'Complete the workplace audit by section, attach evidence and submit for review.', action: 'Open questionnaire', icon: ClipboardCheck, featured: true },
      { href: '/app/risk-assessments', title: 'Risk assessment', description: 'Document an activity, its hazards, people at risk and existing controls.', action: 'Create assessment', icon: HardHat },
      { href: '/app/jsa', title: 'Job safety analysis', description: 'Record task, worksite, supervisor and permit requirements.', action: 'Create JSA', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Report & follow up',
    description: 'Capture events and ensure corrective actions are tracked to completion.',
    forms: [
      { href: '/app/incidents', title: 'Incident & near-miss report', description: 'Log an event and capture immediate response and investigation details.', action: 'Report an event', icon: ShieldAlert },
      { href: '/app/inspections', title: 'Workplace inspection', description: 'Schedule an inspection and record areas, findings and actions.', action: 'Open inspections', icon: ClipboardList },
      { href: '/app/capa', title: 'Corrective action (CAPA)', description: 'Assign an owner, priority and due date to a corrective action.', action: 'Track actions', icon: Wrench },
    ],
  },
  {
    title: 'Compliance & communication',
    description: 'Keep obligations visible and maintain a record of workplace safety communication.',
    forms: [
      { href: '/app/compliance-calendar', title: 'Compliance obligation', description: 'Schedule statutory, equipment and environmental due dates.', action: 'Open calendar', icon: FileCheck2 },
      { href: '/app/toolbox-talks', title: 'Toolbox talk', description: 'Prepare a safety briefing and record attendance.', action: 'Create briefing', icon: MessageSquareText },
      { href: '/app/reports', title: 'DOSHS report', description: 'Prepare a statutory report pack for your workplace.', action: 'Open reports', icon: FileCheck2 },
    ],
  },
  {
    title: 'People & equipment',
    description: 'Manage safety training, protective equipment, emergency roles and plant.',
    forms: [
      { href: '/app/training', title: 'Training record', description: 'Record course completion, trainer and renewal date.', action: 'Add training', icon: Users },
      { href: '/app/ppe', title: 'PPE issue', description: 'Record protective equipment issued and replacement dates.', action: 'Issue PPE', icon: HardHat },
      { href: '/app/personnel', title: 'First aider & fire marshal', description: 'Maintain emergency role holders, worksite and certificate expiry.', action: 'Manage personnel', icon: HeartPulse },
      { href: '/app/fire-equipment', title: 'Fire equipment', description: 'Track equipment location and inspection dates.', action: 'Open register', icon: Flame },
      { href: '/app/committee', title: 'OSH committee meeting', description: 'Schedule a meeting and maintain committee records.', action: 'Open committee', icon: ShieldCheck },
    ],
  },
];

export default function FormsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workplace workspace"
        title="Questionnaires & forms"
        description="A single place to start an assessment, report or workplace safety record."
      />

      <section className="relative overflow-hidden rounded-2xl bg-forest-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-forest-700/40 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-forest-300"><ClipboardCheck className="h-4 w-4" /> Featured questionnaire</p>
          <h2 className="mt-3 text-2xl font-bold">Annual workplace OSH audit</h2>
          <p className="mt-2 text-sm leading-6 text-forest-100/85">Work through the audit sections, record an assessment and observations for each area, attach supporting evidence and send the completed submission to your lead auditor.</p>
          <p className="mt-3 text-xs text-forest-200">Your draft saves to your workplace account and can be continued later.</p>
          <Link href="/app/osh-audit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-forest-900 transition hover:bg-forest-50">Open OSH audit <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="mb-4"><h2 className="text-lg font-bold text-ink">{group.title}</h2><p className="mt-1 text-sm text-slate-500">{group.description}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.forms.map((form) => {
              const Icon = form.icon;
              return (
                <Link
                  key={form.href}
                  href={form.href}
                  className={`group flex min-h-40 flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${form.featured ? 'border-forest-200 bg-forest-50/60 hover:border-forest-300' : 'border-slate-200 bg-white hover:border-forest-200'}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="rounded-xl bg-white p-2.5 text-forest-700 shadow-sm"><Icon className="h-5 w-5" /></span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-forest-700" />
                  </span>
                  <span className="mt-4 text-sm font-bold text-ink">{form.title}</span>
                  <span className="mt-1 flex-1 text-xs leading-5 text-slate-500">{form.description}</span>
                  <span className="mt-4 text-xs font-bold text-forest-700">{form.action} <span aria-hidden="true">→</span></span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
