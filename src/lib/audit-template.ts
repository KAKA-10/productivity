export const AUDIT_CATEGORIES = [
  { id: 'basic', title: 'Basic details', description: 'Workplace identity, contact, location and worker data.' },
  { id: 'policies', title: 'Safety and health policies', description: 'Policies, occupational health services, programmes and emergency planning.' },
  { id: 'conditions', title: 'Safety, health and welfare conditions', description: 'Workplace safety, occupational hygiene and welfare conditions.' },
] as const;

export type AuditFieldKind = 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'date' | 'select';
export type AuditFieldOption = { value: string; label: string };
export type AuditField = {
  key: string;
  label: string;
  kind: AuditFieldKind;
  required: boolean;
  options?: readonly AuditFieldOption[];
  hint?: string;
};

const YES_NO_NA = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_applicable', label: 'Not applicable' },
] as const;

const AVAILABILITY = [
  { value: 'available', label: 'Available and current' },
  { value: 'needs_review', label: 'Available but needs review' },
  { value: 'not_available', label: 'Not available' },
  { value: 'not_applicable', label: 'Not applicable' },
] as const;

function field(
  key: string,
  label: string,
  kind: AuditFieldKind = 'textarea',
  options?: readonly AuditFieldOption[],
  hint?: string,
  required = true,
): AuditField {
  return { key, label, kind, required, options, hint };
}

const basicSections = [
  {
    id: 'workplace-identification',
    category: 'basic',
    title: 'Workplace identification',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('workplaceName', 'Registered workplace name', 'text'),
      field('registrationNumber', 'Workplace registration number', 'text'),
      field('industry', 'Type of industry / main activity', 'text'),
      field('occupierName', 'Name of occupier', 'text'),
    ],
  },
  {
    id: 'contact-details',
    category: 'basic',
    title: 'Contact details',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('contactName', 'Primary workplace contact', 'text'),
      field('contactEmail', 'Email address', 'email'),
      field('countryCode', 'Country calling code', 'select', [
        { value: '+254', label: '+254 — Kenya' },
        { value: '+255', label: '+255 — Tanzania' },
        { value: '+256', label: '+256 — Uganda' },
        { value: '+250', label: '+250 — Rwanda' },
        { value: '+251', label: '+251 — Ethiopia' },
        { value: '+1', label: '+1 — Other' },
        { value: 'other', label: 'Other' },
      ]),
      field('otherCountryCode', 'Other country calling code', 'text', undefined, 'Enter the international code when “Other” is selected.', false),
      field('contactPhone', 'Phone number', 'tel'),
    ],
  },
  {
    id: 'physical-location',
    category: 'basic',
    title: 'Physical location',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('county', 'County', 'text'),
      field('subCounty', 'Sub-county', 'text'),
      field('poBox', 'P.O. Box', 'text'),
      field('town', 'Town / locality', 'text'),
      field('streetAddress', 'Street address / directions', 'textarea'),
    ],
  },
  {
    id: 'workers-data',
    category: 'basic',
    title: 'Workers data',
    law: 'OSHA 2007, Sec. 6',
    fields: [
      field('totalWorkers', 'Total workers', 'number'),
      field('maleWorkers', 'Male workers', 'number'),
      field('femaleWorkers', 'Female workers', 'number'),
      field('workersWithDisabilities', 'Workers with disabilities (PWD)', 'number'),
      field('permanentWorkers', 'Permanent workers', 'number'),
      field('contractWorkers', 'Contract workers', 'number'),
      field('temporaryWorkers', 'Temporary / casual workers', 'number'),
      field('workerCountAsOf', 'Worker count as of', 'date'),
    ],
  },
] as const;

