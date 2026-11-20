export type FireAnswerChoice = 'yes' | 'no' | 'not_applicable' | 'further_information' | '';
export type FireAnswer = { choice: FireAnswerChoice; narration: string };
export type FireSafetyAuditData = {
  employerDetails: Record<string, string>;
  workersData: Record<string, string>;
  checklistAnswers: Record<string, FireAnswer>;
  furtherInformation: Record<string, string>;
};

export type FireAuditChoice = { value: Exclude<FireAnswerChoice, ''>; label: string };
export type FireAuditQuestion = {
  key: string;
  label: string;
  choices: readonly FireAuditChoice[];
};

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;

const YES_NO_NA_FI = [
  ...YES_NO,
  { value: 'not_applicable', label: 'N/A' },
  { value: 'further_information', label: 'F/I' },
] as const;

export const FIRE_SAFETY_SECTIONS: {
  id: string;
  title: string;
  description: string;
  questions?: readonly FireAuditQuestion[];
}[] = [
  {
    id: 'prevention',
    title: 'Prevention',
    description: 'Ignition sources, fuel storage, housekeeping and hot-work controls.',
    questions: [
      { key: 'flammable-storage', label: 'Are fuels, gases and other flammable products stored safely?', choices: YES_NO },
      { key: 'oxidisers-storage', label: 'Are oxygen cylinders and oxidising products stored to reduce fire risk?', choices: YES_NO },
      { key: 'incompatible-storage', label: 'Are materials that should not be stored together kept separate?', choices: YES_NO },
      { key: 'ignition-control', label: 'Are potential ignition sources identified and controlled?', choices: YES_NO },
      { key: 'arson-prevention', label: 'Are reasonable measures in place to reduce arson risk, including keeping combustible items away from buildings?', choices: YES_NO },
      { key: 'hot-work-control', label: 'Where hot work occurs, are the associated fire risks controlled?', choices: YES_NO },
      { key: 'hot-work-permit', label: 'Is a permit system used for hot work?', choices: YES_NO },
      { key: 'combustible-waste', label: 'Is combustible waste kept to a minimum and stored safely?', choices: YES_NO },
      { key: 'socket-safety', label: 'Are electrical sockets used safely and protected from overloading?', choices: YES_NO },
      { key: 'fixed-wiring-test', label: 'Has fixed electrical wiring been inspected and tested?', choices: YES_NO },
      { key: 'hazard-signage', label: 'Are signs used where needed to identify smoking restrictions, gas storage and flammable materials?', choices: YES_NO },
      { key: 'smoking-rules', label: 'Are workplace smoking rules followed?', choices: YES_NO },
      { key: 'ignition-separation', label: 'Are flammable materials kept away from ignition sources?', choices: YES_NO },
      { key: 'housekeeping', label: 'Are good housekeeping standards maintained?', choices: YES_NO },
      { key: 'explosive-atmosphere', label: 'Where a flammable or explosive atmosphere could occur, are risks assessed and controlled?', choices: YES_NO },
      { key: 'heating-equipment', label: 'Is heating and cooking equipment serviced, maintained and cleaned as needed?', choices: YES_NO },
    ],
  },
  {
    id: 'control-containment',
    title: 'Control and containment',
    description: 'Fire equipment, alarms, fire doors and protective systems.',
    questions: [
      { key: 'extinguisher-access', label: 'Are extinguishers, blankets and hose reels accessible, correctly located and in good condition?', choices: YES_NO },
      { key: 'extinguisher-service', label: 'Have fire extinguishers been serviced within the required six-month period?', choices: YES_NO },
      { key: 'fire-doors', label: 'Are fire doors kept shut or held open by a device that releases when the alarm sounds?', choices: YES_NO },
      { key: 'sprinkler-service', label: 'Where sprinklers are installed, are they routinely serviced?', choices: YES_NO },
      { key: 'specialist-systems', label: 'Where provided, are fire-fighting lifts and lightning-protection systems tested and maintained?', choices: YES_NO },
      { key: 'exit-direction-signs', label: 'Do directional signs guide occupants to fire exits?', choices: YES_NO },
      { key: 'fire-escape-condition', label: 'Are external metal fire escapes maintained in safe condition?', choices: YES_NO },
      { key: 'alarm-audibility', label: 'Can the fire alarm be heard throughout the buildings?', choices: YES_NO },
      { key: 'alarm-service', label: 'Is the fire alarm system routinely serviced?', choices: YES_NO },
      { key: 'alarm-panel', label: 'Does the alarm panel indicate that the system is operating correctly?', choices: YES_NO },
      { key: 'emergency-lighting', label: 'Is emergency lighting provided along internal and external escape routes?', choices: YES_NO },
      { key: 'assembly-point', label: 'Is a fire assembly point designated?', choices: YES_NO },
    ],
  },
  {
    id: 'means-of-escape',
    title: 'Means of escape',
    description: 'Escape routes and exits that occupants can identify and use.',
    questions: [
      { key: 'routes-clear', label: 'Are escape routes kept clear?', choices: YES_NO_NA_FI },
      { key: 'exits-openable', label: 'Can fire exits be opened promptly and without difficulty?', choices: YES_NO_NA_FI },
      { key: 'exits-identifiable', label: 'Are all fire exits clearly identifiable?', choices: YES_NO_NA_FI },
    ],
  },
  {
    id: 'procedures-training',
    title: 'Procedures, information and training',
    description: 'Emergency arrangements, staff responsibilities, training and drills.',
    questions: [
      { key: 'risk-assessment', label: 'Is the fire-risk assessment completed by the workplace team?', choices: YES_NO_NA_FI },
      { key: 'written-arrangements', label: 'Are written fire procedures in place that assign responsibilities and explain emergency actions?', choices: YES_NO_NA_FI },
      { key: 'roles-current', label: 'Are staff named in the fire procedures still assigned to those roles?', choices: YES_NO_NA_FI },
      { key: 'role-training', label: 'Have staff with specific fire-safety duties, such as marshals or alarm testers, been trained?', choices: YES_NO_NA_FI },
      { key: 'fire-manager', label: 'Is a responsible manager appointed and identified in the written fire arrangements?', choices: YES_NO_NA_FI },
      { key: 'alarm-awareness', label: 'Do staff know the sound of the fire alarm?', choices: YES_NO_NA_FI },
      { key: 'risk-assessment-tests', label: 'Are required checks identified by the fire-risk assessment completed and recorded?', choices: YES_NO_NA_FI },
      { key: 'drill-frequency', label: 'Are fire drills held at the frequency set by the risk assessment?', choices: YES_NO_NA_FI },
      { key: 'drill-records', label: 'Are drills recorded and are identified shortcomings followed up?', choices: YES_NO_NA_FI },
      { key: 'false-alarms', label: 'Are false alarms investigated and corrective measures taken where needed?', choices: YES_NO_NA_FI },
      { key: 'fire-action-notices', label: 'Are fire-action notices clearly displayed and properly completed?', choices: YES_NO_NA_FI },
      { key: 'staff-emergency-training', label: 'Have staff been trained in what to do when a fire occurs or the alarm sounds?', choices: YES_NO_NA_FI },
      { key: 'new-starter-induction', label: 'Are new staff briefed on the fire procedure on their first day?', choices: YES_NO_NA_FI },
      { key: 'extinguisher-training', label: 'Are enough staff, including fire marshals, trained to use extinguishers safely?', choices: YES_NO_NA_FI },
      { key: 'fire-brigade-contact', label: 'Are arrangements in place to contact the fire brigade?', choices: YES_NO_NA_FI },
      { key: 'visitor-supervision', label: 'Are visitors informed about emergency arrangements or supervised?', choices: YES_NO_NA_FI },
      { key: 'peep-plan', label: 'Are personal emergency evacuation plans prepared and kept current for staff who need them?', choices: YES_NO_NA_FI },
      { key: 'peep-support', label: 'Where a personal evacuation plan exists, are other staff trained to assist with it?', choices: YES_NO_NA_FI },
      { key: 'visitor-evacuation', label: 'Are special evacuation arrangements made for visitor groups that may need assistance?', choices: YES_NO_NA_FI },
      { key: 'routine-inspections', label: 'Are routine fire-safety inspections carried out?', choices: YES_NO_NA_FI },
    ],
  },
];

