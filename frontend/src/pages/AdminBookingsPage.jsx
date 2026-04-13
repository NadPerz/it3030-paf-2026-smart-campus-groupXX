import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';

// ── Icons ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const QRIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/>
  </svg>
);
const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

// ── Status badge ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    APPROVED:  { bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
    PENDING:   { bg:'#fef9c3', color:'#854d0e', dot:'#ca8a04' },
    REJECTED:  { bg:'#fee2e2', color:'#991b1b', dot:'#dc2626' },
    CANCELLED: { bg:'#f1f5f9', color:'#475569', dot:'#94a3b8' },
  };
  const s = cfg[status] || cfg.CANCELLED;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px',
      borderRadius:20, fontSize:11, fontWeight:700,
      background:s.bg, color:s.color, letterSpacing:'0.3px', whiteSpace:'nowrap'
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';
  const palette = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];
  const color = palette[initials.charCodeAt(0) % palette.length];
  return (
    <div style={{
      width:34, height:34, borderRadius:'50%',
      background:`${color}18`, border:`1.5px solid ${color}35`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:12, fontWeight:800, color, flexShrink:0, letterSpacing:'0.5px'
    }}>
      {initials}
    </div>
  );
}

// ── Action menu (dropdown) ──────────────────────────────────────────────
function ActionMenu({ booking, onApprove, onReject, onQR, onDelete, processing }) {
  const [open, setOpen] = useState(false);
  const isApproving = processing === booking.id + '-a';

  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:32, height:32, borderRadius:8, border:'1px solid #e2e8f0',
          background:'#f8fafc', cursor:'pointer', display:'flex',
          alignItems:'center', justifyContent:'center', color:'#64748b',
          transition:'all 0.15s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.borderColor='#cbd5e1'; }}
        onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; }}
      >
        <MoreIcon />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={() => setOpen(false)} />
          {/* dropdown */}
          <div style={{
            position:'absolute', right:0, top:38, width:180,
            background:'#fff', borderRadius:10, border:'1px solid #e2e8f0',
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:99, overflow:'hidden'
          }}>
            {booking.status === 'PENDING' && (
              <>
                <button
                  onClick={() => { setOpen(false); onApprove(booking); }}
                  disabled={isApproving}
                  style={{
                    width:'100%', padding:'10px 14px', background:'transparent', border:'none',
                    cursor:'pointer', fontSize:13, fontWeight:600, color:'#15803d',
                    display:'flex', alignItems:'center', gap:9, textAlign:'left',
                    borderBottom:'1px solid #f1f5f9', transition:'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <span style={{ width:22, height:22, borderRadius:6, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}><CheckIcon /></span>
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => { setOpen(false); onReject(booking); }}
                  style={{
                    width:'100%', padding:'10px 14px', background:'transparent', border:'none',
                    cursor:'pointer', fontSize:13, fontWeight:600, color:'#991b1b',
                    display:'flex', alignItems:'center', gap:9, textAlign:'left',
                    borderBottom:'1px solid #f1f5f9', transition:'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <span style={{ width:22, height:22, borderRadius:6, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center' }}><XIcon /></span>
                  Reject
                </button>
              </>
            )}

            {booking.status === 'APPROVED' && (
              <button
                onClick={() => { setOpen(false); onQR(booking); }}
                style={{
                  width:'100%', padding:'10px 14px', background:'transparent', border:'none',
                  cursor:'pointer', fontSize:13, fontWeight:600, color:'#1d4ed8',
                  display:'flex', alignItems:'center', gap:9, textAlign:'left',
                  borderBottom:'1px solid #f1f5f9', transition:'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background='#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <span style={{ width:22, height:22, borderRadius:6, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}><QRIcon /></span>
                View QR Code
              </button>
            )}

            <button
              onClick={() => { setOpen(false); onDelete(booking); }}
              style={{
                width:'100%', padding:'10px 14px', background:'transparent', border:'none',
                cursor:'pointer', fontSize:13, fontWeight:600, color:'#dc2626',
                display:'flex', alignItems:'center', gap:9, textAlign:'left',
                transition:'background 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ width:22, height:22, borderRadius:6, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center' }}><TrashIcon /></span>
              Delete Record
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('ALL');
  const [search, setSearch]             = useState('');
  const [showQR, setShowQR]             = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [processing, setProcessing]     = useState(null);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try { setLoading(true); const r = await bookingService.getAllBookings(); setBookings(r.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }

  async function handleApprove(b) {
    try {
      setProcessing(b.id + '-a');
      await bookingService.approve(b.id, { adminRemarks: 'Approved by admin' });
      toast.success(`Approved: ${b.resourceName}`);
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Approval failed'); }
    finally { setProcessing(null); }
  }

  async function handleRejectConfirm() {
    if (!rejectRemark.trim()) { toast.error('Please provide a reason'); return; }
    try {
      setProcessing(rejectTarget.id + '-r');
      await bookingService.reject(rejectTarget.id, { adminRemarks: rejectRemark });
      toast.success('Booking rejected');
      setRejectTarget(null); setRejectRemark('');
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Rejection failed'); }
    finally { setProcessing(null); }
  }

  async function handleDelete(b) {
    if (!window.confirm('Permanently delete this booking record?')) return;
    try { await bookingService.delete(b.id); toast.success('Deleted'); loadBookings(); }
    catch { toast.error('Delete failed'); }
  }

  async function handleViewQR(b) {
    try { const r = await bookingService.getQRCode(b.id); setShowQR({ ...b, qrCode: r.data }); }
    catch { toast.error('Failed to load QR'); }
  }

  const counts = {
    total:    bookings.length,
    pending:  bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
  };

  const filtered = bookings
    .filter(b => filter === 'ALL' || b.status === filter)
    .filter(b => !search || b.resourceName?.toLowerCase().includes(search.toLowerCase()) || b.userName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:3, letterSpacing:'-0.3px' }}>Booking Management</h1>
        <p style={{ fontSize:13, color:'#64748b' }}>Review, approve, and reject campus resource booking requests</p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Bookings', value:counts.total,    color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe' },
          { label:'Pending Review', value:counts.pending,  color:'#b45309', bg:'#fefce8', border:'#fde68a' },
          { label:'Approved',       value:counts.approved, color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0' },
          { label:'Rejected',       value:counts.rejected, color:'#991b1b', bg:'#fef2f2', border:'#fecaca' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:s.color, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, opacity:0.75 }}>{s.label}</div>
            <div style={{ fontSize:32, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Pending alert ── */}
      {counts.pending > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 18px', background:'#fefce8', border:'1px solid #fde68a', borderRadius:10, marginBottom:18 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:700, fontSize:13, color:'#92400e' }}>{counts.pending} booking{counts.pending>1?'s':''} awaiting approval</span>
            <span style={{ fontSize:12, color:'#a16207', marginLeft:8 }}>— review them below</span>
          </div>
          <button onClick={() => setFilter('PENDING')}
            style={{ padding:'6px 16px', background:'#92400e', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Review Now
          </button>
        </div>
      )}

      {/* ── Filters + search bar ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {STATUS_FILTERS.map(s => {
            const active = filter === s;
            const n = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px',
                borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                borderColor: active ? '#1d4ed8' : '#e2e8f0',
                background: active ? '#1d4ed8' : '#fff',
                color: active ? '#fff' : '#64748b',
              }}>
                {s === 'ALL' ? 'All' : s}
                <span style={{
                  padding:'1px 6px', borderRadius:10, fontSize:10, fontWeight:700,
                  background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: active ? '#fff' : '#94a3b8'
                }}>{n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}><SearchIcon /></span>
          <input
            placeholder="Search by user or resource..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:'8px 14px 8px 34px', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#0f172a', outline:'none', width:260, background:'#f8fafc', fontFamily:'inherit' }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#1d4ed8', borderRadius:'50%', margin:'0 auto 12px', animation:'spin 0.8s linear infinite' }} />
          <p style={{ fontSize:13, color:'#94a3b8' }}>Loading bookings...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:'#64748b', marginBottom:4 }}>No bookings found</p>
              <p style={{ fontSize:12, color:'#94a3b8' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'2px solid #f1f5f9' }}>
                  {['User','Resource','Date & Time','Purpose','Status',''].map((h,i) => (
                    <th key={i} style={{
                      padding:'12px 16px', fontSize:11, fontWeight:700, color:'#94a3b8',
                      textAlign: i===5 ? 'center' : 'left',
                      textTransform:'uppercase', letterSpacing:'0.7px',
                      width: i===5 ? 60 : 'auto'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => (
                  <tr key={b.id}
                    style={{ borderBottom: idx < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#fafbfc'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                    {/* User */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={b.userName} />
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{b.userName}</div>
                          <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>#{b.id?.slice(-6)?.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>

                    {/* Resource */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{b.resourceName}</div>
                      {b.expectedAttendees && (
                        <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{b.expectedAttendees} attendees</div>
                      )}
                    </td>

                    {/* Date & Time — combined column */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#334155' }}>{b.bookingDate}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:2, fontFamily:'monospace' }}>
                        {b.startTime?.substring(0,5)} – {b.endTime?.substring(0,5)}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle', maxWidth:180 }}>
                      <div style={{ fontSize:12, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.purpose}</div>
                      {b.adminRemarks && (
                        <div style={{ fontSize:11, color:'#94a3b8', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          Note: {b.adminRemarks}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle' }}>
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Actions — single dropdown button */}
                    <td style={{ padding:'14px 16px', verticalAlign:'middle', textAlign:'center' }}>
                      <ActionMenu
                        booking={b}
                        onApprove={handleApprove}
                        onReject={b2 => { setRejectTarget(b2); setRejectRemark(''); }}
                        onQR={handleViewQR}
                        onDelete={handleDelete}
                        processing={processing}
                      />
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
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:18, padding:32, width:460, maxWidth:'95vw', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#fef2f2', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <XIcon />
              </div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#0f172a' }}>Reject Booking</h2>
            </div>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:20, paddingLeft:52 }}>
              <strong style={{ color:'#334155' }}>{rejectTarget.resourceName}</strong> booked by{' '}
              <strong style={{ color:'#334155' }}>{rejectTarget.userName}</strong> on {rejectTarget.bookingDate}
            </p>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                Reason for rejection *
              </label>
              <textarea
                value={rejectRemark} onChange={e => setRejectRemark(e.target.value)}
                placeholder="e.g. Room under scheduled maintenance, Overlapping event already approved..."
                rows={3}
                style={{ width:'100%', padding:'10px 13px', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit', background:'#f8fafc', color:'#0f172a', lineHeight:1.6, boxSizing:'border-box' }}
              />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, borderTop:'1px solid #f1f5f9', paddingTop:18 }}>
              <button onClick={() => setRejectTarget(null)}
                style={{ padding:'10px 22px', background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleRejectConfirm}
                style={{ padding:'10px 24px', background:'#dc2626', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 1px 6px rgba(220,38,38,0.3)' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR MODAL ── */}
      {showQR && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:18, padding:32, width:380, maxWidth:'95vw', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a' }}>Booking QR Code</h2>
              <button onClick={() => setShowQR(null)}
                style={{ width:32, height:32, borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer', fontSize:16, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:14, padding:20, border:'1px solid #e2e8f0', textAlign:'center', marginBottom:20 }}>
              {showQR.qrCode
                ? <img src={`data:image/png;base64,${showQR.qrCode}`} alt="QR" style={{ width:190, height:190, display:'block', margin:'0 auto' }} />
                : <div style={{ width:190, height:190, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:13, margin:'0 auto' }}>Loading...</div>
              }
            </div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:4 }}>{showQR.resourceName}</h3>
              <p style={{ fontSize:12, color:'#64748b' }}>
                {showQR.userName} &nbsp;·&nbsp; {showQR.bookingDate} &nbsp;·&nbsp;
                {showQR.startTime?.substring(0,5)} – {showQR.endTime?.substring(0,5)}
              </p>
            </div>
            <button onClick={() => setShowQR(null)}
              style={{ width:'100%', padding:'11px', background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}