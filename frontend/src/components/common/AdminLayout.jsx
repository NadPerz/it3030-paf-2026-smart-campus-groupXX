import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

// ── Sidebar menu items ────────────────────────────────────────────────────────
const menuItems = [
  { icon: '📊', label: 'Dashboard',               path: '/admin/dashboard',     active: true  },
  { icon: '👥', label: 'User Management',         path: '/admin/users',         active: true  },
  { icon: '📋', label: 'Audit Log',               path: '/admin/audit-log',     active: true},
  { icon: '🏛️', label: 'Resource Management',     path: '/admin/resources',     active: true },
  { icon: '📅', label: 'Booking Management',      path: '/admin/bookings',      active: true },
  { icon: '🔧', label: 'Ticket Management',       path: '/admin/tickets',       active: true },
  { icon: '🔔', label: 'Notification Management', path: '/admin/notifications', active: true  },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAV_BG       = '#1a2235';   // top navbar background
const SIDEBAR_BG   = '#1e2a3b';   // sidebar background (same navy family)
const NAV_HEIGHT   = 72;          // px
const SIDEBAR_W    = 260;         // px
const ACCENT_COLOR = '#4f8ef7';   // active left bar + active text

function AdminLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  // Live unread count for sidebar badge
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await notificationService.getUnreadCount();
        setNotifCount(res.data.count ?? 0);
      } catch (_) {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ══════════════════════════════════════════
          FIXED TOP NAVBAR
      ══════════════════════════════════════════ */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: `${NAV_HEIGHT}px`,
        background: NAV_BG,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 200,
      }}>

        {/* Left — Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '20px' }}>🏫</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '-0.2px' }}>
            Smart Campus Hub
          </span>
        </Link>

        {/* Center — Page title */}
        <span style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '15px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '0.1px',
          pointerEvents: 'none',
        }}>
          Admin Panel
        </span>

        {/* Right — User info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="profile"
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
              />
            ) : (
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#1D4ED8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: '700',
                fontSize: '14px', border: '2px solid rgba(255,255,255,0.2)',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>
              👋 {user?.name || user?.email}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              height: '36px',
              padding: '0 18px',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.1px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          FIXED SIDEBAR
      ══════════════════════════════════════════ */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        width: `${SIDEBAR_W}px`,
        height: '100vh',
        background: SIDEBAR_BG,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        // Padding top pushes content below the navbar
        paddingTop: `${NAV_HEIGHT}px`,
      }}>

        {/* Admin user card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="admin"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#1D4ED8', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: '700',
              fontSize: '15px', flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </div>
            <span style={{
              display: 'inline-block', marginTop: '3px',
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
              background: 'rgba(109,40,217,0.25)', color: '#C4B5FD',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              ADMIN
            </span>
          </div>
        </div>

        {/* Section label */}
        <div style={{
          fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          padding: '18px 20px 8px',
        }}>
          Management
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const badge = item.path === '/admin/notifications' ? notifCount : null;

            if (item.active) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '44px',
                    padding: '0 20px',
                    gap: '10px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: isActive ? `3px solid ${ACCENT_COLOR}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </div>
                  {badge > 0 && (
                    <span style={{
                      flexShrink: 0, fontSize: '10px', fontWeight: '700', color: 'white',
                      background: '#D97706', minWidth: '18px', height: '18px',
                      borderRadius: '999px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', padding: '0 5px',
                    }}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            }

            // Inactive — "Soon"
            return (
              <div
                key={item.path}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  height: '44px', padding: '0 20px', paddingLeft: '23px',
                  gap: '10px', fontSize: '13.5px',
                  color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed',
                  borderLeft: '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: '10px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)',
                  padding: '2px 7px',
                }}>
                  Soon
                </span>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          fontSize: '11px', color: 'rgba(255,255,255,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          Smart Campus Hub © 2026
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════ */}
      <main style={{
        marginLeft: `${SIDEBAR_W}px`,
        paddingTop: `${NAV_HEIGHT}px`,
        minHeight: '100vh',
        background: '#F8FAFC',
      }}>
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;