export const FIRE_EMPLOYER_FIELDS = [
  { key: 'registrationNumber', label: 'Workplace registration number', type: 'text' },
  { key: 'occupierName', label: 'Name of occupier', type: 'text' },
  { key: 'situation', label: 'Situation of workplace', type: 'text' },
  { key: 'county', label: 'County', type: 'text' },
  { key: 'subCounty', label: 'Sub-county', type: 'text' },
  { key: 'building', label: 'Building / workplace name', type: 'text' },
  { key: 'postalAddress', label: 'Postal address', type: 'text' },
  { key: 'postalCodeName', label: 'Postal code and post-office name', type: 'text' },
  { key: 'town', label: 'Town', type: 'text' },
  { key: 'telephone', label: 'Telephone', type: 'tel' },
  { key: 'mobilePhone', label: 'Mobile phone', type: 'tel' },
  { key: 'fax', label: 'Fax', type: 'text' },
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'industryType', label: 'Type of industry', type: 'text' },
] as const;

export const FIRE_WORKER_FIELDS = [
  { key: 'totalEmployees', label: 'Total number of employees', type: 'number' },
  { key: 'femaleEmployees', label: 'Number of female employees', type: 'number' },
  { key: 'maleEmployees', label: 'Number of male employees', type: 'number' },
  { key: 'under18Count', label: 'Number of persons below 18 years', type: 'number' },
  { key: 'under18Ages', label: 'Ages of persons below 18 years', type: 'text' },
  { key: 'safetyCommitteeChair', label: 'Safety and health committee chairperson', type: 'text' },
  { key: 'previousAuditor', label: 'Person who performed the previous audit', type: 'text' },
  { key: 'safetyLead', label: 'Person in charge of safety and health', type: 'text' },
  { key: 'internCount', label: 'Persons on attachment or internship', type: 'number' },
  { key: 'physicalChallengeCount', label: 'Persons with physical challenges', type: 'number' },
  { key: 'previousAuditDate', label: 'Date of previous audit', type: 'date' },
  { key: 'currentAuditDate', label: 'Date of current audit', type: 'date' },
  { key: 'registrationCertificateNumber', label: 'Workplace registration certificate number', type: 'number' },
  { key: 'registrationCertificateDate', label: 'Date of workplace registration certificate', type: 'date' },
] as const;

