import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = await requireRole('ADMIN').catch(() => null);

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const formData = await request.formData();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const isActive = formData.get('isActive') === 'on';

  if (!title || !body) {
    return NextResponse.redirect(new URL('/dashboard/admin?error=bulletin', request.url));
  }

  await prisma.bulletin.create({
    data: {
      title,
      body,
      isActive,
      authorId: user.id
    }
  });

  return NextResponse.redirect(new URL('/dashboard/admin?created=bulletin', request.url));
}