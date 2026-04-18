import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_COLORS = { OPEN:'#004085', IN_PROGRESS:'#92400e', RESOLVED:'#14532d', CLOSED:'#374151', REJECTED:'#7f1d1d' };
const STATUS_BG     = { OPEN:'#dbeafe', IN_PROGRESS:'#fef3c7', RESOLVED:'#dcfce7', CLOSED:'#f3f4f6', REJECTED:'#fee2e2' };
const STATUS_DOT    = { OPEN:'#3b82f6', IN_PROGRESS:'#f59e0b', RESOLVED:'#22c55e', CLOSED:'#9ca3af', REJECTED:'#ef4444' };
const PRIORITY_COLOR= { LOW:'#16a34a', MEDIUM:'#d97706', HIGH:'#dc2626', CRITICAL:'#7c3aed' };
const PRIORITY_BG   = { LOW:'#dcfce7', MEDIUM:'#fef3c7', HIGH:'#fee2e2', CRITICAL:'#ede9fe' };

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

export default function MyTicketsPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ status:'', priority:'', search:'' });

  useEffect(() => {
    ticketService.getAllTickets()
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t =>
    (!filter.status   || t.status   === filter.status) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.search   || t.title?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t=>t.status==='OPEN').length,
    inProgress: tickets.filter(t=>t.status==='IN_PROGRESS').length,
    resolved:   tickets.filter(t=>t.status==='RESOLVED').length,
    rejected:   tickets.filter(t=>t.status==='REJECTED').length,
    closed:     tickets.filter(t=>t.status==='CLOSED').length,
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
            My Tickets
          </h2>
          <p style={{ margin:'4px 0 0', color:'#94a3b8', fontSize:'0.875rem' }}>
            {user?.name && <>Welcome, <strong style={{color:'#374151'}}>{user.name}</strong> — </>}
            track and manage your campus incident reports
          </p>
        </div>
        <button onClick={() => navigate('/tickets/new')} style={{
          background:'linear-gradient(135deg,#1e40af,#3b82f6)',
          color:'white', border:'none', borderRadius:'10px',
          padding:'10px 22px', fontSize:'0.875rem', fontWeight:'700',
          cursor:'pointer', boxShadow:'0 2px 8px rgba(29,78,216,0.3)',
          transition:'opacity 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          + New Ticket
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:'14px', marginBottom:'24px' }}>
        {[
          { label:'Total',       value:stats.total,      bg:'linear-gradient(135deg,#1e40af,#3b82f6)', icon:'🎫' },
          { label:'Open',        value:stats.open,       bg:'linear-gradient(135deg,#b45309,#f59e0b)', icon:'📬' },
          { label:'In Progress', value:stats.inProgress, bg:'linear-gradient(135deg,#0e7490,#06b6d4)', icon:'⚙️'  },
          { label:'Resolved',    value:stats.resolved,   bg:'linear-gradient(135deg,#15803d,#22c55e)', icon:'✓'   },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'14px',
            padding:'20px', color:'white',
            boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
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

      {/* QUICK FILTER PILLS */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
        {[
          { label:'All',         value:'',            count:stats.total },
          { label:'Open',        value:'OPEN',        count:stats.open },
          { label:'In Progress', value:'IN_PROGRESS', count:stats.inProgress },
          { label:'Resolved',    value:'RESOLVED',    count:stats.resolved },
          { label:'Rejected',    value:'REJECTED',    count:stats.rejected },
          { label:'Closed',      value:'CLOSED',      count:stats.closed },
        ].map(tab => (
          <button key={tab.value}
            onClick={() => setFilter({...filter, status:tab.value})}
            style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'0.8rem',
              fontWeight:'600', cursor:'pointer',
              border: filter.status===tab.value ? 'none' : '1px solid #e5e7eb',
              background: filter.status===tab.value ? '#1d4ed8' : 'white',
              color:       filter.status===tab.value ? 'white'   : '#374151',
              boxShadow: filter.status===tab.value
                ? '0 2px 8px rgba(29,78,216,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
              transition:'all 0.15s', display:'flex', alignItems:'center', gap:'6px'
            }}>
            {tab.label}
            <span style={{
              padding:'1px 6px', borderRadius:'10px', fontSize:'0.7rem', fontWeight:'700',
              background: filter.status===tab.value ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
              color:       filter.status===tab.value ? 'white' : '#6b7280',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div style={{ background:'white', border:'1px solid #f0f0f0', borderRadius:'12px',
        padding:'14px 18px', marginBottom:'24px',
        display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center',
        boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ flex:1, minWidth:'220px', position:'relative' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%',
            transform:'translateY(-50%)', color:'#9ca3af' }}>🔍</span>
          <input className="form-control" style={{ paddingLeft:'34px' }}
            placeholder="Search your tickets..."
            value={filter.search}
            onChange={e => setFilter({...filter, search:e.target.value})} />
        </div>
        <select className="form-control" style={{ width:'140px' }}
          value={filter.priority}
          onChange={e => setFilter({...filter, priority:e.target.value})}>
          <option value="">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {(filter.status||filter.priority||filter.search) && (
          <button className="btn btn-secondary" style={{ fontSize:'0.82rem' }}
            onClick={() => setFilter({status:'',priority:'',search:''})}>
            Clear all
          </button>
        )}
        <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:'#9ca3af', whiteSpace:'nowrap' }}>
          {filtered.length} ticket{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* LOADING */}
      {loading && <div className="spinner-container"><div className="spinner"></div></div>}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 40px', background:'white',
          borderRadius:'16px', border:'1px solid #f0f0f0',
          boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'16px', opacity:0.4 }}>🎫</div>
          <h3 style={{ margin:'0 0 8px', color:'#0f172a', fontWeight:'700' }}>
            {filter.search || filter.status || filter.priority
              ? 'No tickets match your filters'
              : 'No tickets yet'}
          </h3>
          <p style={{ color:'#94a3b8', margin:'0 0 20px', fontSize:'0.9rem' }}>
            {filter.search || filter.status || filter.priority
              ? 'Try adjusting your search or filters'
              : 'Submit your first incident report to get started'}
          </p>
          {!filter.search && !filter.status && !filter.priority && (
            <button onClick={() => navigate('/tickets/new')} style={{
              background:'linear-gradient(135deg,#1e40af,#3b82f6)',
              color:'white', border:'none', borderRadius:'10px',
              padding:'10px 24px', fontSize:'0.875rem', fontWeight:'700',
              cursor:'pointer', boxShadow:'0 2px 8px rgba(29,78,216,0.3)'
            }}>
              + Create Your First Ticket
            </button>
          )}
        </div>
      )}

      {/* TICKET CARDS GRID */}
      <div style={{ display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'16px' }}>
        {filtered.map(ticket => (
          <div key={ticket.id}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            style={{
              background:'white', borderRadius:'14px', padding:'0',
              border:'1px solid #f0f0f0', cursor:'pointer',
              boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              transition:'all 0.2s', overflow:'hidden',
              borderTop:`3px solid ${PRIORITY_COLOR[ticket.priority]||'#e5e7eb'}`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform='translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform='translateY(0)';
            }}>

            {/* Card header */}
            <div style={{ padding:'16px 18px 12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', gap:'8px', marginBottom:'10px' }}>
                <h4 style={{ margin:0, fontSize:'0.92rem', fontWeight:'700',
                  color:'#0f172a', flex:1, lineHeight:'1.3',
                  overflow:'hidden', display:'-webkit-box',
                  WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {ticket.title}
                </h4>
                <Chip label={ticket.status?.replace('_',' ')}
                  status={ticket.status} type="status" />
              </div>

              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                <Chip label={ticket.priority} status={ticket.priority} type="priority" />
                <span style={{ background:'#f1f5f9', color:'#475569',
                  padding:'3px 10px', borderRadius:'20px',
                  fontSize:'0.7rem', fontWeight:'600' }}>
                  {ticket.category}
                </span>
                {ticket.faculty && (
                  <span style={{ background:'#f8fafc', color:'#64748b',
                    padding:'3px 10px', borderRadius:'20px', fontSize:'0.68rem' }}>
                    {ticket.faculty.replace('Faculty of ','').replace('School of ','')}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ padding:'0 18px 12px' }}>
              <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280',
                lineHeight:'1.5', display:'-webkit-box',
                WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {ticket.description}
              </p>
            </div>

            {/* AI triage badge */}
            {ticket.aiTriage && (
              <div style={{ margin:'0 18px 12px', background:'#eff6ff',
                border:'1px solid #bfdbfe', borderRadius:'8px',
                padding:'8px 12px', fontSize:'0.78rem', color:'#1d4ed8' }}>
                <strong>AI:</strong> {ticket.aiTriage.suggestedPriority} priority
                — {ticket.aiTriage.estimatedResolutionTime}
              </div>
            )}

            {/* Card footer */}
            <div style={{ padding:'10px 18px', borderTop:'1px solid #f8fafc',
              background:'#f8fafc', display:'flex',
              justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.72rem', color:'#94a3b8',
                display:'flex', alignItems:'center', gap:'4px' }}>
                📍 {ticket.location || '—'}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                {ticket.assignedToName && (
                  <span style={{ fontSize:'0.7rem', color:'#6b7280',
                    background:'#e5e7eb', padding:'2px 8px', borderRadius:'10px' }}>
                    👷 {ticket.assignedToName}
                  </span>
                )}
                <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB',{
                    day:'2-digit', month:'short', year:'numeric'
                  }) : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}