import Link from 'next/link';
import {
  betaHighlights,
  heroMetrics,
  publicNavLinks,
  publicPrimaryCta,
  publicSecondaryCta,
  tensionPoints,
  trustPoints,
  valuePillars,
} from './content';

function EnergyBars() {
  const bars = [
    { label: '06', generation: 12, import: 48, export: 4 },
    { label: '09', generation: 38, import: 28, export: 8 },
    { label: '12', generation: 78, import: 8, export: 26 },
    { label: '15', generation: 66, import: 12, export: 18 },
    { label: '18', generation: 22, import: 42, export: 2 },
    { label: '21', generation: 4, import: 54, export: 0 },
  ];

  return (
    <div className="grid grid-cols-6 gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-3">
          <div className="flex h-48 w-full items-end justify-center gap-1">
            <span className="w-3 rounded-full bg-[rgba(242,184,88,0.95)]" style={{ height: `${bar.generation}%` }} />
            <span className="w-3 rounded-full bg-[rgba(90,163,255,0.9)]" style={{ height: `${bar.import}%` }} />
            <span className="w-3 rounded-full bg-[rgba(109,224,184,0.85)]" style={{ height: `${bar.export}%` }} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function RangeSparkline() {
  const points = [24, 36, 44, 58, 48, 72, 64, 82, 68, 78, 88, 94];

  return (
    <div className="flex items-end gap-2">
      {points.map((point, index) => (
        <span
          key={`${point}-${index}`}
          className="w-4 rounded-t-full bg-gradient-to-t from-[#61f0c2] to-[#f0c46b]"
          style={{ height: `${point}px` }}
        />
      ))}
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(6,10,18,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-medium tracking-[0.18em] text-white/86 uppercase">
          <span className="public-logo-mark" />
          Solar Tracker
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNavLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/62 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={publicSecondaryCta.href}
            className="hidden rounded-full border border-white/14 px-4 py-2 text-sm text-white/84 transition-colors hover:border-white/30 hover:text-white sm:inline-flex"
          >
            {publicSecondaryCta.label}
          </Link>
          <Link href={publicPrimaryCta.href} className="public-button public-button-primary">
            {publicPrimaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicLandingPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="public-hero-glow public-hero-glow-left" />
          <div className="public-hero-glow public-hero-glow-right" />
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-18 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
            <div className="public-reveal space-y-8">
              <div className="space-y-5">
                <p className="public-kicker">Invite-only beta. Product-led preview.</p>
                <h1 className="max-w-4xl text-5xl leading-[0.92] font-medium tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">
                  See what your solar is actually worth.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                  Solar Tracker turns generation, import, export, tariff context, and payback signals
                  into one calm view that feels legible from the first glance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={publicPrimaryCta.href} className="public-button public-button-primary">
                  {publicPrimaryCta.label}
                </Link>
                <Link href={publicSecondaryCta.href} className="public-button public-button-secondary">
                  {publicSecondaryCta.label}
                </Link>
              </div>

              <p className="text-sm text-white/42">
                MyEnergi supported first. Google sign-in is the beta access request path.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="public-glass-panel p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{metric.label}</p>
                    <p className="mt-4 text-2xl font-medium tracking-[-0.03em] text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-white/48">{metric.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="public-reveal-delay relative">
              <div className="public-dashboard-frame">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Sample installation</p>
                    <h2 className="mt-2 text-lg font-medium text-white">Fixture Home</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    Live data, read-only
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="public-panel-soft p-5">
                    <div className="mb-5 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Today</p>
                        <p className="mt-2 text-3xl font-medium tracking-[-0.03em] text-white">EUR 5.82</p>
                        <p className="mt-1 text-sm text-white/48">estimated solar-created value</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Export credit</p>
                        <p className="mt-2 text-lg text-white/82">EUR 1.14</p>
                      </div>
                    </div>
                    <EnergyBars />
                    <div className="mt-4 flex items-center gap-4 text-xs text-white/38">
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f2b858]" /> generation</span>
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#5aa3ff]" /> import</span>
                      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#6de0b8]" /> export</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="public-panel-soft p-5">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Range history</p>
                      <div className="mt-4 flex items-end justify-between gap-5">
                        <div>
                          <p className="text-3xl font-medium tracking-[-0.03em] text-white">EUR 126</p>
                          <p className="mt-1 text-sm text-white/48">sample net savings in the last 30 days</p>
                        </div>
                        <RangeSparkline />
                      </div>
                    </div>

                    <div className="public-panel-soft p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Weather context</p>
                          <p className="mt-3 text-xl text-white">Light cloud, clean solar window</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-white">14C</p>
                          <p className="mt-1 text-xs text-white/46">sunset 21:11</p>
                        </div>
                      </div>
                    </div>

                    <div className="public-panel-soft p-5">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Trust</p>
                      <p className="mt-3 text-base text-white/78">Freshness, tariff context, and read-only framing built in from the start.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="public-floating-card public-floating-card-top">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Payback progress</p>
                <p className="mt-3 text-xl font-medium text-white">Steady recovery, not vague optimism.</p>
              </div>
              <div className="public-floating-card public-floating-card-bottom">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Read-only by design</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Preview the product without connecting your own installation.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="public-reveal">
              <p className="public-kicker">Why this exists</p>
              <h2 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
                Most solar dashboards stop at activity. They show movement, not meaning.
              </h2>
            </div>
            <div className="public-reveal-delay grid gap-4 sm:grid-cols-2">
              {tensionPoints.map((point) => (
                <div key={point} className="public-panel-soft p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/34">Tension</p>
                  <p className="mt-5 text-2xl leading-9 tracking-[-0.03em] text-white/86">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {valuePillars.map((pillar, index) => (
              <article
                key={pillar.title}
                className={`public-card-stack public-reveal ${index === 1 ? 'lg:translate-y-8' : ''} ${index === 2 ? 'lg:translate-y-4' : ''}`}
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/36">Value pillar</p>
                <h3 className="mt-5 text-2xl font-medium tracking-[-0.03em] text-white">{pillar.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/64">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
          <div className="public-reveal public-panel-soft p-8">
            <p className="public-kicker">Range value</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white">
              Your best solar day is interesting. Your long-term value is what matters.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/64">
              The product connects usage, tariff shape, export behavior, and payback context over time so the
              story feels financial, not decorative.
            </p>
            <div className="mt-10 space-y-4">
              {[
                'Period savings that remain visibly tied to tariff context',
                'Export value separated instead of hidden inside one vague total',
                'Recovery and payoff language that stays honest about progress',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-t border-white/8 pt-4 text-white/76">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#f0c46b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="public-reveal-delay public-panel-soft overflow-hidden p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Sample range view</p>
                <p className="mt-3 text-3xl font-medium text-white">Last 30 days</p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/56">tariff-aware</div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Net savings', value: 'EUR 126' },
                { label: 'Export value', value: 'EUR 24' },
                { label: 'Self-consumption', value: '71%' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-black/18 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/34">{item.label}</p>
                  <p className="mt-4 text-2xl text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
              <div className="flex items-end gap-3">
                {[36, 42, 48, 40, 52, 58, 64, 56, 62, 72, 76, 68].map((point, index) => (
                  <span
                    key={`${point}-${index}`}
                    className="flex-1 rounded-t-[1.5rem] bg-gradient-to-t from-[#f2b858] via-[#e0b36d] to-[#7ce8c2]"
                    style={{ height: `${point * 1.8}px` }}
                  />
                ))}
              </div>
              <div className="mt-5 flex justify-between text-[10px] uppercase tracking-[0.28em] text-white/28">
                <span>week 1</span>
                <span>week 2</span>
                <span>week 3</span>
                <span>week 4</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
          <div className="public-reveal public-panel-soft p-8">
            <p className="public-kicker">Live context</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white">
              Live context when you want it. Historical clarity when you need it.
            </h2>
            <p className="mt-6 text-base leading-8 text-white/64">
              Freshness, current flow, weather, and daylight belong in the experience, but they should support
              understanding rather than drown it.
            </p>
          </div>

          <div className="public-reveal-delay grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Current generation', body: 'See the present state of the installation at a glance.' },
              { title: 'Weather and daylight', body: 'Understand the shape of the day without pretending weather is output.' },
              { title: 'Freshness signals', body: 'Know when the product last saw usable data.' },
              { title: 'Trust framing', body: 'Read-only context stays visible before and after sign-in.' },
            ].map((item) => (
              <div key={item.title} className="public-panel-soft p-5">
                <h3 className="text-xl tracking-[-0.03em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="beta" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
          <div className="public-reveal public-panel-soft p-8">
            <p className="public-kicker">Current beta shape</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white">
              Built for real homes, starting narrowly on purpose.
            </h2>
            <div className="mt-8 space-y-4">
              {betaHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 text-white/76">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#7ce8c2]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="public-reveal-delay public-panel-soft p-8">
            <p className="public-kicker">Read-only by design</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white">Preview the product without handing it control.</h2>
            <div className="mt-8 space-y-4">
              {trustPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 border-t border-white/8 pt-4 text-white/72">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#f0c46b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] lg:grid-cols-2 lg:p-8">
            <div className="public-panel-soft p-6">
              <p className="public-kicker">Preview first</p>
              <h3 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white">Explore the read-only demo.</h3>
              <p className="mt-4 text-base leading-8 text-white/64">
                Sample data, no sign-in, no setup friction. Enough product texture to understand the experience
                before you commit.
              </p>
              <div className="mt-8">
                <Link href={publicPrimaryCta.href} className="public-button public-button-primary">
                  {publicPrimaryCta.label}
                </Link>
              </div>
            </div>

            <div className="public-panel-soft p-6">
              <p className="public-kicker">Join the beta</p>
              <h3 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white">Use your own installation after approval.</h3>
              <p className="mt-4 text-base leading-8 text-white/64">
                Sign in with Google to request access. After approval, you can connect a supported MyEnergi setup
                and move into the real product flow.
              </p>
              <div className="mt-8">
                <Link href={publicSecondaryCta.href} className="public-button public-button-secondary">
                  {publicSecondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 text-sm text-white/42 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <p className="text-3xl font-medium tracking-[-0.04em] text-white">Make your solar legible.</p>
          <p className="mt-3 max-w-xl leading-7">
            See the system. Understand the value. Start with the demo, then step into the beta when the setup matches.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={publicPrimaryCta.href} className="public-button public-button-primary">
            {publicPrimaryCta.label}
          </Link>
          <Link href={publicSecondaryCta.href} className="public-button public-button-secondary">
            {publicSecondaryCta.label}
          </Link>
        </div>
      </footer>
    </div>
  );
}
