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
  Quote,
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
    text: 'Improve efficiency and effectiveness while reducing wasted time and resources.',
    className: 'bg-forest-50 text-forest-700',
  },
  {
    icon: HardHat,
    number: '02',
    title: 'Occupational safety & health',
    text: 'Build safer workplaces through audits, training, risk assessment and practical compliance support.',
    className: 'bg-safety-50 text-safety-700',
  },
  {
    icon: Leaf,
    number: '03',
    title: 'Environment',
    text: 'Address environmental requirements through assessments, audits, noise surveys and air-quality monitoring.',
    className: 'bg-clay-50 text-clay-700',
  },
];

const SERVICES = [
  {
    icon: ShieldCheck,
    title: 'Products & services',
    items: [
      {
        title: 'Environmental consultancy',
        description: 'Environmental Impact Assessments (EIA), Environmental Audits (EA), noise surveys and air-quality monitoring. NEMA Firm of Experts registration is listed as certificate no. 2497.',
        focusAreas: [
          'Environmental Impact Assessment and Environmental Audit',
          'Noise-level surveys, legal implications and mitigation advice',
          'Air-quality monitoring for flue gases such as SO2 and H2S, chemicals and dust',
        ],
      },
      {
        title: 'Productivity consultancy',
        description: 'Consultancy, training and implementation support shaped by Asian productivity practices and adapted to each workplace.',
        focusAreas: [
          'Productivity awareness, concepts and practices',
          'Staff and customer satisfaction surveys',
          'Management diagnostic surveys, specialist studies, problem-solving projects, implementation support and management advisory',
          'Change management',
          'Training-needs analysis and total training plans',
          'Structured on-the-job training',
          '5S good housekeeping and visual management',
          'Occupational safety and health',
          'Safety and hygiene surveys',
          'Motivation and team building',
          'Employee involvement, suggestion schemes and quality-control circles',
          'Waste reduction: overproduction, waiting, transportation, inventory, motion and product defects',
          'Line balancing',
          'Corporate communication and networking',
          'Energy efficiency and energy auditing',
          'Work sampling',
          'Method improvement and work measurement',
          'Service excellence',
          'Labour-management cooperation',
          'Productivity gain sharing',
          'Facilitation and presentation skills',
          'Green productivity',
          'Value-added productivity measurement',
          'Industrial engineering and value engineering',
          'Benchmarking and best practices',
          'Innovation',
          'Just-in-time and Toyota Production System',
          'ISO 9001:2008 and integrated management systems',
          'Knowledge management',
          'Productivity-linked wage systems',
          'Strategic planning and balanced scorecards',
          'Total Quality Management and Six Sigma',
          'Total Productive Maintenance',
          'Business excellence and BEACON assessment',
        ],
      },
      {
        title: 'OSH compliance',
        description: 'Support for workplace duties under OSHA 2007 and WIBA 2007, alongside workplace audits, training and risk controls.',
        focusAreas: [
          'Workplace registration and self-assessment',
          'Fire-safety services',
          'Fire-marshal training',
          'Staff fire sensitisation',
          'Fire drills',
          'Fire audits',
          'Firefighting appliances and equipment',
          'Safety audits',
          'Health-and-safety training',
          'Occupational safety risk assessments',
          'Occupational medical examinations',
          'First-aid training',
          'First-aid box contents',
        ],
      },
      {
        title: 'Occupational safety & health certificate (mentored programme)',
        description: 'A practical programme for people developing occupational safety, health and environmental expertise. Confirm current availability, fees and dates with the team.',
        focusAreas: [
          'Legal framework: OSHA 2007, related regulations, safety committees, medical examinations, first aid, fire-risk reduction, noise, construction, hazardous substances and WIBA 2007',
          'Workplace hazards and controls, accidents, PPE, safe-work procedures, accident investigation and inspection techniques',
          'Occupational diseases, stress, substance abuse, first aid, HIV/AIDS, chemical safety and hospital safety',
          'Machinery, plant and electrical safety, emergency preparedness and construction safety',
          'Fire principles, firefighting and fire-safety practice',
          'Occupational hygiene, hazardous agents, industries, substances and controls',
          'Practical work: OSH audits and risk assessments, fire audits, noise measurements and dust surveys',
          'Assessment: examinations (30%), reports (30%) and oral assessment (40%); pass mark: 80% per paper',
        ],
      },
    ],
  },
  {
    icon: Factory,
    title: 'Facility setup',
    items: [
      {
        title: 'Local authority certificates & licences',
        description: 'Guidance on identifying and preparing for relevant county permits and local authority licensing requirements.',
        focusAreas: [],
      },
      {
        title: 'DOSHS / Ministry of Labour certificates',
        description: 'Support in understanding workplace registration and the documentation needed for applicable DOSHS processes.',
        focusAreas: [],
      },
      {
        title: 'Facility layout',
        description: 'Review how people, work areas, equipment and movement routes fit together, with safety and operational needs in mind.',
        focusAreas: [],
      },
      {
        title: 'NEMA approval',
        description: 'Environmental experts can advise on the assessment and documentation process relevant to your proposed project.',
        focusAreas: [],
      },
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Strategic management',
    items: [
      {
        title: 'Performance management system',
        description: 'Develop practical measures, review routines and responsibilities that help teams track progress against their goals.',
        focusAreas: [],
      },
      {
        title: 'Company diagnosis',
        description: 'Build a clearer picture of organisational strengths and constraints to guide where improvement effort should go.',
        focusAreas: [],
      },
      {
        title: 'Records management',
        description: 'Organise business records, ownership and review practices so important information is easier to find and maintain.',
        focusAreas: [],
      },
      {
        title: 'Strategic planning',
        description: 'Turn priorities into a focused plan with defined outcomes, accountable owners and review milestones.',
        focusAreas: [],
      },
      {
        title: 'Insurance risk management',
        description: 'Review operational exposures and risk controls to support informed conversations about insurance and prevention.',
        focusAreas: [],
      },
    ],
  },
  {
    icon: Sparkles,
    title: 'Productivity improvement tools, techniques & practices',
    items: [
      {
        title: 'Process improvement',
        description: 'Use practical improvement methods to reduce waste, strengthen quality and make work more effective.',
        focusAreas: [
          'Lean waste management and seven-waste reduction',
          'Line balancing, industrial engineering and value engineering',
          'Risk assessment and management',
          'Total Quality Management and Total Productive Maintenance',
          'Innovation, just-in-time and Toyota Production System',
          'Quality circles, suggestion schemes and 5S good housekeeping',
          'Green productivity',
        ],
      },
    ],
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
    text: 'To become a world-class provider of productivity management consulting services that enhance industry and national competitiveness while improving standards of living.',
  },
  {
    title: 'Mission',
    text: 'To improve Africa’s competitiveness through training and productivity consulting.',
  },
  {
    title: 'Approach',
    text: 'Act as an independent advisory partner and change agent, share knowledge and skills, and offer workplace-specific solutions aimed at the 20% of causes behind 80% of problems.',
  },
];
const CSR = ['Education', 'Community development', 'Philanthropy'];
const VALUES = [
  { title: 'Professionalism', text: 'Employ knowledge and skills.' },
  { title: 'Innovation', text: 'Develop more effective and efficient ways of doing things.' },
  { title: 'Policy development', text: 'Establish, deploy and implement actions.' },
  { title: 'Ethics', text: 'Exercise integrity and confidentiality in our work.' },
  { title: 'Management by fact', text: 'Make decisions based on facts and data.' },
  { title: 'Customer focus', text: 'Listen and deliver what we commit.' },
  { title: 'Continuous improvement', text: 'Always improve the way we do things.' },
  { title: 'Teamwork', text: 'Respect each other and work as a team.' },
];
const INDUSTRIES = [
  'Government agencies',
  'Non-profit organisations',
  'Petrochemical, oil and gas',
  'Shipbuilding',
  'Food manufacturing',
  'Automotive repair',
  'Semiconductor and electronics manufacturing',
  'Garment and furniture manufacturing',
  'Metal fabrication and precision engineering',
  'Environmental engineering',
  'Wholesale and retail',
  'Telecommunications',
  'Transport and logistics',
  'Printing',
  'Imaging and design services',
  'Food catering, canteens and restaurants',
  'Construction, renovation and interior design',
  'Education',
  'Laundry',
  'Hospitality, security, banking, sports, civil engineering, service industries and horticulture',
  'Information technology',
];
const TRACK_RECORD = [
  { client: 'Line Art Solutions', industry: 'Printing and labelling', services: 'Environmental, safety and health audits; dust measurement; occupational safety audit.' },
  { client: 'Symphony Limited', industry: 'Information technology', services: 'Fire-safety and safety-and-health audits.' },
  { client: 'Soliton Telmec', industry: 'Telecommunications and fibre-optic infrastructure', services: 'Safety-and-health and fire-safety audits.' },
  { client: 'PowerPlast Industries Limited', industry: 'Plastic bottle manufacturing', services: 'Environmental impact assessment, safety-and-health audit and occupational risk assessment.' },
  { client: 'Euro Industrial Chemicals Limited', industry: 'Chemical wholesale and retail', services: 'Safety-and-health and fire audits, dust measurement, air-exchange measurements, and safety-policy development and review.' },
  { client: 'Institute of Advanced Technology', industry: 'Training and education', services: 'Staff fire sensitisation and fire-marshal training.' },
  { client: 'Golden Cara Investments Limited', industry: 'Battery manufacturing', services: 'Safety committee training, audits, fire sensitisation, accident investigation and annual environmental assessment.' },
  { client: 'Dalc Education', industry: 'Training and education', services: 'Safety-and-health and fire-safety audits.' },
  { client: 'Hotel Boulevard', industry: 'Hospitality', services: 'Fire-safety and occupational safety-and-health audits; safety-and-health policy.' },
  { client: 'Royal Castle Hotel, Mombasa', industry: 'Hospitality', services: 'Fire-safety and occupational safety-and-health audits.' },
  { client: 'Telcoms Infrastructure Limited', industry: 'Infrastructure development', services: 'Fire-risk assessment and fire-safety audit.' },
  { client: '680 Hotel', industry: 'Hospitality', services: 'Fire-safety and occupational safety-and-health audits; safety-and-health policy.' },
  { client: 'Silpac Industries Limited', industry: 'Packaging', services: 'Environmental impact plan and incident report.' },
  { client: 'Kileleshwa Covenant Community Church', industry: 'Religious institution', services: 'Noise measurement and environmental audit report.' },
  { client: 'Fantacon Limited', industry: 'Construction and metal fabrication', services: 'Safety and fire audits, risk assessment, occupational medical examination, policy development and environmental assessment.' },
  { client: 'Auto Tech Motor Garage', industry: 'Motor vehicle servicing and repair', services: 'Safety and fire audits, risk assessment, statutory plant examination, policy development and environmental audit.' },
  { client: 'Master Fabricators Limited', industry: 'Motor vehicle body fabrication', services: 'Fire-marshal training.' },
  { client: 'Sunny Processors Limited', industry: 'Food and juice processing', services: 'Fire-marshal training.' },
  { client: 'Panari Hotel', industry: 'Hospitality', services: 'Safety committee training and occupational safety-and-health policy.' },
  { client: 'Stainless Steel Products Limited', industry: 'Metal fabrication', services: 'Safety policy development, medical examination, fire-safety and occupational safety audits.' },
  { client: 'Karen Roses', industry: 'Horticulture', services: 'Fire-safety and occupational safety audits; occupational safety refresher course.' },
  { client: 'Eldama Ravine Roses', industry: 'Horticulture', services: 'Occupational safety refresher course.' },
  { client: 'Marble Arch Hotel, Nairobi', industry: 'Catering and accommodation', services: 'Occupational safety audit and safety-and-health policy development and review.' },
  { client: 'Classic Ironmongers', industry: 'Import, wholesale and retail', services: 'Occupational safety-and-health policy development and review; safety audit.' },
  { client: 'Woodtex Kenya Limited', industry: 'Not specified on the source page', services: 'Consulting, legal advice, training and auditing on retainer.' },
  { client: 'Betatrad Kenya Limited', industry: 'Not specified on the source page', services: 'Consulting, legal advice, training and auditing on retainer.' },
  { client: 'Hoggers Limited (Steers restaurants)', industry: 'Food service', services: 'Fire-safety consulting and auditing.' },
];
const TESTIMONIAL =
  'PCL made a difference when we were starting up my company in Kenya. Its collaborative way of working and consultants’ in-depth NEMA and OSH knowledge helped us secure approval within a month for a project that had been stalled for more than a year. Within a week, pending requirements were met or arrangements for compliance were made. Their support was key to our success, and I remain grateful.';
const FAQS = [
  {
    question: 'What is productivity?',
    answer: 'Doing the right things (effectiveness) and doing things right (efficiency), while minimising wasted resources and time to deliver quality and satisfaction to customers and staff. It also compares the return from an input with the resources and time used.',
  },
  {
    question: 'Does productivity mean working harder?',
    answer: 'No. Productivity is about effectiveness and efficiency, not simply working harder.',
  },
  {
    question: 'Does a productivity improvement programme mean cutting costs or jobs?',
    answer: 'Not necessarily. Cost reductions should not come at the expense of quality, and staffing depends on the market and the organisation’s circumstances.',
  },
  {
    question: 'Does productivity improvement require consultants?',
    answer: 'No. Productivity improvement involves current employees.',
  },
  {
    question: 'Is productivity the same as production?',
    answer: 'No. Producing more does not by itself mean the work is productive; the return on resources, time and quality matters.',
  },
];

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
                Inspiring a competitive Kenya
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
                  Explore Productivity OSHAPP <ArrowDownRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="text-slate-400">Practice areas</span>
                {['Productivity', 'Occupational safety & health', 'Environment'].map((name) => (
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
                        <p className="text-sm font-bold">Productivity OSHAPP</p>
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
                  Productivity, safety and environmental expertise for better work.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Productivity Consulting Limited is a training and consulting company focused on productivity, occupational safety and health, and environmental compliance. Its stated aim is to help organisations improve efficiency and effectiveness while building safer workplaces.
              </p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="relative isolate overflow-hidden rounded-[1.75rem] bg-forest-950 p-7 text-white shadow-[0_24px_70px_-38px_rgba(13,36,28,0.65)] sm:p-9">
                <div aria-hidden="true" className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-200">Our background</p>
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-forest-100">
                    Kenya · Africa
                  </span>
                </div>
                <h3 className="font-display mt-6 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  A productivity vision shaped over time.
                </h3>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div className="border-l border-forest-400/70 pl-4">
                    <p className="font-display text-2xl font-semibold text-safety-400">2005</p>
                    <p className="mt-2 text-sm leading-6 text-forest-100">
                      The idea traces back to an African Union and Asian Productivity Organization knowledge-sharing forum in Sandton, South Africa.
                    </p>
                  </div>
                  <div className="border-l border-forest-400/70 pl-4">
                    <p className="font-display text-2xl font-semibold text-safety-400">2010</p>
                    <p className="mt-2 text-sm leading-6 text-forest-100">
                      Productivity Consulting Limited was formed and registered in Kenya to help organisations apply productivity and management practices.
                    </p>
                  </div>
                </div>
                <p className="mt-8 border-t border-white/10 pt-5 text-sm leading-6 text-forest-200">
                  Our ambition is to grow into a centre for productivity training and publications in Kenya and across Africa.
                </p>
              </article>

              <article className="flex flex-col rounded-[1.75rem] border border-forest-100 bg-forest-50/70 p-7 sm:p-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-forest-700 shadow-sm ring-1 ring-forest-100">
                  <Quote aria-hidden="true" className="h-5 w-5" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Business philosophy</p>
                <h3 className="font-display mt-3 text-2xl font-semibold leading-snug tracking-tight text-forest-950 sm:text-3xl">
                  Better workplaces. A better quality of life.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                  We help transform businesses into efficient, effective and safe work environments where employees can thrive.
                </p>
                <div className="mt-auto pt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Who we work with</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Local enterprises', 'Public institutions', 'Non-governmental organisations'].map((client) => (
                      <span key={client} className="rounded-full border border-forest-100 bg-white px-3 py-2 text-xs font-medium text-forest-800">
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {ABOUT_POINTS.map(({ title, text }) => (
                <article key={title} className="rounded-2xl bg-forest-50/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-forest-900">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-forest-100 bg-forest-50/60 p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Our values</p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-forest-950">PIPE MC2T</h3>
                </div>
                <p className="max-w-xl text-xs leading-5 text-slate-500">
                  DOSHS training approvals cover first aid, fire safety and safety committee training. PCL is also listed as a NITA industrial training provider and a NEMA-registered Firm of Experts (certificate no. 2497).
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {VALUES.map(({ title, text }) => (
                  <article key={title} className="rounded-xl bg-white p-4">
                    <p className="text-sm font-bold text-forest-900">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
            </div>
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
                Training and consulting from diagnosis to delivery.
              </h2>
            </div>
            <Link href="/contact" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-forest-700 hover:text-forest-900">
              Discuss your needs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Explore Productivity Consulting Limited’s consulting, training and workplace-improvement services.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, items }, index) => (
              <article key={title} className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-forest-50 text-forest-700' : 'bg-safety-50 text-safety-700'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold text-forest-900">{title}</h3>
                    <div className="mt-3 space-y-2">
                      {items.map((item) => (
                        <details key={item.title} className="group rounded-xl border border-slate-100 bg-slate-50/70 open:border-forest-200 open:bg-forest-50/60">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition hover:text-forest-800 focus-visible:ring-2 focus-visible:ring-forest-500 [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center gap-2.5">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" />
                              {item.title}
                            </span>
                            <ArrowDownRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90 group-open:text-forest-700" />
                          </summary>
                          <div className="px-6 pb-4 pl-7">
                            <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                            {item.focusAreas.length ? (
                              <ul className="mt-3 space-y-1.5 border-l-2 border-forest-200 pl-4 text-xs leading-5 text-slate-600">
                                {item.focusAreas.map((focusArea) => <li key={focusArea}>{focusArea}</li>)}
                              </ul>
                            ) : null}
                            <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900">
                              Discuss this service <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </details>
                      ))}
                    </div>
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
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-safety-400">Meet Productivity OSHAPP</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your workplace safety records, finally in one place.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-forest-100 sm:text-base">
                A practical OSH platform for Kenyan SMEs. Keep key workplace records organised, support safer day-to-day operations and prepare DOSHS-ready reports.
              </p>
              <Link href="/login" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-safety-500 px-5 py-3 text-sm font-bold text-forest-950 transition hover:bg-safety-400">
                Open Productivity OSHAPP <ArrowRight className="h-4 w-4" />
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
                Our local and international consultant pool includes Asian Productivity Organization resource persons and trained productivity practitioners. External experts can be engaged when a project requires additional knowledge.
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
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Industries and organisations served</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <span key={industry} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{industry}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="track-record" className="border-y border-forest-100 bg-white px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay-700">Track record</p>
                <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">Experience across sectors.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Past work spans manufacturing, hospitality, infrastructure, education, horticulture and other sectors. These references are historical records, not confirmation of current client relationships.
              </p>
            </div>
            <details className="group mt-8 rounded-2xl border border-forest-100 bg-forest-50/50 p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-forest-900 [&::-webkit-details-marker]:hidden">
                <span>View the archived client and project references ({TRACK_RECORD.length})</span>
                <ArrowDownRight className="h-5 w-5 shrink-0 text-forest-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Confirm client names, service histories and permissions before using these as current references.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {TRACK_RECORD.map(({ client, industry, services }) => (
                  <article key={client} className="rounded-xl border border-forest-100 bg-white p-4">
                    <h3 className="text-sm font-bold text-forest-900">{client}</h3>
                    <p className="mt-1 text-xs font-medium text-forest-700">{industry}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{services}</p>
                  </article>
                ))}
              </div>
            </details>
            <blockquote className="mt-6 rounded-2xl bg-forest-950 p-6 text-white sm:p-8">
              <Quote className="h-6 w-6 text-safety-400" aria-hidden="true" />
              <p className="mt-4 max-w-4xl text-sm leading-7 text-forest-50 sm:text-base">“{TESTIMONIAL}”</p>
              <footer className="mt-4 text-xs font-semibold text-forest-300">
                Edited for readability · Mr. Ali Hassan, Director, Golden Cara Investments
              </footer>
            </blockquote>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Frequently asked questions</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">A practical view of productivity.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">Clear answers to common questions about productivity and improvement.</p>
          </div>
          <div className="mt-8 max-w-4xl space-y-3">
            {FAQS.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200 bg-white open:border-forest-200 open:bg-forest-50/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-forest-900 [&::-webkit-details-marker]:hidden">
                  {question}
                  <ArrowDownRight className="h-4 w-4 shrink-0 text-forest-600 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
