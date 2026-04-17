import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get('error') != null;

  function handleGoogleLogin() {
    setLoading(true);
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  // Single shared background — used on BOTH the page and the right panel
  const BG = '#EEF2F7';

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

          html, body {
          overflow: hidden !important;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .lp-page {
          height: calc(100vh - 104px);
          display: flex;
          align-items: center;
          justify-content: center;
          // background: ${BG};
          padding: 20px;
          box-sizing: border-box;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }
        .lp-card {
          display: flex;
          width: 100%;
          max-width: 800px;
          height: 100%;
          max-height: 660px;
          border-radius: 12px;
          border: 1px solid #DDE3EC;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }
        .lp-photo {
          flex: 0 0 44%;
          overflow: hidden;
          border-radius: 0;
        }
        .lp-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        /* Right panel: EXACT same color as the page */
        .lp-right {
          flex: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 18px;
          gap: 30px;
          min-width: 0;
        }
        .lp-form-card {
          width: 100%;
          max-width: 276px;
          background: #ffffff;
          border-radius: 10px;
          border: 1px solid #E4E9F0;
          padding: 22px 20px;
          text-align: center;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }
        .lp-google-btn {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #111827;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .lp-google-btn:hover {
          border-color: #4285F4;
          background: #F0F4FF;
          box-shadow: 0 2px 8px rgba(66,133,244,0.16);
        }
        .lp-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-badges {
          display: flex;
          gap: 8px;
          width: 100%;
          max-width: 276px;
        }
        .lp-badge {
          flex: 1;
          background: #ffffff;
          border: 1px solid #E4E9F0;
          border-radius: 9px;
          padding: 9px 10px;
          display: flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .lp-badge-icon {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 580px) {
          .lp-photo { display: none; }
        }
      `}</style>

      <div className="lp-page">
        <div className="lp-card">

          {/* Left: image */}
          <div className="lp-photo">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop&q=80"
              alt="University campus"
            />
          </div>

          {/* Right: same bg as page — seamless */}
          <div className="lp-right">

            {/* Inner white card */}
            <div className="lp-form-card">
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#1D4ED8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 10px',
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="10" width="18" height="11" rx="1" stroke="white" strokeWidth="1.8"/>
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="15" r="1.5" fill="white"/>
                  <path d="M12 16.5v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 15px' }}>
                Smart Campus Hub
              </h1>
              <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.55', margin: '0 0 15px' }}>
                One platform for bookings, resources and support across your campus.
              </p>

              <button className="lp-google-btn" onClick={handleGoogleLogin} disabled={loading}>
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 0.9s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Redirecting…
                  </>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {hasError && (
                <div style={{
                  marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: '7px', padding: '7px 11px', color: '#991B1B',
                }}>
                  <span>⚠️</span>
                  <span style={{ fontSize: '12px' }}>Sign-in failed. Please try again.</span>
                </div>
              )}

              <p style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '12px', marginBottom: 0 }}>
                By signing in you accept the Campus Terms of Use.
              </p>
            </div>

            {/* Badges */}
            <div className="lp-badges">
              {[
                {
                  label: 'Secure', sub: 'Institutional Access',
                  icon: (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#1D4ED8" opacity="0.12"/>
                      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke="#1D4ED8" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  label: 'Unified', sub: 'All Campus Tools',
                  icon: (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="#1D4ED8"/>
                      <circle cx="4" cy="6" r="2" stroke="#1D4ED8" strokeWidth="1.6"/>
                      <circle cx="20" cy="6" r="2" stroke="#1D4ED8" strokeWidth="1.6"/>
                      <circle cx="4" cy="18" r="2" stroke="#1D4ED8" strokeWidth="1.6"/>
                      <circle cx="20" cy="18" r="2" stroke="#1D4ED8" strokeWidth="1.6"/>
                      <path d="M6 6.5L10 10M14 10l4-3.5M6 17.5L10 14M14 14l4 3.5" stroke="#1D4ED8" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ),
                },
              ].map(({ label, sub, icon }) => (
                <div key={label} className="lp-badge">
                  <div className="lp-badge-icon">{icon}</div>
                  <div>
                    <p style={{ fontSize: '8.5px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.07em', margin: 0, textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#374151', margin: 0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '9.5px', color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>
              © 2024 SLIIT Operations · Smart Campus Initiative
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;