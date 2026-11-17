import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';

export const AUDIT_CATEGORIES = [
  { id: 'basic', title: 'Basic details', description: 'Workplace identity, contact, location and worker data.' },
  { id: 'policies', title: 'Safety and health policies', description: 'Policies, occupational health services, programmes and emergency planning.' },
  { id: 'conditions', title: 'Safety, health and welfare conditions', description: 'Workplace safety, occupational hygiene and welfare conditions.' },
] as const;

export type AuditFieldKind = 'text' | 'textarea' | 'number' | 'decimal' | 'email' | 'tel' | 'date' | 'select' | 'multi-select';
export type AuditFieldOption = { value: string; label: string };
export type AuditField = {
  key: string;
  label: string;
  kind: AuditFieldKind;
  required: boolean;
  options?: readonly AuditFieldOption[];
  hint?: string;
  legacy?: boolean;
  exclusiveOptions?: readonly string[];
  allowCustomOption?: boolean;
};
export type AuditEvidenceField = {
  key: string;
  label: string;
  required?: boolean;
  requiredIf?: { answerKey: string; values: readonly string[] };
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

const COMPLIANCE = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partially_compliant', label: 'Partially compliant' },
  { value: 'non_compliant', label: 'Non-compliant' },
  { value: 'not_applicable', label: 'Not applicable' },
] as const;

const ADEQUACY = [
  { value: 'adequate', label: 'Adequate' },
  { value: 'partially_adequate', label: 'Partially adequate' },
  { value: 'inadequate', label: 'Inadequate' },
  { value: 'not_provided', label: 'Not provided' },
] as const;

const INDUSTRIES = [
  'Food & beverage manufacturing',
  'Grain milling',
  'Construction',
  'Chemical & pharmaceutical',
  'Textile & apparel',
  'Metal fabrication & engineering',
  'Transport, storage & logistics',
  'Agriculture & horticulture',
  'Mining & quarrying',
  'Energy & utilities',
  'Hospitality & tourism',
  'Healthcare',
  'Education',
  'Retail & wholesale trade',
  'ICT & professional services',
  'Other',
] as const;

function field(
  key: string,
  label: string,
  kind: AuditFieldKind = 'textarea',
  options?: readonly AuditFieldOption[],
  hint?: string,
  required = true,
  allowCustomOption = false,
): AuditField {
  return {
    key,
    label,
    kind,
    required,
    options,
    hint,
    ...(allowCustomOption ? { allowCustomOption: true } : {}),
  };
}

function multiField(
  key: string,
  label: string,
  labels: readonly string[],
  exclusiveOptions: readonly string[] = [],
  required = true,
): AuditField {
  return {
    ...field(
      key,
      label,
      'multi-select',
      labels.map((value) => ({ value, label: value })),
      undefined,
      required,
    ),
    ...(exclusiveOptions.length ? { exclusiveOptions } : {}),
  };
}

function yesNoField(key: string, label: string, required = true) {
  return field(key, label, 'select', YES_NO_NA, undefined, required);
}

function evidenceField(
  key: string,
  label: string,
  required = false,
  requiredIf?: AuditEvidenceField['requiredIf'],
): AuditEvidenceField {
  return { key, label, required, requiredIf };
}

const basicSections = [
  {
    id: 'workplace-identification',
    category: 'basic',
    title: 'Workplace identification',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('workplaceName', 'Registered workplace name', 'text', undefined, undefined, false),
      field('registrationNumber', 'Workplace registration no.', 'text'),
      field('industryType', 'Type of industry', 'select', INDUSTRIES.map((value) => ({ value, label: value }))),
      field('industry', 'Additional industry activity details', 'text', undefined, undefined, false),
      field('occupierName', 'Name of occupier', 'text'),
      field('tradingName', 'Trading / business name', 'text', undefined, undefined, false),
      field('firstRegistrationDate', 'Date of first registration', 'date', undefined, undefined, false),
      field('kraPin', 'KRA PIN', 'text', undefined, undefined, false),
    ],
  },
  {
    id: 'contact-details',
    category: 'basic',
    title: 'Contact details',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('contactName', 'Primary workplace contact', 'text', undefined, undefined, false),
      field('contactEmail', 'Email address', 'email'),
      field('countryCode', 'Country calling code', 'select', [
        { value: '+254', label: '+254 — Kenya' },
        { value: '+255', label: '+255 — Tanzania' },
        { value: '+256', label: '+256 — Uganda' },
        { value: '+250', label: '+250 — Rwanda' },
        { value: '+211', label: '+211 — South Sudan' },
        { value: '+251', label: '+251 — Ethiopia' },
        { value: '+1', label: '+1 — Other' },
        { value: 'other', label: 'Other' },
      ]),
      field('otherCountryCode', 'Other country calling code', 'text', undefined, 'Enter the international code when “Other” is selected.', false),
      field('contactPhone', 'Phone number', 'tel'),
      field('alternativePhone', 'Alternative phone no.', 'tel', undefined, undefined, false),
      field('website', 'Website', 'text', undefined, undefined, false),
    ],
  },
  {
    id: 'physical-location',
    category: 'basic',
    title: 'Physical location',
    law: 'OSHA 2007, Sec. 44',
    fields: [
      field('county', 'County', 'select', KENYAN_COUNTIES.map((value) => ({ value, label: value })), undefined, true, true),
      field('subCounty', 'Sub-county', 'text'),
      field('poBox', 'P.O. Box', 'text'),
      field('town', 'Town / locality', 'text'),
      field('streetAddress', 'Street address / directions', 'textarea', undefined, undefined, false),
      field('nearestLandmark', 'Nearest landmark', 'text', undefined, undefined, false),
      field('gpsCoordinates', 'GPS coordinates', 'text', undefined, 'Enter latitude and longitude, e.g. -1.3086, 36.8517.', false),
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
      field('permanentWorkers', 'Permanent workers', 'number', undefined, undefined, false),
      field('contractWorkers', 'Contract workers', 'number', undefined, undefined, false),
      field('temporaryWorkers', 'Temporary / casual workers', 'number', undefined, undefined, false),
      field('apprenticesInterns', 'Apprentices, interns and attachés', 'number', undefined, undefined, false),
      field('expatriateWorkers', 'Expatriate employees', 'number', undefined, undefined, false),
      field('nightShiftWorkers', 'Workers on night shift', 'number', undefined, undefined, false),
      field('youngWorkers', 'Young persons (16–18 years)', 'number', undefined, undefined, false),
      field('shiftPattern', 'Shift pattern and working hours', 'textarea', undefined, undefined, false),
      field('workerCountAsOf', 'Worker count as of', 'date', undefined, undefined, false),
    ],
  },
] as const;

