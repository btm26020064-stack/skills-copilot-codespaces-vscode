import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN'
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {
      name: 'Client User',
      passwordHash,
      role: 'CLIENT'
    },
    create: {
      name: 'Client User',
      email: 'client@example.com',
      passwordHash,
      role: 'CLIENT'
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });