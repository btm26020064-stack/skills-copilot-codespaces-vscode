import { ReviewStatus } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, context: any) {
  const user = await requireRole('ADMIN').catch(() => null);

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const formData = await request.formData();
  const status = String(formData.get('status') || 'PENDING') as ReviewStatus;
  const { id } = context.params as { id: string };

  if (!(status === 'VERIFIED' || status === 'REJECTED')) {
    return NextResponse.redirect(new URL('/dashboard/admin?error=document-status', request.url));
  }

  await prisma.documentSubmission.update({
    where: { id },
    data: {
      status,
      reviewerId: user.id,
      reviewedAt: new Date()
    }
  });

  return NextResponse.redirect(new URL('/dashboard/admin?updated=document', request.url));
}