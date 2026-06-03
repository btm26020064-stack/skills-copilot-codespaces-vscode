import { ReviewStatus } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirectUrl } from '@/lib/site-url';

export async function POST(request: NextRequest, context: any) {
  const user = await requireRole('ADMIN').catch(() => null);

  if (!user) {
    return NextResponse.redirect(redirectUrl(request, '/login'));
  }

  const formData = await request.formData();
  const status = String(formData.get('status') || 'PENDING') as ReviewStatus;
  const { id } = context.params as { id: string };

  if (!(status === 'VERIFIED' || status === 'REJECTED')) {
    return NextResponse.redirect(redirectUrl(request, '/dashboard/admin?error=document-status'));
  }

  await prisma.documentSubmission.update({
    where: { id },
    data: {
      status,
      reviewerId: user.id,
      reviewedAt: new Date()
    }
  });

  return NextResponse.redirect(redirectUrl(request, '/dashboard/admin?updated=document'));
}