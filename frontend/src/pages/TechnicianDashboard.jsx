import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext.jsx';
import CommentSection from '../components/common/CommentSection.jsx';

const STATUS_COLORS = { OPEN:'#004085', IN_PROGRESS:'#92400e', RESOLVED:'#14532d', CLOSED:'#374151', REJECTED:'#7f1d1d' };
const STATUS_BG     = { OPEN:'#dbeafe', IN_PROGRESS:'#fef3c7', RESOLVED:'#dcfce7', CLOSED:'#f3f4f6', REJECTED:'#fee2e2' };
const STATUS_DOT    = { OPEN:'#3b82f6', IN_PROGRESS:'#f59e0b', RESOLVED:'#22c55e', CLOSED:'#9ca3af', REJECTED:'#ef4444' };
const PRIORITY_COLOR= { LOW:'#16a34a', MEDIUM:'#d97706', HIGH:'#dc2626', CRITICAL:'#7c3aed' };
const PRIORITY_BG   = { LOW:'#dcfce7',  MEDIUM:'#fef3c7',  HIGH:'#fee2e2',  CRITICAL:'#ede9fe' };

// inject pulse keyframe once
if (!document.getElementById('pulse-kf-tech')) {
  const s = document.createElement('style');
  s.id = 'pulse-kf-tech';
  s.innerHTML = `@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`;
  document.head.appendChild(s);
}

const Chip = ({ label, status, type='status' }) => {
  const c = type==='status'
    ? { bg:STATUS_BG[status], color:STATUS_COLORS[status], dot:STATUS_DOT[status] }
    : { bg:PRIORITY_BG[status], color:PRIORITY_COLOR[status], dot:PRIORITY_COLOR[status] };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
      background:c.bg, color:c.color, padding:'3px 10px',
      borderRadius:'20px', fontSize:'0.7rem', fontWeight:'700' }}>
      <span style={{ width:'6px', height:'6px', borderRadius:'50%',
        background:c.dot, flexShrink:0 }} />
      {label}
    </span>
  );
};

