export default function WaitingPage() {
  // In production this screen is rendered server-side after the OAuth callback
  // creates the user record with status='awaiting_approval'. The signed-in user's
  // email is read from session. Placeholder shown here.
  const userEmail = 'you@example.com';

  return (
    <div className="min-h-screen font-sans text-slate-100 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.06),_transparent_30%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)]">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#101826]">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          <span className="text-sm font-semibold text-slate-100">Solar Tracker</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 flex justify-center">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-800 bg-[#111b2b] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.55)]">

          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Access pending
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">
            You&rsquo;re on the list
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Your request has been received. We&rsquo;ll review it and send an approval email
            to <span className="font-medium text-slate-100">{userEmail}</span> when your
            access is ready.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-4 text-sm leading-relaxed text-slate-400">
            <p className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-400 shrink-0">!</span>
              When you receive your approval email, sign back in with{' '}
              <strong className="text-slate-200">the same Google account</strong> you used today.
              Using a different account will start a new access request.
            </p>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6">
            {/* Sign-out — placeholder until NextAuth is wired (P-040) */}
            <a href="#" className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-300">
              Sign out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
