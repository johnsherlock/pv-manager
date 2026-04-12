export default function SuspendedPage() {
  // This screen is shown when a signed-in user has status='suspended'.
  // Auth middleware routes suspended users here instead of the app.
  // A suspension-management UI is explicitly deferred (decision 0006 §11).

  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 480 }}>
        <p className="eyebrow">Solar Tracker</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>Access paused</h1>

        <p className="copy" style={{ marginTop: 16 }}>
          Your access to Solar Tracker has been paused. Your data is safe and has not been
          removed.
        </p>

        <p className="copy" style={{ marginTop: 12 }}>
          If you have questions or believe this is a mistake, contact us at{' '}
          <a href="mailto:support@solartracker.app" style={{ color: 'var(--accent)' }}>
            support@solartracker.app
          </a>
          .
        </p>

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
