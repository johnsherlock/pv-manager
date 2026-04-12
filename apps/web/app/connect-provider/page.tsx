'use client';

import { useState } from 'react';

export default function ConnectProviderPage() {
  // This screen is shown to approved users who have no valid provider connection.
  // Auth middleware routes them here instead of the app until a connection exists.
  // The actual credentials form and server-side validation are built in P-038 / U-048.

  return (
    <div className="min-h-screen font-sans text-slate-100 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.06),_transparent_30%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)]">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#101826]">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          <span className="text-sm font-semibold text-slate-100">Solar Tracker</span>
          <span className="mx-2 text-slate-700">/</span>
          <span className="text-sm font-semibold text-slate-100">Setup</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 flex justify-center">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-800 bg-[#111b2b] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.55)]">

          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Required setup
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">
            Connect your MyEnergi account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Solar Tracker reads live and historical data directly from your MyEnergi hub.
            This is the only required step before you can use the app.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            Your credentials are stored securely on our servers and are never shared or
            exposed in the browser.
          </div>

          {/* Credentials form placeholder — built in P-038 / U-048 */}
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">
                Serial number
              </label>
              <input
                type="text"
                placeholder="e.g. 12345678"
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-500 placeholder-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">
                API key
              </label>
              <input
                type="password"
                placeholder="Your MyEnergi API key"
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-500 placeholder-slate-700 cursor-not-allowed"
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 opacity-40 cursor-not-allowed"
            >
              Connect MyEnergi
            </button>
            <p className="text-center text-xs text-slate-600">
              Connection form will be enabled in the next release.
            </p>
          </div>

          <CredentialsHelp />

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

function CredentialsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
      >
        <span className="text-[10px]">{open ? '▾' : '▸'}</span>
        How do I find my MyEnergi credentials?
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm leading-relaxed text-slate-400">
          <p className="font-semibold text-slate-300">Serial number</p>
          <p className="mt-1">
            Your 8-digit serial number is printed on the sticker on the side of your MyEnergi
            hub (Zappi, Harvi, or Eddi). It is also shown in the MyEnergi app under{' '}
            <em>Settings → Hub</em>.
          </p>

          <p className="mt-4 font-semibold text-slate-300">API key</p>
          <p className="mt-1">
            Open the MyEnergi app, go to <em>Settings → Advanced → API</em>, and tap{' '}
            <em>Generate API key</em>. Copy the key shown — it will not be displayed again.
            If you have already generated a key, you can regenerate it from the same screen.
          </p>
        </div>
      )}
    </div>
  );
}
