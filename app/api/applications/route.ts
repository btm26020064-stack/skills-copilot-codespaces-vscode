import { ApplicationStatus, DocumentType, SlotType } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApplicationPdf } from '@/lib/pdf';
import { saveFile } from '@/lib/storage';
import { redirectUrl } from '@/lib/site-url';

const fileFields: Array<[string, DocumentType]> = [
  ['arrivalNotice', 'ARRIVAL_NOTICE'],
  ['crewList', 'CREW_LIST'],
  ['sailingPermit', 'SAILING_PERMIT'],
  ['manifest', 'MANIFEST'],
  ['k11', 'K11']
];

export async function POST(request: NextRequest) {
  const user = await requireUser().catch(() => null);

  if (!user) {
    return NextResponse.redirect(redirectUrl(request, '/login'));
  }

  const formData = await request.formData();
  const companyName = String(formData.get('companyName') || '').trim();
  const vesselName = String(formData.get('vesselName') || '').trim();
  const vesselNo = String(formData.get('vesselNo') || '').trim() || null;
  const slotType = String(formData.get('slotType') || 'NEW_SHIP') as SlotType;
  const arrivalDateValue = String(formData.get('arrivalDate') || '').trim();
  const arrivalDate = arrivalDateValue ? new Date(arrivalDateValue) : null;
  const remarks = String(formData.get('remarks') || '').trim() || null;

  if (!companyName || !vesselName || !(slotType === 'NEW_SHIP' || slotType === 'PC')) {
    return NextResponse.redirect(redirectUrl(request, '/dashboard?error=application'));
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      companyName,
      vesselName,
      vesselNo,
      slotType,
      arrivalDate: arrivalDate && !Number.isNaN(arrivalDate.getTime()) ? arrivalDate : null,
      remarks,
      status: ApplicationStatus.PENDING
    }
  });

  const uploadedFiles: Array<{ type: string; originalName: string; publicPath: string }> = [];

  for (const [fieldName, type] of fileFields) {
    const file = formData.get(fieldName);

    if (file instanceof File && file.size > 0) {
      const uploaded = await saveFile('applications', file);

      await prisma.applicationFile.create({
        data: {
          applicationId: application.id,
          type,
          originalName: file.name,
          filePath: uploaded.publicPath
        }
      });

      uploadedFiles.push({
        type,
        originalName: file.name,
        publicPath: uploaded.publicPath
      });
    }
  }

  const pdf = await generateApplicationPdf({
    applicationId: application.id,
    companyName,
    vesselName,
    vesselNo,
    slotType,
    arrivalDate,
    remarks,
    files: uploadedFiles
  });

  await prisma.application.update({
    where: { id: application.id },
    data: {
      pdfPath: pdf.publicPath
    }
  });

  return NextResponse.redirect(redirectUrl(request, '/dashboard?submitted=application'));
}