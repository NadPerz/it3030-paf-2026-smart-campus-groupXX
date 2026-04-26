import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import CommentSection from '../components/common/CommentSection.jsx';
import NotificationBell from '../components/notification/NotificationBell.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

// ── Color maps ────────────────────────────────────────────────────────────────
const STATUS_COLORS = { OPEN:'#004085', IN_PROGRESS:'#92400e', RESOLVED:'#14532d', CLOSED:'#374151', REJECTED:'#7f1d1d' };
const STATUS_BG     = { OPEN:'#dbeafe', IN_PROGRESS:'#fef3c7', RESOLVED:'#dcfce7', CLOSED:'#f3f4f6', REJECTED:'#fee2e2' };
const STATUS_DOT    = { OPEN:'#3b82f6', IN_PROGRESS:'#f59e0b', RESOLVED:'#22c55e', CLOSED:'#9ca3af', REJECTED:'#ef4444' };
const PRIORITY_COLOR= { LOW:'#16a34a', MEDIUM:'#d97706', HIGH:'#dc2626', CRITICAL:'#7c3aed' };
const PRIORITY_BG   = { LOW:'#dcfce7', MEDIUM:'#fef3c7', HIGH:'#fee2e2', CRITICAL:'#ede9fe' };

// ── Shared components ─────────────────────────────────────────────────────────
const Chip = ({ label, status, type = 'status' }) => {
  const c = type === 'status'
    ? { bg: STATUS_BG[status],   color: STATUS_COLORS[status],  dot: STATUS_DOT[status] }
    : { bg: PRIORITY_BG[status], color: PRIORITY_COLOR[status], dot: PRIORITY_COLOR[status] };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:c.bg, color:c.color, padding:'3px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
      {label}
    </span>
  );
};

function Btn({ onClick, bg, color, border, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background:bg, color, border:`1px solid ${border}`,
      whiteSpace:'nowrap', opacity: disabled ? 0.6 : 1, transition:'opacity 0.15s',
    }}>
      {children}
    </button>
  );
}