const policySections = [
  {
    id: 'policy-statement',
    category: 'policies',
    title: 'Safety and health policy statement and licences',
    law: 'OSHA 2007, Sec. 7',
    fields: [
      field('policyStatus', 'Safety and health policy statement status', 'select', AVAILABILITY),
      field('policyApprovedBy', 'Approved / signed by', 'text'),
      field('policyReviewDate', 'Last review date', 'date'),
      field('workplaceLicences', 'Relevant workplace safety and health licences', 'textarea'),
      field('licenceStatus', 'Licence status', 'select', AVAILABILITY),
    ],
    evidenceRequiredIf: ['policyStatus', 'licenceStatus'],
  },
  {
    id: 'safety-officer',
    category: 'policies',
    title: 'Person responsible for safety at the workplace',
    law: 'OSHA 2007, Sec. 9 & 11',
    fields: [
      field('safetyOfficerName', 'Full name', 'text'),
      field('safetyOfficerJobTitle', 'Job title', 'text'),
      field('safetyOfficerAppointmentDate', 'Appointment date', 'date'),
      field('academicQualifications', 'Academic qualifications', 'textarea'),
      field('professionalQualifications', 'OSH / professional qualifications and membership', 'textarea'),
      field('safetyOfficerExperience', 'Relevant experience and responsibilities', 'textarea'),
      field('qualificationsEvidenceAvailable', 'Supporting qualification documents available', 'select', YES_NO_NA),
    ],
    evidenceRequiredIf: ['qualificationsEvidenceAvailable'],
  },
  {
    id: 'occupational-health',
    category: 'policies',
    title: 'Occupational health provisions',
    law: 'OSHA 2007, Sec. 51',
    fields: [
      field('healthClinicAvailable', 'Health clinic available on site', 'select', YES_NO_NA),
      field('healthClinicDetails', 'Clinic services, operating hours and provider', 'textarea'),
      field('firstAidRooms', 'Number of first aid rooms', 'number'),
      field('firstAidBoxes', 'Number of first aid boxes', 'number'),
      field('ambulances', 'Number of ambulances available', 'number'),
      field('referralHospitals', 'Referral hospitals and contact arrangements', 'textarea'),
      field('attendedCasesThisYear', 'Cases attended during the reporting year', 'number'),
      field('healthPersonnel', 'Health personnel, qualifications and coverage', 'textarea'),
      field('medicalInsurance', 'Medical insurance scheme and eligible workers', 'textarea'),
      field('healthProvisionsGaps', 'Service gaps or improvement actions', 'textarea'),
    ],
  },
  {
    id: 'health-programmes',
    category: 'policies',
    title: 'Occupational health programmes',
    law: 'OSHA 2007, Sec. 6(2)',
    fields: [
      field('counsellingProgramme', 'Employee counselling programme', 'select', YES_NO_NA),
      field('healthEducationProgramme', 'Health education programme', 'select', YES_NO_NA),
      field('hearingConservationProgramme', 'Hearing conservation programme', 'select', YES_NO_NA),
      field('rehabilitationProgramme', 'Rehabilitation / return-to-work programme', 'select', YES_NO_NA),
      field('otherHealthProgrammes', 'Other occupational health programmes', 'textarea'),
      field('programmeCoverage', 'Who is covered, frequency and responsible person', 'textarea'),
      field('programmeResults', 'Participation, outcomes and improvement needs', 'textarea'),
    ],
    evidenceRequiredIf: ['counsellingProgramme', 'healthEducationProgramme', 'hearingConservationProgramme', 'rehabilitationProgramme'],
  },
  {
    id: 'information-systems',
    category: 'policies',
    title: 'Safety and health information systems',
    law: 'OSHA 2007, Sec. 13',
    fields: [
      field('operationalManuals', 'Operational / safe-work manuals available', 'select', AVAILABILITY),
      field('incidentRecords', 'Incident and occupational disease records maintained', 'select', YES_NO_NA),
      field('inspectionRecords', 'Inspection and maintenance records maintained', 'select', YES_NO_NA),
      field('trainingRecords', 'Safety training records maintained', 'select', YES_NO_NA),
      field('documentControl', 'Document owner, review frequency and version control', 'textarea'),
      field('informationAccess', 'How workers access safety information and report hazards', 'textarea'),
    ],
    evidenceRequiredIf: ['operationalManuals'],
  },
  {
    id: 'permits-to-work',
    category: 'policies',
    title: 'Permits to work and dangerous processes',
    law: 'OSHA 2007, Sec. 6(3) & 82',
    fields: [
      field('dangerousProcesses', 'Dangerous work processes carried out at this workplace', 'textarea'),
      field('permitTypes', 'Permit types used (e.g. hot work, confined space, height, electrical)', 'textarea'),
      field('permitIssuers', 'Who authorises and receives permits', 'textarea'),
      field('permitControls', 'Isolation, gas testing, PPE and other pre-work controls', 'textarea'),
      field('permitCloseout', 'How permits are monitored, closed and retained', 'textarea'),
    ],
  },
  {
    id: 'emergency-response',
    category: 'policies',
    title: 'Emergency response plan',
    law: 'OSHA 2007, Sec. 6(2)(f)',
    fields: [
      field('emergencyPlanStatus', 'Emergency response plan status', 'select', AVAILABILITY),
      field('emergencyCoordinator', 'Emergency coordinator and response team', 'textarea'),
      field('emergencyScenarios', 'Credible emergencies covered by the plan', 'textarea'),
      field('evacuationAssembly', 'Evacuation routes and assembly points', 'textarea'),
      field('emergencyContacts', 'Emergency contacts and referral arrangements', 'textarea'),
      field('drillsPerYear', 'Emergency drills conducted in the last year', 'number'),
      field('emergencyEquipment', 'Emergency equipment and inspection arrangements', 'textarea'),
    ],
    evidenceRequiredIf: ['emergencyPlanStatus'],
  },
] as const;

