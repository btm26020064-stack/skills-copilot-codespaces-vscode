import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

type ApplicationPdfInput = {
  applicationId: string;
  companyName: string;
  vesselName: string;
  vesselNo?: string | null;
  slotType: string;
  arrivalDate?: Date | null;
  remarks?: string | null;
  files: Array<{ type: string; originalName: string; publicPath: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export async function generateApplicationPdf(input: ApplicationPdfInput) {
  const folder = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
  await mkdir(folder, { recursive: true });

  const filename = `application-${input.applicationId}.pdf`;
  const diskPath = path.join(folder, filename);
  const publicPath = `/uploads/pdfs/${filename}`;

  const document = new PDFDocument({ margin: 48, size: 'A4' });
  const stream = createWriteStream(diskPath);

  document.pipe(stream);

  document.fontSize(20).fillColor('#0f172a').text('Slot Application Summary', {
    align: 'left'
  });
  document.moveDown(0.5);
  document.fontSize(10).fillColor('#475569').text(`Application ID: ${input.applicationId}`);
  document.text(`Generated: ${formatDate(new Date())}`);
  document.moveDown(1);

  const rows = [
    ['Company', input.companyName],
    ['Vessel', input.vesselName],
    ['Vessel No.', input.vesselNo || '-'],
    ['Slot Type', input.slotType],
    ['Arrival Date', formatDate(input.arrivalDate)],
    ['Remarks', input.remarks || '-']
  ];

  rows.forEach(([label, value]) => {
    document.fontSize(11).fillColor('#0f172a').text(label, { continued: true, width: 140 });
    document.fillColor('#334155').text(`: ${value}`);
    document.moveDown(0.25);
  });

  document.moveDown(1);
  document.fontSize(14).fillColor('#0f172a').text('Uploaded Files');
  document.moveDown(0.5);

  input.files.forEach((file) => {
    document.fontSize(10).fillColor('#334155').text(`${file.type}: ${file.originalName}`);
    document.fillColor('#64748b').text(file.publicPath, { indent: 14 });
  });

  document.end();

  await new Promise<void>((resolve) => {
    stream.on('finish', () => resolve());
  });

  return {
    diskPath,
    publicPath
  };
}