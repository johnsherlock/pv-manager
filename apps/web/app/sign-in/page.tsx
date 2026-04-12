export default function SignInPage() {
  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 480 }}>
        <p className="eyebrow">Solar Tracker</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>Invite-only beta</h1>

        <p className="copy" style={{ marginTop: 16 }}>
          Solar Tracker shows you exactly how much your solar installation is cutting your electricity
          bill — with tariff-aware savings, export value, and payback tracking.
        </p>

        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'rgba(13, 107, 87, 0.07)',
            border: '1px solid rgba(13, 107, 87, 0.2)',
            borderRadius: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text)' }}>
            <strong>Before you sign in:</strong> this beta requires a{' '}
            <strong>MyEnergi hub</strong>, your hub&rsquo;s <strong>serial number</strong>, and
            your <strong>MyEnergi API key</strong>. You&rsquo;ll be asked to connect your account
            after approval.
          </p>
        </div>

        {/* Sign-in CTA — placeholder until NextAuth / Google OAuth is wired (P-040) */}
        <button
          type="button"
          disabled
          style={{
            marginTop: 28,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '13px 20px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'not-allowed',
            opacity: 0.6,
          }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
        <p
          style={{
            marginTop: 8,
            fontSize: '0.78rem',
            color: 'var(--muted)',
            textAlign: 'center',
          }}
        >
          Sign-in will be enabled when beta access opens.
        </p>

        <p
          style={{
            marginTop: 24,
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
            textAlign: 'center',
          }}
        >
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: 'var(--accent)' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" style={{ color: 'var(--accent)' }}>
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
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#fff"
        fillOpacity=".9"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#fff"
        fillOpacity=".9"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#fff"
        fillOpacity=".9"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#fff"
        fillOpacity=".9"
      />
    </svg>
  );
}
