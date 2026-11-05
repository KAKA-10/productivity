import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Factory,
  FileCheck2,
  Flame,
  HardHat,
  Leaf,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

const PILLARS = [
  {
    icon: Factory,
    number: '01',
    title: 'Productivity',
    text: 'Find the friction in your operation and build practical systems for lasting improvement.',
    className: 'bg-forest-50 text-forest-700',
  },
  {
    icon: HardHat,
    number: '02',
    title: 'Occupational safety & health',
    text: 'Make occupational safety and health part of everyday work, not just a file on a shelf.',
    className: 'bg-safety-50 text-safety-700',
  },
  {
    icon: Leaf,
    number: '03',
    title: 'Environment',
    text: 'Navigate environmental requirements and build more responsible, resilient operations.',
    className: 'bg-clay-50 text-clay-700',
  },
];

const SERVICES = [
  {
    icon: ShieldCheck,
    title: 'Products & services',
    items: ['Environmental consultancy', 'Productivity consultancy', 'OSH compliance', 'OSH mentored certificate (PCLGEMBAKAIZENS)'],
  },
  {
    icon: Factory,
    title: 'Facility setup',
    items: ['Local authority certificates & licences', 'DOSHS / Ministry of Labour certificates', 'Facility layout', 'NEMA approval'],
  },
  {
    icon: ClipboardCheck,
    title: 'Strategic management',
    items: ['Performance management system', 'Company diagnosis', 'Records management', 'Strategic planning', 'Insurance risk management'],
  },
  {
    icon: Sparkles,
    title: 'Improvement tools',
    items: ['Process improvement', 'Gemba kaizen', 'Management diagnostic surveys', 'Implementation support'],
  },
];

const MODULES = [
  { icon: ClipboardCheck, label: 'Risk assessments' },
  { icon: FileCheck2, label: 'Incident reporting' },
  { icon: HardHat, label: 'Toolbox talks' },
  { icon: BadgeCheck, label: 'Inspections & audits' },
  { icon: Flame, label: 'Fire & PPE records' },
  { icon: ShieldCheck, label: 'DOSHS-ready reports' },
];