type ConditionSectionId =
  | 'machine-safety'
  | 'chemical-safety'
  | 'plant-safety'
  | 'electrical-safety'
  | 'fire-safety'
  | 'construction-safety'
  | 'personal-protective-equipment'
  | 'ventilation'
  | 'overcrowding'
  | 'housekeeping'
  | 'lighting'
  | 'handling-materials'
  | 'noise'
  | 'vibration'
  | 'radiation'
  | 'thermal-conditions'
  | 'pressure-systems'
  | 'ergonomics'
  | 'sanitation'
  | 'drinking-water'
  | 'welfare-facilities'
  | 'first-aid'
  | 'occupational-hygiene'
  | 'medical-surveillance';

type ConditionDefinition = {
  id: ConditionSectionId;
  category: 'conditions';
  title: string;
  law: string;
  group: 'safety' | 'health';
  fields: readonly AuditField[];
};

function condition(
  id: ConditionSectionId,
  title: string,
  law: string,
  group: ConditionDefinition['group'],
  prompts: readonly [string, string, string, string, string],
): ConditionDefinition {
  return {
    id,
    category: 'conditions',
    title,
    law,
    group,
    fields: [
      field('scope', prompts[0]),
      field('hazards', prompts[1]),
      field('controls', prompts[2]),
      field('inspectionTraining', prompts[3]),
      field('recordsActions', prompts[4]),
    ],
  };
}

