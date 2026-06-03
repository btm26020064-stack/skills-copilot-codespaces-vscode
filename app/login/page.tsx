type LoginProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-soft backdrop-blur">
      <p className="text-sm font-semibold tracking-[0.25em] text-teal-800 uppercase">Sign in</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Access the portal</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Use the admin or client account created in the database seed.</p>

      {resolvedSearchParams?.error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Invalid email or password.
        </div>
      ) : null}

      <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-teal-700 px-4 py-3 font-medium text-white hover:bg-teal-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}