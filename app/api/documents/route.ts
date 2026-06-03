import { DocumentType } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/storage';

const allowedTypes = new Set<DocumentType>(['ARRIVAL_NOTICE', 'CREW_LIST', 'SAILING_PERMIT', 'MANIFEST', 'K11', 'OTHER']);

export async function POST(request: NextRequest) {
  const user = await requireUser().catch(() => null);

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const formData = await request.formData();
  const type = String(formData.get('type') || 'OTHER') as DocumentType;
  const note = String(formData.get('note') || '').trim() || null;
  const file = formData.get('file');

  if (!(file instanceof File) || !allowedTypes.has(type)) {
    return NextResponse.redirect(new URL('/dashboard?error=document', request.url));
  }

  const uploaded = await saveFile('documents', file);

  await prisma.documentSubmission.create({
    data: {
      userId: user.id,
      type,
      originalName: file.name,
      filePath: uploaded.publicPath,
      note
    }
  });

  return NextResponse.redirect(new URL('/dashboard?submitted=document', request.url));
}