const conditionSections = [
  condition('machine-safety', 'Machine safety', 'OSHA 2007, Sec. 101–110', 'safety', [
    'Machinery, work areas and high-risk equipment covered',
    'Moving parts, entanglement, crush and other machine hazards',
    'Machine guarding, interlocks, safe operating procedures and lockout',
    'Preventive maintenance, operator competency and inspection frequency',
    'Inspection records, defects found and corrective actions',
  ]),
  condition('chemical-safety', 'Chemical safety', 'OSHA 2007, Sec. 96–100', 'safety', [
    'Hazardous substances, quantities and work areas',
    'Exposure routes, incompatible substances and likely health effects',
    'Chemical inventory, safety data sheets, labels, storage and spill controls',
    'Exposure monitoring, worker training and emergency response',
    'Chemical registers, incident records and outstanding corrective actions',
  ]),
  condition('plant-safety', 'Plant safety', 'OSHA 2007, Sec. 82–95', 'safety', [
    'Plant, lifting equipment and pressure systems in use',
    'Failure, overloading, falling loads and unsafe access hazards',
    'Safe systems of work, guarding, rated capacity and isolation controls',
    'Thorough examinations, preventive maintenance and operator competency',
    'Certificates, maintenance logs, defects and corrective actions',
  ]),
  condition('electrical-safety', 'Electrical safety', 'OSHA 2007, Sec. 78–81', 'safety', [
    'Electrical installations, panels and portable equipment covered',
    'Shock, arc flash, fire, damaged wiring and unauthorised access risks',
    'Earthing, circuit protection, safe isolation and electrical work permits',
    'Inspection/testing frequency and competent electrical personnel',
    'Test certificates, defect reports and corrective actions',
  ]),
  condition('fire-safety', 'Fire safety', 'Fire Risk Reduction Rules 2007', 'safety', [
    'Fire hazards, ignition sources and areas of elevated risk',
    'Combustible materials, blocked exits and fire spread risks',
    'Fire detection, alarms, extinguishers, exits and fire-fighting controls',
    'Fire drills, equipment servicing and staff training',
    'Fire risk assessment, drill records, equipment certificates and actions',
  ]),
  condition('construction-safety', 'Construction safety', 'Building Operations & Works of Engineering Construction Rules 1984', 'safety', [
    'Construction, alteration or maintenance projects and contractors',
    'Work-at-height, excavation, falling objects and site traffic hazards',
    'Site induction, permits, fall protection, scaffold and exclusion-zone controls',
    'Competent supervision, equipment inspection and contractor coordination',
    'Construction plans, permits, inspection records and corrective actions',
  ]),
  condition('personal-protective-equipment', 'Personal protective equipment', 'OSHA 2007, Sec. 101(3)', 'health', [
    'Tasks and worker groups requiring personal protective equipment',
    'Residual exposure risks after engineering and administrative controls',
    'PPE selection, issue, fit, compatibility, cleaning and replacement',
    'Worker instruction, supervision and inspection frequency',
    'PPE issue records, defects, worker feedback and corrective actions',
  ]),
  condition('ventilation', 'Ventilation', 'OSHA 2007, Sec. 47', 'health', [
    'Work areas with natural or mechanical ventilation',
    'Heat, dust, fumes, vapours, odours and inadequate air movement',
    'Fresh-air supply, local exhaust and safe discharge arrangements',
    'Ventilation inspection, filter replacement and air-quality monitoring',
    'Maintenance records, complaints and improvement actions',
  ]),
  condition('overcrowding', 'Overcrowding and workspace', 'OSHA 2007, Sec. 46', 'health', [
    'Work areas, occupancy limits and typical maximum headcount',
    'Restricted movement, blocked egress, poor air circulation and congestion',
    'Space allocation, safe access, aisle widths and occupancy controls',
    'Occupancy reviews and checks during peak shifts',
    'Occupancy records, worker reports and corrective actions',
  ]),
  condition('housekeeping', 'Housekeeping and waste management', 'OSHA 2007, Sec. 45', 'health', [
    'Work areas, walkways, storage locations and waste streams',
    'Slips, trips, blocked access, spills and accumulated waste',
    'Cleaning schedules, spill response, waste segregation and safe storage',
    'Housekeeping inspections and responsibility by area/shift',
    'Inspection logs, recurring issues and corrective actions',
  ]),
  condition('lighting', 'Lighting', 'OSHA 2007, Sec. 49', 'health', [
    'Workstations, circulation routes and emergency areas',
    'Poor illumination, glare, shadows and visual-task risks',
    'Suitable task lighting, daylight control and emergency lighting',
    'Lighting checks, lux assessments and maintenance frequency',
    'Assessment records, worker concerns and corrective actions',
  ]),
  condition('handling-materials', 'Handling and storage of materials', 'OSHA 2007, Sec. 67–72', 'health', [
    'Materials handled, stored and transported, including load characteristics',
    'Manual lifting, falling objects, unstable stacks and vehicle interaction',
    'Mechanical aids, safe stacking, load limits and pedestrian segregation',
    'Manual-handling training, equipment inspection and supervision',
    'Handling assessments, incident records and corrective actions',
  ]),
  condition('noise', 'Noise', 'OSHA 2007, Sec. 101', 'health', [
    'Noise sources, exposed areas and worker groups',
    'Exposure levels, communication difficulty and hearing-loss risk',
    'Noise reduction, isolation, work rotation and hearing protection',
    'Noise measurement, hearing conservation and audiometric surveillance',
    'Noise assessments, exposure records and corrective actions',
  ]),
  condition('vibration', 'Vibration', 'OSHA 2007, Sec. 101', 'health', [
    'Hand-arm and whole-body vibration sources and exposed workers',
    'Exposure duration, symptoms and vibration-related health risks',
    'Low-vibration equipment, isolation, work rotation and exposure limits',
    'Equipment maintenance, exposure monitoring and health surveillance',
    'Vibration assessments, worker reports and corrective actions',
  ]),
  condition('radiation', 'Radiation', 'OSHA 2007, Sec. 101', 'health', [
    'Ionising / non-ionising radiation sources and controlled areas',
    'Exposure pathways, affected workers and potential health effects',
    'Authorisation, shielding, access control, warning signs and PPE',
    'Exposure monitoring, dosimetry, equipment testing and training',
    'Licences, monitoring records, incidents and corrective actions',
  ]),
  condition('thermal-conditions', 'Thermal conditions', 'OSHA 2007, Sec. 6 & 101', 'health', [
    'Hot / cold work areas, outdoor work and affected worker groups',
    'Heat stress, cold stress, dehydration and temperature extremes',
    'Ventilation, insulation, hydration, rest breaks and acclimatisation',
    'Temperature monitoring, work-rest review and supervisor checks',
    'Monitoring records, health reports and corrective actions',
  ]),
  condition('pressure-systems', 'Pressure systems and compressed gases', 'OSHA 2007, Sec. 82–95', 'health', [
    'Pressure vessels, compressors, cylinders and associated pipework',
    'Overpressure, leaks, rupture, stored energy and gas release hazards',
    'Pressure relief, isolation, secure storage and safe operating limits',
    'Competent examination, gauge testing and operator training',
    'Examination certificates, maintenance records and corrective actions',
  ]),
  condition('ergonomics', 'Ergonomics and work design', 'OSHA 2007, Sec. 6 & 101', 'health', [
    'Workstations, repetitive tasks, forceful work and prolonged postures',
    'Musculoskeletal strain, fatigue and ergonomic risk factors',
    'Workstation adjustment, task redesign, aids and recovery breaks',
    'Ergonomic assessments, worker consultation and review frequency',
    'Assessment records, reported symptoms and corrective actions',
  ]),
  condition('sanitation', 'Sanitation and washing facilities', 'OSHA 2007, Sec. 50', 'health', [
    'Toilets, handwashing points and changing facilities by work area',
    'Inadequate access, cleanliness, privacy or availability of water',
    'Suitable capacity, cleaning, handwashing supplies and maintenance',
    'Facility inspections and cleaning frequency',
    'Inspection records, worker feedback and corrective actions',
  ]),
  condition('drinking-water', 'Drinking water', 'OSHA 2007, Sec. 91', 'health', [
    'Drinking-water sources and points of access',
    'Contamination, insufficient supply and access-related risks',
    'Potable supply, protected storage, clean dispensers and safe access',
    'Water-quality checks, cleaning and replenishment frequency',
    'Test results, maintenance records and corrective actions',
  ]),
  condition('welfare-facilities', 'Welfare facilities', 'OSHA 2007, Sec. 92–95', 'health', [
    'Rest areas, changing rooms, lockers, eating areas and other amenities',
    'Capacity, hygiene, privacy, accessibility and suitability for workers',
    'Adequate facilities, separation where required and cleaning controls',
    'Facility inspections, maintenance and accessibility reviews',
    'Inspection records, worker feedback and corrective actions',
  ]),
  condition('first-aid', 'First aid and emergency care', 'First Aid Rules 1977', 'health', [
    'First aid rooms, boxes, trained first aiders and shift coverage',
    'Likely injuries, response delays and access limitations',
    'Equipment, emergency communication and referral / ambulance arrangements',
    'First aider training, equipment checks and case review frequency',
    'Training certificates, stock checks, attended cases and corrective actions',
  ]),
  condition('occupational-hygiene', 'Occupational hygiene and exposure control', 'OSHA 2007, Sec. 101', 'health', [
    'Workplace agents, processes and exposed worker groups',
    'Chemical, biological, physical and other occupational exposures',
    'Exposure elimination, engineering controls and safe work practices',
    'Hygiene surveys, sampling and control effectiveness reviews',
    'Exposure records, health trends and corrective actions',
  ]),
  condition('medical-surveillance', 'Medical surveillance and health records', 'OSHA 2007, Sec. 101', 'health', [
    'Roles and exposures requiring medical surveillance',
    'Work-related symptoms, trends and fitness-for-work concerns',
    'Pre-placement / periodic checks, referral and confidentiality controls',
    'Surveillance schedule and competent health provider',
    'Aggregated surveillance records, referrals and improvement actions',
  ]),
] as const;

