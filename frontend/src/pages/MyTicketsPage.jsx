import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ status:'', priority:'', search:'' });
  const navigate = useNavigate();

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

  const getBadgeClass = (status) => {
    const map = {
      OPEN:'badge-open', IN_PROGRESS:'badge-in_progress',
      RESOLVED:'badge-resolved', CLOSED:'badge-closed', REJECTED:'badge-rejected'
    };
    return 'badge ' + (map[status] || '');
  };

  const getPriorityColor = (p) => {
    const map = { LOW:'#2e7d32', MEDIUM:'#f57c00', HIGH:'#e53935', CRITICAL:'#b71c1c' };
    return map[p] || '#333';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h2 style={{ margin:0, color:'#1a73e8' }}>My Tickets</h2>
          <p style={{ margin:'4px 0 0', color:'#666', fontSize:'0.9rem' }}>Track your incident reports</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
          + New Ticket
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total',       value: tickets.length,                                      color:'#1a73e8' },
          { label:'Open',        value: tickets.filter(t=>t.status==='OPEN').length,         color:'#004085' },
          { label:'In Progress', value: tickets.filter(t=>t.status==='IN_PROGRESS').length,  color:'#856404' },
          { label:'Resolved',    value: tickets.filter(t=>t.status==='RESOLVED').length,     color:'#155724' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'16px' }}>
            <div style={{ fontSize:'0.8rem', color:'#666' }}>{s.label}</div>
            <div style={{ fontSize:'2rem', fontWeight:'700', color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:'24px', display:'flex', gap:'12px', flexWrap:'wrap', padding:'16px' }}>
        <input className="form-control" style={{ flex:1, minWidth:'200px' }}
          placeholder="Search tickets..."
          value={filter.search}
          onChange={e => setFilter({...filter, search:e.target.value})} />
        <select className="form-control" style={{ width:'160px' }}
          value={filter.status}
          onChange={e => setFilter({...filter, status:e.target.value})}>
          <option value="">All Statuses</option>
          {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s=>(
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
        <select className="form-control" style={{ width:'160px' }}
          value={filter.priority}
          onChange={e => setFilter({...filter, priority:e.target.value})}>
          <option value="">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {(filter.status||filter.priority||filter.search) && (
          <button className="btn btn-secondary"
            onClick={()=>setFilter({status:'',priority:'',search:''})}>
            Clear
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="spinner-container"><div className="spinner"></div></div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:'48px' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🎫</div>
          <h3 style={{ color:'#666' }}>No tickets found</h3>
          <p style={{ color:'#999' }}>Create your first ticket to get started</p>
          <button className="btn btn-primary" style={{ marginTop:'12px' }}
            onClick={() => navigate('/tickets/new')}>
            + Create Ticket
          </button>
        </div>
      )}

      {/* Ticket cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px' }}>
        {filtered.map(ticket => (
          <div key={ticket.id} className="card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            style={{ cursor:'pointer', borderLeft:`4px solid ${getPriorityColor(ticket.priority)}` }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
              <h4 style={{ margin:0, fontSize:'0.95rem', flex:1, paddingRight:'8px' }}>{ticket.title}</h4>
              <span className={getBadgeClass(ticket.status)}>
                {ticket.status?.replace('_',' ')}
              </span>
            </div>

            <div style={{ display:'flex', gap:'8px', marginBottom:'10px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.78rem', fontWeight:'600', color:getPriorityColor(ticket.priority) }}>
                ● {ticket.priority}
              </span>
              <span className="badge" style={{ background:'#f1f3f4', color:'#555' }}>
                {ticket.category}
              </span>
            </div>

            <p style={{ fontSize:'0.85rem', color:'#666', margin:'0 0 10px', lineHeight:'1.4',
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {ticket.description}
            </p>

            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#999',
              borderTop:'1px solid #f0f0f0', paddingTop:'8px' }}>
              <span>📍 {ticket.location}</span>
              <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
            </div>

            {ticket.aiTriage && (
              <div style={{ marginTop:'8px', background:'#e8f0fe', borderRadius:'6px',
                padding:'6px 10px', fontSize:'0.8rem', color:'#1a73e8' }}>
                🤖 AI: {ticket.aiTriage.suggestedPriority} — {ticket.aiTriage.recommendedAction?.slice(0,40)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}