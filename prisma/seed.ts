import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled in production');
  }

  const adminPasswordOverride = process.env.TODOMU_SEED_ADMIN_PASSWORD;
  const userPasswordOverride = process.env.TODOMU_SEED_USER_PASSWORD;
  const developmentAdminPassword = adminPasswordOverride || 'admin12345';
  const developmentUserPassword = userPasswordOverride || 'client12345';
  if (
    (adminPasswordOverride && adminPasswordOverride.length < 12) ||
    (userPasswordOverride && userPasswordOverride.length < 12)
  ) {
    throw new Error('Custom demo passwords must be at least 12 characters');
  }

  await prisma.emailLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.doshsReport.deleteMany();
  await prisma.clientAssignment.deleteMany();
  await prisma.capa.deleteMany();
  await prisma.trainingRecord.deleteMany();
  await prisma.committeeMeeting.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.fireEquipment.deleteMany();
  await prisma.ppeRecord.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.oshAudit.deleteMany();
  await prisma.complianceItem.deleteMany();
  await prisma.toolboxTalk.deleteMany();
  await prisma.jsa.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(developmentAdminPassword, 12);
  const userHash = await bcrypt.hash(developmentUserPassword, 12);
  const organisation = await prisma.organisation.upsert({
    where: { name: 'Tafari Millers Ltd' },
    update: { status: 'active' },
    create: { name: 'Tafari Millers Ltd' },
    select: { id: true },
  });
  const branch = await prisma.branch.upsert({
    where: { organisationId_name: { organisationId: organisation.id, name: 'Main branch' } },
    update: { county: 'Nairobi', status: 'active' },
    create: { organisationId: organisation.id, name: 'Main branch', county: 'Nairobi' },
    select: { id: true, name: true },
  });

  await prisma.user.createMany({
    data: [
      {
        username: 'Auditor',
        passwordHash: adminHash,
        fullName: 'Toledo Douglas',
        role: 'super_admin',
        organisation: 'Productivity OSHAPP — Lead Auditor',
        email: 'auditor@todomu.co.ke',
      },
      {
        username: 'tafari_hse',
        passwordHash: userHash,
        fullName: 'Wanjiru Kamau',
        role: 'workplace_admin',
        organisation: 'Tafari Millers Ltd',
        organisationId: organisation.id,
        branchId: branch.id,
        county: 'Nairobi',
        email: 'hse@tafarimillers.co.ke',
      },
    ],
  });

  await prisma.incident.createMany({
    data: [
      {
        ref: 'INC-2026-008',
        title: 'Forklift hydraulic hose burst & fluid spill',
        type: 'Property Damage',
        site: branch.name,
        severity: 'Medium',
        status: 'Under Investigation',
        reporter: 'John Kamau',
        summary:
          'High-pressure hydraulic line ruptured on Forklift #04, spilling ~15L of fluid. Area bunded immediately; zero injuries.',
        occurredAt: '2026-09-07',
        injuredName: '',
        occupation: 'Forklift operator',
        bodyPart: '',
        lostTimeDays: 0,
        oshaSection: 'OSHA 2007 Sec. 6',
        witnesses: 'Alice Wanjiku',
        immediateCause: 'Aged hydraulic hose',
        rootCause: 'Missed preventive maintenance interval',
      },
      {
        ref: 'INC-2026-007',
        title: 'Near-miss: unguarded conveyor pinch point',
        type: 'Near-Miss',
        site: branch.name,
        severity: 'Low',
        status: 'Closed',
        reporter: 'Alice Wanjiku',
        summary:
          'Operator noticed side guard panel missing on Main Conveyor 2. Machine locked out until guard reinstalled.',
        occurredAt: '2026-09-04',
      },
      {
        ref: 'INC-2026-006',
        title: 'Minor laceration during packaging line clearing',
        type: 'First Aid',
        site: branch.name,
        severity: 'Low',
        status: 'Closed',
        reporter: 'Peter Omondi',
        summary: 'Hand cut while clearing a jam. First aid administered on site. No lost time.',
        occurredAt: '2026-08-28',
        injuredName: 'Peter Omondi',
        occupation: 'Packaging attendant',
        bodyPart: 'Left hand',
        lostTimeDays: 0,
        oshaSection: 'OSHA 2007 Sec. 21',
        witnesses: 'Line supervisor',
        immediateCause: 'Reach into moving parts',
        rootCause: 'Guard temporarily removed',
      },
    ],
  });

  await prisma.riskAssessment.createMany({
    data: [
      {
        ref: 'RA-2026-001',
        activity: 'High-pressure grain dryer operation',
        location: branch.name,
        hazard: 'Overheating / combustible dust explosion',
        likelihood: 3,
        severity: 5,
        riskScore: 15,
        existingControls: 'Thermal cutoffs, explosion relief venting, housekeeping SOP',
        residualRisk: 'Medium',
        status: 'Open',
        personsAtRisk: 'Dryer operators, millers',
        legalDuty: 'OSHA 2007 Sec. 13 — Risk assessment',
        reviewDate: '2026-12-01',
      },
      {
        ref: 'RA-2026-002',
        activity: 'Forklift material handling',
        location: branch.name,
        hazard: 'Pedestrian collision and load tip-over',
        likelihood: 2,
        severity: 4,
        riskScore: 8,
        existingControls: 'Walkways, beacons, speed governors, hi-vis',
        residualRisk: 'Low',
        status: 'Under Review',
      },
      {
        ref: 'RA-2026-003',
        activity: 'Electrical substation maintenance',
        location: branch.name,
        hazard: 'Arc flash / electrocution',
        likelihood: 2,
        severity: 5,
        riskScore: 10,
        existingControls: 'LOTO, arc-rated PPE, authorised electrician only',
        residualRisk: 'Medium',
        status: 'Open',
      },
    ],
  });

  await prisma.jsa.createMany({
    data: [
      {
        ref: 'JSA-2026-001',
        taskTitle: 'Hot work on fuel storage tank',
        site: branch.name,
        department: 'Maintenance',
        supervisor: 'Peter Omondi',
        stepsCount: 5,
        permitRequired: 'Hot Work Permit',
        status: 'Approved',
        reviewDate: '2026-09-01',
      },
      {
        ref: 'JSA-2026-002',
        taskTitle: 'Silo interior cleaning',
        site: branch.name,
        department: 'Operations',
        supervisor: 'Samuel Njuguna',
        stepsCount: 6,
        permitRequired: 'Confined Space Permit',
        status: 'Pending Approval',
        reviewDate: '2026-09-05',
      },
    ],
  });

  await prisma.toolboxTalk.createMany({
    data: [
      {
        ref: 'TBT-2026-042',
        topic: 'Dust explosion prevention in grain storage',
        category: 'Process Safety',
        audience: 'Silo & milling personnel',
        duration: '10 Mins',
        author: 'AI Generator (OSHA 2007)',
        attendeesCount: 24,
        status: 'Completed',
        content:
          '1. Key hazard: fine organic dust.\n2. Controls: LEV, non-sparking tools, grounding.\n3. Discuss yesterday’s dust accumulation points.',
      },
      {
        ref: 'TBT-2026-041',
        topic: 'Safe forklift operations & pedestrian separation',
        category: 'Logistics Safety',
        audience: 'Warehouse crews',
        duration: '8 Mins',
        author: 'AI Generator',
        attendeesCount: 18,
        status: 'Completed',
        content:
          '1. Blind spots at Dock B.\n2. 3-metre exclusion, horn at aisles, Class 2 hi-vis.',
      },
    ],
  });

  await prisma.complianceItem.createMany({
    data: [
      {
        ref: 'OBL-001',
        title: 'DOSHS annual workplace registration renewal',
        category: 'Statutory Audit',
        site: branch.name,
        regulator: 'DOSHS',
        dueDate: '2026-09-23',
        status: 'urgent',
        assignedTo: 'Toledo Douglas',
        lawReference: 'OSHA 2007 Sec. 44',
      },
      {
        ref: 'OBL-002',
        title: 'Annual statutory safety audit submission',
        category: 'Statutory Audit',
        site: branch.name,
        regulator: 'DOSHS',
        dueDate: '2026-10-15',
        status: 'pending',
        assignedTo: 'Wanjiru Kamau',
        lawReference: 'OSHA 2007 Sec. 11',
      },
      {
        ref: 'OBL-003',
        title: 'Boiler inspection — AIA',
        category: 'Equipment Inspection',
        site: branch.name,
        regulator: 'AIA',
        dueDate: '2026-10-07',
        status: 'pending',
        assignedTo: 'Peter Omondi',
        lawReference: 'OSHA 2007 Plant regs',
      },
      {
        ref: 'OBL-004',
        title: 'Stack emission & ambient air quality survey',
        category: 'Environmental Compliance',
        site: branch.name,
        regulator: 'NEMA',
        dueDate: '2026-12-10',
        status: 'pending',
        assignedTo: 'External hygienist',
        lawReference: 'EMCA / NEMA licence',
      },
    ],
  });

  await prisma.oshAudit.createMany({
    data: [
      {
        ref: 'AUD-2026-001',
        facility: branch.name,
        cycleYear: '2026',
        auditor: 'Toledo Douglas',
        auditorCredentials: 'DOSHS/OSH/AUD/1842',
        complianceScore: 91,
        status: 'Internal Review',
        committeeSignOff: 'Pending committee',
        notes: 'Fire drill overdue by 6 weeks. Machine guarding improved since 2025.',
        workplaceRegNo: 'DOSHS/NBI/WR/4412',
        employeeCount: 186,
      },
      {
        ref: 'AUD-2025-003',
        facility: branch.name,
        cycleYear: '2025',
        auditor: 'Jane Njeri',
        auditorCredentials: 'DOSHS/OSH/AUD/1104',
        complianceScore: 86,
        status: 'Approved & Filed',
        committeeSignOff: 'Signed 12 Nov 2025',
        notes: 'Filed with DOSHS Nairobi office.',
      },
    ],
  });

  await prisma.inspection.createMany({
    data: [
      {
        ref: 'INS-2026-014',
        title: 'Weekly house-keeping & egress inspection',
        area: 'Packaging hall',
        site: branch.name,
        inspector: 'Wanjiru Kamau',
        scheduled: '2026-09-12',
        status: 'Scheduled',
        findings: '',
      },
      {
        ref: 'INS-2026-013',
        title: 'Silo catwalk and fall-protection check',
        area: 'Silo farm',
        site: branch.name,
        inspector: 'Samuel Njuguna',
        scheduled: '2026-09-08',
        status: 'Completed',
        findings: 'One missing mid-rail on catwalk 3. CAPA raised.',
      },
    ],
  });

  await prisma.ppeRecord.createMany({
    data: [
      {
        ref: 'PPE-2026-088',
        employee: 'John Kamau',
        department: 'Logistics',
        item: 'Safety shoes + hi-vis vest',
        size: '42',
        issuedOn: '2026-08-01',
        expiryDate: '2027-08-01',
        status: 'Active',
      },
      {
        ref: 'PPE-2026-079',
        employee: 'Faith Atieno',
        department: 'Milling',
        item: 'Dust respirator P2',
        size: 'M',
        issuedOn: '2026-06-12',
        expiryDate: '2026-12-12',
        status: 'Due Soon',
      },
    ],
  });

  await prisma.fireEquipment.createMany({
    data: [
      {
        ref: 'FE-IA-012',
        type: '9kg DCP extinguisher',
        location: 'Packaging hall east',
        site: branch.name,
        lastInspection: '2026-08-15',
        nextInspection: '2026-09-15',
        status: 'Due',
      },
      {
        ref: 'FE-TH-004',
        type: 'CO2 extinguisher',
        location: 'MCC room',
        site: branch.name,
        lastInspection: '2026-07-20',
        nextInspection: '2026-10-20',
        status: 'Serviceable',
      },
    ],
  });

  await prisma.personnel.createMany({
    data: [
      {
        ref: 'PER-001',
        name: 'Mary Wambui',
        role: 'First Aider',
        site: branch.name,
        department: 'HR / Clinic',
        certificate: 'St John Ambulance',
        expiryDate: '2027-03-01',
        phone: '0712 000 221',
      },
      {
        ref: 'PER-002',
        name: 'Daniel Otieno',
        role: 'Fire Marshal',
        site: branch.name,
        department: 'Operations',
        certificate: 'Fire safety marshal — KFRS',
        expiryDate: '2026-11-30',
        phone: '0722 118 904',
      },
    ],
  });

  await prisma.committeeMeeting.createMany({
    data: [
      {
        ref: 'MTG-2026-Q3',
        title: 'Q3 OSH Committee',
        site: branch.name,
        meetingDate: '2026-09-15',
        chair: 'Wanjiru Kamau',
        attendees: 8,
        status: 'Scheduled',
        minutes: 'Agenda: incident trend, PPE gaps, DOSHS renewal.',
      },
    ],
  });

  await prisma.trainingRecord.createMany({
    data: [
      {
        ref: 'TRN-2026-019',
        course: 'Forklift operator recertification',
        trainee: 'John Kamau',
        department: 'Logistics',
        trainer: 'NTSA accredited instructor',
        date: '2026-07-18',
        expiryDate: '2028-07-18',
        status: 'Valid',
      },
      {
        ref: 'TRN-2026-011',
        course: 'Confined space entry',
        trainee: 'Samuel Njuguna',
        department: 'Operations',
        trainer: 'Toledo Douglas',
        date: '2025-10-02',
        expiryDate: '2026-10-02',
        status: 'Expiring',
      },
    ],
  });

  await prisma.capa.createMany({
    data: [
      {
        ref: 'CAPA-2026-017',
        title: 'Reinstall conveyor side guard — line 2',
        source: 'INC-2026-007',
        site: branch.name,
        owner: 'Peter Omondi',
        dueDate: '2026-09-11',
        priority: 'High',
        status: 'Open',
        description: 'Permanent guard and interlock before restart.',
      },
      {
        ref: 'CAPA-2026-016',
        title: 'Replace missing silo catwalk mid-rail',
        source: 'INS-2026-013',
        site: branch.name,
        owner: 'Samuel Njuguna',
        dueDate: '2026-09-20',
        priority: 'Medium',
        status: 'In Progress',
        description: 'Fabricate and install mid-rail; inspect remaining catwalks.',
      },
    ],
  });

  await prisma.doshsReport.createMany({
    data: [
      {
        ref: 'DOSHS-2026-AR',
        title: 'Annual workplace OSH return',
        type: 'Annual return',
        period: '2026',
        site: branch.name,
        status: 'Draft',
        preparedBy: 'Wanjiru Kamau',
      },
      {
        ref: 'DOSHS-2026-INC',
        title: 'Incident summary — August 2026',
        type: 'Incident return',
        period: 'Aug 2026',
        site: branch.name,
        status: 'Ready',
        preparedBy: 'Toledo Douglas',
      },
    ],
  });

  const workplace = await prisma.user.findUniqueOrThrow({
    where: { username: 'tafari_hse' },
    select: { organisation: true },
  });
  await prisma.$transaction([
    prisma.incident.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.riskAssessment.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.jsa.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.toolboxTalk.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.complianceItem.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.oshAudit.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.inspection.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.ppeRecord.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.fireEquipment.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.personnel.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.committeeMeeting.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.trainingRecord.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.capa.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
    prisma.doshsReport.updateMany({ where: { organisation: '' }, data: { organisation: workplace.organisation, branchId: branch.id } }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
