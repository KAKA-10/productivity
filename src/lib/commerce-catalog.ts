export const KENYAN_COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang’a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
] as const;

export type County = (typeof KENYAN_COUNTIES)[number];
export type AuditCode = 'safety' | 'fire' | 'environmental' | 'risk';

export const AUDIT_OPTIONS: { code: AuditCode; title: string; description: string }[] = [
  { code: 'safety', title: 'Safety and compliance audit', description: 'Review occupational safety and health arrangements and identify practical compliance actions.' },
  { code: 'fire', title: 'Fire safety audit', description: 'Review fire prevention, emergency readiness and fire-protection arrangements.' },
  { code: 'environmental', title: 'Environmental audit', description: 'Review environmental aspects, controls and applicable compliance obligations.' },
  { code: 'risk', title: 'Workplace risk audit', description: 'Review workplace hazards, risk controls and actions for priority work areas.' },
];

const REGIONAL_COUNTIES = new Set<County>(['Machakos', 'Kajiado', 'Kiambu']);

export function getAuditBundle(county: string, thirdAudit?: string) {
  if (!KENYAN_COUNTIES.includes(county as County)) return null;
  if (county === 'Nairobi') {
    return { auditCodes: ['safety'] as AuditCode[], amount: 10_000 };
  }
  if (REGIONAL_COUNTIES.has(county as County)) {
    return { auditCodes: ['safety', 'fire'] as AuditCode[], amount: 20_000 };
  }
  if (thirdAudit !== 'environmental' && thirdAudit !== 'risk') return null;
  return {
    auditCodes: ['safety', 'fire', thirdAudit] as AuditCode[],
    amount: 30_000,
  };
}

export const TRAINING_PACKAGES = [
  { code: 'osh-induction', title: 'Workplace Safety Essentials', category: 'Safety', price: 2_500, duration: 'Half day', description: 'Practical OSH duties, everyday hazard awareness and safe-work habits.' },
  { code: 'safety-committee', title: 'Safety Committee Skills', category: 'Safety', price: 4_000, duration: '1 day', description: 'Build confident committee meetings, inspections and action follow-through.' },
  { code: 'fire-safety', title: 'Fire Safety & Warden', category: 'Fire', price: 3_500, duration: 'Half day', description: 'Fire prevention, evacuation roles and practical emergency response.' },
  { code: 'first-aid', title: 'Workplace First Aid', category: 'First aid', price: 5_500, duration: '2 days', description: 'Recognise an emergency and provide an organised first response.' },
  { code: 'risk-assessment', title: 'Hazard Identification & Risk Assessment', category: 'Safety', price: 3_000, duration: '1 day', description: 'Identify hazards, evaluate risk and choose practical control measures.' },
  { code: 'environmental-awareness', title: 'Environmental Awareness at Work', category: 'Environment', price: 2_500, duration: 'Half day', description: 'Understand common workplace environmental impacts and responsible controls.' },
] as const;

export type TrainingCode = (typeof TRAINING_PACKAGES)[number]['code'];

export const FEATURE_PRODUCTS = [
  { code: 'incidents', title: 'Incident & near-miss register', route: '/app/incidents', description: 'Record events, investigate causes and track follow-up actions.' },
  { code: 'risks', title: 'Risk assessments', route: '/app/risk-assessments', description: 'Document workplace hazards, controls and residual risk.' },
  { code: 'jsa', title: 'Job safety analysis', route: '/app/jsa', description: 'Break work into safe steps, hazards and controls.' },
  { code: 'toolbox-talks', title: 'Toolbox talks', route: '/app/toolbox-talks', description: 'Prepare and record team safety briefings.' },
  { code: 'compliance', title: 'Compliance calendar', route: '/app/compliance-calendar', description: 'Track statutory obligations, owners and due dates.' },
  { code: 'inspections', title: 'Workplace inspections', route: '/app/inspections', description: 'Schedule inspections, record findings and assign actions.' },
  { code: 'reports', title: 'DOSHS reports', route: '/app/reports', description: 'Organise workplace reporting records and supporting details.' },
  { code: 'ppe', title: 'PPE issuance', route: '/app/ppe', description: 'Maintain personal protective equipment issue records.' },
  { code: 'fire', title: 'Fire equipment register', route: '/app/fire-equipment', description: 'Track fire equipment, inspection records and service dates.' },
  { code: 'personnel', title: 'Emergency role holders', route: '/app/personnel', description: 'Maintain first aider and fire marshal appointments and renewals.' },
  { code: 'meetings', title: 'Safety committee records', route: '/app/committee', description: 'Keep committee minutes, attendance and actions together.' },
  { code: 'capa', title: 'Corrective actions', route: '/app/capa', description: 'Assign, monitor and close out corrective and preventive actions.' },
  { code: 'training-records', title: 'Training records', route: '/app/training/records', description: 'Track completed courses, participant details and renewal dates.' },
] as const;

export const FEATURE_PRICE_PLACEHOLDER = 5_000;

export function featureForPath(pathname: string) {
  return FEATURE_PRODUCTS.find((feature) => pathname === feature.route || pathname.startsWith(`${feature.route}/`));
}

export function featureForResource(resource: string) {
  const resourceRoutes: Record<string, string> = {
    incidents: '/app/incidents',
    risks: '/app/risk-assessments',
    jsa: '/app/jsa',
    'toolbox-talks': '/app/toolbox-talks',
    compliance: '/app/compliance-calendar',
    audits: '/app/osh-audit',
    inspections: '/app/inspections',
    ppe: '/app/ppe',
    fire: '/app/fire-equipment',
    personnel: '/app/personnel',
    meetings: '/app/committee',
    training: '/app/training/records',
    capa: '/app/capa',
    reports: '/app/reports',
  };
  const route = resourceRoutes[resource];
  if (resource === 'audits') return undefined;
  return route ? featureForPath(route) : undefined;
}

export function parseUnlockedFeatures(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((feature) => typeof feature === 'string')) return parsed;
  } catch {
    return [];
  }

  return [];
}

export function hasResourceAccess(
  resource: string,
  user: { role: string; auditAccess?: boolean; unlockedFeatures?: string[] },
) {
  if (user.role === 'admin') return true;
  if (resource === 'audits') return Boolean(user.auditAccess);
  const feature = featureForResource(resource);
  return !feature || (user.unlockedFeatures ?? []).includes(feature.code);
}
