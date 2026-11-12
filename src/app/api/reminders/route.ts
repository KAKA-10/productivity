import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function soon(date: string, days = 30) {
  const due = new Date(date).getTime();
  if (Number.isNaN(due)) return false;
  const diff = due - Date.now();
  return diff <= days * 86400000;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });

  const features = new Set(session.unlockedFeatures ?? []);
  const [compliance, fire, ppe, training, capa, emails] = await Promise.all([
    features.has('compliance') ? prisma.complianceItem.findMany({ where: { organisation: session.organisation } }) : Promise.resolve([]),
    features.has('fire') ? prisma.fireEquipment.findMany({ where: { organisation: session.organisation } }) : Promise.resolve([]),
    features.has('ppe') ? prisma.ppeRecord.findMany({ where: { organisation: session.organisation } }) : Promise.resolve([]),
    features.has('training-records') ? prisma.trainingRecord.findMany({ where: { organisation: session.organisation } }) : Promise.resolve([]),
    features.has('capa') ? prisma.capa.findMany({ where: { organisation: session.organisation } }) : Promise.resolve([]),
    prisma.emailLog.findMany({ where: { organisation: session.organisation }, orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  const items = [
    ...compliance.filter((i) => soon(i.dueDate)).map((i) => ({
      id: i.id,
      title: i.title,
      dueDate: i.dueDate,
      source: 'Compliance',
      sourceRef: i.ref,
      body: `${i.regulator} filing due for ${i.site}`,
    })),
    ...fire.filter((i) => soon(i.nextInspection)).map((i) => ({
      id: i.id,
      title: `${i.type} inspection`,
      dueDate: i.nextInspection,
      source: 'Fire',
      sourceRef: i.ref,
      body: `Extinguisher at ${i.location} is due for inspection.`,
    })),
    ...ppe.filter((i) => soon(i.expiryDate)).map((i) => ({
      id: i.id,
      title: `PPE expiry — ${i.item}`,
      dueDate: i.expiryDate,
      source: 'PPE',
      sourceRef: i.ref,
      body: `${i.employee} replacement due.`,
    })),
    ...training.filter((i) => soon(i.expiryDate)).map((i) => ({
      id: i.id,
      title: `Training expiry — ${i.course}`,
      dueDate: i.expiryDate,
      source: 'Training',
      sourceRef: i.ref,
      body: `${i.trainee} recertification due.`,
    })),
    ...capa.filter((i) => i.status !== 'Closed' && soon(i.dueDate)).map((i) => ({
      id: i.id,
      title: i.title,
      dueDate: i.dueDate,
      source: 'CAPA',
      sourceRef: i.ref,
      body: `Owner ${i.owner}`,
    })),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return NextResponse.json({ items, emails });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'user') return NextResponse.json({ error: 'Workplace account required' }, { status: 403 });

  const current = await GET();
  const payload = await current.json();
  const items = payload.items as { title: string; dueDate: string; sourceRef: string; body: string }[];

  const created = await Promise.all(
    items.slice(0, 12).map((item) =>
      prisma.emailLog.create({
        data: {
          toAddress: session.email || 'hse@tafarimillers.co.ke',
          subject: `Productivity OSHAPP reminder: ${item.title}`,
          body: `${item.body}\nDue: ${item.dueDate}\nRef: ${item.sourceRef}\n\nThis is an automated OSHA 2007 compliance reminder from Productivity OSHAPP.`,
          organisation: session.organisation,
          status: process.env.SMTP_HOST ? 'queued-smtp' : 'logged-in-app',
        },
      }),
    ),
  );

  return NextResponse.json({ sent: created.length, mode: process.env.SMTP_HOST ? 'smtp' : 'in-app' });
}