export const FIRE_FURTHER_FIELDS = [
  { key: 'workplaceSection', label: 'Workplace section', type: 'text' },
  { key: 'actionBy', label: 'Action by', type: 'text' },
  { key: 'remarks', label: 'Remarks and recommendations', type: 'textarea' },
  { key: 'completionDate', label: 'Completion date', type: 'date' },
] as const;

export const FIRE_PRIORITY_FIELDS = [
  { key: 'fireRisk', label: 'Fire risk / action required' },
  { key: 'priority', label: 'Priority' },
] as const;

export const FIRE_SAFETY_QUESTIONS = FIRE_SAFETY_SECTIONS.flatMap((section) => section.questions ?? []);

const employerKeys = FIRE_EMPLOYER_FIELDS.map((field) => field.key);
const workerKeys = FIRE_WORKER_FIELDS.map((field) => field.key);
const furtherKeys = [
  ...FIRE_FURTHER_FIELDS.map((field) => field.key),
  ...FIRE_PRIORITY_FIELDS.map((field) => field.key),
];
const questionByKey = new Map(FIRE_SAFETY_QUESTIONS.map((question) => [question.key, question]));
const PRIORITIES = ['high', 'medium', 'low', ''];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringFields(
  value: unknown,
  keys: readonly string[],
  errors: string[],
  groupName: string,
): Record<string, string> {
  if (!isRecord(value)) {
    errors.push(`${groupName} must be an object.`);
    return {};
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) errors.push(`${groupName} contains an unknown field.`);
  }
  const result: Record<string, string> = {};
  for (const key of keys) {
    const item = value[key];
    if (item === undefined) {
      result[key] = '';
    } else if (typeof item !== 'string') {
      errors.push(`${groupName} contains an invalid value.`);
    } else if (item.length > (key === 'remarks' ? 4000 : 500)) {
      errors.push(`${groupName} contains a value that is too long.`);
    } else {
      result[key] = item;
    }
  }
  return result;
}

function validateTypedFields(
  values: Record<string, string>,
  fields: readonly { key: string; label: string; type: string }[],
  groupName: string,
  errors: string[],
) {
  for (const field of fields) {
    const value = values[field.key];
    if (!value) continue;
    if (field.type === 'number' && !/^\d+$/.test(value)) {
      errors.push(`${groupName}: ${field.label} must be a whole number.`);
    }
    if (field.type === 'date') {
      const timestamp = Date.parse(`${value}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
        errors.push(`${groupName}: ${field.label} must be a valid date.`);
      }
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${groupName}: enter a valid email address.`);
    }
  }
}