const requiredBasicAnswers: Record<(typeof basicSections)[number]['id'], readonly string[]> = {
  'workplace-identification': ['registrationNumber', 'industryType', 'occupierName'],
  'contact-details': ['contactEmail', 'countryCode', 'contactPhone'],
  'physical-location': ['county', 'subCounty', 'poBox', 'town'],
  'workers-data': ['totalWorkers', 'maleWorkers', 'femaleWorkers', 'workersWithDisabilities'],
};

const supplementalBasicAnswers: Record<(typeof basicSections)[number]['id'], readonly string[]> = {
  'workplace-identification': ['workplaceName', 'industry'],
  'contact-details': ['contactName', 'otherCountryCode'],
  'physical-location': [],
  'workers-data': ['temporaryWorkers', 'workerCountAsOf'],
};

const normalizedBasicSections = basicSections.map((section) => ({
  ...section,
  fields: section.fields.map((item) => ({
    ...item,
    required: requiredBasicAnswers[section.id].includes(item.key),
    ...(supplementalBasicAnswers[section.id].includes(item.key) ? { legacy: true } : {}),
  })),
}));

const policySections = [
  {
    id: 'policy-statement',
    category: 'policies',
    title: 'Safety and health policy statement and licences',
    law: 'OSHA 2007, Sec. 7',
    fields: [
      yesNoField('policyInPlace', 'Written safety and health policy in place'),
      field('policyStatus', 'Safety and health policy statement status', 'select', AVAILABILITY),
      field('policyApprovedBy', 'Signed by (name and title)', 'text'),
      field('policySignedDate', 'Date signed', 'date'),
      field('policyReviewDate', 'Last review date', 'date'),
      field('policyDisplayed', 'Policy displayed at conspicuous places', 'select', COMPLIANCE),
      multiField('policyLanguages', 'Languages the policy is communicated in', ['English', 'Kiswahili', 'Other local language']),
      field('workplaceLicences', 'Relevant workplace safety and health licences', 'textarea'),
      field('licenceStatus', 'Licence status', 'select', AVAILABILITY),
      field('policyCommunication', 'How the policy is communicated to workers', 'textarea'),
    ],
    evidenceFields: [
      evidenceField('signed-policy', 'Upload signed safety and health policy statement', false, { answerKey: 'policyInPlace', values: ['yes'] }),
      evidenceField('safety-health-licences', 'Upload safety and health licences / certificates held'),
      evidenceField('dosh-registration', 'Upload DOSHS certificate of workplace registration'),
    ],
  },
  {
    id: 'safety-officer',
    category: 'policies',
    title: 'Person responsible for safety at the workplace',
    law: 'OSHA 2007, Sec. 9 & 11',
    fields: [
      field('safetyOfficerName', 'Full name', 'text'),
      field('safetyOfficerJobTitle', 'Designation', 'text'),
      field('safetyOfficerEmail', 'Email address', 'email'),
      field('safetyOfficerPhone', 'Phone no.', 'tel'),
      field('safetyOfficerAppointmentStatus', 'Appointment status', 'select', [
        { value: 'full_time', label: 'Full-time' },
        { value: 'part_time', label: 'Part-time' },
        { value: 'shared', label: 'Shared with other duties' },
        { value: 'outsourced', label: 'Outsourced consultant' },
      ]),
      field('safetyOfficerAppointmentDate', 'Appointment date', 'date'),
      field('academicQualifications', 'Academic qualifications', 'textarea'),
      field('professionalQualifications', 'Professional qualifications and memberships', 'textarea'),
      field('safetyOfficerExperience', 'Relevant experience and responsibilities', 'textarea'),
      field('doshsApprovalNumber', 'DOSHS approval / registration no.', 'text'),
      field('lastCpdDate', 'Date of last continuing professional development', 'date', undefined, undefined, false),
      field('qualificationsEvidenceAvailable', 'Supporting qualification documents available', 'select', YES_NO_NA),
    ],
    evidenceFields: [
      evidenceField('academic-certificates', 'Upload academic certificates', true),
      evidenceField('professional-certificates', 'Upload professional certificates / practising licence', true),
      evidenceField('appointment-letter', 'Upload letter of appointment'),
    ],
  },
  {
    id: 'occupational-health',
    category: 'policies',
    title: 'Occupational health provisions',
    law: 'OSHA 2007, Sec. 51',
    fields: [
      field('healthClinicAvailable', 'Health clinic available on site', 'select', YES_NO_NA),
      field('healthClinicHours', 'Clinic operating hours', 'select', [
        { value: '24_hours', label: '24 hours' },
        { value: 'day_shift', label: 'Day shift only' },
        { value: 'scheduled_days', label: 'Scheduled clinic days' },
        { value: 'not_applicable', label: 'Not applicable' },
      ]),
      field('healthClinicDetails', 'Clinic services and provider', 'textarea', undefined, undefined, false),
      yesNoField('dedicatedFirstAidRoom', 'Dedicated first aid room provided'),
      field('firstAidRooms', 'Number of first aid rooms', 'number'),
      field('firstAidBoxes', 'Number of first aid boxes', 'number'),
      field('firstAidBoxLocations', 'Location of first aid boxes and person in charge of each', 'textarea'),
      field('firstAidBoxContents', 'First aid box contents against the statutory list', 'select', ADEQUACY),
      field('trainedFirstAiders', 'Number of trained first aiders', 'number'),
      field('ambulanceArrangement', 'Ambulance arrangement', 'select', [
        { value: 'own', label: 'Own ambulance on site' },
        { value: 'on_call', label: 'Ambulance on call / retainer' },
        { value: 'public_service', label: 'Public emergency service only' },
        { value: 'none', label: 'None' },
      ]),
      field('ambulances', 'Number of ambulances available', 'number'),
      field('referralHospitals', 'Referral hospitals and their distance from the workplace', 'textarea'),
      field('attendedCasesThisYear', 'Cases attended during the reporting year', 'number'),
      field('caseBreakdown', 'Breakdown of cases attended', 'textarea', undefined, undefined, false),
      field('healthPersonnel', 'Health personnel engaged (cadre, number, registration no.)', 'textarea'),
      yesNoField('medicalInsuranceProvided', 'Medical insurance scheme provided'),
      field('medicalInsurance', 'Insurance provider / scheme name and eligible workers', 'textarea', undefined, undefined, false),
      field('medicalInsuranceCoveredEmployees', 'Number of employees covered', 'number'),
      field('medicalInsuranceScope', 'Scope of cover', 'select', [
        { value: 'inpatient', label: 'Inpatient only' },
        { value: 'inpatient_outpatient', label: 'Inpatient and outpatient' },
        { value: 'full', label: 'Inpatient, outpatient and dental/optical' },
        { value: 'not_applicable', label: 'Not applicable' },
      ]),
      yesNoField('wibaCoverInForce', 'WIBA (Work Injury Benefits) cover in force'),
      yesNoField('statutoryMedicalExams', 'Statutory medical examinations conducted for exposed workers'),
      field('lastMedicalExamDate', 'Date of last medical examination round', 'date', undefined, undefined, false),
      field('healthProvisionsGaps', 'Service gaps or improvement actions', 'textarea', undefined, undefined, false),
    ],
    evidenceFields: [evidenceField('medical-wiba-documents', 'Upload medical scheme / WIBA policy documents', true)],
  },
  {
    id: 'health-programmes',
    category: 'policies',
    title: 'Occupational health programmes',
    law: 'OSHA 2007, Sec. 6(2)',
    fields: [
      multiField('healthProgrammes', 'Health programmes at the workplace', [
        'Counselling / employee assistance',
        'Health education & promotion',
        'Hearing conservation',
        'Rehabilitation & return to work',
        'HIV/AIDS workplace programme',
        'Alcohol & substance abuse',
        'Non-communicable disease screening',
        'Reproductive & maternal health',
        'Immunisation',
        'Mental health & stress management',
        'Respiratory health surveillance',
        'Ergonomics & MSD prevention',
        'None identified',
      ], ['None identified']),
      field('counsellingProgramme', 'Employee counselling programme', 'select', YES_NO_NA),
      field('healthEducationProgramme', 'Health education programme', 'select', YES_NO_NA),
      field('hearingConservationProgramme', 'Hearing conservation programme', 'select', YES_NO_NA),
      field('rehabilitationProgramme', 'Rehabilitation / return-to-work programme', 'select', YES_NO_NA),
      field('programmeDelivery', 'Describe how each selected programme is delivered', 'textarea'),
      field('programmeFrequency', 'Delivery frequency', 'select', [
        { value: 'continuous', label: 'Continuous' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'biannually', label: 'Bi-annually' },
        { value: 'annually', label: 'Annually' },
        { value: 'ad_hoc', label: 'Ad hoc' },
      ]),
      field('programmeProvider', 'Programme provider / facilitator', 'text'),
      field('programmeParticipants', 'Number of workers who participated during the year', 'number'),
      yesNoField('programmeBudgetAllocated', 'Dedicated annual budget allocated'),
      field('otherHealthProgrammes', 'Other occupational health programmes', 'textarea', undefined, undefined, false),
      field('programmeCoverage', 'Who is covered and responsible person', 'textarea', undefined, undefined, false),
      field('programmeResults', 'Participation, outcomes and improvement needs', 'textarea', undefined, undefined, false),
    ],
    evidenceFields: [evidenceField('programme-support', 'Upload supporting evidence (attendance registers, reports, photos)', true)],
  },
  {
    id: 'information-systems',
    category: 'policies',
    title: 'Safety and health information systems',
    law: 'OSHA 2007, Sec. 13',
    fields: [
      field('operationalManuals', 'Operational / safe-work manuals available', 'select', AVAILABILITY),
      field('manualsList', 'List the operational manuals held', 'textarea'),
      yesNoField('safetyDataSheetsAvailable', 'Safety data sheets available for all chemicals held'),
      field('safetyDataSheetsAccess', 'Accessibility of safety data sheets at point of use', 'select', ADEQUACY),
      multiField('statutoryRegisters', 'Statutory registers maintained', [
        'General register (Form DOSH 2)',
        'Risk assessment register',
        'PPE issuance register',
        'First aid treatment register',
        'Training register',
        'Plant examination register',
        'Chemical inventory',
        'Fire equipment register',
        'Committee minutes file',
        'Contractor / visitor register',
        'None maintained',
      ], ['None maintained']),
      field('documentControlStatus', 'Document control and version management', 'select', ADEQUACY),
      yesNoField('recordsKeptDigitally', 'Records kept digitally / in a management system'),
      field('incidentRecords', 'Incident and occupational disease records maintained', 'select', YES_NO_NA, undefined, false),
      field('inspectionRecords', 'Inspection and maintenance records maintained', 'select', YES_NO_NA, undefined, false),
      field('trainingRecords', 'Safety training records maintained', 'select', YES_NO_NA, undefined, false),
      field('documentControl', 'Document owner, review frequency and version control', 'textarea', undefined, undefined, false),
      field('informationAccess', 'How workers access safety information and report hazards', 'textarea'),
    ],
    evidenceFields: [
      evidenceField('manual-sample', 'Upload sample operational manual / index of manuals', false, { answerKey: 'operationalManuals', values: ['available', 'needs_review'] }),
      evidenceField('register-sample', 'Upload sample statutory register extract'),
    ],
  },
  {
    id: 'permits-to-work',
    category: 'policies',
    title: 'Permits to work and dangerous processes',
    law: 'OSHA 2007, Sec. 6(3) & 82',
    fields: [
      yesNoField('permitSystemInPlace', 'Permit to work system in place'),
      multiField('permitProcesses', 'Dangerous work processes requiring a permit to work', [
        'Hot work (welding, cutting, grinding)',
        'Confined space entry',
        'Working at height above 2 metres',
        'Electrical isolation / lockout–tagout',
        'Excavation and trenching',
        'Lifting operations with cranes / hoists',
        'Work on pressure systems and boilers',
        'Chemical cleaning and line breaking',
        'Radiography / non-destructive testing',
        'Roof work and fragile surfaces',
        'Work over or near water',
        'Live electrical work',
        'None identified',
      ], ['None identified']),
      field('permitIssuers', 'Permit issuing authority (name and title)', 'text'),
      field('permitApprovalAuthority', 'Permit approving authority', 'text'),
      field('permitsIssuedThisYear', 'Number of permits issued during the year', 'number'),
      field('permitMaximumValidity', 'Maximum permit validity', 'select', [
        { value: 'one_shift', label: 'One shift' },
        { value: '24_hours', label: '24 hours' },
        { value: '72_hours', label: '72 hours' },
        { value: 'task_duration', label: 'Task duration' },
        { value: 'other', label: 'Other' },
      ]),
      yesNoField('contractorsUsePermitSystem', 'Contractors are covered by the same permit system'),
      yesNoField('permitsClosedOut', 'Permits are formally closed out and filed'),
      field('permitProcessDescription', 'Describe the permit process from request to close-out', 'textarea'),
      field('dangerousProcesses', 'Additional dangerous work process details', 'textarea', undefined, undefined, false),
      field('permitTypes', 'Additional permit types and controls', 'textarea', undefined, undefined, false),
      field('permitControls', 'Isolation, gas testing, PPE and other pre-work controls', 'textarea', undefined, undefined, false),
      field('permitCloseout', 'How permits are monitored, closed and retained', 'textarea', undefined, undefined, false),
    ],
    evidenceFields: [evidenceField('sample-permit', 'Upload sample completed permit to work', true)],
  },
  {
    id: 'emergency-response',
    category: 'policies',
    title: 'Emergency response plan',
    law: 'OSHA 2007, Sec. 6(2)(f)',
    fields: [
      yesNoField('emergencyPlanInPlace', 'Documented emergency response plan in place'),
      field('emergencyPlanStatus', 'Emergency response plan status', 'select', AVAILABILITY),
      field('emergencyPlanReviewDate', 'Date plan was last reviewed', 'date'),
      multiField('emergencyScenariosList', 'Emergency scenarios covered', [
        'Fire and explosion',
        'Chemical spill or release',
        'Medical emergency',
        'Structural collapse',
        'Machinery entrapment',
        'Flooding',
        'Power failure',
        'Bomb threat / security incident',
        'Disease outbreak',
        'Confined space rescue',
        'Other',
      ]),
      field('responseTeamMembers', 'Number of emergency response team members', 'number'),
      field('drillsPerYear', 'Emergency drills conducted during the year', 'number'),
      field('lastEmergencyDrillDate', 'Date of last drill', 'date'),
      field('evacuationTime', 'Last recorded evacuation time', 'text'),
      field('emergencyCoordinator', 'Emergency coordinator and response team', 'textarea'),
      field('evacuationAssembly', 'Evacuation routes and assembly points', 'textarea'),
      field('emergencyContacts', 'Emergency contacts and referral arrangements', 'textarea'),
      yesNoField('mutualAidAgreement', 'Mutual aid agreement with neighbouring premises or county services'),
      field('escapeRouteStatus', 'Escape route signage and emergency lighting', 'select', COMPLIANCE),
      field('emergencyScenarios', 'Additional emergency scenario details', 'textarea', undefined, undefined, false),
      field('emergencyEquipment', 'Emergency equipment and inspection arrangements', 'textarea', undefined, undefined, false),
    ],
    evidenceFields: [
      evidenceField('emergency-plan', 'Upload emergency response plan', false, { answerKey: 'emergencyPlanInPlace', values: ['yes'] }),
      evidenceField('emergency-drills', 'Upload drill reports and debrief records', true),
    ],
  },
] as const;

