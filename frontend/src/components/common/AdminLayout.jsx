import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: '👥', label: 'User Management',         path: '/admin/users',         active: true,  pendingCount: null },
  { icon: '🏛️', label: 'Resource Management',     path: '/admin/resources',     active: false, pendingCount: null },
  { icon: '📅', label: 'Booking Management',      path: '/admin/bookings',      active: false, pendingCount: null },
  { icon: '🔧', label: 'Ticket Management',       path: '/admin/tickets',       active: false, pendingCount: null },
  { icon: '🔔', label: 'Notification Management', path: '/admin/notifications', active: false, pendingCount: 3   },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 60px)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col shrink-0" style={{ width: '260px', backgroundColor: '#1E293B' }}>

        {/* Admin user info */}
        <div
          className="flex items-center gap-3 px-5 py-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="admin"
              className="rounded-full shrink-0 object-cover"
              style={{ width: '42px', height: '42px' }}
            />
          ) : (
            <div
              className="rounded-full shrink-0 flex items-center justify-center text-white text-[15px] font-semibold bg-[#1D4ED8]"
              style={{ width: '42px', height: '42px' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-white leading-tight truncate">
              {user?.name || 'Admin'}
            </div>
            <span
              className="inline-block text-[11px] font-semibold rounded-[10px] mt-0.5"
              style={{ backgroundColor: 'rgba(109,40,217,0.2)', color: '#C4B5FD', padding: '2px 8px' }}
            >
              ADMIN
            </span>
          </div>
        </div>

        {/* Section label */}
        <div
          className="text-[11px] font-semibold uppercase"
          style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', padding: '16px 20px 8px' }}
        >
          MANAGEMENT
        </div>

        {/* Menu items */}
        <nav className="flex-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;

            if (item.active) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-between no-underline transition-colors"
                  style={{
                    height: '44px',
                    padding: '0 20px',
                    gap: '12px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.60)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                    borderLeft: isActive ? '4px solid #3B82F6' : '4px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.80)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.pendingCount && (
                    <span
                      className="shrink-0 text-[10px] font-semibold text-white rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#D97706', minWidth: '18px', height: '18px', padding: '0 5px' }}
                    >
                      {item.pendingCount}
                    </span>
                  )}
                </Link>
              );
            }

            /* Inactive item */
            return (
              <div
                key={item.path}
                className="flex items-center justify-between"
                style={{
                  height: '44px',
                  padding: '0 20px',
                  paddingLeft: '24px', /* 20px + 4px to align with active item content */
                  gap: '12px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.35)',
                  cursor: 'not-allowed',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.pendingCount ? (
                  /* Amber count badge for Notification Management */
                  <span
                    className="shrink-0 text-[10px] font-semibold text-white rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#D97706', minWidth: '18px', height: '18px', padding: '0 5px' }}
                  >
                    {item.pendingCount}
                  </span>
                ) : (
                  /* "Soon" badge for other inactive items */
                  <span
                    className="shrink-0 text-[10px] rounded"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', padding: '2px 7px' }}
                  >
                    Soon
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4 text-[11px]"
          style={{ color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.10)' }}
        >
          Smart Campus Hub © 2026
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F8FAFC' }}>
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
