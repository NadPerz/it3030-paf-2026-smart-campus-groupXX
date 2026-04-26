import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Shown to users who are waiting for admin approval.
 * Member 4 responsibility.
 */
function PendingApprovalPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // Auto check every 10 seconds if approved
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await authService.getCurrentUser();
        const updatedUser = response.data;
        if (updatedUser.status === 'ACTIVE') {
          login({ ...updatedUser, token: user?.token });
          navigate('/');
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function handleCheckNow() {
    setChecking(true);
    try {
      const response = await authService.getCurrentUser();
      const updatedUser = response.data;
      if (updatedUser.status === 'ACTIVE') {
        login({ ...updatedUser, token: user?.token });
        navigate('/');
      } else {
        alert('Still pending. Please wait for admin approval.');
      }
    } catch (err) {
      alert('Error checking status. Please try again.');
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        html, body {
          overflow: hidden !important;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .pa-page {
          height: calc(100vh - 104px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }
        .pa-card {
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

        /* LEFT — illustration panel */
        .pa-illustration {
          flex: 0 0 44%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
        }
        .pa-illustration svg {
          width: 100%;
          height: auto;
          max-width: 240px;
        }

        /* RIGHT — content panel (soft gray like screenshot) */
        .pa-right {
          flex: 1;
          background: #F4F6FA;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 20px;
          min-width: 0;
          position: relative;
        }

        .pa-brand {
          position: absolute;
          top: 22px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .pa-brand-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #111827;
          letter-spacing: 0.2px;
        }

        .pa-content {
          width: 100%;
          max-width: 280px;
          text-align: center;
        }
        .pa-title {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 7px;
          letter-spacing: -0.3px;
        }
        .pa-subtitle {
          font-size: 12.5px;
          color: #6B7280;
          line-height: 1.55;
          margin: 0 0 16px;
        }

        .pa-user {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #ffffff;
          border: 1px solid #E4E9F0;
          border-radius: 8px;
          padding: 7px 10px;
          margin-bottom: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .pa-buttons {
          display: flex;
          gap: 9px;
          justify-content: center;
        }
        .pa-btn {
          height: 36px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .pa-btn-primary {
          background: #1E3A5F;
          color: #ffffff;
          border: 1.5px solid #1E3A5F;
          box-shadow: 0 1px 3px rgba(29,78,216,0.25);
        }
        .pa-btn-primary:hover:not(:disabled) {
          background: #1E40AF;
          box-shadow: 0 2px 8px rgba(29,78,216,0.35);
        }
        .pa-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .pa-btn-secondary {
          background: #ffffff;
          color: #374151;
          border: 1.5px solid #E2E8F0;
        }
        .pa-btn-secondary:hover {
          border-color: #CBD5E1;
          background: #F9FAFB;
        }

        .pa-status {
          margin-top: 14px;
          font-size: 10.5px;
          color: #6B7280;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pa-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse 1.8s ease-in-out infinite;
        }

        .pa-footer {
          position: absolute;
          bottom: 22px;
          font-size: 10px;
          color: #9CA3AF;
          letter-spacing: 0.3px;
          margin: 0;
        }

        @media (max-width: 580px) {
          .pa-illustration { display: none; }
        }
      `}</style>

      <div className="pa-page">
        <div className="pa-card">

          {/* LEFT: Person + Clock illustration (line art) */}
          <div className="pa-illustration">
            <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" fill="none">
              {/* Clock outer ring */}
              <circle cx="185" cy="150" r="88" stroke="#C9D2DE" strokeWidth="3.5"/>
              {/* Clock tick marks */}
              <line x1="185" y1="68"  x2="185" y2="80"  stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="185" y1="220" x2="185" y2="232" stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="97"  y1="150" x2="109" y2="150" stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="261" y1="150" x2="273" y2="150" stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              {/* Clock hands (hour up, minute right) */}
              <line x1="185" y1="150" x2="185" y2="95"  stroke="#B7C1D0" strokeWidth="4"   strokeLinecap="round"/>
              <line x1="185" y1="150" x2="228" y2="150" stroke="#B7C1D0" strokeWidth="4"   strokeLinecap="round"/>
              <circle cx="185" cy="150" r="4" fill="#B7C1D0"/>

              {/* Person - head */}
              <circle cx="105" cy="128" r="24" stroke="#C9D2DE" strokeWidth="3.5"/>
              {/* Person - shoulders / body */}
              <path d="M 62 235 Q 62 168 105 168 Q 148 168 148 235"
                    stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Counter line */}
              <line x1="48" y1="235" x2="165" y2="235" stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="58" y1="235" x2="58" y2="258"  stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="155" y1="235" x2="155" y2="258" stroke="#C9D2DE" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* RIGHT: Content */}
          <div className="pa-right">

            {/* Brand — top */}
            <div className="pa-brand">
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: '#1D4ED8', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="10" width="18" height="11" rx="1" stroke="white" strokeWidth="2"/>
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="pa-brand-text">Smart Campus Hub</span>
            </div>

            {/* Main content block */}
            <div className="pa-content">
              <h1 className="pa-title">Waiting For Admin</h1>
              <p className="pa-subtitle">
                One platform for bookings, resources and support across your campus.
              </p>

              {user && (
                <div className="pa-user">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="profile"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#1D4ED8', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 600, fontSize: '12px', flexShrink: 0
                    }}>
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 600, fontSize: '12px', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      color: '#6B7280', fontSize: '10.5px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              )}

              <div className="pa-buttons">
                <button
                  className="pa-btn pa-btn-primary"
                  onClick={handleCheckNow}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <svg style={{ animation: 'spin 0.9s linear infinite' }} width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Checking…
                    </>
                  ) : (
                    'Check Now'
                  )}
                </button>
                <button className="pa-btn pa-btn-secondary" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>

              <div className="pa-status">
                <span className="pa-status-dot" />
                Auto-checking every 10 seconds
              </div>
            </div>

            <p className="pa-footer">
              By signing in you accept the Campus Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PendingApprovalPage;