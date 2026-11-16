import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workplaces = await prisma.user.findMany({
    where: { role: 'workplace_admin' },
    select: { organisation: true },
    distinct: ['organisation'],
  });
  if (workplaces.length !== 1 || !workplaces[0].organisation) {
    throw new Error('Legacy records were left unchanged: map them manually unless exactly one workplace organisation exists.');
  }

  const organisation = workplaces[0].organisation;
  const updates = await prisma.$transaction([
    prisma.incident.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.riskAssessment.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.jsa.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.toolboxTalk.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.complianceItem.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.oshAudit.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.inspection.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.ppeRecord.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.fireEquipment.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.personnel.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.committeeMeeting.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.trainingRecord.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.capa.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.doshsReport.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.reminder.updateMany({ where: { organisation: '' }, data: { organisation } }),
    prisma.emailLog.updateMany({ where: { organisation: '' }, data: { organisation } }),
  ]);
  console.info(`Assigned ${updates.reduce((total, result) => total + result.count, 0)} legacy records to the only workplace organisation.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