// table cell styles
const th = { padding:'10px 14px', fontSize:11, fontWeight:700, color:'#94a3b8', textAlign:'left', textTransform:'uppercase', letterSpacing:'0.7px', whiteSpace:'nowrap', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' };
const td = { padding:'12px 14px', fontSize:13, verticalAlign:'middle', borderBottom:'1px solid #f8fafc' };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState({ status:'', priority:'', search:'' });
  const [selected, setSelected]         = useState(null);
  const [comments, setComments]         = useState([]);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState('ALL');

  const load = () => {
    setLoading(true);
    ticketService.getAssignedTickets()
      .then(r => {
        const sorted = [...r.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const openTicket = (ticket) => {
    setSelected(ticket);
    ticketService.getComments(ticket.id)
      .then(r => setComments(r.data))
      .catch(() => setComments([]));
  };

  const refreshComments = () => {
    if (!selected) return;
    ticketService.getComments(selected.id).then(r => setComments(r.data));
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this ticket as resolved?')) return;
    setResolveLoading(true);
    try {
      await ticketService.updateStatus(id, { status: 'RESOLVED' });
      load();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'RESOLVED' }));
    } catch { alert('Failed to resolve ticket'); }
    setResolveLoading(false);
  };

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:      tickets.length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved:   tickets.filter(t => t.status === 'RESOLVED').length,
    closed:     tickets.filter(t => t.status === 'CLOSED').length,
    critical:   tickets.filter(t => t.priority === 'CRITICAL').length,
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const STATUS_TABS = [
    { label:'All',         value:'ALL',         count: stats.total      },
    { label:'In Progress', value:'IN_PROGRESS',  count: stats.inProgress },
    { label:'Resolved',    value:'RESOLVED',     count: stats.resolved   },
    { label:'Closed',      value:'CLOSED',       count: stats.closed     },
  ];

  const filtered = tickets.filter(t =>
    (activeTab === 'ALL' || t.status === activeTab) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.search   ||
      t.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.userName?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  // ── Initials ───────────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* ── TOP NAV BAR — matches admin panel style ── */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, height:'72px', zIndex:200,
        background:'#0F172A',
        borderBottom:'1px solid rgba(255, 255, 255, 0.08)',
        boxShadow:'0 1px 12px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          maxWidth:1400, margin:'0 auto',
          padding:'0 28px', height:60,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:24,
        }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#0F172A,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <GridIcon />
            </div>
            <div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:15, lineHeight:1, letterSpacing:'-0.01em' }}>Smart Campus</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:1 }}>Hub</div>
            </div>
          </div>

          {/* Centre label */}
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:600, letterSpacing:'0.02em' }}>
            Technician Panel
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>

            {/* Notification bell */}
            <NotificationBell darkMode />

            <div style={{ width:1, height:22, background:'rgba(255, 255, 255, 0.89)' }} />

            {/* Avatar + name */}
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name}
                style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.2)' }} />
            ) : (
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>
                {initials}
              </div>
            )}
            <span style={{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:500, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name || 'Technician'}
            </span>

            <div style={{ width:1, height:22, background:'rgba(255,255,255,0.12)' }} />

            {/* Logout */}
            <button onClick={handleLogout} style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'6px 13px', borderRadius:8, fontSize:13.5, fontWeight:500,
              background:'transparent', color:'rgba(255,255,255,0.6)',
              border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer',
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.15)'; e.currentTarget.style.color='#fca5a5'; e.currentTarget.style.borderColor='rgba(220,38,38,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'28px 28px', marginTop:'72px' }}>

        {/* Page header */}
        <div style={{ marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
            Assigned Tickets
          </h2>
          <p style={{ margin:'4px 0 0', color:'#94a3b8', fontSize:'0.875rem' }}>
            Welcome back, <strong style={{ color:'#374151' }}>{user?.name || 'Technician'}</strong>
            {' '}— you have <strong style={{ color:'#f59e0b' }}>{stats.inProgress}</strong> ticket{stats.inProgress !== 1 ? 's' : ''} in progress
          </p>
        </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
      {[
        { label:'Total Assigned', value:stats.total,      numColor:'#1d4ed8', bg:'#eff6ff', border:'#1d4ed8' },
        { label:'In Progress',    value:stats.inProgress, numColor:'#d97706', bg:'#fffbeb', border:'#d97706' },
        { label:'Resolved',       value:stats.resolved,   numColor:'#16a34a', bg:'#f0fdf4', border:'#16a34a' },
        { label:'Critical',       value:stats.critical,   numColor:'#7c3aed', bg:'#f5f3ff', border:'#7c3aed' },
      ].map(s => (
      <div key={s.label} style={{
          background: s.bg,
          borderRadius: 10,
          padding: '16px 20px',
          borderLeft: `4px solid ${s.border}`,
     }}>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6, fontWeight:500 }}>{s.label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:s.numColor, lineHeight:1 }}>{s.value}</div>
    </div>
     ))}
    </div>

        {/* In-progress alert */}
        {stats.inProgress > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#fefce8', border:'1px solid #fde68a', borderRadius:10, marginBottom:18 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontWeight:700, fontSize:13, color:'#92400e', flex:1 }}>
              {stats.inProgress} ticket{stats.inProgress > 1 ? 's' : ''} currently in progress
            </span>
            <button onClick={() => setActiveTab('IN_PROGRESS')}
              style={{ padding:'5px 14px', background:'#92400e', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
              View Now
            </button>
          </div>
        )}

        {/* Status filter pills */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} style={{
              padding:'6px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
              border: activeTab === tab.value ? 'none' : '1px solid #e5e7eb',
              background: activeTab === tab.value ? '#1d4ed8' : 'white',
              color: activeTab === tab.value ? 'white' : '#374151',
              boxShadow: activeTab === tab.value ? '0 2px 8px rgba(29,78,216,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
              transition:'all 0.15s', display:'flex', alignItems:'center', gap:6,
            }}>
              {tab.label}
              <span style={{
                padding:'1px 6px', borderRadius:10, fontSize:'0.7rem', fontWeight:700,
                background: activeTab === tab.value ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                color: activeTab === tab.value ? 'white' : '#6b7280',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search + priority filter bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:8 }}>
            <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority:e.target.value }))}
              style={{ padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#0f172a', outline:'none', background:'#f8fafc', fontFamily:'inherit', cursor:'pointer' }}>
              <option value="">All Priorities</option>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {(filter.priority || filter.search) && (
              <button onClick={() => setFilter({ status:'', priority:'', search:'' })}
                style={{ padding:'8px 14px', background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                Clear all
              </button>
            )}
          </div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}><SearchIcon /></span>
            <input
              placeholder="Search by title or reporter..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search:e.target.value }))}
              style={{ padding:'8px 12px 8px 32px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#0f172a', outline:'none', width:260, background:'#f8fafc', fontFamily:'inherit' }}
            />
          </div>
        </div>

        {/* Main split: table left, detail right */}
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap:20 }}>

          {/* ── TICKET TABLE ── */}
          <div>
            {loading && (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#1d4ed8', borderRadius:'50%', margin:'0 auto 14px', animation:'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {!loading && (
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'70px', color:'#94a3b8' }}>
                    <div style={{ fontWeight:600, fontSize:'1rem', color:'#374151', marginBottom:4 }}>No tickets found</div>
                    <div style={{ fontSize:'0.85rem' }}>Try adjusting your filters</div>
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        {['Ticket','Priority','Status','Actions'].map((h, i) => (
                          <th key={h} style={{ ...th, textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(ticket => (
                        <tr key={ticket.id}
                          onClick={() => openTicket(ticket)}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = selected?.id === ticket.id ? '#f0f6ff' : 'transparent'}
                          style={{
                            cursor:'pointer',
                            background: selected?.id === ticket.id ? '#f0f6ff' : 'transparent',
                            borderLeft: ticket.priority === 'CRITICAL' ? '3px solid #7c3aed' : '3px solid transparent',
                          }}
                        >
                          {/* Ticket info */}
                          <td style={td}>
                            <div style={{ fontWeight:700, color:'#0f172a', fontSize:13, marginBottom:3 }}>
                              {ticket.title}
                            </div>
                            <div style={{ fontSize:11, color:'#64748b', display:'flex', gap:5 }}>
                              <span>{ticket.userName || 'Unknown'}</span>
                              {ticket.location && <><span style={{ color:'#d1d5db' }}>·</span><span>{ticket.location}</span></>}
                            </div>
                            <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>
                              {ticket.category}
                              {ticket.createdAt && (
                                <> · {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</>
                              )}
                            </div>
                          </td>

                          {/* Priority */}
                          <td style={td}>
                            <Chip label={ticket.priority} status={ticket.priority} type="priority" />
                          </td>

                          {/* Status */}
                          <td style={td}>
                            <Chip label={ticket.status?.replace('_',' ')} status={ticket.status} type="status" />
                          </td>

                          {/* Actions */}
                          <td style={{ ...td, textAlign:'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:5 }}>
                              <Btn onClick={() => openTicket(ticket)} bg="#f8fafc" color="#475569" border="#e2e8f0">
                                View
                              </Btn>
                              {ticket.status === 'IN_PROGRESS' && (
                                <Btn onClick={() => handleResolve(ticket.id)} bg="#f0fdf4" color="#15803d" border="#bbf7d0">
                                  Resolve
                                </Btn>
                              )}
                              {ticket.status === 'RESOLVED' && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, fontSize:11, fontWeight:700, background:'#dcfce7', color:'#14532d', border:'1px solid #bbf7d0' }}>
                                  Resolved
                                </span>
                              )}
                              {ticket.status === 'CLOSED' && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, fontSize:11, fontWeight:700, background:'#f1f5f9', color:'#475569', border:'1px solid #e2e8f0' }}>
                                  Closed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* ── DETAIL PANEL ── */}
          {selected && (
            <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', alignSelf:'start', position:'sticky', top:80 }}>

              {/* Header */}
              <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:15, marginBottom:8, lineHeight:1.3 }}>
                    {selected.title}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <Chip label={selected.status?.replace('_',' ')} status={selected.status} type="status" />
                    <Chip label={selected.priority} status={selected.priority} type="priority" />
                    <span style={{ background:'#f1f5f9', color:'#475569', padding:'3px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600 }}>
                      {selected.category}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {selected.status === 'IN_PROGRESS' && (
                    <Btn onClick={() => handleResolve(selected.id)} disabled={resolveLoading} bg="#f0fdf4" color="#15803d" border="#bbf7d0">
                      {resolveLoading ? 'Resolving...' : 'Mark Resolved'}
                    </Btn>
                  )}
                  <button onClick={() => setSelected(null)} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:7, padding:'5px 9px', cursor:'pointer', color:'#94a3b8', fontSize:16, lineHeight:1 }}>
                    &times;
                  </button>
                </div>
              </div>

              {/* Reporter details */}
              <div style={{ padding:'16px 22px', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
                  Reporter Details
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    ['Reporter',    selected.userName       || '—'],
                    ['Email',       selected.userEmail      || '—'],
                    ['Reg. Number', selected.userRegNo      || '—'],
                    ['Faculty',     selected.faculty        || '—'],
                    ['Location',    selected.location       || '—'],
                    ['Contact',     selected.contactDetails || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</div>
                      <div style={{ color:'#0f172a', fontWeight:600, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', marginTop:8 }}>
                  <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>Description</div>
                  <div style={{ color:'#374151', fontSize:13, lineHeight:1.5 }}>{selected.description || '—'}</div>
                </div>
              </div>

              {/* AI Triage */}
              {selected.aiTriage && (
                <div style={{ margin:'12px 22px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'10px 14px', fontSize:'0.82rem', color:'#1d4ed8' }}>
                  <div style={{ fontWeight:700, marginBottom:3 }}>AI Suggestion</div>
                  <div>{selected.aiTriage.suggestedPriority} priority — {selected.aiTriage.recommendedAction}</div>
                  <div style={{ color:'#6b7280', fontSize:'0.78rem', marginTop:2 }}>
                    Estimated: {selected.aiTriage.estimatedResolutionTime}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div style={{ padding:'12px 22px 18px' }}>
                <CommentSection
                  ticketId={selected.id}
                  comments={comments}
                  onRefresh={refreshComments}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}