export default function TechnicianDashboard() {
  const { user } = useAuth();

  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState({ status:'', priority:'', search:'' });
  const [selected, setSelected]         = useState(null);
  const [comments, setComments]         = useState([]);
  const [resolveLoading, setResolveLoading] = useState(false);

  // ── New-ticket badge ──────────────────────────────────────────────────────
  const [lastSeen, setLastSeen] = useState(() =>
    parseInt(localStorage.getItem('tech_lastSeen') || '0')
  );
  const markAllSeen = () => {
    const now = Date.now();
    localStorage.setItem('tech_lastSeen', now.toString());
    setLastSeen(now);
  };
  const isNew = (t) => t.createdAt && new Date(t.createdAt).getTime() > lastSeen;

  const load = () => {
    setLoading(true);
    ticketService.getAllTickets()
      .then(r => {
        const mine = r.data
          .filter(t =>
            t.assignedToId === 'tech-001' ||
            t.assignedToName?.toLowerCase().includes('siyumi') ||
            t.status === 'IN_PROGRESS'
          )
          .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // auto-refresh every 30s
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

  const handleResolve = async () => {
    if (!selected || !window.confirm('Mark this ticket as resolved?')) return;
    setResolveLoading(true);
    try {
      await ticketService.updateStatus(selected.id, { status:'RESOLVED' });
      load();
      setSelected(prev => ({ ...prev, status:'RESOLVED' }));
    } catch { alert('Failed to resolve ticket'); }
    setResolveLoading(false);
  };

  const filtered = tickets.filter(t =>
    (!filter.status   || t.status   === filter.status) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.search   ||
      t.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.userName?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  const newCount = tickets.filter(isNew).length;

  const stats = {
    total:      tickets.length,
    inProgress: tickets.filter(t => t.status==='IN_PROGRESS').length,
    resolved:   tickets.filter(t => t.status==='RESOLVED').length,
    critical:   tickets.filter(t => t.priority==='CRITICAL').length,
  };

  return (
    <div style={{ padding:'28px 32px', background:'#f8fafc', minHeight:'100vh',
      fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:'800',
            color:'#0f172a', letterSpacing:'-0.02em' }}>
            Technician Dashboard
          </h2>
          <p style={{ margin:'4px 0 0', color:'#94a3b8', fontSize:'0.875rem' }}>
            Welcome back, <strong style={{color:'#374151'}}>{user?.name || 'Technician'}</strong>
            — you have <strong style={{color:'#f59e0b'}}>{stats.inProgress}</strong> ticket{stats.inProgress!==1?'s':''} in progress
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* New ticket notification */}
          {newCount > 0 && (
            <button onClick={markAllSeen} style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'linear-gradient(135deg,#dc2626,#ef4444)',
              color:'white', border:'none', borderRadius:'12px',
              padding:'8px 16px', cursor:'pointer', fontWeight:'700',
              fontSize:'0.82rem', boxShadow:'0 4px 12px rgba(220,38,38,0.4)',
              animation:'pulse 1.5s infinite'
            }}>
              <span style={{ background:'white', color:'#dc2626', borderRadius:'50%',
                width:'22px', height:'22px', display:'inline-flex',
                alignItems:'center', justifyContent:'center',
                fontSize:'0.72rem', fontWeight:'900', flexShrink:0 }}>
                {newCount}
              </span>
              New ticket{newCount>1?'s':''} — Dismiss
            </button>
          )}
          <span style={{ background:'linear-gradient(135deg,#15803d,#22c55e)',
            color:'white', padding:'6px 18px', borderRadius:'20px',
            fontSize:'0.8rem', fontWeight:'700', letterSpacing:'0.05em',
            boxShadow:'0 2px 8px rgba(22,163,74,0.3)' }}>
            TECHNICIAN
          </span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:'14px', marginBottom:'24px' }}>
        {[
          { label:'Assigned',    value:stats.total,      bg:'linear-gradient(135deg,#1e40af,#3b82f6)', icon:'📋' },
          { label:'In Progress', value:stats.inProgress, bg:'linear-gradient(135deg,#b45309,#f59e0b)', icon:'⚙️' },
          { label:'Resolved',    value:stats.resolved,   bg:'linear-gradient(135deg,#15803d,#22c55e)', icon:'✓'  },
          { label:'Critical',    value:stats.critical,   bg:'linear-gradient(135deg,#7c2d12,#ef4444)', icon:'⚠'  },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'14px',
            padding:'20px', color:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
            position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:'-8px', top:'-8px',
              fontSize:'3rem', opacity:0.15 }}>{s.icon}</div>
            <div style={{ fontSize:'0.72rem', fontWeight:'600',
              textTransform:'uppercase', letterSpacing:'0.08em',
              opacity:0.85, marginBottom:'10px' }}>{s.label}</div>
            <div style={{ fontSize:'2.2rem', fontWeight:'800', lineHeight:'1' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* MAIN SPLIT */}
      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:'20px' }}>

        {/* LEFT — Ticket List */}
        <div>
          {/* Filters */}
          <div style={{ background:'white', border:'1px solid #f0f0f0',
            borderRadius:'12px', padding:'14px', marginBottom:'12px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ position:'relative', marginBottom:'10px' }}>
              <span style={{ position:'absolute', left:'12px', top:'50%',
                transform:'translateY(-50%)', color:'#9ca3af', fontSize:'0.9rem' }}>🔍</span>
              <input className="form-control" style={{ paddingLeft:'34px' }}
                placeholder="Search tickets..."
                value={filter.search}
                onChange={e => setFilter({...filter, search:e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <select className="form-control" style={{ flex:1 }}
                value={filter.status}
                onChange={e => setFilter({...filter, status:e.target.value})}>
                <option value="">All Statuses</option>
                {['IN_PROGRESS','RESOLVED','CLOSED'].map(s=>(
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
              <select className="form-control" style={{ flex:1 }}
                value={filter.priority}
                onChange={e => setFilter({...filter, priority:e.target.value})}>
                <option value="">All Priorities</option>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:'10px',
            paddingLeft:'2px', display:'flex', justifyContent:'space-between',
            alignItems:'center' }}>
            <span>{filtered.length} ticket{filtered.length!==1?'s':''} found</span>
            {newCount > 0 && (
              <span style={{ background:'#fee2e2', color:'#dc2626', padding:'2px 8px',
                borderRadius:'10px', fontSize:'0.7rem', fontWeight:'700',
                animation:'pulse 1.5s infinite' }}>
                {newCount} new
              </span>
            )}
          </div>

          {loading && <div className="spinner-container"><div className="spinner"></div></div>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px 20px', color:'#94a3b8',
              background:'white', borderRadius:'12px', border:'1px solid #f0f0f0' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'10px', opacity:0.5 }}>📋</div>
              <div style={{ fontWeight:'600', color:'#374151' }}>No tickets assigned</div>
              <div style={{ fontSize:'0.83rem', marginTop:'4px' }}>
                Check back when admin assigns tickets
              </div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {filtered.map(ticket => (
              <div key={ticket.id} onClick={() => openTicket(ticket)} style={{
                borderRadius:'12px', padding:'14px 16px', cursor:'pointer',
                transition:'all 0.15s',
                border: selected?.id===ticket.id ? '2px solid #1d4ed8' : '1px solid #f0f0f0',
                borderLeft: ticket.priority==='CRITICAL' ? '4px solid #7c3aed'
                  : isNew(ticket) ? '4px solid #dc2626'
                  : selected?.id===ticket.id ? '4px solid #1d4ed8' : '4px solid transparent',
                boxShadow: selected?.id===ticket.id
                  ? '0 4px 12px rgba(29,78,216,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                background: selected?.id===ticket.id ? '#f8faff'
                  : isNew(ticket) ? '#fffbfb' : 'white'
              }}
              onMouseEnter={e => { if(selected?.id!==ticket.id) e.currentTarget.style.background='#fafafa'; }}
              onMouseLeave={e => { if(selected?.id!==ticket.id) e.currentTarget.style.background = isNew(ticket) ? '#fffbfb' : 'white'; }}>

                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'flex-start', marginBottom:'8px' }}>
                  {/* Title + NEW badge */}
                  <div style={{ flex:1, marginRight:'8px', display:'flex',
                    alignItems:'center', gap:'6px', overflow:'hidden' }}>
                    <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'0.875rem',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {ticket.title}
                    </div>
                    {isNew(ticket) && (
                      <span style={{ background:'#dc2626', color:'white',
                        fontSize:'0.58rem', fontWeight:'800',
                        padding:'2px 5px', borderRadius:'4px', flexShrink:0,
                        animation:'pulse 1.5s infinite' }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <Chip label={ticket.status?.replace('_',' ')} status={ticket.status} type="status" />
                </div>

                <div style={{ fontSize:'0.75rem', color:'#6b7280', marginBottom:'8px' }}>
                  {ticket.userName} &nbsp;·&nbsp; {ticket.location}
                </div>

                <div style={{ display:'flex', gap:'6px', alignItems:'center',
                  justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <Chip label={ticket.priority} status={ticket.priority} type="priority" />
                    <span style={{ background:'#f1f5f9', color:'#475569',
                      padding:'2px 8px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:'600' }}>
                      {ticket.category}
                    </span>
                  </div>
                  <span style={{ fontSize:'0.68rem', color:'#9ca3af' }}>
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB',{
                      day:'2-digit', month:'short'
                    }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Detail Panel */}
        <div>
          {!selected ? (
            <div style={{ background:'white', border:'1px solid #f0f0f0',
              borderRadius:'14px', padding:'80px 40px', textAlign:'center',
              color:'#94a3b8', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'16px', opacity:0.4 }}>👈</div>
              <div style={{ fontWeight:'600', fontSize:'1rem', color:'#374151' }}>
                Select a ticket to view details
              </div>
              <div style={{ fontSize:'0.85rem', marginTop:'6px' }}>
                Click any ticket from the list on the left
              </div>
            </div>
          ) : (
            <div style={{ background:'white', border:'1px solid #f0f0f0',
              borderRadius:'14px', overflow:'hidden',
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>

              {/* Detail header */}
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #f8fafc',
                background:'#f8fafc' }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'flex-start', gap:'12px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                      <h3 style={{ margin:0, fontSize:'1.05rem', fontWeight:'700', color:'#0f172a' }}>
                        {selected.title}
                      </h3>
                      {isNew(selected) && (
                        <span style={{ background:'#dc2626', color:'white',
                          fontSize:'0.6rem', fontWeight:'800',
                          padding:'2px 7px', borderRadius:'6px', flexShrink:0 }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      <Chip label={selected.status?.replace('_',' ')} status={selected.status} type="status" />
                      <Chip label={selected.priority} status={selected.priority} type="priority" />
                      <span style={{ background:'#f1f5f9', color:'#475569',
                        padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'600' }}>
                        {selected.category}
                      </span>
                    </div>
                  </div>
                  {selected.status === 'IN_PROGRESS' && (
                    <button onClick={handleResolve} disabled={resolveLoading}
                      style={{ background:'linear-gradient(135deg,#15803d,#22c55e)',
                        color:'white', border:'none', borderRadius:'10px',
                        padding:'10px 20px', fontSize:'0.85rem', fontWeight:'700',
                        cursor:'pointer', flexShrink:0,
                        boxShadow:'0 2px 8px rgba(22,163,74,0.3)' }}>
                      {resolveLoading ? 'Resolving...' : '✓ Mark Resolved'}
                    </button>
                  )}
                  {selected.status === 'RESOLVED' && (
                    <span style={{ background:'#dcfce7', color:'#14532d',
                      padding:'8px 16px', borderRadius:'10px', fontSize:'0.82rem', fontWeight:'700' }}>
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Reporter details */}
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #f8fafc' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:'700', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'14px' }}>
                  Reporter Details
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  {[
                    ['Reporter',    selected.userName       || '—'],
                    ['Email',       selected.userEmail      || '—'],
                    ['Reg. Number', selected.userRegNo      || '—'],
                    ['Faculty',     selected.faculty        || '—'],
                    ['Location',    selected.location       || '—'],
                    ['Contact',     selected.contactDetails || '—'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ background:'#f8fafc', borderRadius:'8px', padding:'10px 12px' }}>
                      <div style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:'600',
                        marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</div>
                      <div style={{ color:'#0f172a', fontWeight:'600', fontSize:'0.82rem',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#f8fafc', borderRadius:'8px',
                  padding:'10px 12px', marginTop:'10px' }}>
                  <div style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:'600',
                    marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Description
                  </div>
                  <div style={{ color:'#374151', fontSize:'0.85rem', lineHeight:'1.5' }}>
                    {selected.description || '—'}
                  </div>
                </div>
              </div>

              {/* AI Triage */}
              {selected.aiTriage && (
                <div style={{ margin:'16px 24px', background:'#eff6ff',
                  border:'1px solid #bfdbfe', borderRadius:'10px',
                  padding:'12px 16px', fontSize:'0.83rem', color:'#1d4ed8' }}>
                  <div style={{ fontWeight:'700', marginBottom:'4px' }}>🤖 AI Suggestion</div>
                  <div>{selected.aiTriage.suggestedPriority} priority — {selected.aiTriage.recommendedAction}</div>
                  <div style={{ color:'#6b7280', fontSize:'0.78rem', marginTop:'3px' }}>
                    Estimated: {selected.aiTriage.estimatedResolutionTime}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div style={{ padding:'16px 24px' }}>
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