export function validateFireSafetyAuditData(input: unknown): {
  data: FireSafetyAuditData | null;
  errors: string[];
} {
  const errors: string[] = [];
  if (!isRecord(input)) return { data: null, errors: ['Audit data must be an object.'] };
  const allowedGroups = ['employerDetails', 'workersData', 'checklistAnswers', 'furtherInformation'];
  for (const key of Object.keys(input)) {
    if (!allowedGroups.includes(key)) errors.push('Audit data contains an unknown group.');
  }

  const employerDetails = stringFields(input.employerDetails, employerKeys, errors, 'Employer details');
  const workersData = stringFields(input.workersData, workerKeys, errors, 'Workers data');
  const furtherInformation = stringFields(input.furtherInformation, furtherKeys, errors, 'Further information');
  validateTypedFields(employerDetails, FIRE_EMPLOYER_FIELDS, 'Employer details', errors);
  validateTypedFields(workersData, FIRE_WORKER_FIELDS, 'Workers data', errors);
  validateTypedFields(furtherInformation, FIRE_FURTHER_FIELDS, 'Further information', errors);
  if (furtherInformation.fireRisk && !PRIORITIES.includes(furtherInformation.fireRisk)) {
    errors.push('Fire risk must be High, Medium or Low.');
  }
  if (furtherInformation.priority && !PRIORITIES.includes(furtherInformation.priority)) {
    errors.push('Priority must be High, Medium or Low.');
  }

  const checklistAnswers: Record<string, FireAnswer> = {};
  if (!isRecord(input.checklistAnswers)) {
    errors.push('Checklist answers must be an object.');
  } else {
    for (const key of Object.keys(input.checklistAnswers)) {
      if (!questionByKey.has(key)) errors.push('Checklist answers contain an unknown question.');
    }
    for (const question of FIRE_SAFETY_QUESTIONS) {
      const answer = input.checklistAnswers[question.key];
      if (answer === undefined) {
        checklistAnswers[question.key] = { choice: '', narration: '' };
        continue;
      }
      if (!isRecord(answer)) {
        errors.push('A checklist response is invalid.');
        continue;
      }
      if (Object.keys(answer).some((key) => key !== 'choice' && key !== 'narration')) {
        errors.push('A checklist response contains an unknown field.');
      }
      const allowedChoices = question.choices.map((choice) => choice.value);
      const choice = answer.choice;
      const narration = answer.narration;
      if (choice !== '' && (typeof choice !== 'string' || !allowedChoices.includes(choice as Exclude<FireAnswerChoice, ''>))) {
        errors.push('A checklist answer has an invalid choice.');
      }
      if (narration !== undefined && (typeof narration !== 'string' || narration.length > 4000)) {
        errors.push('A checklist narration is invalid or too long.');
      }
      checklistAnswers[question.key] = {
        choice: typeof choice === 'string' ? choice as FireAnswerChoice : '',
        narration: typeof narration === 'string' ? narration : '',
      };
    }
  }

  return errors.length
    ? { data: null, errors }
    : { data: { employerDetails, workersData, checklistAnswers, furtherInformation }, errors };
}

export function getFireSafetyAuditProgress(answers: Record<string, FireAnswer>) {
  const completed = FIRE_SAFETY_QUESTIONS.filter((question) => {
    const choice = answers[question.key]?.choice;
    return question.choices.some((option) => option.value === choice);
  }).length;
  const total = FIRE_SAFETY_QUESTIONS.length;
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

export function createFireSafetyAuditDefaults(
  branch: { name: string; organisation: string; county: string; subCounty: string; town: string; poBox: string },
  responses?: Record<string, { answers?: Record<string, string> }>,
): FireSafetyAuditData {
  const answer = (section: string, key: string) => responses?.[section]?.answers?.[key] ?? '';
  const employerDetails = Object.fromEntries(employerKeys.map((key) => [key, ''])) as Record<string, string>;
  Object.assign(employerDetails, {
    registrationNumber: answer('workplace-identification', 'registrationNumber'),
    occupierName: answer('workplace-identification', 'occupierName'),
    county: answer('physical-location', 'county') || branch.county,
    subCounty: answer('physical-location', 'subCounty') || branch.subCounty,
    building: branch.name,
    postalAddress: answer('physical-location', 'poBox') || branch.poBox,
    town: answer('physical-location', 'town') || branch.town,
    mobilePhone: answer('contact-details', 'contactPhone'),
    email: answer('contact-details', 'contactEmail'),
    website: answer('contact-details', 'website'),
    industryType: answer('workplace-identification', 'industryType'),
  });

  const workersData = Object.fromEntries(workerKeys.map((key) => [key, ''])) as Record<string, string>;
  Object.assign(workersData, {
    totalEmployees: answer('workers-data', 'totalWorkers'),
    femaleEmployees: answer('workers-data', 'femaleWorkers'),
    maleEmployees: answer('workers-data', 'maleWorkers'),
    under18Count: answer('workers-data', 'youngWorkers'),
    internCount: answer('workers-data', 'apprenticesInterns'),
    physicalChallengeCount: answer('workers-data', 'workersWithDisabilities'),
    currentAuditDate: new Date().toISOString().slice(0, 10),
  });

  const checklistAnswers = Object.fromEntries(
    FIRE_SAFETY_QUESTIONS.map((question) => [question.key, { choice: '', narration: '' }]),
  ) as Record<string, FireAnswer>;
  const furtherInformation = Object.fromEntries(furtherKeys.map((key) => [key, ''])) as Record<string, string>;
  return { employerDetails, workersData, checklistAnswers, furtherInformation };
}
