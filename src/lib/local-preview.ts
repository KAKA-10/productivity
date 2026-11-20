import { AUDIT_SECTIONS, getAuditProgress, type AuditResponse, type AuditResponses } from '@/lib/audit-template';
import { FEATURE_PRODUCTS } from '@/lib/commerce-catalog';
import {
  createFireSafetyAuditDefaults,
  getFireSafetyAuditProgress,
  type FireSafetyAuditData,
} from '@/lib/fire-safety-audit';
import type { SessionUser } from '@/lib/session';

export const LOCAL_PREVIEW_BRANCH = {
  id: 'local-preview-branch',
  name: 'Local preview branch',
  organisationId: 'local-preview-organisation',
  organisation: 'Local demo workplace',
  county: 'Nairobi',
  subCounty: 'Nairobi',
  town: 'Nairobi',
  poBox: '',
};

const localBranchDetails = {
  ...LOCAL_PREVIEW_BRANCH,
};

type LocalFireAuditState = {
  data: FireSafetyAuditData;
  version: number;
  updatedAt: string;
};

type LocalOshAuditState = {
  responses: AuditResponses;
  version: number;
  updatedAt: string;
};

type LocalPreviewState = {
  fireAudit: LocalFireAuditState;
  oshAudit: LocalOshAuditState;
};

type LocalPreviewGlobal = typeof globalThis & {
  __todomuLocalPreviewState?: LocalPreviewState;
};

function getPreviewState() {
  const global = globalThis as LocalPreviewGlobal;
  global.__todomuLocalPreviewState ??= {
    fireAudit: {
      data: createFireSafetyAuditDefaults(localBranchDetails),
      version: 0,
      updatedAt: new Date().toISOString(),
    },
    oshAudit: {
      responses: Object.fromEntries(AUDIT_SECTIONS.map((section) => [section.id, { answers: {} }])) as AuditResponses,
      version: 0,
      updatedAt: new Date().toISOString(),
    },
  };
  return global.__todomuLocalPreviewState;
}

export function createLocalPreviewSession(): SessionUser {
  return {
    id: 'local-preview-user',
    username: 'local-preview',
    fullName: 'Local Preview User',
    role: 'workplace_admin',
    organisation: LOCAL_PREVIEW_BRANCH.organisation,
    organisationId: LOCAL_PREVIEW_BRANCH.organisationId,
    branchId: LOCAL_PREVIEW_BRANCH.id,
    email: 'local-preview@example.test',
    county: LOCAL_PREVIEW_BRANCH.county,
    auditAccess: true,
    unlockedFeatures: FEATURE_PRODUCTS.map((feature) => feature.code),
    localAuthBypass: true,
  };
}

export function getLocalPreviewFireAudit() {
  const state = getPreviewState().fireAudit;
  return {
    id: 'local-preview-fire-audit',
    cycleYear: String(new Date().getFullYear()),
    version: state.version,
    updatedAt: state.updatedAt,
    data: state.data,
    progress: getFireSafetyAuditProgress(state.data.checklistAnswers),
    branch: {
      id: LOCAL_PREVIEW_BRANCH.id,
      name: LOCAL_PREVIEW_BRANCH.name,
      organisation: LOCAL_PREVIEW_BRANCH.organisation,
    },
  };
}

export function saveLocalPreviewFireAudit(data: FireSafetyAuditData) {
  const state = getPreviewState().fireAudit;
  state.data = data;
  state.version += 1;
  state.updatedAt = new Date().toISOString();
  return {
    version: state.version,
    updatedAt: state.updatedAt,
    progress: getFireSafetyAuditProgress(state.data.checklistAnswers),
  };
}

export function getLocalPreviewOshAudit() {
  const state = getPreviewState().oshAudit;
  const responses = { ...state.responses } as AuditResponses & { 'fire-safety'?: AuditResponse };
  delete responses['fire-safety'];
  return {
    id: 'local-preview-osh-audit',
    reference: 'LOCAL-PREVIEW-OSH',
    status: 'draft',
    version: state.version,
    cycleYear: String(new Date().getFullYear()),
    submittedAt: null,
    updatedAt: state.updatedAt,
    responses,
    findings: {},
    evidence: [],
    progress: getAuditProgress(responses),
    categories: [...new Set(AUDIT_SECTIONS.map((section) => section.category))],
    branch: {
      id: LOCAL_PREVIEW_BRANCH.id,
      name: LOCAL_PREVIEW_BRANCH.name,
      organisation: LOCAL_PREVIEW_BRANCH.organisation,
    },
    canSign: false,
    signingUserName: null,
    clientSignerName: null,
    clientAttestedAt: null,
    clientDeclaration: false,
    clientSignatureEvidenceId: null,
  };
}

export function saveLocalPreviewOshAudit(responses: AuditResponses) {
  const state = getPreviewState().oshAudit;
  state.responses = responses;
  state.version += 1;
  state.updatedAt = new Date().toISOString();
  return { version: state.version, updatedAt: state.updatedAt };
}
