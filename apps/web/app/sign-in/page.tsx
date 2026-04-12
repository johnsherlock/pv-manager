export default function SignInPage() {
  return (
    <main className="min-h-screen font-sans bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.06),_transparent_30%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-[#111b2b] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.55)]">

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Solar Tracker
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">
          Invite-only beta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Solar Tracker shows you exactly how much your solar installation is cutting your
          electricity bill — with tariff-aware savings, export value, and payback tracking.
        </p>

        {/* Requirements + trust notes */}
        <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-4 text-sm leading-relaxed text-slate-300">
          <p className="font-semibold text-slate-200">Before you sign in</p>
          <p className="mt-1.5">
            This beta requires a <span className="font-medium text-slate-100">MyEnergi hub</span>,
            your hub&rsquo;s <span className="font-medium text-slate-100">serial number</span>, and
            your <span className="font-medium text-slate-100">MyEnergi API key</span>. You&rsquo;ll
            be asked to connect your account after approval.
          </p>
          <ul className="mt-3 space-y-1.5 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              Solar Tracker only ever <strong className="text-slate-300">reads</strong> data from
              your MyEnergi account — it never changes your settings or controls your devices.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              You can delete your account and all associated data at any time from Settings.
            </li>
          </ul>
        </div>

        {/* Sign-in CTA — placeholder until NextAuth / Google OAuth is wired (P-040) */}
        <button
          type="button"
          disabled
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 opacity-40 cursor-not-allowed"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
        <p className="mt-2 text-center text-xs text-slate-600">
          Sign-in will be enabled when beta access opens.
        </p>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-600">
          By continuing, you agree to our{' '}
          <a href="#" className="text-slate-400 underline underline-offset-2 hover:text-slate-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-slate-400 underline underline-offset-2 hover:text-slate-200">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="currentColor" fillOpacity=".8" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="currentColor" fillOpacity=".8" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="currentColor" fillOpacity=".8" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="currentColor" fillOpacity=".8" />
    </svg>
  );
}
