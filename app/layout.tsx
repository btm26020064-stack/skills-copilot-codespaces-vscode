import type { Metadata } from 'next';
import Link from 'next/link';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import { getSession } from '@/lib/session';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Cargo Portal',
  description: 'Client and admin portal for shipping document submissions and approvals.'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" className={`${manrope.variable} ${mono.variable}`}>
      <body className="font-[var(--font-manrope)] text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-sm font-semibold text-white shadow-lg shadow-teal-700/20">
                CP
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-teal-800 uppercase">Cargo Portal</p>
                <p className="text-xs text-slate-500">Minimal admin and client workflow</p>
              </div>
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100" href="/">
                Home
              </Link>
              {session ? (
                <>
                  <Link className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100" href="/dashboard">
                    Dashboard
                  </Link>
                  {session.role === 'ADMIN' ? (
                    <Link className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100" href="/dashboard/admin">
                      Admin
                    </Link>
                  ) : null}
                  <form action="/api/auth/logout" method="post">
                    <button className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-300 hover:bg-slate-50" type="submit">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link className="rounded-full bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" href="/login">
                  Login
                </Link>
              )}
            </nav>
          </header>

          <main className="flex-1 pb-10">{children}</main>
        </div>
      </body>
    </html>
  );
}