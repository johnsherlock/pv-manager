// loading.tsx — shown instantly by Next.js while the historical day page fetches.
// Matches the structural layout of HistoricalDayScreen so the transition feels
// like the content is filling in rather than the whole page replacing.

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />;
}

export default function HistoricalDayLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)] font-sans text-slate-100">
      {/* Nav bar */}
      <header className="border-b border-slate-800 bg-[#101826]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Bone className="h-4 w-16" />
            <span className="text-slate-700">/</span>
            <Bone className="h-4 w-28" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200">
            J
          </div>
        </div>
      </header>

      {/* Control bar */}
      <div className="border-b border-slate-800 bg-[#0c1422]/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Bone className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Bone className="h-7 w-7 rounded-full" />
            <Bone className="h-7 w-32" />
            <Bone className="h-7 w-7 rounded-full" />
            <Bone className="h-7 w-7 rounded-full" />
            <Bone className="h-7 w-7 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {/* Day totals panel */}
            <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-5">
              <Bone className="mb-4 h-3 w-20" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Bone className="h-3 w-16" />
                    <Bone className="h-6 w-20" />
                    <Bone className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart panel */}
            <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-5">
              <div className="mb-4 flex items-center justify-between">
                <Bone className="h-4 w-28" />
                <div className="flex gap-2">
                  <Bone className="h-7 w-16 rounded-full" />
                  <Bone className="h-7 w-16 rounded-full" />
                </div>
              </div>
              <Bone className="h-48 w-full rounded-xl" />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Value panel */}
            <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-5">
              <Bone className="mb-3 h-3 w-20" />
              <Bone className="mb-2 h-8 w-32" />
              <Bone className="h-3 w-24" />
            </div>

            {/* Solar coverage panel */}
            <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-5">
              <Bone className="mb-3 h-3 w-24" />
              <div className="flex items-center justify-center py-4">
                <Bone className="h-28 w-28 rounded-full" />
              </div>
            </div>

            {/* Notes panel */}
            <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-5">
              <Bone className="mb-2 h-3 w-12" />
              <Bone className="mb-3 h-5 w-24" />
              <Bone className="mb-4 h-3 w-full" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <Bone className="mb-2 h-4 w-32" />
                    <Bone className="h-3 w-full" />
                    <Bone className="mt-1 h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
