import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Shown to users whose accounts have been suspended.
 * Layout matches LoginPage for visual consistency.
 */
function AccessDeniedPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // Auto check every 10 seconds if reactivated
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const updatedUser = await response.json();
          if (updatedUser.status === 'ACTIVE') {
            login({ ...updatedUser, token });
            navigate('/');
          }
        }
      } catch (err) {
        // Keep waiting
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function handleCheckNow() {
    setChecking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedUser = await response.json();
        if (updatedUser.status === 'ACTIVE') {
          login({ ...updatedUser, token });
          navigate('/');
        } else {
          alert('Account is still suspended.');
        }
      } else {
        alert('Account is still suspended.');
      }
    } catch (err) {
      alert('Error checking status.');
    } finally {
      setChecking(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

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

        .ad-page {
          height: calc(100vh - 104px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }
        .ad-card {
          display: flex;
          width: 100%;
          max-width: 800px;
          height: 100%;
          max-height: 660px;
          border-radius: 12px;
          border: 1px solid #DDE3EC;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          background: #ffffff;
        }
        .ad-illustration {
          flex: 0 0 44%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-right: 1px solid #EEF2F7;
        }
        .ad-illustration svg {
          width: 100%;
          height: auto;
          max-width: 260px;
        }
        .ad-right {
          flex: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 18px;
          gap: 11px;
          min-width: 0;
        }
        .ad-form-card {
          width: 100%;
          max-width: 276px;
          background: #ffffff;
          border-radius: 10px;
          border: 1px solid #E4E9F0;
          padding: 62px 20px;
          text-align: center;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }
        .ad-user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F9FAFB;
          border: 1px solid #E4E9F0;
          border-radius: 8px;
          padding: 7px 10px;
          margin: 20px 0 20px;
          text-align: left;
        }
        .ad-btn-row {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }
        .ad-btn {
          flex: 1;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .ad-btn-primary {
          background: #1E3A5F;
          border: 1.5px solid #1E3A5F;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(29,78,216,0.25);
        }
        .ad-btn-primary:hover:not(:disabled) {
          background: #1E40AF;
          box-shadow: 0 2px 8px rgba(29,78,216,0.3);
        }
        .ad-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ad-btn-secondary {
          background: #ffffff;
          border: 1.5px solid #E2E8F0;
          color: #374151;
        }
        .ad-btn-secondary:hover {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }
        .ad-status-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 10.5px;
          color: #9CA3AF;
        }
        .ad-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .ad-badges {
          display: flex;
          gap: 8px;
          width: 100%;
          max-width: 276px;
        }
        .ad-badge {
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
        .ad-badge-icon {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #FEF2F2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 580px) {
          .ad-illustration { display: none; }
        }
      `}</style>

      <div className="ad-page">
        <div className="ad-card">

          {/* Left: disconnected-plug illustration */}
          <div className="ad-illustration">
            <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg" fill="none">
              {/* Top curvy cable */}
              <path
                d="M 150 0 C 220 60, 80 130, 180 200 C 240 240, 170 260, 130 240"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Left plug (coming from top) */}
              <g transform="translate(130 240) rotate(200)">
                <rect x="-6" y="-14" width="38" height="28" rx="4" fill="#4B5563" />
                <rect x="-14" y="-8" width="10" height="5" rx="1" fill="#374151" />
                <rect x="-14" y="3" width="10" height="5" rx="1" fill="#374151" />
              </g>

              {/* Spark lines between plugs */}
              <g stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round">
                <line x1="155" y1="235" x2="168" y2="222" />
                <line x1="162" y1="250" x2="178" y2="250" />
                <line x1="155" y1="265" x2="168" y2="278" />
              </g>

              {/* Right plug (coming from bottom) */}
              <g transform="translate(190 260) rotate(20)">
                <rect x="-6" y="-14" width="38" height="28" rx="4" fill="#4B5563" />
                <rect x="-14" y="-8" width="10" height="5" rx="1" fill="#374151" />
                <rect x="-14" y="3" width="10" height="5" rx="1" fill="#374151" />
              </g>

              {/* Bottom curvy cable */}
              <path
                d="M 190 260 C 250 290, 100 340, 180 410 C 230 450, 120 480, 150 500"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Right: same structure as LoginPage */}
          <div className="ad-right">

            {/* Inner white card */}
            <div className="ad-form-card">
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

              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px' }}>
                Access Denied
              </h1>
              <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.55', margin: '0 0 15px' }}>
                Your account has been suspended by an administrator.
              </p>

              {/* User chip */}
              {user && (
                <div className="ad-user-chip">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: '#1D4ED8', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '600', fontSize: '12px',
                      flexShrink: 0
                    }}>
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontWeight: '600', fontSize: '11.5px', color: '#111827',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      color: '#6B7280', fontSize: '10.5px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Button row: Check Now + Sign Out */}
              <div className="ad-btn-row">
                <button
                  className="ad-btn ad-btn-primary"
                  onClick={handleCheckNow}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <svg style={{ animation: 'spin 0.9s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Checking…
                    </>
                  ) : (
                    'Check Now'
                  )}
                </button>

                <button
                  className="ad-btn ad-btn-secondary"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>

              {/* Auto-checking indicator */}
              <div className="ad-status-row">
                <span className="ad-pulse"></span>
                <span>Checking status automatically every 10s</span>
              </div>
            </div>

            {/* Badges */}
            {/* <div className="ad-badges">
              {[
                {
                  label: 'Suspended', sub: 'Contact Admin',
                  icon: (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="1.8"/>
                      <path d="M6 6l12 12" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  label: 'Automatic', sub: 'Status Monitoring',
                  icon: (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12a9 9 0 1 1-3-6.7" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M21 4v5h-5" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
              ].map(({ label, sub, icon }) => (
                <div key={label} className="ad-badge">
                  <div className="ad-badge-icon">{icon}</div>
                  <div>
                    <p style={{ fontSize: '8.5px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.07em', margin: 0, textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#374151', margin: 0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div> */}

            <p style={{ fontSize: '9.5px', color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>
              © 2024 SLIIT Operations · Smart Campus Initiative
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default AccessDeniedPage;