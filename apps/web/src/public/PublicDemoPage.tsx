import Link from 'next/link';
import { demoExclusions, demoIncludes, publicSecondaryCta } from './content';

function DemoColumnChart() {
  const series = [42, 58, 54, 76, 68, 84, 74];

  return (
    <div className="flex items-end gap-3">
      {series.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="flex-1 rounded-t-[1.4rem] bg-gradient-to-t from-[#4aa6ff] via-[#67d7d2] to-[#f3c873]"
          style={{ height: `${value * 1.5}px` }}
        />
      ))}
    </div>
  );
}

export function PublicDemoPage() {
  return (
    <div className="public-page min-h-screen">
      <header className="border-b border-white/10 bg-[rgba(6,10,18,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">Public preview</p>
            <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-white">Solar Tracker demo</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="public-button public-button-secondary">
              Back to landing
            </Link>
            <Link href={publicSecondaryCta.href} className="public-button public-button-primary">
              {publicSecondaryCta.label}
            </Link>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-300/16 bg-[rgba(242,184,88,0.1)]">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-amber-100/84 sm:px-6 lg:px-8">
          Demo mode is read-only and uses sample data. Settings, provider setup, and write flows stay out of this preview.
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
        <section className="space-y-6">
          <div className="public-panel-soft p-7">
            <p className="public-kicker">Today at a glance</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-white">Sample installation overview</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/64">
              This preview keeps the product legible without asking for sign-in or credentials. It shows the
              kind of relationship the app makes visible between live flow, cost, and longer-range value.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Solar-created value', value: 'EUR 5.82' },
              { label: 'Export credit', value: 'EUR 1.14' },
              { label: 'Self-consumption', value: '71%' },
            ].map((card) => (
              <div key={card.label} className="public-panel-soft p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/34">{card.label}</p>
                <p className="mt-5 text-3xl text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="public-panel-soft p-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/34">Sample 7-day trend</p>
                <p className="mt-3 text-3xl font-medium text-white">Value and flow over time</p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/52">read-only preview</div>
            </div>
            <div className="mt-8">
              <DemoColumnChart />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="public-panel-soft p-6">
            <p className="public-kicker">What this demo includes</p>
            <div className="mt-6 space-y-4">
              {demoIncludes.map((item) => (
                <div key={item} className="flex items-start gap-3 text-white/76">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#7ce8c2]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="public-panel-soft p-6">
            <p className="public-kicker">What stays out</p>
            <div className="mt-6 space-y-4">
              {demoExclusions.map((item) => (
                <div key={item} className="flex items-start gap-3 text-white/72">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#f0c46b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="public-panel-soft p-6">
            <p className="public-kicker">Next step</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white">Want to use your own installation?</h2>
            <p className="mt-4 text-base leading-8 text-white/64">
              Sign in with Google to request beta access. After approval, the real product flow continues through
              supported-provider connection rather than this public preview.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={publicSecondaryCta.href} className="public-button public-button-primary">
                {publicSecondaryCta.label}
              </Link>
              <Link href="/" className="public-button public-button-secondary">
                Return to landing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