const requiredPolicyAnswers: Record<(typeof policySections)[number]['id'], readonly string[]> = {
  'policy-statement': ['policyInPlace'],
  'safety-officer': ['safetyOfficerName', 'academicQualifications'],
  'occupational-health': [
    'healthClinicAvailable',
    'dedicatedFirstAidRoom',
    'firstAidBoxes',
    'trainedFirstAiders',
    'referralHospitals',
    'attendedCasesThisYear',
    'healthPersonnel',
    'medicalInsuranceProvided',
  ],
  'health-programmes': ['healthProgrammes', 'programmeDelivery'],
  'information-systems': ['operationalManuals'],
  'permits-to-work': ['permitSystemInPlace', 'permitProcesses', 'permitIssuers'],
  'emergency-response': ['emergencyPlanInPlace', 'responseTeamMembers', 'drillsPerYear'],
};

const supplementalPolicyAnswers: Record<(typeof policySections)[number]['id'], readonly string[]> = {
  'policy-statement': ['policyStatus', 'workplaceLicences', 'licenceStatus'],
  'safety-officer': ['safetyOfficerAppointmentDate', 'safetyOfficerExperience', 'qualificationsEvidenceAvailable'],
  'occupational-health': ['firstAidRooms', 'wibaCoverInForce', 'healthProvisionsGaps'],
  'health-programmes': [
    'counsellingProgramme',
    'healthEducationProgramme',
    'hearingConservationProgramme',
    'rehabilitationProgramme',
    'otherHealthProgrammes',
    'programmeCoverage',
    'programmeResults',
  ],
  'information-systems': ['incidentRecords', 'inspectionRecords', 'trainingRecords', 'documentControl'],
  'permits-to-work': ['dangerousProcesses', 'permitTypes', 'permitControls', 'permitCloseout'],
  'emergency-response': ['emergencyPlanStatus', 'emergencyCoordinator', 'emergencyScenarios', 'emergencyEquipment'],
};

