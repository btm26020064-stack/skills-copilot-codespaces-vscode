import Link from 'next/link';

const highlights = [
  'Admin and client login with role-based access',
  'Upload arrival notice, crew list, sailing permit, manifest, and K11',
  'Submit slot applications for new ship and PC',
  'Generate a PDF summary after submission',
  'Verify documents and approve or reject applications',
  'Publish bulletins from the admin dashboard'
];

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-soft backdrop-blur sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-teal-100 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-teal-800">
          Shipping operations portal
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          A clean workspace for document verification, application approvals, and slot handling.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Built for a minimalist admin/client workflow, with MySQL storage and a deployment path that fits a Linux VPS.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50">
            Open dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-soft sm:p-10">
        <p className="text-sm font-semibold tracking-[0.25em] text-teal-300 uppercase">Core modules</p>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-300">
          <div>
            <p className="font-medium text-white">1. Login system</p>
            <p>Separate admin and client access with protected dashboards.</p>
          </div>
          <div>
            <p className="font-medium text-white">2. Document review</p>
            <p>Upload and verify the required shipping documents in one place.</p>
          </div>
          <div>
            <p className="font-medium text-white">3. Slot applications</p>
            <p>Support new ship and PC applications with PDF output on submit.</p>
          </div>
          <div>
            <p className="font-medium text-white">4. Bulletin board</p>
            <p>Admin announcements appear directly inside the dashboard.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}