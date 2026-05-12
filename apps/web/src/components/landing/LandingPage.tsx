'use client';

import Link from 'next/link';
import { useScrollReveal } from './useScrollReveal';

// ─── Shared primitives ────────────────────────────────────────────────────────

function reveal(visible: boolean, delay = 0): string {
  return [
    'transition-all duration-700 ease-out',
    delay ? `delay-[${delay}ms]` : '',
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
  ]
    .filter(Boolean)
    .join(' ');
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-[#050b14]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <span className="text-sm font-semibold tracking-wide text-slate-100">Solar Tracker</span>
        <Link
          href="/sign-in"
          className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
        >
          Sign in for beta
        </Link>
      </div>
    </header>
  );
}

// ─── Simulated app UI compositions ───────────────────────────────────────────

function LiveCard() {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#111b2b] p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Live</span>
        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[livePulse_2s_ease-in-out_infinite]" />
          Updated now
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Generation', value: '3.8 kW', color: 'text-amber-400' },
          { label: 'Import', value: '0.2 kW', color: 'text-slate-400' },
          { label: 'Export', value: '1.4 kW', color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-[#0d1726] px-3 py-2">
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-600">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      {/* Simulated sparkline */}
      <div className="h-12 rounded-lg bg-[#0d1726] overflow-hidden relative">
        <svg viewBox="0 0 200 48" className="h-full w-full">
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,36 C20,30 40,18 60,14 C80,10 100,20 120,16 C140,12 160,8 180,10 L200,8 L200,48 L0,48 Z" fill="url(#sparkGrad)" />
          <path d="M0,36 C20,30 40,18 60,14 C80,10 100,20 120,16 C140,12 160,8 180,10 L200,8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

function RangeCard() {
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5, 0.75, 1.0, 0.85, 0.6, 0.7, 0.45, 0.9];
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#111b2b] p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Range history</span>
        <span className="text-[10px] text-slate-600">Last 14 days</span>
      </div>
      <div className="mb-3 flex items-end gap-0.5 h-16">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-amber-500/70"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>Savings</span>
        <span className="text-emerald-400 font-semibold">+£42.30</span>
      </div>
    </div>
  );
}

function FloatingMetricBadge({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className={`rounded-xl border ${accent} bg-[#111b2b]/90 px-3 py-2.5 shadow-xl backdrop-blur-sm`}>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-semibold font-mono text-slate-100">{value}</p>
      <p className="text-[9px] text-slate-600">{sub}</p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-14">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(245,158,11,0.07),transparent_60%),radial-gradient(circle_at_10%_80%,rgba(56,189,248,0.05),transparent_40%)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-32">

        {/* Left — headline */}
        <div className="flex flex-col justify-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-500/80"
            style={{ animation: 'fadeIn 0.7s ease-out 0.1s both' }}
          >
            Invite-only beta
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.06] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
            <span
              className="block"
              style={{ animation: 'fadeIn 0.8s ease-out 0.25s both' }}
            >
              See what your
            </span>
            <span
              className="block text-amber-400"
              style={{ animation: 'fadeIn 0.8s ease-out 0.45s both' }}
            >
              solar is actually
            </span>
            <span
              className="block"
              style={{ animation: 'fadeIn 0.8s ease-out 0.65s both' }}
            >
              worth.
            </span>
          </h1>
          <p
            className="mt-6 max-w-md text-base leading-relaxed text-slate-400"
            style={{ animation: 'fadeIn 0.8s ease-out 0.85s both' }}
          >
            Solar Tracker turns generation, import, export, tariff, and payback context
            into one readable product experience — so your solar installation finally makes financial sense.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: 'fadeIn 0.8s ease-out 1.05s both' }}
          >
            <Link
              href="/sign-in"
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)]"
            >
              Sign in for beta
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:text-slate-100"
            >
              Request access
            </Link>
          </div>
          <p
            className="mt-3 text-xs text-slate-600"
            style={{ animation: 'fadeIn 0.6s ease-out 1.2s both' }}
          >
            Invite-only beta · MyEnergi supported first · Google sign-in required
          </p>
        </div>

        {/* Right — layered product composition */}
        <div
          className="relative flex items-center justify-center lg:justify-end"
          style={{ animation: 'fadeIn 1s ease-out 0.6s both' }}
        >
          <div className="relative w-full max-w-sm lg:max-w-none">
            {/* Main live card */}
            <div className="relative z-10 transform lg:translate-x-4">
              <LiveCard />
            </div>
            {/* Range card — offset behind/below */}
            <div className="relative z-0 mt-3 ml-6 transform lg:ml-10 lg:-mt-2 lg:translate-x-2">
              <RangeCard />
            </div>
            {/* Floating metric badges */}
            <div className="absolute -top-4 -left-2 z-20 hidden lg:block">
              <FloatingMetricBadge
                label="Today's savings"
                value="£8.40"
                sub="vs no solar"
                accent="border-emerald-500/30"
              />
            </div>
            <div className="absolute bottom-0 -right-4 z-20 hidden lg:block">
              <FloatingMetricBadge
                label="Export value"
                value="£1.96"
                sub="today"
                accent="border-amber-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600"
           style={{ animation: 'fadeIn 0.6s ease-out 1.5s both' }}>
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="h-5 w-px bg-gradient-to-b from-slate-600 to-transparent" />
      </div>
    </section>
  );
}