const normalizedPolicySections = policySections.map((section) => ({
  ...section,
  fields: section.fields.map((item) => ({
    ...item,
    required: requiredPolicyAnswers[section.id].includes(item.key),
    ...(supplementalPolicyAnswers[section.id].includes(item.key) ? { legacy: true } : {}),
  })),
}));

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
  optional?: boolean;
  fields: readonly AuditField[];
  evidenceFields?: readonly AuditEvidenceField[];
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

const referenceConditionFields: Partial<Record<ConditionSectionId, readonly AuditField[]>> = {
  'machine-safety': [
    field('machinesInUse', 'Total number of machines in use', 'number'),
    field('machineGuarding', 'Guarding of dangerous parts', 'select', COMPLIANCE),
    field('machinesWithoutGuards', 'Machines found without adequate guards', 'number'),
    yesNoField('interlockedGuards', 'Interlocked guards fitted where access is required'),
    yesNoField('lockoutTagoutUsed', 'Lockout–tagout procedure in place and used'),
    yesNoField('emergencyStopsTested', 'Emergency stops fitted, accessible and tested'),
    field('emergencyStopsTestDate', 'Date emergency stops were last tested', 'date'),
    yesNoField('machineryRegisterMaintained', 'Machinery register maintained'),
    field('authorisedOperators', 'Number of trained and authorised operators', 'number'),
    field('preventiveMaintenance', 'Planned preventive maintenance regime', 'select', ADEQUACY),
    yesNoField('machineSopsDisplayed', 'Written safe operating procedures displayed at machines'),
    field('machineObservations', 'Observations, defects noted and corrective action taken', 'textarea'),
  ],
  'chemical-safety': [
    field('hazardousSubstanceCount', 'Number of hazardous substances held', 'number'),
    field('chemicalLabelling', 'GHS labelling of containers', 'select', COMPLIANCE),
    field('chemicalStore', 'Segregated and bunded chemical store', 'select', COMPLIANCE),
    field('lastExposureMonitoringDate', 'Date of last exposure monitoring', 'date'),
    field('licensedWasteDisposal', 'Waste disposal through a NEMA-licensed handler', 'select', COMPLIANCE),
    field('licensedWasteContractor', 'Name of licensed waste contractor', 'text'),
    field('chemicalObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('chemicalInventoryMaintained', 'Up-to-date chemical inventory maintained'),
    yesNoField('safetyDataSheetsHeld', 'Safety data sheets available for every substance'),
    yesNoField('chemicalSpillKits', 'Spill kits provided and staff trained in their use'),
    yesNoField('chemicalExposureMonitoring', 'Personal exposure monitoring carried out'),
    yesNoField('chemicalPermitUsed', 'Chemical handling covered by permit to work'),
    yesNoField('chemicalTrainingDelivered', 'Chemical handling training delivered to exposed workers'),
  ],
  'plant-safety': [
    field('steamBoilers', 'Number of steam boilers', 'number'),
    field('airReceivers', 'Number of air receivers / pressure vessels', 'number'),
    field('liftingMachines', 'Number of lifting machines and appliances', 'number'),
    field('hoistsAndLifts', 'Number of hoists and lifts', 'number'),
    field('plantExaminer', 'Name of DOSHS-approved examiner used', 'text'),
    field('lastPlantExamination', 'Date of last statutory examination', 'date'),
    field('nextPlantExamination', 'Date next examination is due', 'date'),
    field('plantGeneralCondition', 'General condition of plant', 'select', COMPLIANCE),
    field('plantExaminerDefects', 'Defects reported by the examiner and action taken', 'textarea'),
    yesNoField('plantExaminedOnTime', 'All plant examined within statutory intervals'),
    yesNoField('plantCertificatesHeld', 'Valid examination certificates held on site'),
    yesNoField('operatorCertificatesValid', 'Operators hold valid competence certificates'),
  ],
  'electrical-safety': [
    field('electricalInstallationCondition', 'General condition of the electrical installation', 'select', COMPLIANCE),
    field('lastEarthTestDate', 'Date of last earth continuity / resistance test', 'date'),
    field('licensedElectrician', 'Licensed electrician / contractor used (ERC class)', 'text'),
    field('electricalObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('earthingTested', 'Earthing and bonding tested'),
    yesNoField('lightningProtectionTested', 'Lightning protection installed and tested'),
    yesNoField('rcdProtection', 'ELCB / RCD protection fitted on final circuits'),
    yesNoField('distributionBoardsSecured', 'Distribution boards labelled and kept locked'),
    yesNoField('liveConductorsProtected', 'No exposed live conductors or damaged insulation observed'),
    yesNoField('thermographicSurvey', 'Thermographic survey of panels carried out'),
    yesNoField('generatorSafe', 'Standby generator safely installed, earthed and ventilated'),
    yesNoField('electricalIsolationPermits', 'Electrical isolation permits used for maintenance'),
  ],
  'fire-safety': [
    field('lastFireRiskAssessment', 'Date of last fire risk assessment', 'date'),
    field('fireExtinguisherCount', 'Number of fire extinguishers', 'number'),
    field('hoseReelHydrantCount', 'Number of hose reels / hydrants', 'number'),
    field('lastFireAlarmTest', 'Date alarm was last tested', 'date'),
    field('meansOfEscape', 'Means of escape, exit signage and emergency lighting', 'select', COMPLIANCE, undefined, true, true),
    field('trainedFireMarshals', 'Number of trained fire marshals / fire team members', 'number'),
    field('fireCertificateExpiry', 'Fire certificate expiry date', 'date'),
    field('fireObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('fireRiskAssessmentByAuditor', 'Fire risk assessment carried out by a registered fire safety auditor'),
    yesNoField('extinguishersServiced', 'All extinguishers serviced within the last 12 months'),
    yesNoField('fireDetectionTested', 'Fire detection and alarm system installed and tested'),
    yesNoField('fireWaterSupply', 'Dedicated firefighting water supply available'),
    yesNoField('fireExitsClear', 'All exits unobstructed and openable from inside'),
    yesNoField('countyFireCertificate', 'Valid county fire safety certificate held'),
  ],
  'construction-safety': [
    field('constructionProjects', 'Current or recent projects and their duration', 'textarea'),
    yesNoField('scaffoldsInspected', 'Scaffolding erected and inspected by a competent person'),
    field('lastScaffoldInspection', 'Date of last scaffold inspection', 'date'),
    field('constructionWelfare', 'Welfare facilities on site (sanitation, water, shelter)', 'select', ADEQUACY, undefined, true, true),
    field('constructionObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('constructionWorkUndertaken', 'Construction or engineering works undertaken at this workplace'),
    yesNoField('contractorsPrequalified', 'Contractors prequalified on safety and health criteria'),
    yesNoField('constructionInduction', 'Site induction given to all workers and visitors'),
    yesNoField('fallProtectionUsed', 'Edge protection, nets or harness systems in use'),
    yesNoField('excavationsInspected', 'Excavations supported, barricaded and inspected'),
    yesNoField('constructionPlantCertified', 'Construction plant holds valid examination certificates'),
    yesNoField('constructionPpeEnforced', 'Helmets, boots and high-visibility clothing enforced on site'),
    yesNoField('constructionFirstAid', 'First aid provision on site'),
  ],
  'personal-protective-equipment': [
    multiField('ppeTypes', 'Personal protective equipment in use', [
      'Safety helmets',
      'Safety footwear',
      'Eye and face protection',
      'Hearing protection',
      'Respiratory protection',
      'Hand protection (gloves)',
      'Protective clothing / overalls',
      'High-visibility clothing',
      'Fall arrest harnesses',
      'Chemical aprons and suits',
      'Welding PPE',
      'Thermal / cold protection',
      'None identified',
    ], ['None identified']),
    field('ppeSuitability', 'Suitability of PPE for the hazards present', 'select', COMPLIANCE),
    field('ppeStorageCleaning', 'Storage, cleaning and maintenance arrangements', 'select', ADEQUACY, undefined, true, true),
    field('ppeReplacementPolicy', 'Replacement policy / interval', 'text'),
    field('ppeComplianceRate', 'Observed PPE compliance rate (%)', 'decimal'),
    field('ppeObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('ppeProvidedFree', 'PPE provided free of charge to workers'),
    yesNoField('ppeRegisterMaintained', 'PPE issuance register maintained and signed'),
    yesNoField('ppeUseTraining', 'Workers trained on correct use, limits and care of PPE'),
    yesNoField('respiratorFitTesting', 'Face-fit testing carried out for tight-fitting respirators'),
  ],
  ventilation: [
    multiField('ventilationTypes', 'Ventilation systems in use', [
      'Natural',
      'Mechanical general',
      'Local exhaust ventilation (LEV)',
      'Air conditioning',
      'Dilution ventilation',
      'None identified',
    ], ['None identified']),
    field('localExhaustSystems', 'Number of local exhaust ventilation systems', 'number'),
    field('lastAirflowTest', 'Date of last airflow / LEV performance test', 'date'),
    field('ventilationAdequacy', 'Adequacy of ventilation in work areas', 'select', COMPLIANCE),
    field('airChangesPerHour', 'Air changes per hour achieved (where measured)', 'decimal'),
    field('ventilationObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('airborneContaminantsControlled', 'Dust, fume and vapour controlled at source'),
    yesNoField('ventilationMaintenancePlan', 'Ventilation plant on a planned maintenance schedule'),
  ],
  overcrowding: [
    field('workRoomFloorArea', 'Total floor area of work rooms (m²)', 'decimal'),
    field('maximumRoomOccupancy', 'Maximum number of workers in one room', 'number'),
    field('spacePerWorker', 'Cubic space available per worker (m³)', 'decimal'),
    field('minimumSpaceCompliance', 'Compliance with minimum space requirement', 'select', COMPLIANCE),
    field('overcrowdingObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('occupancyNoticeDisplayed', 'Notice of permitted number of occupants displayed'),
    yesNoField('circulationSpaceMaintained', 'Adequate gangways and circulation space maintained'),
  ],
  housekeeping: [
    field('housekeepingStandard', 'General standard of housekeeping', 'select', COMPLIANCE),
    field('wasteSegregationRemoval', 'Waste segregation and removal', 'select', COMPLIANCE),
    field('housekeepingObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('cleaningSchedule', 'Documented cleaning schedule in place'),
    yesNoField('floorsClear', 'Floors free of spillages, oil and standing water'),
    yesNoField('materialsStoredSafely', 'Materials stored safely without obstructing exits or gangways'),
    yesNoField('workplaceOrganisationProgramme', '5S or equivalent workplace organisation programme'),
    yesNoField('combustibleDustControlled', 'Combustible dust accumulation controlled'),
  ],
  lighting: [
    multiField('lightingTypes', 'Lighting systems provided', [
      'Natural daylight',
      'Artificial general lighting',
      'Task lighting',
      'Emergency lighting',
    ]),
    field('generalIlluminance', 'Measured illuminance in general work areas (lux)', 'number'),
    field('taskIlluminance', 'Measured illuminance at detailed task areas (lux)', 'number'),
    field('lastLightingSurvey', 'Date of last lighting survey', 'date'),
    field('lightingAdequacy', 'Adequacy of lighting', 'select', COMPLIANCE),
    field('lightingObservations', 'Observations and corrective action taken', 'textarea'),
    yesNoField('glareControlled', 'Glare, flicker and shadow controlled'),
    yesNoField('emergencyLightingTested', 'Emergency lighting installed on escape routes and tested'),
    yesNoField('lightingMaintenance', 'Light fittings cleaned and failed lamps replaced promptly'),
  ],
  'handling-materials': [
    yesNoField('manualHandlingRiskAssessment', 'Manual handling risk assessment carried out'),
    field('heaviestManualLoad', 'Heaviest load handled manually (kg)', 'decimal'),
    yesNoField('mechanicalHandlingAids', 'Mechanical aids provided (trolleys, hoists, conveyors)'),
    yesNoField('manualHandlingTraining', 'Manual handling / kinetic lifting training delivered'),
    yesNoField('teamLiftingRules', 'Team lifting rules defined for heavy loads'),
    yesNoField('liftingTackleExamined', 'Lifting tackle marked with SWL and examined'),
    field('musculoskeletalInjuryCases', 'Musculoskeletal injury cases reported during the year', 'number'),
    field('rackingStoragePractice', 'Racking, stacking and storage practice', 'select', COMPLIANCE),
    field('handlingObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  noise: [
    yesNoField('competentNoiseSurvey', 'Noise survey carried out by a competent person'),
    field('lastNoiseSurvey', 'Date of last noise survey', 'date'),
    field('highestNoiseLevel', 'Highest measured noise level (dB(A))', 'decimal'),
    field('workersAboveNoiseLimit', 'Number of workers exposed above 85 dB(A)', 'number'),
    yesNoField('hearingProtectionZones', 'Hearing protection zones demarcated and signed'),
    yesNoField('hearingProtectionUsed', 'Suitable hearing protection provided and worn'),
    yesNoField('audiometricTesting', 'Baseline and periodic audiometric testing conducted'),
    field('workersAudiometricallyTested', 'Number of workers audiometrically tested this year', 'number'),
    field('engineeringNoiseControls', 'Engineering noise controls (enclosure, damping, silencers)', 'select', ADEQUACY),
    field('noiseObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  vibration: [
    multiField('vibrationSources', 'Sources of vibration', [
      'Hand-held power tools',
      'Compactors and rammers',
      'Forklifts and mobile plant',
      'Vibrating screens and mills',
      'Vehicles on rough ground',
      'None identified',
    ], ['None identified']),
    yesNoField('vibrationAssessed', 'Vibration exposure assessed'),
    field('handArmVibrationExposure', 'Hand-arm vibration exposure (m/s² A(8))', 'decimal'),
    field('wholeBodyVibrationExposure', 'Whole-body vibration exposure (m/s² A(8))', 'decimal'),
    yesNoField('lowVibrationTools', 'Low-vibration tools selected where reasonably practicable'),
    yesNoField('vibrationExposureLimited', 'Exposure time limited by job rotation or work scheduling'),
    yesNoField('vibrationHealthSurveillance', 'Health surveillance for vibration-exposed workers'),
    field('vibrationObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  radiation: [
    multiField('radiationSources', 'Radiation sources present', [
      'Industrial radiography',
      'Nuclear level / density gauges',
      'X-ray inspection equipment',
      'UV curing or welding arcs',
      'Lasers',
      'Microwave / RF equipment',
      'None identified',
    ], ['None identified']),
    yesNoField('knraLicenceHeld', 'Licence held from the Kenya Nuclear Regulatory Authority'),
    field('radiationLicenceExpiry', 'Licence expiry date', 'date'),
    field('radiationProtectionOfficer', 'Appointed radiation protection officer', 'text'),
    field('workersDoseMonitored', 'Number of workers under dose monitoring', 'number'),
    yesNoField('personalDosimetry', 'Personal dosimetry provided and results reviewed'),
    yesNoField('radiationShielding', 'Shielding, interlocks and controlled areas in place'),
    yesNoField('radiationWarningSigns', 'Warning signage and access control at source locations'),
    field('radiationObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  'thermal-conditions': [
    multiField('thermalStressSources', 'Sources of thermal stress', [
      'Boilers and furnaces',
      'Ovens and dryers',
      'Outdoor work in direct sun',
      'Cold rooms and freezers',
      'Hot process water / steam',
      'None identified',
    ], ['None identified']),
    field('highestWorkplaceTemperature', 'Highest workplace temperature recorded (°C)', 'decimal'),
    field('lowestWorkplaceTemperature', 'Lowest workplace temperature recorded (°C)', 'decimal'),
    yesNoField('heatStressIndexMeasured', 'WBGT or equivalent heat stress index measured'),
    field('thermalControls', 'Thermal control measures (shielding, cooling, insulation)', 'select', ADEQUACY),
    yesNoField('hotWorkWaterAndRest', 'Drinking water and rest breaks provided for hot work'),
    yesNoField('thermalAcclimatisation', 'Acclimatisation programme for new or returning workers'),
    yesNoField('thermalProtectiveClothing', 'Thermal protective clothing provided where required'),
    field('thermalObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  'pressure-systems': [
    multiField('pressureSystemTypes', 'Pressure systems in service', [
      'Steam boilers',
      'Air receivers and compressors',
      'Steam pipework',
      'LPG installations',
      'Hydraulic systems',
      'Gas cylinders',
      'Autoclaves',
      'None identified',
    ], ['None identified']),
    yesNoField('pressureGaugesCalibrated', 'Pressure gauges fitted, legible and within calibration'),
    yesNoField('pressureReliefValvesTested', 'Safety and relief valves tested and set correctly'),
    field('reliefValveTestDate', 'Date relief valves were last tested', 'date'),
    field('hydraulicPressureTestDate', 'Date of last hydraulic / pressure test', 'date'),
    yesNoField('gasCylindersSecured', 'Gas cylinders stored upright, secured and segregated'),
    yesNoField('boilerAttendantCertificates', 'Boiler and compressor attendants hold valid certificates'),
    yesNoField('airReceiversInspected', 'Air receivers drained and internally inspected'),
    field('pressureSystemObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  ergonomics: [
    yesNoField('ergonomicRiskAssessment', 'Ergonomic risk assessment carried out'),
    field('workstationDesign', 'Workstation design (height, reach, posture, seating)', 'select', ADEQUACY),
    yesNoField('displayScreenAssessments', 'Display screen equipment assessments for office workers'),
    yesNoField('ergonomicJobRotation', 'Job rotation or task variation to limit repetitive strain'),
    yesNoField('antiFatigueSupport', 'Anti-fatigue matting or seating for standing work'),
    field('musculoskeletalDisorderCases', 'Musculoskeletal disorder cases recorded during the year', 'number'),
    yesNoField('workerErgonomicConsultation', 'Workers consulted on workstation improvements'),
    yesNoField('ergonomicsTraining', 'Ergonomics awareness training delivered'),
    field('ergonomicObservations', 'Observations and corrective action taken', 'textarea'),
  ],
  'welfare-facilities': [
    field('maleToilets', 'Number of toilets for male workers', 'number'),
    field('femaleToilets', 'Number of toilets for female workers', 'number'),
    field('accessibleToilets', 'Number of accessible toilets for PWD', 'number'),
    field('sanitaryConvenienceRatio', 'Compliance with sanitary convenience ratio', 'select', COMPLIANCE),
    field('sanitaryFacilityCleanliness', 'Cleanliness of sanitary facilities', 'select', COMPLIANCE),
    yesNoField('washingFacilities', 'Washing facilities with soap and clean water provided'),
    yesNoField('wholesomeDrinkingWater', 'Wholesome drinking water provided and marked'),
    yesNoField('canteenOrEatingArea', 'Canteen or designated eating area provided'),
    yesNoField('changingRooms', 'Changing rooms provided and separated by sex'),
    yesNoField('lockersProvided', 'Lockers or clothing accommodation provided'),
    yesNoField('restRoomOrShelter', 'Rest room / shelter provided'),
    yesNoField('nursingRoom', 'Nursing or lactation room provided'),
    yesNoField('disabilityAccess', 'Workplace accessible to workers with disability'),
    yesNoField('staffHousingOrTransport', 'Staff housing or transport provided'),
    field('welfareObservations', 'Observations and corrective action taken', 'textarea'),
  ],
};

const referenceConditionEvidence: Partial<Record<ConditionSectionId, readonly AuditEvidenceField[]>> = {
  'machine-safety': [evidenceField('machinery-certificates', 'Upload machinery register / examination certificates')],
  'chemical-safety': [evidenceField('chemical-records', 'Upload chemical inventory / sample SDS / disposal notes')],
  'plant-safety': [evidenceField('plant-certificates', 'Upload statutory examination certificates', true)],
  'electrical-safety': [evidenceField('electrical-reports', 'Upload electrical test / inspection reports', true)],
  'fire-safety': [evidenceField('fire-reports', 'Upload fire audit report and county certificate', true)],
  'construction-safety': [evidenceField('construction-records', 'Upload site safety plan / inspection records')],
  'personal-protective-equipment': [evidenceField('ppe-records', 'Upload PPE register extract / supplier certificates')],
  ventilation: [evidenceField('ventilation-reports', 'Upload airflow test / LEV examination report')],
  housekeeping: [evidenceField('housekeeping-records', 'Upload housekeeping inspection records / photos')],
  lighting: [evidenceField('lighting-report', 'Upload lighting survey report')],
  'handling-materials': [evidenceField('handling-records', 'Upload handling assessment / training records')],
  noise: [evidenceField('noise-reports', 'Upload noise survey and audiometry summary', true)],
  radiation: [evidenceField('radiation-records', 'Upload licence and dosimetry reports')],
  'pressure-systems': [evidenceField('pressure-certificates', 'Upload pressure system test certificates')],
  ergonomics: [evidenceField('ergonomic-report', 'Upload ergonomic assessment report')],
  'welfare-facilities': [evidenceField('welfare-records', 'Upload welfare facility inspection records / photos')],
};

const requiredConditionAnswers: Partial<Record<ConditionSectionId, readonly string[]>> = {
  'machine-safety': ['machinesInUse', 'machineGuarding', 'lockoutTagoutUsed'],
  'chemical-safety': ['hazardousSubstanceCount', 'chemicalInventoryMaintained', 'safetyDataSheetsHeld'],
  'plant-safety': ['plantExaminedOnTime', 'plantCertificatesHeld'],
  'electrical-safety': ['electricalInstallationCondition', 'earthingTested'],
  'fire-safety': [
    'fireRiskAssessmentByAuditor',
    'fireExtinguisherCount',
    'extinguishersServiced',
    'meansOfEscape',
    'countyFireCertificate',
  ],
  'construction-safety': ['constructionWorkUndertaken'],
  'personal-protective-equipment': ['ppeTypes', 'ppeProvidedFree', 'ppeRegisterMaintained', 'ppeSuitability'],
  ventilation: ['ventilationAdequacy'],
  overcrowding: ['workRoomFloorArea', 'spacePerWorker', 'minimumSpaceCompliance'],
  housekeeping: ['housekeepingStandard'],
  lighting: ['lightingAdequacy'],
  'handling-materials': ['manualHandlingRiskAssessment', 'mechanicalHandlingAids'],
  noise: ['competentNoiseSurvey', 'workersAboveNoiseLimit'],
  vibration: [],
  radiation: [],
  'thermal-conditions': ['thermalControls'],
  'pressure-systems': ['pressureGaugesCalibrated', 'pressureReliefValvesTested'],
  ergonomics: ['ergonomicRiskAssessment', 'workstationDesign'],
  'welfare-facilities': [
    'maleToilets',
    'femaleToilets',
    'sanitaryConvenienceRatio',
    'washingFacilities',
    'wholesomeDrinkingWater',
    'disabilityAccess',
  ],
};

const enhancedConditionSections = conditionSections.map((section) => {
  const fields = referenceConditionFields[section.id];
  if (!fields) {
    return {
      ...section,
      optional: true,
      fields: section.fields.map((item) => ({ ...item, required: false, legacy: true })),
    };
  }
  const requiredKeys = requiredConditionAnswers[section.id] ?? [];
  return {
    ...section,
    optional: false,
    fields: [
      ...section.fields.map((item) => ({ ...item, required: false, legacy: true })),
      ...fields.map((item) => ({
        ...item,
        required: requiredKeys.includes(item.key),
      })),
    ],
    evidenceFields: referenceConditionEvidence[section.id] ?? [],
  };
});

export const AUDIT_SECTIONS = [...normalizedBasicSections, ...normalizedPolicySections, ...enhancedConditionSections] as const;

export type AuditSectionId = (typeof AUDIT_SECTIONS)[number]['id'];
export type AuditSection = (typeof AUDIT_SECTIONS)[number];
export type AuditAssessment = 'compliant' | 'needs_attention' | 'not_applicable';
export type AuditResponse = {
  assessment?: AuditAssessment;
  notes?: string;
  answers?: Record<string, string>;
};
export type AuditResponses = Partial<Record<AuditSectionId, AuditResponse>>;

export function isOptionalAuditSection(section: AuditSection) {
  return 'optional' in section && section.optional === true;
}

export function isAuditFieldRequired(sectionId: AuditSectionId, item: AuditField, answers?: Record<string, string>) {
  return item.required ||
    (sectionId === 'contact-details' && item.key === 'otherCountryCode' && answers?.countryCode === 'other');
}

export const REQUIRED_AUDIT_ANSWERS: Partial<Record<AuditSectionId, string[]>> = Object.fromEntries(
  AUDIT_SECTIONS.map((section) => [section.id, section.fields.filter((item) => item.required).map((item) => item.key)]),
);

export function parseAuditMultiSelect(value?: string) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item): item is string => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

function hasAnswer(fieldDefinition: AuditField, value?: string) {
  if (!value?.trim()) return false;
  if (fieldDefinition.kind !== 'multi-select') return true;
  const selected = parseAuditMultiSelect(value);
  return selected.length > 0 &&
    selected.every((option) => fieldDefinition.options?.some((item) => item.value === option)) &&
    !(selected.length > 1 && selected.some((option) => fieldDefinition.exclusiveOptions?.includes(option)));
}

export function isAuditSectionComplete(sectionId: AuditSectionId, responses: AuditResponses) {
  const response = responses[sectionId];
  if (!response?.assessment) return false;
  const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return false;
  return section.fields.every((item) => {
    return !isAuditFieldRequired(sectionId, item, response.answers) || hasAnswer(item, response.answers?.[item.key]);
  });
}

function hasLegacyRequiredEvidence(sectionId: AuditSectionId, responses: AuditResponses) {
  const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
  if (!section || !('evidenceRequiredIf' in section) || !section.evidenceRequiredIf) return false;
  const answers = responses[sectionId]?.answers ?? {};
  const requiredKeys: unknown = section.evidenceRequiredIf;
  if (!Array.isArray(requiredKeys)) return false;
  return requiredKeys.some((key: unknown) => {
    if (typeof key !== 'string') return false;
    const value = answers[key];
    return value !== undefined && value !== '' && value !== 'no' && value !== 'not_applicable' && value !== 'not_available';
  });
}

export function getRequiredAuditEvidence(sectionId: AuditSectionId, responses: AuditResponses) {
  const section = AUDIT_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return [];
  const answerValues = responses[sectionId]?.answers ?? {};
  const definitions = 'evidenceFields' in section ? section.evidenceFields ?? [] : [];
  const required = definitions.filter((item) =>
    item.required ||
    (item.requiredIf && item.requiredIf.values.includes(answerValues[item.requiredIf.answerKey] ?? '')),
  );
  if (required.length) return required;
  if (hasLegacyRequiredEvidence(sectionId, responses)) {
    return [{ key: 'supporting', label: 'Supporting evidence' }];
  }
  return [];
}

export function getMissingAuditEvidence(
  responses: AuditResponses,
  evidence: readonly { sectionId: string; fieldKey?: string | null }[],
) {
  return AUDIT_SECTIONS.flatMap((section) => {
    const missing = getRequiredAuditEvidence(section.id, responses).filter((required) =>
      !evidence.some((file) =>
        file.sectionId === section.id &&
        (required.key === 'supporting' ? !file.fieldKey : file.fieldKey === required.key),
      ),
    );
    return missing.map((item) => ({ sectionId: section.id, sectionTitle: section.title, ...item }));
  });
}

export function isAuditEvidenceRequired(sectionId: AuditSectionId, responses: AuditResponses) {
  return getRequiredAuditEvidence(sectionId, responses).length > 0;
}

export function formatAuditAnswer(fieldDefinition: AuditField | undefined, value: string) {
  if (!fieldDefinition) return value || '—';
  if (fieldDefinition.kind === 'multi-select') {
    const values = parseAuditMultiSelect(value);
    return values.length
      ? values.map((selected) => fieldDefinition.options?.find((option) => option.value === selected)?.label ?? selected).join(', ')
      : '—';
  }
  if (fieldDefinition.kind === 'select') {
    return fieldDefinition.options?.find((option) => option.value === value)?.label ?? value ?? '—';
  }
  return value || '—';
}

export function getAuditProgress(responses: AuditResponses) {
  const requiredSections = AUDIT_SECTIONS.filter((section) => !isOptionalAuditSection(section));
  const completed = requiredSections.filter((section) => isAuditSectionComplete(section.id, responses)).length;
  return {
    completed,
    total: requiredSections.length,
    percent: Math.round((completed / requiredSections.length) * 100),
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
      if (definition.kind === 'decimal' && answer && (!/^-?\d{1,7}(?:\.\d{1,3})?$/.test(answer) || Math.abs(Number(answer)) > 1_000_000)) {
        errors.push(`${definition.label} must be a valid number`);
        invalidAnswer = true;
        continue;
      }
      if (definition.kind === 'email' && answer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
        errors.push(`${definition.label} must be a valid email address`);
        invalidAnswer = true;
        continue;
      }
      if (definition.kind === 'select' && answer && !definition.allowCustomOption && !definition.options?.some((option) => option.value === answer)) {
        errors.push(`${definition.label} has an invalid selection`);
        invalidAnswer = true;
        continue;
      }
      if (definition.kind === 'multi-select' && answer) {
        const selected = parseAuditMultiSelect(answer);
        const valid = selected.length > 0 &&
          selected.every((option) => definition.options?.some((item) => item.value === option)) &&
          !(selected.length > 1 && selected.some((option) => definition.exclusiveOptions?.includes(option)));
        if (!valid) {
          errors.push(`${definition.label} has invalid selections`);
          invalidAnswer = true;
          continue;
        }
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
