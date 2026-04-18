import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';
import { notificationService } from '../services/notificationService';

// ── Palette (lighter, softer) ─────────────────────────────────────────────────
const BLUE   = '#3B82F6';
const GREEN  = '#10B981';
const AMBER  = '#F59E0B';
const RED    = '#F87171';
const PURPLE = '#A78BFA';
const SLATE  = '#94A3B8';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  ),
  Ticket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
};

// ── Date normalizer ───────────────────────────────────────────────────────────
// Spring Boot serializes LocalDate as [2026, 4, 18] (array) by default,
// OR as "2026-04-18" if write-dates-as-timestamps=false is configured.
// This handles BOTH and returns "YYYY-MM-DD".
function normalizeDate(raw) {
  if (!raw) return null;
  // Array format from Spring Boot default: [2026, 4, 18]
  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  // String: "2026-04-18" or "2026-04-18T10:30:00"
  if (typeof raw === 'string') {
    return raw.includes('T') ? raw.split('T')[0] : raw.substring(0, 10);
  }
  return null;
}

// Format LocalTime — handles array [10, 30, 0] or string "10:30:00"
function formatTime(t) {
  if (!t) return '—';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #EEF2FF',
      boxShadow: '0 2px 8px rgba(99,102,241,0.06)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.09em', color: '#A5B4FC', marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon: IconComp, loading }) {
  return (
    <Card style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        <IconComp />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>
          {loading ? <span style={{ color: '#E2E8F0', fontSize: 18 }}>—</span> : value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #EEF2FF', borderRadius: 10,
      padding: '8px 14px', fontSize: 12,
      boxShadow: '0 4px 16px rgba(99,102,241,0.12)',
    }}>
      <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}:</span><span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [users,     setUsers]     = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [resources, setResources] = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [notifs,    setNotifs]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, b, r, t, n] = await Promise.allSettled([
          api.get('/users'),
          api.get('/bookings'),
          api.get('/resources'),
          api.get('/tickets'),
          notificationService.getAll(),
        ]);
        if (u.status === 'fulfilled') setUsers(u.value.data  || []);
        if (b.status === 'fulfilled') setBookings(b.value.data || []);
        if (r.status === 'fulfilled') setResources(r.value.data || []);
        if (t.status === 'fulfilled') setTickets(t.value.data  || []);
        if (n.status === 'fulfilled') setNotifs(n.value.data   || []);
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const activeUsers    = users.filter(u => u.status === 'ACTIVE').length;
  const pendingUsers   = users.filter(u => u.status === 'PENDING').length;
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;

  const approvedBookings  = bookings.filter(b => b.status === 'APPROVED').length;
  const pendingBookings   = bookings.filter(b => b.status === 'PENDING').length;
  const rejectedBookings  = bookings.filter(b => b.status === 'REJECTED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

  const activeResources   = resources.filter(r => r.status === 'ACTIVE').length;
  const inactiveResources = resources.filter(r => r.status !== 'ACTIVE').length;

  const openTickets     = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressT     = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
  const closedTickets   = tickets.filter(t => t.status === 'CLOSED').length;

  const unreadNotifs = notifs.filter(n => !n.isRead).length;

  // ── Chart data ──────────────────────────────────────────────────────────────
  const bookingStatusData = [
    { name: 'Approved',  value: approvedBookings,  color: GREEN  },
    { name: 'Pending',   value: pendingBookings,   color: AMBER  },
    { name: 'Rejected',  value: rejectedBookings,  color: RED    },
    { name: 'Cancelled', value: cancelledBookings, color: SLATE  },
  ].filter(d => d.value > 0);

  const ticketStatusData = [
    { name: 'Open',        value: openTickets,     fill: RED    },
    { name: 'In Progress', value: inProgressT,     fill: AMBER  },
    { name: 'Resolved',    value: resolvedTickets, fill: GREEN  },
    { name: 'Closed',      value: closedTickets,   fill: SLATE  },
  ];

  // ── Bookings over last 7 days ───────────────────────────────────────────────
  // normalizeDate() handles Spring Boot array [2026,4,18] AND string "2026-04-18"
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key   = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = bookings.filter(b => normalizeDate(b.bookingDate) === key).length;
    return { label, bookings: count };
  });

  // ── Bookings by resource (top 6) ────────────────────────────────────────────
  // resourceName is a direct string field on BookingResponseDTO
  const bookingsByResource = Object.entries(
    bookings.reduce((acc, b) => {
      const name = b.resourceName || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({
      name: name.length > 14 ? name.slice(0, 13) + '…' : name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // ── User roles breakdown ─────────────────────────────────────────────────────
  const roleData = ['USER', 'ADMIN', 'TECHNICIAN'].map(role => ({
    role,
    count: users.filter(u => u.role === role).length,
  }));

  // ── Recent bookings ──────────────────────────────────────────────────────────
  const recentBookings = [...bookings]
    .sort((a, b) => {
      // createdAt may be array [2026,4,18,10,30,0] or ISO string
      const toMs = (v) => {
        if (!v) return 0;
        if (Array.isArray(v)) return new Date(v[0], v[1]-1, v[2], v[3]||0, v[4]||0).getTime();
        return new Date(v).getTime();
      };
      return toMs(b.createdAt) - toMs(a.createdAt);
    })
    .slice(0, 5);

  const statusStyle = {
    APPROVED:  { bg: '#DCFCE7', text: '#15803D' },
    PENDING:   { bg: '#FEF9C3', text: '#92400E' },
    REJECTED:  { bg: '#FEE2E2', text: '#B91C1C' },
    CANCELLED: { bg: '#F1F5F9', text: '#475569' },
  };

  return (
    <>
      <style>{`
        html, body { overflow: hidden !important; height: 100%; margin: 0; padding: 0; }
        .dash-scroll::-webkit-scrollbar { width: 5px; }
        .dash-scroll::-webkit-scrollbar-track { background: transparent; }
        .dash-scroll::-webkit-scrollbar-thumb { background: #C7D2FE; border-radius: 10px; }
      `}</style>

      <div className="dash-scroll" style={{
        height: 'calc(100vh - 72px)',
        overflowY: 'auto',
        background: '#F8FAFF',
        padding: '28px 32px 40px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.3px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
            Overview of campus activity and system health
          </p>
        </div>

        {/* ── Row 1: Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
          <StatCard label="Total Users"    value={users.length}     sub={`${activeUsers} active`}      color={BLUE}   icon={Icons.Users}    loading={loading} />
          <StatCard label="Total Bookings" value={bookings.length}  sub={`${pendingBookings} pending`} color={GREEN}  icon={Icons.Calendar} loading={loading} />
          <StatCard label="Resources"      value={resources.length} sub={`${activeResources} active`}  color={PURPLE} icon={Icons.Building} loading={loading} />
          <StatCard label="Tickets"        value={tickets.length}   sub={`${openTickets} open`}        color={AMBER}  icon={Icons.Ticket}   loading={loading} />
          <StatCard label="Notifications"  value={notifs.length}    sub={`${unreadNotifs} unread`}     color={RED}    icon={Icons.Bell}     loading={loading} />
        </div>

        {/* ── Row 2: Area chart + Pie ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Bookings — Last 7 Days</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={last7} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BLUE} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke={BLUE} strokeWidth={2.5} fill="url(#blueGrad)" dot={{ r: 3.5, fill: BLUE, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Booking Status</SectionTitle>
            {bookingStatusData.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 13 }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                    {bookingStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* ── Row 3: Bar charts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Bookings by Resource (Top 6)</SectionTitle>
            {bookingsByResource.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 13 }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bookingsByResource} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Bookings" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Ticket Status Breakdown</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ticketStatusData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tickets" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {ticketStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Row 4: User stats + Recent bookings ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginBottom: 16 }}>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>User Overview</SectionTitle>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10 }}>By Role</div>
              {roleData.map(({ role, count }) => {
                const pct = users.length ? Math.round(count / users.length * 100) : 0;
                const colors = { USER: BLUE, ADMIN: PURPLE, TECHNICIAN: GREEN };
                return (
                  <div key={role} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', marginBottom: 4 }}>
                      <span>{role}</span>
                      <span style={{ fontWeight: 700 }}>{count} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: '#EEF2FF', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[role] || BLUE, borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10 }}>By Status</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Active',    count: activeUsers,    bg: '#DCFCE7', text: '#15803D' },
                { label: 'Pending',   count: pendingUsers,   bg: '#FEF9C3', text: '#92400E' },
                { label: 'Suspended', count: suspendedUsers, bg: '#FEE2E2', text: '#B91C1C' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, color: s.text, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                  {s.label}: {s.count}
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Recent Bookings</SectionTitle>
            {recentBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#CBD5E1', fontSize: 13 }}>No bookings yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Resource', 'Date', 'Time', 'User', 'Status'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#A5B4FC',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        paddingBottom: 10, borderBottom: '1px solid #EEF2FF',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, i) => {
                    const sc = statusStyle[b.status] || statusStyle.CANCELLED;
                    return (
                      <tr key={b.id} style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600, color: '#1E293B' }}>{b.resourceName || '—'}</td>
                        <td style={{ padding: '10px 8px', color: '#475569' }}>{normalizeDate(b.bookingDate) || '—'}</td>
                        <td style={{ padding: '10px 8px', color: '#475569' }}>{formatTime(b.startTime)}–{formatTime(b.endTime)}</td>
                        <td style={{ padding: '10px 8px', color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.userName || b.userEmail || '—'}
                        </td>
                        <td style={{ padding: '10px 0' }}>
                          <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* ── Row 5: Resource + Notification summary ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Resources by Type</SectionTitle>
            {resources.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#CBD5E1', fontSize: 13 }}>No resources</div>
            ) : (() => {
              const byType = Object.entries(
                resources.reduce((acc, r) => { acc[r.type || 'OTHER'] = (acc[r.type || 'OTHER'] || 0) + 1; return acc; }, {})
              ).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
              const typeColors = [BLUE, GREEN, AMBER, PURPLE, RED, SLATE];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {byType.map(({ type, count }, i) => {
                    const pct = resources.length ? Math.round(count / resources.length * 100) : 0;
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{type}</span>
                          <span style={{ fontWeight: 700 }}>{count} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: '#EEF2FF', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: typeColors[i % typeColors.length], borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <div style={{ background: '#DCFCE7', color: '#15803D', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>Active: {activeResources}</div>
                    <div style={{ background: '#FEE2E2', color: '#B91C1C', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>Inactive: {inactiveResources}</div>
                  </div>
                </div>
              );
            })()}
          </Card>

          <Card style={{ padding: '20px 22px' }}>
            <SectionTitle>Notification Summary</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total',   value: notifs.length,                color: BLUE,   bg: '#EFF6FF' },
                { label: 'Unread',  value: unreadNotifs,                 color: RED,    bg: '#FFF1F2' },
                { label: 'Read',    value: notifs.length - unreadNotifs, color: GREEN,  bg: '#F0FDF4' },
                { label: 'Booking', value: notifs.filter(n => ['BOOKING_APPROVED','BOOKING_REJECTED','BOOKING_CREATED','BOOKING_CANCELLED'].includes(n.type)).length, color: PURPLE, bg: '#F5F3FF' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {(() => {
              const cats = [
                { label: 'Bookings', count: notifs.filter(n => ['BOOKING_APPROVED','BOOKING_REJECTED','BOOKING_CREATED','BOOKING_CANCELLED'].includes(n.type)).length, color: GREEN },
                { label: 'Account',  count: notifs.filter(n => ['ACCOUNT_APPROVED','ACCOUNT_SUSPENDED','ACCOUNT_REACTIVATED','ACCOUNT_PENDING','PROFILE_UPDATED','ROLE_CHANGED'].includes(n.type)).length, color: PURPLE },
                { label: 'Users',    count: notifs.filter(n => ['NEW_USER_PENDING','USER_PROFILE_UPDATED'].includes(n.type)).length, color: BLUE },
                { label: 'Tickets',  count: notifs.filter(n => ['TICKET_STATUS_CHANGED','TICKET_COMMENT'].includes(n.type)).length, color: AMBER },
              ].filter(c => c.count > 0);
              if (!cats.length) return null;
              return (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>By Category</div>
                  {cats.map(c => {
                    const pct = notifs.length ? Math.round(c.count / notifs.length * 100) : 0;
                    return (
                      <div key={c.label} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', marginBottom: 3 }}>
                          <span>{c.label}</span><span style={{ fontWeight: 700 }}>{c.count}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 4, background: '#EEF2FF', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </Card>
        </div>

      </div>
    </>
  );
}