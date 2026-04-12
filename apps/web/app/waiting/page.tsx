export default function WaitingPage() {
  // In production this screen is rendered server-side after the OAuth callback
  // creates the user record with status='awaiting_approval'. The signed-in user's
  // email is passed as a prop or read from session. Placeholder shown here.
  const userEmail = 'you@example.com';

  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>⏳</div>

        <p className="eyebrow">Solar Tracker</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>You&rsquo;re on the list</h1>

        <p className="copy" style={{ marginTop: 16 }}>
          Your request has been received. We&rsquo;ll review it and send an approval email to{' '}
          <strong>{userEmail}</strong> when your access is ready.
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
            <strong>Important:</strong> when you receive your approval email, sign back in with{' '}
            <strong>the same Google account</strong> you used today. Using a different account
            will start a new access request.
          </p>
        </div>

        <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          {/* Sign-out — placeholder until NextAuth is wired (P-040) */}
          <a
            href="#"
            style={{
              display: 'inline-block',
              fontSize: '0.9rem',
              color: 'var(--muted)',
              textDecoration: 'underline',
            }}
          >
            Sign out
          </a>
        </div>
      </div>
    </main>
  );
}