const PARTNERS = ['Kenya', 'Botswana', 'Mauritius', 'Nigeria', 'South Africa', 'Zambia', 'Singapore', 'Malaysia', 'Philippines', 'India'];
const EXPERTISE = ['Productivity', 'Green productivity', 'HR', 'Business management', 'Finance', 'Accounting', 'Project management', 'OSH', 'Occupational medicine', 'Engineering', 'Building & construction'];
const ABOUT_POINTS = [
  {
    title: 'Vision',
    text: 'To be the productivity centre of Kenya and Africa — a clearing house for productivity training and publication.',
  },
  {
    title: 'Mission',
    text: 'Independent world-class advisory: a change agent, problem solver and skills partner to business and government.',
  },
  {
    title: 'Approach',
    text: 'Find the causes behind the challenges, then diagnose, implement and advise with local and international consultants.',
  },
];
const CSR = ['Education', 'Community development', 'Philanthropy'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_12%,rgba(183,228,199,0.42),transparent_38%),radial-gradient(ellipse_at_92%_20%,rgba(254,243,199,0.58),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-forest-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-forest-500" />
                Productivity · OSH · Environment
              </div>
              <h1 className="font-display mt-7 text-5xl font-semibold leading-[1.04] tracking-tight text-forest-950 sm:text-6xl lg:text-[4.35rem]">
                Safer workplaces.
                <span className="mt-1 block text-forest-600">Stronger businesses.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Practical consulting and training to help Kenyan organisations work better, protect their people and meet their responsibilities.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-forest-900/15 transition hover:-translate-y-0.5 hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
                >
                  Talk to a consultant <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-forest-200 bg-white/80 px-5 py-3 text-sm font-bold text-forest-800 transition hover:border-forest-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
                >
                  Explore TODOMU <ArrowDownRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="text-slate-400">Working with</span>
                {['DOSHS', 'NITA', 'NEMA'].map((name) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-forest-500" />
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -left-7 top-12 h-32 w-32 rounded-full bg-safety-100/80 blur-2xl" />
              <div className="absolute -right-4 bottom-8 h-36 w-36 rounded-full bg-forest-200/70 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-white/75 p-3 shadow-[0_30px_90px_-40px_rgba(13,36,28,0.38)] backdrop-blur-sm sm:p-4">
                <div className="overflow-hidden rounded-[1.45rem] bg-forest-950 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-safety-500 text-forest-950">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">TODOMU</p>
                        <p className="text-[11px] text-forest-200">Workplace OSH, organised</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-forest-500/60 bg-forest-800 px-2.5 py-1 text-[10px] font-semibold text-forest-100">
                      OSHA 2007
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium text-forest-300">A clearer view of your workplace</p>
                    <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">Safety, in one place.</h2>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {MODULES.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex min-h-[4.25rem] items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-safety-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-medium leading-4 text-forest-50">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-forest-800/80 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold">Built for practical compliance</p>
                        <p className="mt-0.5 text-[11px] text-forest-200">Records ready when you need them.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-safety-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-forest-100 bg-white px-4 py-3 shadow-xl sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-forest-900">Local expertise</p>
                  <p className="text-[11px] text-slate-500">Guidance for Kenyan workplaces</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-forest-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">What we do</p>
                <h2 className="font-display mt-3 max-w-lg text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">
                  Better work starts with a better way of working.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Productivity Consulting Limited is an independent advisory and training partner. We help teams understand the challenges in front of them, improve how work gets done and build safer, more capable organisations.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {ABOUT_POINTS.map(({ title, text }) => (
                <article key={title} className="rounded-2xl bg-forest-50/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-forest-900">{text}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 max-w-5xl text-xs leading-5 text-slate-500">
              Our values: superior value informed by Kenyan government guidelines. DOSHS-approved trainer for first aid, fire safety and safety committee training; NITA industrial training provider; NEMA-registered environmental experts; and APO resource persons and practitioners.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PILLARS.map(({ icon: Icon, number, title, text, className }) => (
                <article key={title} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-forest-200 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-300">{number}</span>
                  </div>
                  <h3 className="font-display mt-5 text-lg font-semibold text-forest-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay-700">How we can help</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">
                The right support, from diagnosis to delivery.
              </h2>
            </div>
            <Link href="/contact" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-forest-700 hover:text-forest-900">
              Discuss your needs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, items }, index) => (
              <article key={title} className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-forest-50 text-forest-700' : 'bg-safety-50 text-safety-700'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-forest-900">{title}</h3>
                    <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="facility" className="px-6 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] bg-clay-700 px-7 py-9 text-white sm:px-10 sm:py-11 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay-100">Facility setup</p>
              <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Get your workplace ready to operate.</h2>
              <p className="mt-3 text-sm leading-6 text-clay-50">
                Navigate workplace registration, Ministry of Labour certificates, local authority licences, facility layout and NEMA approval with one experienced partner.
              </p>
            </div>
            <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-clay-700 transition hover:bg-clay-50">
              Start a conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section id="platform" className="bg-forest-950 px-6 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-safety-500 text-forest-950">
                <Sparkles className="h-6 w-6" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-safety-400">Meet TODOMU</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your workplace safety records, finally in one place.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-forest-100 sm:text-base">
                A practical OSH platform for Kenyan SMEs. Keep key workplace records organised, support safer day-to-day operations and prepare DOSHS-ready reports.
              </p>
              <Link href="/login" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-safety-500 px-5 py-3 text-sm font-bold text-forest-950 transition hover:bg-safety-400">
                Open TODOMU <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODULES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-800 text-safety-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-forest-50">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="network" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Our network</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-forest-950">Local knowledge. A wider perspective.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Drawing on local and international consultants, we bring together the experience needed to support organisations across industries.
              </p>
            </div>
            <div className="rounded-2xl border border-forest-100 bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Regional connections</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PARTNERS.map((partner) => (
                  <span key={partner} className="rounded-full bg-forest-50 px-3.5 py-2 text-xs font-semibold text-forest-800">{partner}</span>
                ))}
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Community commitments</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CSR.map((area) => (
                  <span key={area} className="rounded-full bg-safety-50 px-3.5 py-2 text-xs font-semibold text-safety-700">{area}</span>
                ))}
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Areas of expertise</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {EXPERTISE.map((area) => (
                  <span key={area} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">{area}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
