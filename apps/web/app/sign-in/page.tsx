'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="public-page min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(6,10,18,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-sm font-medium tracking-[0.18em] uppercase text-white/86">
            <span className="public-logo-mark" />
            Solar Tracker
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="public-button public-button-secondary">
              View demo
            </Link>
            <Link href="/" className="text-sm text-white/62 transition-colors hover:text-white">
              Back to landing
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">

        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            Invite-only beta
          </p>
          <h1 className="mt-3 text-4xl font-medium leading-tight tracking-[-0.04em] text-slate-50 sm:text-5xl">
            Move from the public preview into the real product.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/64">
            Google sign-in is the beta access request path. After approval, you can connect a supported
            MyEnergi installation and use the full read-only analysis flow with your own data.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Current beta starts with MyEnergi-supported homes',
              'Provider connection happens only after approval',
              'Read-only by design: Solar Tracker never controls devices',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/74">
                <span className="mt-0.5 shrink-0 text-[#7ce8c2]">✓</span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
              Start here if
            </p>
            <ul className="space-y-2 text-sm text-white/62">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/34">·</span>
                <span>You want to use your own installation after approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/34">·</span>
                <span>You already explored the public demo and want the real beta flow.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center mt-12 lg:mt-0">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.04))] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.42)] backdrop-blur-sm">
            <h2 className="text-xl font-medium text-slate-50">Sign in with Google</h2>
            <p className="mt-2 text-sm leading-7 text-white/60">
              Beta access is invite-only. You&rsquo;ll need a <span className="text-white/80">MyEnergi hub</span>,
              serial number, and API key once your request is approved.
            </p>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/live' })}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#f0c46b] px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#f5d185]"
            >
              <GoogleIcon />
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-xs leading-relaxed text-white/42">
              By continuing, you agree to our{' '}
              <a href="#" className="text-white/62 underline underline-offset-2 hover:text-white/86">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-white/62 underline underline-offset-2 hover:text-white/86">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
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
