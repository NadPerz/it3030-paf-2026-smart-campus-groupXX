import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PRIORITY_COLOR = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#dc2626', CRITICAL: '#7c3aed' };
const PRIORITY_BG    = { LOW: '#dcfce7', MEDIUM: '#fef3c7', HIGH: '#fee2e2', CRITICAL: '#ede9fe' };

const IconDashboard = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconOverview = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconEdit = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconBooking = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconTicket = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" />
    <path d="M6 10V6a6 6 0 0 1 12 0v4" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',        Icon: IconDashboard, path: '/profile' },
  { id: 'overview',  label: 'Profile Overview', Icon: IconOverview,  path: '/profile/overview' },
  { id: 'edit',      label: 'Edit Profile',     Icon: IconEdit,      path: '/profile/edit' },
  { id: 'bookings',  label: 'My Bookings',      Icon: IconBooking,   path: '/bookings' },
  { id: 'tickets',   label: 'My Tickets',       Icon: IconTicket,    path: '/tickets' },
];

function StatusBadge({ status }) {
  const cfg = {
    OPEN:        { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    IN_PROGRESS: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    RESOLVED:    { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    CLOSED:      { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
    REJECTED:    { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  };
  const s = cfg[status] || cfg.CLOSED;
  const label = status === 'IN_PROGRESS' ? 'IN PROGRESS' : status;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 11px', borderRadius: 20, fontSize: 11,
      fontWeight: 700, background: s.bg, color: s.color, letterSpacing: '0.3px'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UserAssignIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const TicketIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/>
    <path d="M6 10V6a6 6 0 0 1 12 0v4"/>
  </svg>
);

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];

export default function MyTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    ticketService.getMyTickets()
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    ALL:         tickets.length,
    OPEN:        tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED').length,
    REJECTED:    tickets.filter(t => t.status === 'REJECTED').length,
    CLOSED:      tickets.filter(t => t.status === 'CLOSED').length,
  };

  const filtered = tickets.filter(t =>
    (filter === 'ALL' || t.status === filter) &&
    (!priority || t.priority === priority) &&
    (!search   || t.title?.toLowerCase().includes(search.toLowerCase()))
  );

  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatCreatedAt(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const inp = {
    padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 13, color: '#1e293b', outline: 'none',
    fontFamily: 'inherit', background: '#f8fafc',
  };

  return (
    <>
      {/* Lock the page scroll exactly like MyBookingsPage */}
      <style>{`html, body { overflow: hidden !important; height: 100%; margin: 0; padding: 0; }`}</style>

      <div style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#F1F5F9',
        height: 'calc(100vh - 65px)',   // same as bookings
        overflow: 'hidden',             // page does NOT scroll
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: 1200, width: '100%', margin: '0 auto',
          padding: '0 24px', flex: 1, minHeight: 0,
          display: 'flex', gap: 24, alignItems: 'stretch',
          boxSizing: 'border-box',
        }}>

          {/* ── Sidebar ── */}
          <aside style={{
            width: 230, flexShrink: 0, background: '#fff',
            borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)',
              borderRadius: '16px 16px 0 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12, padding: '32px 20px', flexShrink: 0,
            }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="avatar"
                  style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
              ) : (
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: 26,
                }}>{initial}</div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{user?.name || '—'}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5, marginTop: 2, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '2px 12px' }}>
                {user?.role || 'USER'}
              </span>
            </div>

            <div style={{ height: 1, background: '#F1F5F9', flexShrink: 0 }} />

            <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 0', flex: 1 }}>
              {NAV_ITEMS.map(item => {
                const active = item.id === 'tickets';
                return (
                  <button key={item.id} onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px', fontSize: 13.5, fontWeight: 500,
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      background: active ? '#EFF6FF' : 'transparent',
                      color: active ? '#1D4ED8' : '#4B5563',
                      border: 'none',
                      borderLeft: active ? '3px solid #1D4ED8' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                    <span style={{ color: active ? '#1D4ED8' : '#9CA3AF' }}><item.Icon /></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 20px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: user?.status === 'ACTIVE' ? '#22C55E' : '#F59E0B', display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>{user?.status || 'ACTIVE'}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                Member since {formatDate(user?.createdAt)}
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              flex: 1, minHeight: 0,
              background: '#fff', borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              padding: '28px',
              display: 'flex', flexDirection: 'column',  // flex column so inner list can grow
              boxSizing: 'border-box',
              overflow: 'hidden',                         // panel itself does NOT scroll
            }}>

              {/* Page header — flexShrink:0 so it never scrolls away */}
              <div style={{ flexShrink: 0, marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.3px' }}>My Tickets</h1>
                <p style={{ fontSize: 13, color: '#64748b' }}>View and manage your campus incident reports</p>
              </div>

              {/* Status filter chips — flexShrink:0 */}
              <div style={{ flexShrink: 0, display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(s => {
                  const active = filter === s;
                  const label = s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase();
                  return (
                    <button key={s} onClick={() => setFilter(s)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                        borderColor: active ? '#1d4ed8' : '#e2e8f0',
                        background: active ? '#1d4ed8' : '#fff',
                        color: active ? '#fff' : '#64748b',
                      }}>
                      {label}
                      <span style={{
                        padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                        background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: active ? '#fff' : '#94a3b8',
                      }}>{counts[s]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search + priority — flexShrink:0 */}
              <div style={{
                flexShrink: 0,
                display: 'flex', gap: 10, marginBottom: 22, alignItems: 'center',
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    style={{ ...inp, width: '100%', paddingLeft: 34, background: 'transparent', border: 'none', boxShadow: 'none' }}
                    placeholder="Search your tickets..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
                <select style={{ ...inp, width: 140, border: 'none', background: 'transparent' }} value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="">All Priorities</option>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {(search || priority) && (
                  <button onClick={() => { setSearch(''); setPriority(''); }}
                    style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Clear
                  </button>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                  {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* ── Scrollable ticket list — only this area scrolls ── */}
              <div style={{
                flex: 1, minHeight: 0,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent',
                paddingRight: 4,
              }}>

                {/* Loading */}
                {loading && (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>Loading your tickets...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                )}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', padding: '70px 20px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <TicketIcon />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      {filter !== 'ALL' || search || priority ? 'No tickets match your filters' : 'No tickets yet'}
                    </h3>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>
                      {filter !== 'ALL' || search || priority ? 'Try adjusting your search or filters' : 'Your submitted incident reports will appear here'}
                    </p>
                  </div>
                )}

                {/* Ticket cards */}
                {!loading && filtered.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        style={{
                          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                          padding: '20px 22px', cursor: 'pointer',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          transition: 'box-shadow 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
                      >
                        {/* Left */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9,
                              background: '#eff6ff', border: '1px solid #bfdbfe',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <TicketIcon />
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ticket.title}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                Ticket #{ticket.id?.toString().slice(-6).toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8, paddingLeft: 42 }}>
                            {ticket.category && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                                <TagIcon /> {ticket.category}
                              </span>
                            )}
                            {ticket.location && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                                <MapPinIcon /> {ticket.location}
                              </span>
                            )}
                            {ticket.createdAt && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                                <CalIcon /> {formatCreatedAt(ticket.createdAt)}
                              </span>
                            )}
                            {ticket.assignedToName && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                                <UserAssignIcon /> {ticket.assignedToName}
                              </span>
                            )}
                          </div>

                          {ticket.description && (
                            <div style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 42 }}>
                              {ticket.description}
                            </div>
                          )}

                          {ticket.adminRemarks && (
                            <div style={{ marginTop: 8, paddingLeft: 42 }}>
                              <span style={{ fontSize: 11, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: 6, display: 'inline-block' }}>
                                Note: {ticket.adminRemarks}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, marginLeft: 20, flexShrink: 0 }}>
                          <StatusBadge status={ticket.status} />
                          {ticket.priority && (
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                              background: PRIORITY_BG[ticket.priority] || '#f1f5f9',
                              color: PRIORITY_COLOR[ticket.priority] || '#475569',
                            }}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>{/* end scrollable list */}
            </div>
          </main>

        </div>
      </div>
    </>
  );
}