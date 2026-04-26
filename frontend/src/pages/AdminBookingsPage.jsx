import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';

// ── Icons ──────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const QRIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/></svg>;

// ── Status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    APPROVED:  { bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
    PENDING:   { bg:'#fef9c3', color:'#854d0e', dot:'#ca8a04' },
    REJECTED:  { bg:'#fee2e2', color:'#991b1b', dot:'#dc2626' },
    CANCELLED: { bg:'#f1f5f9', color:'#475569', dot:'#94a3b8' },
  };
  const s = cfg[status] || cfg.CANCELLED;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const ini = name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || '?';
  const pal = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];
  const col = pal[ini.charCodeAt(0) % pal.length];
  return (
    <div style={{ width:32, height:32, borderRadius:'50%', background:`${col}20`, border:`1.5px solid ${col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:col, flexShrink:0 }}>
      {ini}
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────
function Btn({ onClick, bg, color, border, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:700, cursor: disabled ? 'not-allowed' : 'pointer', background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap', opacity: disabled ? 0.6 : 1, transition:'opacity 0.15s' }}>
      {children}
    </button>
  );
}

const STATUS_FILTERS = ['ALL','PENDING','APPROVED','REJECTED','CANCELLED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('ALL');
  const [search, setSearch]             = useState('');
  const [showQR, setShowQR]             = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [processing, setProcessing]     = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setLoading(true); const r = await bookingService.getAllBookings(); setBookings(r.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }

  async function handleApprove(b) {
    try {
      setProcessing(b.id+'-a');
      await bookingService.approve(b.id, { adminRemarks:'Approved by admin' });
      toast.success('Booking approved');
      load();
    } catch(err) { toast.error(err.response?.data?.message || 'Approval failed'); }
    finally { setProcessing(null); }
  }

  async function handleRejectConfirm() {
    if (!rejectRemark.trim()) { toast.error('Please provide a reason'); return; }
    try {
      setProcessing(rejectTarget.id+'-r');
      await bookingService.reject(rejectTarget.id, { adminRemarks: rejectRemark });
      toast.success('Booking rejected');
      setRejectTarget(null); setRejectRemark('');
      load();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(null); }
  }

  async function handleDelete(b) {
    if (!window.confirm('Delete this booking record permanently?')) return;
    try { await bookingService.delete(b.id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  }

  async function handleViewQR(b) {
    try { const r = await bookingService.getQRCode(b.id); setShowQR({ ...b, qrCode: r.data }); }
    catch { toast.error('Failed to load QR'); }
  }

  const counts = {
    total:    bookings.length,
    pending:  bookings.filter(b => b.status==='PENDING').length,
    approved: bookings.filter(b => b.status==='APPROVED').length,
    rejected: bookings.filter(b => b.status==='REJECTED').length,
  };

  const filtered = bookings
    .filter(b => filter==='ALL' || b.status===filter)
    .filter(b => !search || b.resourceName?.toLowerCase().includes(search.toLowerCase()) || b.userName?.toLowerCase().includes(search.toLowerCase()));

  // shared input style
  const th = { padding:'10px 14px', fontSize:11, fontWeight:700, color:'#94a3b8', textAlign:'left', textTransform:'uppercase', letterSpacing:'0.7px', whiteSpace:'nowrap', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' };
  const td = { padding:'12px 14px', fontSize:13, verticalAlign:'middle', borderBottom:'1px solid #f8fafc' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:3, letterSpacing:'-0.3px' }}>Booking Management</h1>
        <p style={{ fontSize:13, color:'#64748b' }}>Review, approve, and reject campus resource booking requests</p>
      </div>

      {/* Stat cards */}
      {/* Stat cards */}
<div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
  {[
    { label:'Total Bookings',  value:counts.total,    numColor:'#1d4ed8', bg:'#eff6ff',  borderLeft:'#1d4ed8' },
    { label:'Pending Review',  value:counts.pending,  numColor:'#d97706', bg:'#fffbeb',  borderLeft:'#d97706' },
    { label:'Approved',        value:counts.approved, numColor:'#16a34a', bg:'#f0fdf4',  borderLeft:'#16a34a' },
    { label:'Rejected',        value:counts.rejected, numColor:'#dc2626', bg:'#fef2f2',  borderLeft:'#dc2626' },
  ].map(s => (
    <div key={s.label} style={{
      background: s.bg,
      borderRadius: 10,
      padding: '16px 20px',
      borderLeft: `4px solid ${s.borderLeft}`,
    }}>
      <div style={{ fontSize:28, fontWeight:700, color:s.numColor, lineHeight:1 }}>{s.value}</div>
      <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{s.label}</div>
    </div>
  ))}
</div>
      {/* Pending alert */}
      {counts.pending > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#fefce8', border:'1px solid #fde68a', borderRadius:10, marginBottom:18 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontWeight:700, fontSize:13, color:'#92400e', flex:1 }}>
            {counts.pending} booking{counts.pending>1?'s':''} waiting for approval
          </span>
          <button onClick={() => setFilter('PENDING')}
            style={{ padding:'5px 14px', background:'#92400e', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Review Now
          </button>
        </div>
      )}

      {/* Filters + search */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {STATUS_FILTERS.map(s => {
            const active = filter===s;
            const n = s==='ALL' ? bookings.length : bookings.filter(b=>b.status===s).length;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                display:'inline-flex', alignItems:'center', gap:5, padding:'6px 14px',
                borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid',
                borderColor: active ? '#1d4ed8' : '#e2e8f0',
                background: active ? '#1d4ed8' : '#fff',
                color: active ? '#fff' : '#64748b', transition:'all 0.15s',
              }}>
                {s==='ALL' ? 'All' : s}
                <span style={{ padding:'0px 5px', borderRadius:10, fontSize:10, fontWeight:700, background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: active ? '#fff' : '#94a3b8' }}>{n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}><SearchIcon /></span>
          <input placeholder="Search by user or resource..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ padding:'8px 12px 8px 32px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#0f172a', outline:'none', width:250, background:'#f8fafc', fontFamily:'inherit' }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ width:30, height:30, border:'3px solid #e2e8f0', borderTopColor:'#1d4ed8', borderRadius:'50%', margin:'0 auto 10px', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ fontSize:13, color:'#94a3b8' }}>Loading...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 20px', color:'#94a3b8' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#64748b', marginBottom:4 }}>No bookings match your filters</div>
              <div style={{ fontSize:12 }}>Try switching to a different status filter</div>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'18%' }} />  {/* User */}
                <col style={{ width:'14%' }} />  {/* Resource */}
                <col style={{ width:'11%' }} />  {/* Date */}
                <col style={{ width:'12%' }} />  {/* Time */}
                <col style={{ width:'18%' }} />  {/* Purpose */}
                <col style={{ width:'13%' }} />  {/* Status */}
                <col style={{ width:'14%' }} />  {/* Actions */}
              </colgroup>
              <thead>
                <tr>
                  {['User','Resource','Date','Time','Purpose','Status','Actions'].map((h,i) => (
                    <th key={h} style={{ ...th, textAlign: i===6 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => (
                  <tr key={b.id}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                    {/* User */}
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <Avatar name={b.userName} />
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.userName}</div>
                          <div style={{ fontSize:10, color:'#94a3b8' }}>#{b.id?.slice(-6)?.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>

                    {/* Resource */}
                    <td style={{ ...td }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.resourceName}</div>
                      {b.expectedAttendees && <div style={{ fontSize:11, color:'#94a3b8' }}>{b.expectedAttendees} people</div>}
                    </td>

                    {/* Date */}
                    <td style={{ ...td }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#334155', fontFamily:'monospace', whiteSpace:'nowrap' }}>{b.bookingDate}</span>
                    </td>

                    {/* Time */}
                    <td style={{ ...td }}>
                      <span style={{ fontSize:12, color:'#64748b', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                        {b.startTime?.substring(0,5)} – {b.endTime?.substring(0,5)}
                      </span>
                    </td>

                    {/* Purpose */}
                    <td style={{ ...td }}>
                      <div style={{ fontSize:12, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.purpose}</div>
                      {b.adminRemarks && (
                        <div style={{ fontSize:11, color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          Note: {b.adminRemarks}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={td}><StatusBadge status={b.status} /></td>

                    {/* Actions */}
                    <td style={{ ...td, textAlign:'right' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:5 }}>
                        {b.status === 'PENDING' && <>
                          <Btn onClick={()=>handleApprove(b)} disabled={processing===b.id+'-a'} bg='#f0fdf4' color='#15803d' border='#bbf7d0'>
                            <CheckIcon/>{processing===b.id+'-a'?'...':'Approve'}
                          </Btn>
                          <Btn onClick={()=>{setRejectTarget(b);setRejectRemark('');}} bg='#fef2f2' color='#991b1b' border='#fecaca'>
                            <XIcon/>Reject
                          </Btn>
                        </>}
                        {b.status === 'APPROVED' && (
                          <Btn onClick={()=>handleViewQR(b)} bg='#eff6ff' color='#1d4ed8' border='#bfdbfe'>
                            <QRIcon/>View QR
                          </Btn>
                        )}
                        <Btn onClick={()=>handleDelete(b)} bg='#fef2f2' color='#dc2626' border='#fecaca'>
                          <TrashIcon/>
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:30, width:440, maxWidth:'95vw', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:4 }}>Reject Booking</h2>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:18 }}>
              <strong style={{ color:'#334155' }}>{rejectTarget.resourceName}</strong> — booked by <strong style={{ color:'#334155' }}>{rejectTarget.userName}</strong> on {rejectTarget.bookingDate}
            </p>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Reason *</label>
              <textarea value={rejectRemark} onChange={e=>setRejectRemark(e.target.value)}
                placeholder="e.g. Room under maintenance, scheduling conflict..."
                rows={3} style={{ width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit', background:'#f8fafc', color:'#0f172a', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
              <button onClick={()=>setRejectTarget(null)} style={{ padding:'9px 20px', background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleRejectConfirm} style={{ padding:'9px 22px', background:'#dc2626', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR MODAL ── */}
      {showQR && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:30, width:360, maxWidth:'95vw', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', textAlign:'center' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a' }}>Booking QR Code</h2>
              <button onClick={()=>setShowQR(null)} style={{ width:30, height:30, borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer', fontSize:15, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:12, padding:16, border:'1px solid #e2e8f0', display:'inline-block', marginBottom:16 }}>
              {showQR.qrCode
                ? <img src={`data:image/png;base64,${showQR.qrCode}`} alt="QR" style={{ width:180, height:180, display:'block' }} />
                : <div style={{ width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:13 }}>Loading...</div>
              }
            </div>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:3 }}>{showQR.resourceName}</h3>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:16 }}>
              {showQR.userName} · {showQR.bookingDate} · {showQR.startTime?.substring(0,5)}–{showQR.endTime?.substring(0,5)}
            </p>
            <button onClick={()=>setShowQR(null)} style={{ width:'100%', padding:'10px', background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}