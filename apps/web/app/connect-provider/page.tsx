'use client';

import { useState } from 'react';

export default function ConnectProviderPage() {
  // This screen is shown to approved users who have no valid provider connection.
  // Auth middleware routes them here instead of the app until a connection exists.
  // The actual credentials form and server-side validation are built in P-038 / U-048.

  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 520 }}>
        <p className="eyebrow">Solar Tracker — Setup</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>Connect your MyEnergi account</h1>

        <p className="copy" style={{ marginTop: 16 }}>
          Solar Tracker reads live and historical data directly from your MyEnergi hub. This is
          the only required step before you can use the app.
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
            Your credentials are stored securely on our servers and are never shared or exposed
            in the browser.
          </p>
        </div>

        {/* Credentials form placeholder — built in P-038 / U-048 */}
        <div
          style={{
            marginTop: 28,
            padding: '20px',
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          <label style={labelStyle}>
            Serial number
            <input
              type="text"
              placeholder="e.g. 12345678"
              disabled
              style={inputStyle}
            />
          </label>

          <label style={{ ...labelStyle, marginTop: 16 }}>
            API key
            <input
              type="password"
              placeholder="Your MyEnergi API key"
              disabled
              style={inputStyle}
            />
          </label>

          <button
            type="button"
            disabled
            style={{
              marginTop: 20,
              width: '100%',
              padding: '13px 20px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'system-ui, sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            Connect MyEnergi
          </button>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center' }}>
            Connection form will be enabled in the next release.
          </p>
        </div>

        <CredentialsHelp />

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

function CredentialsHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: '0.88rem',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: '0.75rem' }}>{open ? '▾' : '▸'}</span>
        How do I find my MyEnergi credentials?
      </button>

      {open && (
        <div
          style={{
            marginTop: 12,
            padding: '16px 18px',
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: '0.88rem',
            lineHeight: 1.7,
            color: 'var(--text)',
          }}
        >
          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Serial number</p>
          <p style={{ margin: '0 0 14px' }}>
            Your 8-digit serial number is printed on the sticker on the side of your MyEnergi hub
            (Zappi, Harvi, or Eddi). It is also shown in the MyEnergi app under{' '}
            <em>Settings → Hub</em>.
          </p>

          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>API key</p>
          <p style={{ margin: 0 }}>
            Open the MyEnergi app, go to <em>Settings → Advanced → API</em>, and tap{' '}
            <em>Generate API key</em>. Copy the key shown — it will not be displayed again.
            If you have already generated a key, you can regenerate it from the same screen.
          </p>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: '0.88rem',
  fontWeight: 600,
  color: 'var(--text)',
  fontFamily: 'system-ui, sans-serif',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '0.95rem',
  fontFamily: 'system-ui, sans-serif',
  background: 'rgba(255,255,255,0.6)',
  color: 'var(--text)',
  opacity: 0.6,
};
