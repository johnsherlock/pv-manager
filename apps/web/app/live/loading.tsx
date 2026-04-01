// Fallback shown by Next.js while the live page loads (e.g. direct URL load).
// With useTransition on HistoricalDayScreen, this also covers the return
// journey from a historical day back to /live.
export default function LiveLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)] font-sans text-slate-100">
      <header className="border-b border-slate-800 bg-[#101826]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800" />
        </div>
      </header>
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg
            className="h-6 w-6 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-xs tracking-wide">Loading</span>
        </div>
      </div>
    </div>
  );
}
