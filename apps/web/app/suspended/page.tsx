export default function SuspendedPage() {
  // This screen is shown when a signed-in user has status='suspended'.
  // Auth middleware routes suspended users here instead of the app.
  // A suspension-management UI is explicitly deferred (decision 0006 §11).

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
            Account status
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">
            Access paused
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Your access to Solar Tracker has been paused. Your data is safe and has not been
            removed.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            If you have questions or believe this is a mistake, contact us at{' '}
            <a
              href="mailto:support@solartracker.app"
              className="text-slate-300 underline underline-offset-2 hover:text-slate-100"
            >
              support@solartracker.app
            </a>
            .
          </p>

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
