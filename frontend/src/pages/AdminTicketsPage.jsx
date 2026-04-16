import { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  OPEN:'#004085', IN_PROGRESS:'#967104', RESOLVED:'#155724',
  CLOSED:'#383d41', REJECTED:'#721c24'
};
const STATUS_BG = {
  OPEN:'#cce5ff', IN_PROGRESS:'#fff3cd', RESOLVED:'#d4edda',
  CLOSED:'#e2e3e5', REJECTED:'#f8d7da'
};
const PRIORITY_COLORS = {
  LOW:'#2e7d32', MEDIUM:'#f57c00', HIGH:'#e53935', CRITICAL:'#b71c1c'
};
const PRIORITY_BG = {
  LOW:'#d4edda', MEDIUM:'#fff3cd', HIGH:'#fdecea', CRITICAL:'#f8d7da'
};

const TECHNICIANS = [
  { id: 'tech-001', name: 'Siyumi Fonseka', email: 'fonsekasiyumi@gmail.com' },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState({ status:'', priority:'', category:'', search:'' });
  const [rejectModal, setRejectModal]   = useState(null);
  const [assignModal, setAssignModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    ticketService.getAllTickets()
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t =>
    (!filter.status   || t.status   === filter.status) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.category || t.category === filter.category) &&
    (!filter.search   ||
      t.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.userName?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  const handleApproveAndAssign = async () => {
    if (!selectedTech) { alert('Please select a technician'); return; }
    setActionLoading(true);
    try {
      const tech = TECHNICIANS.find(t => t.id === selectedTech);
      await ticketService.assignTechnician(assignModal.id, {
        technicianId: tech.id, technicianName: tech.name,
      });
      setAssignModal(null); setSelectedTech(''); load();
    } catch { alert('Failed to assign technician'); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Please enter a rejection reason'); return; }
    setActionLoading(true);
    try {
      await ticketService.rejectTicket(rejectModal.id, { reason: rejectReason });
      setRejectModal(null); setRejectReason(''); load();
    } catch { alert('Failed to reject ticket'); }
    setActionLoading(false);
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this ticket as resolved?')) return;
    try { await ticketService.updateStatus(id, { status:'RESOLVED' }); load(); }
    catch { alert('Failed to resolve'); }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this ticket?')) return;
    try { await ticketService.updateStatus(id, { status:'CLOSED' }); load(); }
    catch { alert('Failed to close'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    try { await ticketService.deleteTicket(id); load(); }
    catch { alert('Failed to delete'); }
  };

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status==='OPEN').length,
    inProgress: tickets.filter(t => t.status==='IN_PROGRESS').length,
    resolved:   tickets.filter(t => t.status==='RESOLVED').length,
    critical:   tickets.filter(t => t.priority==='CRITICAL').length,
  };

  const ActionBtn = ({ label, onClick, variant }) => {
    const styles = {
      view:    { bg:'#f8fafc', color:'#374151', border:'1px solid #d1d5db' },
      approve: { bg:'#16a34a', color:'white',   border:'none' },
      resolve: { bg:'#16a34a', color:'white',   border:'none' },
      reject:  { bg:'#ffffff', color:'#dc2626', border:'1px solid #fca5a5' },
      close:   { bg:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db' },
      delete:  { bg:'#dc2626', color:'white',   border:'none' },
    };
    const s = styles[variant] || styles.view;
    return (
      <button onClick={onClick} style={{
        fontSize:'0.72rem', padding:'5px 10px', borderRadius:'5px',
        border: s.border, background: s.bg, color: s.color,
        cursor:'pointer', fontWeight:'600', whiteSpace:'nowrap', flexShrink:0,
        transition:'opacity 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        {label}
      </button>
    );
  };

  return (
    <div style={{ padding:'28px', background:'#f8fafc', minHeight:'100vh',
      fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom:'28px' }}>
        <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:'750', color:'#111827' }}>
          Incident Tickets
        </h2>
        <p style={{ margin:'5px 0 0', color:'#73757a', fontSize:'0.88rem' }}>
          Review, approve, assign technicians and manage all campus incident reports
        </p>
      </div>

      {/* STAT CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)',
        gap:'14px', marginBottom:'28px' }}>
        {[
          { label:'Total Tickets', value:stats.total,      accent:'#0e4ea1' },
          { label:'Open',          value:stats.open,       accent:'#f59e0b' },
          { label:'In Progress',   value:stats.inProgress, accent:'#a3740e' },
          { label:'Resolved',      value:stats.resolved,   accent:'#16a34a' },
          { label:'Critical',      value:stats.critical,   accent:'#dc2626' },
        ].map(s => (
          <div key={s.label} style={{
            background:'white', borderRadius:'10px', padding:'18px 20px',
            border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
            borderTop:`3px solid ${s.accent}`
          }}>
            <div style={{ fontSize:'0.85rem', color:'#6c717a', fontWeight:'600',
              marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              {s.label}
            </div>
            <div style={{ fontSize:'2rem', fontWeight:'700', color:s.accent,
              lineHeight:'1' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'10px',
        padding:'14px 18px', marginBottom:'20px',
        display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center',
        boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <input className="form-control" style={{ flex:1, minWidth:'220px' }}
          placeholder="Search by title or reporter..."
          value={filter.search}
          onChange={e => setFilter({...filter, search:e.target.value})} />
        <select className="form-control" style={{ width:'150px' }}
          value={filter.status}
          onChange={e => setFilter({...filter, status:e.target.value})}>
          <option value="">All Statuses</option>
          {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s=>(
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
        <select className="form-control" style={{ width:'130px' }}
          value={filter.priority}
          onChange={e => setFilter({...filter, priority:e.target.value})}>
          <option value="">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className="form-control" style={{ width:'140px' }}
          value={filter.category}
          onChange={e => setFilter({...filter, category:e.target.value})}>
          <option value="">All Categories</option>
          {['ELECTRICAL','PLUMBING','IT','HVAC','GENERAL'].map(c=>(
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(filter.status||filter.priority||filter.category||filter.search) && (
          <button className="btn btn-secondary" style={{ fontSize:'0.85rem' }}
            onClick={() => setFilter({status:'',priority:'',category:'',search:''})}>
            Clear
          </button>
        )}
        <span style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#9ca3af',
          whiteSpace:'nowrap' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ASSIGN MODAL */}
      {assignModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'32px',
            width:'100%', maxWidth:'480px', boxShadow:'0 25px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin:'0 0 4px', color:'#111827', fontSize:'1.1rem' }}>
              Approve & Assign Technician
            </h3>
            <p style={{ margin:'0 0 18px', color:'#6b7280', fontSize:'0.85rem',
              paddingBottom:'16px', borderBottom:'1px solid #f3f4f6' }}>
              Assigning a technician will move this ticket to In Progress.
            </p>
            <div style={{ background:'#f9fafb', borderRadius:'8px', padding:'14px',
              marginBottom:'16px', fontSize:'0.85rem', border:'1px solid #e5e7eb' }}>
              <div style={{ fontWeight:'600', color:'#111827', marginBottom:'10px',
                fontSize:'0.9rem' }}>{assignModal.title}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                gap:'6px', color:'#4b5563' }}>
                <div>Reporter: <strong>{assignModal.userName}</strong></div>
                <div>Location: <strong>{assignModal.location}</strong></div>
                <div>Category: <strong>{assignModal.category}</strong></div>
                <div>Priority:
                  <strong style={{ color:PRIORITY_COLORS[assignModal.priority] }}>
                    {' '}{assignModal.priority}
                  </strong>
                </div>
              </div>
            </div>
            {assignModal.aiTriage && (
              <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe',
                borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
                fontSize:'0.83rem', color:'#1d4ed8' }}>
                AI Suggestion: <strong>{assignModal.aiTriage.suggestedPriority}</strong> priority
                — {assignModal.aiTriage.recommendedAction}
              </div>
            )}
            <div className="form-group">
              <label style={{ fontWeight:'600', fontSize:'0.88rem', color:'#374151' }}>
                Assign Technician *
              </label>
              <select className="form-control" value={selectedTech}
                onChange={e => setSelectedTech(e.target.value)}>
                <option value="">-- Select Technician --</option>
                {TECHNICIANS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
              <button className="btn btn-primary" style={{ flex:1, padding:'10px',
                background:'#16a34a', border:'none' }}
                onClick={handleApproveAndAssign} disabled={actionLoading}>
                {actionLoading ? 'Assigning...' : 'Approve & Assign'}
              </button>
              <button className="btn btn-secondary" style={{ flex:1, padding:'10px' }}
                onClick={() => { setAssignModal(null); setSelectedTech(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'32px',
            width:'100%', maxWidth:'460px', boxShadow:'0 25px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin:'0 0 4px', color:'#dc2626', fontSize:'1.1rem' }}>
              Reject Ticket
            </h3>
            <p style={{ margin:'0 0 18px', color:'#6b7280', fontSize:'0.85rem',
              paddingBottom:'16px', borderBottom:'1px solid #f3f4f6' }}>
              Please provide a reason. The reporter will be notified.
            </p>
            <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb',
              borderRadius:'8px', padding:'12px', marginBottom:'16px',
              fontSize:'0.88rem', fontWeight:'500', color:'#374151' }}>
              {rejectModal.title}
            </div>
            <div className="form-group">
              <label style={{ fontWeight:'600', fontSize:'0.88rem', color:'#374151' }}>
                Reason for Rejection *
              </label>
              <textarea className="form-control" rows={3} style={{ resize:'vertical' }}
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
              <button className="btn btn-danger" style={{ flex:1, padding:'10px' }}
                onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button className="btn btn-secondary" style={{ flex:1, padding:'10px' }}
                onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="spinner-container"><div className="spinner"></div></div>}

      {/* TABLE */}
      {!loading && (
        <div style={{ background:'white', border:'1px solid #e5e7eb',
          borderRadius:'10px', overflow:'hidden',
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>

          {/* Header */}
          <div style={{ display:'grid',
            gridTemplateColumns:'2.4fr 0.9fr 0.9fr 1.2fr 1.6fr',
            padding:'12px 20px', background:'#f9fafb',
            borderBottom:'1px solid #e5e7eb' }}>
            {['Ticket','Category','Priority','Status','Actions'].map(h => (
              <div key={h} style={{ fontSize:'0.72rem', fontWeight:'700',
                color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                {h}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px', color:'#9ca3af' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>📋</div>
              <div style={{ fontWeight:'500', fontSize:'0.95rem' }}>No tickets found</div>
              <div style={{ fontSize:'0.83rem', marginTop:'4px' }}>
                Try adjusting your search or filters
              </div>
            </div>
          )}

          {filtered.map((ticket, idx) => (
            <div key={ticket.id} style={{
              display:'grid',
              gridTemplateColumns:'2.4fr 0.9fr 0.9fr 1.2fr 1.6fr',
              padding:'14px 20px',
              borderBottom: idx < filtered.length-1 ? '1px solid #f3f4f6' : 'none',
              alignItems:'center',
              borderLeft: ticket.priority==='CRITICAL'
                ? '3px solid #dc2626' : '3px solid transparent',
              background: ticket.priority==='CRITICAL' ? '#fffcfc' : 'white',
            }}
            onMouseEnter={e => {
              if (ticket.priority !== 'CRITICAL')
                e.currentTarget.style.background = '#fafafa';
            }}
            onMouseLeave={e => {
              if (ticket.priority !== 'CRITICAL')
                e.currentTarget.style.background = 'white';
            }}>

              {/* Ticket info */}
              <div style={{ paddingRight:'16px' }}>
                <div style={{ fontWeight:'600', color:'#111827', fontSize:'0.88rem',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  marginBottom:'3px' }}>
                  {ticket.title}
                </div>
                <div style={{ fontSize:'0.73rem', color:'#6b7280' }}>
                  {ticket.userName || 'Unknown'} &nbsp;·&nbsp; {ticket.location}
                </div>
                <div style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:'2px' }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                    day:'2-digit', month:'short', year:'numeric'
                  }) : ''}
                </div>
              </div>

              {/* Category */}
              <div>
                <span style={{ background:'#f3f4f6', color:'#374151',
                  padding:'3px 9px', borderRadius:'20px',
                  fontSize:'0.72rem', fontWeight:'500' }}>
                  {ticket.category}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span style={{ background:PRIORITY_BG[ticket.priority],
                  color:PRIORITY_COLORS[ticket.priority],
                  padding:'3px 9px', borderRadius:'20px',
                  fontSize:'0.72rem', fontWeight:'700' }}>
                  {ticket.priority}
                </span>
              </div>

              {/* Status + technician */}
              <div>
                <span style={{ background:STATUS_BG[ticket.status],
                  color:STATUS_COLORS[ticket.status],
                  padding:'3px 9px', borderRadius:'20px',
                  fontSize:'0.72rem', fontWeight:'600' }}>
                  {ticket.status?.replace('_',' ')}
                </span>
                {ticket.assignedToName && (
                  <div style={{ fontSize:'0.68rem', color:'#6b7280', marginTop:'3px' }}>
                    {ticket.assignedToName}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'5px', alignItems:'center',
                flexWrap:'nowrap' }}>
                <ActionBtn label="View"
                  onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  variant="view" />

                {ticket.status === 'OPEN' && <>
                  <ActionBtn label="Approve"
                    onClick={() => setAssignModal(ticket)}
                    variant="approve" />
                  <ActionBtn label="Reject"
                    onClick={() => setRejectModal(ticket)}
                    variant="reject" />
                </>}

                {ticket.status === 'IN_PROGRESS' && <>
                  <ActionBtn label="Resolve"
                    onClick={() => handleResolve(ticket.id)}
                    variant="resolve" />
                  <ActionBtn label="Reject"
                    onClick={() => setRejectModal(ticket)}
                    variant="reject" />
                </>}

                {ticket.status === 'RESOLVED' &&
                  <ActionBtn label="Close"
                    onClick={() => handleClose(ticket.id)}
                    variant="close" />}

                <ActionBtn label="Delete"
                  onClick={() => handleDelete(ticket.id)}
                  variant="delete" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}