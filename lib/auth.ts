import { UserRole } from '@prisma/client';
import { prisma } from './prisma';
import { getSession } from './session';

export async function currentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.sub
    }
  });
}

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    throw new Error('Forbidden');
  }

  return user;
}