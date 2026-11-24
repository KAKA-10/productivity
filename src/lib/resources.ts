import { prisma } from './prisma';

export const RESOURCE_KEYS = [
  'incidents',
  'risks',
  'jsa',
  'toolbox-talks',
  'compliance',
  'audits',
  'inspections',
  'ppe',
  'fire',
  'personnel',
  'meetings',
  'training',
  'capa',
  'reports',
] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export const RESOURCE_PREFIX: Record<ResourceKey, string> = {
  incidents: 'INC',
  risks: 'RA',
  jsa: 'JSA',
  'toolbox-talks': 'TBT',
  compliance: 'OBL',
  audits: 'AUD',
  inspections: 'INS',
  ppe: 'PPE',
  fire: 'FE',
  personnel: 'PER',
  meetings: 'MTG',
  training: 'TRN',
  capa: 'CAPA',
  reports: 'DOSHS',
};

export function isResource(value: string): value is ResourceKey {
  return (RESOURCE_KEYS as readonly string[]).includes(value);
}

export function getModel(resource: ResourceKey) {
  switch (resource) {
    case 'incidents':
      return prisma.incident;
    case 'risks':
      return prisma.riskAssessment;
    case 'jsa':
      return prisma.jsa;
    case 'toolbox-talks':
      return prisma.toolboxTalk;
    case 'compliance':
      return prisma.complianceItem;
    case 'audits':
      return prisma.oshAudit;
    case 'inspections':
      return prisma.inspection;
    case 'ppe':
      return prisma.ppeRecord;
    case 'fire':
      return prisma.fireEquipment;
    case 'personnel':
      return prisma.personnel;
    case 'meetings':
      return prisma.committeeMeeting;
    case 'training':
      return prisma.trainingRecord;
    case 'capa':
      return prisma.capa;
    case 'reports':
      return prisma.doshsReport;
  }
}