export const AUDIT_SECTIONS = [...basicSections, ...policySections, ...conditionSections] as const;

export type AuditSectionId = (typeof AUDIT_SECTIONS)[number]['id'];
export type AuditAssessment = 'compliant' | 'needs_attention' | 'not_applicable';
export type AuditResponse = {
  assessment?: AuditAssessment;
  notes?: string;
  answers?: Record<string, string>;
};
export type AuditResponses = Partial<Record<AuditSectionId, AuditResponse>>;

export const REQUIRED_AUDIT_ANSWERS: Partial<Record<AuditSectionId, string[]>> = Object.fromEntries(
  AUDIT_SECTIONS.map((section) => [section.id, section.fields.filter((item) => item.required).map((item) => item.key)]),
);

export function isAuditSectionComplete(sectionId: AuditSectionId, responses: AuditResponses) {
  const response = responses[sectionId];
  if (!response?.assessment) return false;
  const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return false;
  return section.fields.every((item) => {
    const required = item.required || (sectionId === 'contact-details' && item.key === 'otherCountryCode' && response.answers?.countryCode === 'other');
    return !required || Boolean(response.answers?.[item.key]?.trim());
  });
}

export function isAuditEvidenceRequired(sectionId: AuditSectionId, responses: AuditResponses) {
  const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
  if (!section || !('evidenceRequiredIf' in section) || !section.evidenceRequiredIf) return false;
  const answers = responses[sectionId]?.answers ?? {};
  return section.evidenceRequiredIf.some((key) => {
    const value = answers[key];
    return value !== undefined && value !== '' && value !== 'no' && value !== 'not_applicable' && value !== 'not_available';
  });
}

