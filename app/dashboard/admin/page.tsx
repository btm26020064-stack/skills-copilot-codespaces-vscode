import { ApplicationStatus, ReviewStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type DocumentItem = Prisma.DocumentSubmissionGetPayload<{ include: { user: true; reviewer: true } }>;
type ApplicationItem = Prisma.ApplicationGetPayload<{ include: { user: true; reviewer: true; files: true } }>;
type BulletinItem = Prisma.BulletinGetPayload<{ include: { author: true } }>;

function badgeClass(value: ApplicationStatus | ReviewStatus) {
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

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export default async function AdminDashboardPage() {
  const user = await requireRole('ADMIN').catch(() => null);

  if (!user) {
    redirect('/login');
  }

  const [documents, applications, bulletins, totals] = await Promise.all([
    prisma.documentSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, reviewer: true },
      take: 25
    }),
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, reviewer: true, files: true },
      take: 25
    }),
    prisma.bulletin.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true },
      take: 10
    }),
    Promise.all([
      prisma.user.count(),
      prisma.documentSubmission.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'PENDING' } })
    ])
  ]);

  const [totalUsers, pendingDocuments, pendingApplications] = totals;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Total users', totalUsers],
          ['Pending documents', pendingDocuments],
          ['Pending applications', pendingApplications]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value as number}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Admin dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review uploaded documents, approve slot applications, and publish bulletin updates.</p>

          <div className="mt-6 space-y-4">
            {documents.length ? (
              documents.map((document: DocumentItem) => (
                <article key={document.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{document.user.name} · {document.type.replaceAll('_', ' ').toLowerCase()}</p>
                      <p className="text-sm text-slate-500">{document.originalName}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(document.status)}`}>{document.status}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Submitted {formatDate(document.createdAt)} · Reviewer: {document.reviewer?.name || '-'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={`/api/admin/documents/${document.id}`} method="post">
                      <input type="hidden" name="status" value="VERIFIED" />
                      <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">Verify</button>
                    </form>
                    <form action={`/api/admin/documents/${document.id}`} method="post">
                      <input type="hidden" name="status" value="REJECTED" />
                      <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white">Reject</button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No document submissions yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-soft">
            <h2 className="text-2xl font-semibold tracking-tight">Create bulletin</h2>
            <form action="/api/admin/bulletins" method="post" className="mt-5 space-y-4">
              <input name="title" required placeholder="Bulletin title" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400" />
              <textarea name="body" required rows={5} placeholder="Bulletin details" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400" />
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-white/20" />
                Publish immediately
              </label>
              <button type="submit" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">Save bulletin</button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Applications</h2>
            <div className="mt-5 space-y-4">
              {applications.length ? (
                applications.map((application: ApplicationItem) => (
                  <article key={application.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{application.vesselName}</p>
                        <p className="text-sm text-slate-500">{application.user.name} · {application.slotType.replaceAll('_', ' ').toLowerCase()}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(application.status)}`}>{application.status}</span>
                    </div>
                    <div className="mt-3 grid gap-1 text-xs text-slate-500">
                      <p>Files: {application.files.length}</p>
                      <p>PDF: {application.pdfPath || 'Pending'}</p>
                      <p>Submitted: {formatDate(application.createdAt)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={`/api/admin/applications/${application.id}`} method="post">
                        <input type="hidden" name="status" value="APPROVED" />
                        <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">Approve</button>
                      </form>
                      <form action={`/api/admin/applications/${application.id}`} method="post">
                        <input type="hidden" name="status" value="REJECTED" />
                        <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white">Reject</button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">No applications submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Bulletins</h2>
        <div className="mt-5 space-y-4">
          {bulletins.length ? (
            bulletins.map((bulletin: BulletinItem) => (
              <article key={bulletin.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{bulletin.title}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${bulletin.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                    {bulletin.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{bulletin.body}</p>
                <p className="mt-3 text-xs text-slate-500">By {bulletin.author.name} · {formatDate(bulletin.createdAt)}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No bulletins yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}