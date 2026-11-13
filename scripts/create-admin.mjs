import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const requiredVariables = [
  'DATABASE_URL',
  'ADMIN_BOOTSTRAP_CONFIRM',
  'ADMIN_USERNAME',
  'ADMIN_FULL_NAME',
  'ADMIN_ORGANISATION',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length) {
  console.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  process.exit(1);
}

if (process.env.ADMIN_BOOTSTRAP_CONFIRM !== 'CREATE_ADMIN') {
  console.error('Set ADMIN_BOOTSTRAP_CONFIRM=CREATE_ADMIN to confirm this one-time operation.');
  process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
  console.error('Set NODE_ENV=production before creating a production administrator.');
  process.exit(1);
}

const username = process.env.ADMIN_USERNAME.trim();
const fullName = process.env.ADMIN_FULL_NAME.trim();
const organisation = process.env.ADMIN_ORGANISATION.trim();
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
  console.error('ADMIN_USERNAME must be 3–32 letters, numbers, dots, underscores or hyphens.');
  process.exit(1);
}
if (!fullName || fullName.length > 120 || !organisation || organisation.length > 160) {
  console.error('ADMIN_FULL_NAME and ADMIN_ORGANISATION must be provided and within their length limits.');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
  console.error('ADMIN_EMAIL must be a valid email address.');
  process.exit(1);
}
if (password.length < 16 || password.length > 128) {
  console.error('ADMIN_PASSWORD must be between 16 and 128 characters.');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  });
  if (existingAdmin) {
    throw new Error('An administrator already exists. Refusing to create another.');
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existingUsername) {
    throw new Error('That username already exists. Choose another username.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      username,
      fullName,
      organisation,
      email,
      passwordHash,
      role: 'admin',
      status: 'active',
    },
    select: { username: true },
  });

  console.info(`Administrator "${admin.username}" created. Sign in and store the credentials securely.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to create administrator.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