export function getAuditProgress(responses: AuditResponses) {
  const completed = AUDIT_SECTIONS.filter((section) => isAuditSectionComplete(section.id, responses)).length;
  return {
    completed,
    total: AUDIT_SECTIONS.length,
    percent: Math.round((completed / AUDIT_SECTIONS.length) * 100),
  };
}

export function validateAuditResponses(value: unknown): { responses: AuditResponses; errors: string[] } {
  const errors: string[] = [];
  const responses: AuditResponses = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { responses, errors: ['Audit responses must be an object'] };
  }

  for (const [sectionId, rawResponse] of Object.entries(value)) {
    const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
    if (!section || !rawResponse || typeof rawResponse !== 'object' || Array.isArray(rawResponse)) {
      errors.push(`Invalid audit section: ${sectionId}`);
      continue;
    }

    const input = rawResponse as Record<string, unknown>;
    const assessment = input.assessment;
    if (assessment !== undefined && !['compliant', 'needs_attention', 'not_applicable'].includes(String(assessment))) {
      errors.push(`${section.title}: invalid assessment`);
      continue;
    }
    const notes = input.notes;
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 4000)) {
      errors.push(`${section.title}: notes must be 4,000 characters or fewer`);
      continue;
    }
    const rawAnswers = input.answers;
    if (rawAnswers !== undefined && (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers))) {
      errors.push(`${section.title}: answers must be an object`);
      continue;
    }

    const answers: Record<string, string> = {};
    let invalidAnswer = false;
    for (const [key, rawAnswer] of Object.entries((rawAnswers ?? {}) as Record<string, unknown>)) {
      const definition = section.fields.find((item) => item.key === key);
      if (!definition || typeof rawAnswer !== 'string' || rawAnswer.length > 4000) {
        errors.push(`${section.title}: invalid answer for ${key}`);
        invalidAnswer = true;
        continue;
      }
      const answer = rawAnswer.trim();
      if (definition.kind === 'number' && answer && (!/^\d{1,7}$/.test(answer) || Number(answer) > 1_000_000)) {
        errors.push(`${definition.label} must be a non-negative whole number`);
        invalidAnswer = true;
        continue;
      }
      if (definition.kind === 'email' && answer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
        errors.push(`${definition.label} must be a valid email address`);
        invalidAnswer = true;
        continue;
      }
      if (definition.kind === 'select' && answer && !definition.options?.some((option) => option.value === answer)) {
        errors.push(`${definition.label} has an invalid selection`);
        invalidAnswer = true;
        continue;
      }
      answers[key] = rawAnswer;
    }
    if (invalidAnswer) continue;
    if (section.id === 'contact-details' && answers.countryCode === 'other' && !answers.otherCountryCode?.trim()) {
      errors.push('Enter the other country calling code');
      continue;
    }

    responses[section.id] = {
      ...(assessment ? { assessment: assessment as AuditAssessment } : {}),
      ...(typeof notes === 'string' ? { notes } : {}),
      answers,
    };
  }

  return { responses, errors };
}
