export const AUDIT_CATEGORIES = [
  { id: 'basic', title: 'Basic details', description: 'Workplace identity and occupier details.' },
  { id: 'policies', title: 'Safety and health policies', description: 'People, programmes, plans and safety systems.' },
  { id: 'conditions', title: 'Safety, health and welfare conditions', description: 'Conditions observed across workplace operations.' },
] as const;

export const AUDIT_SECTIONS = [
  { id: 'workplace-identification', category: 'basic', title: 'Workplace identification', law: 'OSHA 2007, Sec. 44' },
  { id: 'contact-details', category: 'basic', title: 'Contact details', law: 'OSHA 2007, Sec. 44' },
  { id: 'physical-location', category: 'basic', title: 'Physical location', law: 'OSHA 2007, Sec. 44' },
  { id: 'workers-data', category: 'basic', title: 'Workers data', law: 'OSHA 2007, Sec. 6' },
  { id: 'policy-statement', category: 'policies', title: 'Safety and health policy statement', law: 'OSHA 2007, Sec. 7' },
  { id: 'safety-officer', category: 'policies', title: 'Person responsible for safety at the workplace', law: 'OSHA 2007, Sec. 9 & 11' },
  { id: 'occupational-health', category: 'policies', title: 'Occupational health provisions', law: 'OSHA 2007, Sec. 51' },
  { id: 'health-programmes', category: 'policies', title: 'Occupational health programmes', law: 'OSHA 2007, Sec. 6(2)' },
  { id: 'information-systems', category: 'policies', title: 'Information systems', law: 'OSHA 2007, Sec. 13' },
  { id: 'permits-to-work', category: 'policies', title: 'Permits to work', law: 'OSHA 2007, Sec. 6(3) & 82' },
  { id: 'emergency-response', category: 'policies', title: 'Emergency response plan', law: 'OSHA 2007, Sec. 6(2)(f)' },
  { id: 'machine-safety', category: 'conditions', title: 'Machine safety', law: 'OSHA 2007, Sec. 101–110' },
  { id: 'chemical-safety', category: 'conditions', title: 'Chemical safety', law: 'OSHA 2007, Sec. 96–100' },
  { id: 'plant-safety', category: 'conditions', title: 'Plant safety', law: 'OSHA 2007, Sec. 82–95' },
  { id: 'electrical-safety', category: 'conditions', title: 'Electrical safety', law: 'OSHA 2007, Sec. 78–81' },
  { id: 'fire-safety', category: 'conditions', title: 'Fire safety', law: 'Fire Risk Reduction Rules 2007' },
  { id: 'construction-safety', category: 'conditions', title: 'Construction safety', law: 'Building Operations & Works of Engineering Construction Rules 1984' },
  { id: 'personal-protective-equipment', category: 'conditions', title: 'Personal protective equipment', law: 'OSHA 2007, Sec. 101(3)' },
  { id: 'ventilation', category: 'conditions', title: 'Ventilation', law: 'OSHA 2007, Sec. 47' },
  { id: 'overcrowding', category: 'conditions', title: 'Overcrowding', law: 'OSHA 2007, Sec. 46' },
  { id: 'housekeeping', category: 'conditions', title: 'House keeping', law: 'OSHA 2007, Sec. 45' },
  { id: 'lighting', category: 'conditions', title: 'Lighting', law: 'OSHA 2007, Sec. 49' },
  { id: 'handling-materials', category: 'conditions', title: 'Handling of materials', law: 'OSHA 2007, Sec. 67–72' },
  { id: 'noise', category: 'conditions', title: 'Noise and vibration', law: 'OSHA 2007, Sec. 101' },
  { id: 'sanitation', category: 'conditions', title: 'Sanitation and washing facilities', law: 'OSHA 2007, Sec. 50' },
  { id: 'drinking-water', category: 'conditions', title: 'Drinking water', law: 'OSHA 2007, Sec. 91' },
  { id: 'welfare-facilities', category: 'conditions', title: 'Welfare facilities', law: 'OSHA 2007, Sec. 92–95' },
  { id: 'first-aid', category: 'conditions', title: 'First aid and emergency care', law: 'First Aid Rules 1977' },
  { id: 'occupational-hygiene', category: 'conditions', title: 'Occupational hygiene and exposure control', law: 'OSHA 2007, Sec. 101' },
  { id: 'medical-surveillance', category: 'conditions', title: 'Medical surveillance and health records', law: 'OSHA 2007, Sec. 101' },
] as const;

export type AuditSectionId = (typeof AUDIT_SECTIONS)[number]['id'];
export type AuditAssessment = 'compliant' | 'needs_attention' | 'not_applicable';

export type AuditResponse = {
  assessment?: AuditAssessment;
  notes?: string;
  answers?: Record<string, string>;
};

export type AuditResponses = Partial<Record<AuditSectionId, AuditResponse>>;

export const REQUIRED_AUDIT_ANSWERS: Partial<Record<AuditSectionId, string[]>> = {
  'workplace-identification': ['workplaceName', 'registrationNumber', 'industry'],
  'contact-details': ['contactName', 'contactEmail', 'contactPhone'],
  'physical-location': ['county', 'town'],
  'workers-data': ['totalWorkers'],
};

export function isAuditSectionComplete(sectionId: AuditSectionId, responses: AuditResponses) {
  const response = responses[sectionId];
  if (!response?.assessment) return false;
  return (REQUIRED_AUDIT_ANSWERS[sectionId] ?? []).every((key) => response.answers?.[key]?.trim());
}

export function getAuditProgress(responses: AuditResponses) {
  const completed = AUDIT_SECTIONS.filter((section) => isAuditSectionComplete(section.id, responses)).length;
  return {
    completed,
    total: AUDIT_SECTIONS.length,
    percent: Math.round((completed / AUDIT_SECTIONS.length) * 100),
  };
}