// ─── Product Tension ──────────────────────────────────────────────────────────

function TensionSection() {
  const { ref, visible } = useScrollReveal<HTMLElement>();
  const points = [
    'What you actually generated',
    'What you imported anyway',
    'What your exports were worth',
    'How your tariff shaped the result',
  ];

  return (
    <section ref={ref} className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          <div className={reveal(visible)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
              The problem
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-50 lg:text-5xl">
              Most solar dashboards stop at activity. They show movement, not meaning.
            </h2>
          </div>
          <div className={`space-y-5 ${reveal(visible, 150)}`}>
            <p className="text-base leading-relaxed text-slate-400">
              Your inverter tells you how much you generated. It doesn&rsquo;t tell you what that was worth,
              how it compared to what you still imported, or whether your system is paying back the way you expected.
            </p>
            <div className="space-y-3 pt-2">
              {points.map((point, i) => (
                <div
                  key={point}
                  className={`flex items-start gap-3 text-sm text-slate-300 transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: visible ? `${200 + i * 80}ms` : '0ms' }}
                >
                  <span className="mt-0.5 shrink-0 text-xs font-mono text-amber-500/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Screenshot Stage ─────────────────────────────────────────────────────────

function ScreenshotStage() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-8 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1726] p-6 sm:p-10 transition-all duration-1000 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'}`}>
          <div className="mb-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
              The product
            </p>
            <p className="mt-2 text-lg font-medium text-slate-300">
              Financial and operational clarity, in one view.
            </p>
          </div>

          {/* Simulated main dashboard composition */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Main panel — range summary */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-700/50 bg-[#111b2b] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Range Summary</p>
                    <p className="text-[10px] text-slate-600">1 Apr – 30 Apr 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Net savings</p>
                    <p className="text-xl font-semibold font-mono text-emerald-400">£127.40</p>
                  </div>
                </div>
                {/* Simulated bar chart */}
                <div className="flex items-end gap-0.5 h-24 mb-3">
                  {[0.5,0.7,0.4,0.8,0.65,0.9,0.55,0.75,0.6,0.85,0.45,0.7,0.8,0.5,0.9,0.65,0.75,0.6,0.85,0.55,0.7,0.9,0.5,0.8,0.65,0.75,0.45,0.85,0.6,0.7].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 100}%`, background: `rgba(245,158,11,${0.4 + h * 0.4})` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>1 Apr</span>
                  <span>30 Apr</span>
                </div>
              </div>
            </div>

            {/* Side panels */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 rounded-2xl border border-slate-700/50 bg-[#111b2b] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">Breakdown</p>
                {[
                  { label: 'Generated', value: '412 kWh', color: 'text-amber-400' },
                  { label: 'Exported', value: '189 kWh', color: 'text-emerald-400' },
                  { label: 'Imported', value: '94 kWh', color: 'text-slate-400' },
                  { label: 'Self-used', value: '223 kWh', color: 'text-sky-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-800 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={`text-xs font-mono font-medium ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-1">Payback</p>
                <p className="text-2xl font-semibold font-mono text-emerald-400">38%</p>
                <p className="text-[10px] text-slate-600 mt-0.5">of system cost recovered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Value Pillars ────────────────────────────────────────────────────────────

const pillars = [
  {
    icon: '◎',
    headline: 'See the whole energy picture',
    body: 'Solar generation, import, export, and household demand in one readable flow.',
  },
  {
    icon: '£',
    headline: 'Understand the money, not just the power',
    body: 'Tariff-aware history, export value, and payback context that map to real household decisions.',
  },
  {
    icon: '✓',
    headline: 'Trust what the app is telling you',
    body: 'Freshness, read-only access, and setup-aware interpretation instead of black box scorecards.',
  },
];

function ValuePillars() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mb-12 text-center ${reveal(visible)}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
            Why it works
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-50 lg:text-5xl">
            Built around what matters.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.headline}
              className={`group rounded-3xl border border-slate-800 bg-[#0d1726] p-8 transition-all duration-700 ease-out hover:border-amber-500/30 hover:bg-[#111b2b] hover:-translate-y-1 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-lg text-amber-400">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-100 leading-snug mb-3">
                {pillar.headline}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Range Value ──────────────────────────────────────────────────────────────

function RangeValueSection() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text */}
          <div className={reveal(visible)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
              Long-term value
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-50 lg:text-5xl">
              Your best solar day is interesting. Your long-term value is what matters.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              Daily snapshots are useful. Months of context tell you whether your system is performing,
              what your export tariff has actually been worth, and how close you are to recovering your investment.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Usage and export patterns across any date range',
                'Tariff shape and how it changes your bottom line',
                'Payback direction tracked against system cost',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Simulated range history visual */}
          <div className={`transition-all duration-700 ease-out delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="rounded-3xl border border-slate-800 bg-[#0d1726] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Annual summary</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Jan – Dec 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Total savings</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400">£1,482</p>
                </div>
              </div>

              {/* Monthly bars */}
              <div className="grid grid-cols-12 gap-1 items-end h-32 mb-2">
                {[0.3,0.35,0.5,0.65,0.9,1.0,0.95,0.92,0.75,0.55,0.38,0.28].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm"
                      style={{ height: `${h * 100}%`, background: `rgba(245,158,11,${0.35 + h * 0.5})` }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-12 gap-1">
                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m) => (
                  <p key={m} className="text-center text-[8px] text-slate-700">{m}</p>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Generated', value: '4,320 kWh', color: 'text-amber-400' },
                  { label: 'Exported', value: '1,840 kWh', color: 'text-emerald-400' },
                  { label: 'Payback', value: '42%', color: 'text-sky-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl bg-[#111b2b] px-3 py-2 text-center">
                    <p className="text-[9px] text-slate-600">{label}</p>
                    <p className={`mt-0.5 text-xs font-semibold font-mono ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Live / Trust / Freshness ─────────────────────────────────────────────────

function LiveTrustSection() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Simulated live view */}
          <div className={`order-2 lg:order-1 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="rounded-3xl border border-slate-800 bg-[#0d1726] p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[livePulse_2s_ease-in-out_infinite]" />
                <span className="text-xs font-medium text-emerald-400">Live · Updated 2 min ago</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Solar output', value: '4.1 kW', sub: 'peak today: 5.2 kW', color: 'text-amber-400', glow: 'border-amber-500/20 bg-amber-500/5' },
                  { label: 'Household use', value: '1.3 kW', sub: 'below daily avg', color: 'text-slate-300', glow: 'border-slate-700/50 bg-transparent' },
                  { label: 'Grid export', value: '2.8 kW', sub: '£0.149 / kWh', color: 'text-emerald-400', glow: 'border-emerald-500/20 bg-emerald-500/5' },
                  { label: 'Grid import', value: '0 kW', sub: 'fully self-powered', color: 'text-slate-500', glow: 'border-slate-800 bg-transparent' },
                ].map(({ label, value, sub, color, glow }) => (
                  <div key={label} className={`rounded-2xl border ${glow} p-3`}>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-slate-600">{label}</p>
                    <p className={`mt-1 text-lg font-semibold font-mono ${color}`}>{value}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Weather/daylight context strip */}
              <div className="rounded-xl border border-slate-800 bg-[#111b2b] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">☀</span>
                  <span className="text-xs text-slate-400">Clear skies · 14°C</span>
                </div>
                <span className="text-[10px] text-slate-600">5h 20m daylight remaining</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className={`order-1 lg:order-2 ${reveal(visible, 150)}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
              Live context
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-50 lg:text-5xl">
              Live context when you want it. Historical clarity when you need it.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              The live view shows current generation, import, export, and household demand — updated
              continuously from your MyEnergi hub. Data freshness is a feature, not hidden plumbing.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Current flow across generation, import, and export',
                'Weather and daylight context for the day',
                'Confidence about when the data last updated',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Supported Setup ──────────────────────────────────────────────────────────

function SupportedSetupSection() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-[#0d1726] p-8 sm:p-10 ${reveal(visible)}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
            Who it&rsquo;s for now
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-50">
            Built for real homes, starting narrowly on purpose.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Solar Tracker is beginning with a specific, well-understood setup so the experience stays
            trustworthy during beta. Broadening provider support comes after the core product is right.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Hardware', value: 'MyEnergi hub', note: 'Zappi, Eddi, Harvi, Hub' },
              { label: 'Access', value: 'Invite-only', note: 'Sign in to request access' },
              { label: 'Sign-in', value: 'Google account', note: 'Required for beta' },
            ].map(({ label, value, note }) => (
              <div key={label} className="rounded-2xl border border-slate-700/40 bg-[#111b2b] p-4">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-200">{value}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

function PrivacySection() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mx-auto max-w-xl text-center ${reveal(visible)}`}>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-500 text-lg mb-5">
            🔒
          </div>
          <h2 className="text-2xl font-semibold text-slate-100">Read-only by design.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Solar Tracker is built to help you understand your system, not interfere with it.
            It reads from your MyEnergi account, never writes. No settings changed, no devices controlled.
            You can delete your account and all data at any time from Settings.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Conversion Band ──────────────────────────────────────────────────────────

function ConversionBand() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mb-10 text-center ${reveal(visible)}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/70">
            Get started
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-50 lg:text-5xl">
            See it first. Commit when ready.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Sign in — primary */}
          <div className={`group rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 transition-all duration-500 hover:border-amber-500/40 hover:bg-amber-500/8 ${visible ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-6'} transition-all duration-700 ease-out`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
              Invite-only beta
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">Request beta access</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Sign in with Google to request access. You&rsquo;ll need a MyEnergi hub, serial number,
              and API key after approval.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Sign in for beta
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* What to expect */}
          <div className={`group rounded-3xl border border-slate-700 bg-[#0d1726] p-8 transition-all duration-500 hover:border-slate-600 hover:bg-[#111b2b] ${visible ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-6'} transition-all duration-700 ease-out`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              What to expect
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">How beta access works</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Sign in with your Google account to join the waitlist. Once approved, connect your
              MyEnergi hub and the full product experience unlocks.
            </p>
            <ol className="mt-5 space-y-2">
              {['Sign in with Google', 'Wait for approval email', 'Connect your MyEnergi hub'].map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[10px] font-semibold text-slate-600">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  return (
    <footer ref={ref} className="border-t border-slate-800/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`text-center ${reveal(visible)}`}>
          <h2 className="text-4xl font-semibold text-slate-50 lg:text-5xl">
            Make your solar legible.
          </h2>
          <p className="mt-4 text-base text-slate-500">
            See the system. Understand the value.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-300 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
            >
              Sign in for beta
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-6 text-xs text-slate-700">
          <span>Solar Tracker</span>
          <span>·</span>
          <a href="#" className="transition-colors hover:text-slate-500">Terms of Service</a>
          <span>·</span>
          <a href="#" className="transition-colors hover:text-slate-500">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-slate-100 bg-[#050b14]">
      {/* Ambient background — subtle across whole page */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(15,23,42,0.9),transparent)] z-0" />

      <div className="relative z-10">
        <LandingNav />
        <HeroSection />

        {/* Section dividers — faint horizontal rule */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <hr className="border-slate-800/60" />
        </div>

        <TensionSection />
        <ScreenshotStage />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <hr className="border-slate-800/60" />
        </div>

        <ValuePillars />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <hr className="border-slate-800/60" />
        </div>

        <RangeValueSection />
        <LiveTrustSection />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <hr className="border-slate-800/60" />
        </div>

        <SupportedSetupSection />
        <PrivacySection />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <hr className="border-slate-800/60" />
        </div>

        <ConversionBand />
        <FooterCTA />
      </div>
    </div>
  );
}
