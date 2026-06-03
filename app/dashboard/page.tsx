import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type DocumentItem = Prisma.DocumentSubmissionGetPayload<{ include: { reviewer: true } }>;
type ApplicationItem = Prisma.ApplicationGetPayload<{ include: { files: true; reviewer: true } }>;
type BulletinItem = Prisma.BulletinGetPayload<{ include: { author: true } }>;

function badgeClass(value: string) {
  switch (value) {
    case 'APPROVED':
    case 'VERIFIED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'REJECTED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await requireUser().catch(() => null);

  if (!user) {
    redirect('/login');
  }

  const [documents, applications, bulletins] = await Promise.all([
    prisma.documentSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { reviewer: true }
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { files: true, reviewer: true }
    }),
    prisma.bulletin.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
      take: 5
    })
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Client area</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Welcome, {user.name}</h1>
            <p className="text-sm leading-6 text-slate-600">Submit shipping documents and track your slot applications in one place.</p>
          </div>

          <form action="/api/documents" method="post" encType="multipart/form-data" className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Upload a document</h2>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Document type</span>
              <select name="type" required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="ARRIVAL_NOTICE">Arrival notice</option>
                <option value="CREW_LIST">Crew list</option>
                <option value="SAILING_PERMIT">Sailing permit</option>
                <option value="MANIFEST">Manifest</option>
                <option value="K11">K11 permit</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">File</span>
              <input name="file" type="file" required className="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Note</span>
              <textarea name="note" rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Optional note for the admin" />
            </label>
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700">
              Submit document
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-soft">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Application form</p>
            <h2 className="text-2xl font-semibold tracking-tight">Submit a slot application</h2>
            <p className="text-sm leading-6 text-slate-300">Fill in the form, upload the required files, and receive a PDF record after submission.</p>
          </div>

          <form action="/api/applications" method="post" encType="multipart/form-data" className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">Company name</span>
              <input name="companyName" required className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Vessel name</span>
              <input name="vesselName" required className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Vessel no.</span>
              <input name="vesselNo" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Slot type</span>
              <select name="slotType" required className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-900">
                <option value="NEW_SHIP">New ship</option>
                <option value="PC">PC</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Arrival date</span>
              <input name="arrivalDate" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">Remarks</span>
              <textarea name="remarks" rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400" />
            </label>

            {[
              ['arrivalNotice', 'Arrival notice'],
              ['crewList', 'Crew list'],
              ['sailingPermit', 'Sailing permit'],
              ['manifest', 'Manifest'],
              ['k11', 'K11 permit']
            ].map(([fieldName, label]) => (
              <label key={fieldName} className="block sm:col-span-1">
                <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
                <input name={fieldName} type="file" className="block w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-200" />
              </label>
            ))}

            <button type="submit" className="sm:col-span-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">
              Submit application and generate PDF
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">My documents</h2>
          <div className="mt-5 space-y-4">
            {documents.length ? (
              documents.map((document: DocumentItem) => (
                <article key={document.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{document.type.replaceAll('_', ' ').toLowerCase()}</p>
                      <p className="text-sm text-slate-500">{document.originalName}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(document.status)}`}>{document.status}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Submitted {formatDate(document.createdAt)} · Reviewer: {document.reviewer?.name || '-'}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No documents submitted yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">My applications</h2>
          <div className="mt-5 space-y-4">
            {applications.length ? (
              applications.map((application: ApplicationItem) => (
                <article key={application.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{application.vesselName}</p>
                      <p className="text-sm text-slate-500">{application.companyName} · {application.slotType.replaceAll('_', ' ').toLowerCase()}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(application.status)}`}>{application.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500">
                    <p>Submitted {formatDate(application.createdAt)} · Reviewer: {application.reviewer?.name || '-'}</p>
                    <p>PDF: {application.pdfPath ? application.pdfPath : 'Pending'}</p>
                    <p>Files: {application.files.length}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No applications submitted yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Bulletins</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {bulletins.length ? (
            bulletins.map((bulletin: BulletinItem) => (
              <article key={bulletin.id} className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-900">{bulletin.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{bulletin.body}</p>
                <p className="mt-4 text-xs text-slate-500">By {bulletin.author.name} · {formatDate(bulletin.createdAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No active bulletins yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}