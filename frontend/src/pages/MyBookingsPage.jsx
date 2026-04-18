import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';
import { resourceService } from '../services/resourceService';

// ─── sidebar icons ────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconOverview = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconEdit = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconBooking = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconTicket = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/>
    <path d="M6 10V6a6 6 0 0 1 12 0v4"/>
  </svg>
);

// ─── content icons ────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9h18"/>
  </svg>
);
const QRIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── NAV ITEMS — Dashboard is first, correct paths for all profile routes ──────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',        Icon: IconDashboard, path: '/profile' },
  { id: 'overview',  label: 'Profile Overview',  Icon: IconOverview,  path: '/profile/overview' },
  { id: 'edit',      label: 'Edit Profile',      Icon: IconEdit,      path: '/profile/edit' },
  { id: 'bookings',  label: 'My Bookings',        Icon: IconBooking,   path: '/bookings' },
  { id: 'tickets',   label: 'My Tickets',         Icon: IconTicket,    path: '/tickets' },
];

function StatusBadge({ status }) {
  const cfg = {
    APPROVED:  { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
    PENDING:   { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
    REJECTED:  { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
    CANCELLED: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  };
  const s = cfg[status] || cfg.CANCELLED;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 11px', borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, letterSpacing:'0.3px' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function MyBookingsPage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [bookings,   setBookings]   = useState([]);
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('ALL');
  const [showModal,  setShowModal]  = useState(false);
  const [showQR,     setShowQR]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    resourceId:'', bookingDate:'', startTime:'', endTime:'', purpose:'', expectedAttendees:'',
  });

  useEffect(() => { loadBookings(); loadResources(); }, []);

  async function loadBookings() {
    try { setLoading(true); const r = await bookingService.getMyBookings(); setBookings(r.data); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }
  async function loadResources() {
    try { const r = await resourceService.getAll(); setResources(r.data.filter(x => x.status === 'ACTIVE')); } catch {}
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.resourceId)                 { toast.error('Please select a resource'); return; }
    if (!form.bookingDate)                { toast.error('Please select a date'); return; }
    if (!form.startTime || !form.endTime) { toast.error('Please select start and end times'); return; }
    if (form.startTime >= form.endTime)   { toast.error('Start time must be before end time'); return; }
    if (!form.purpose.trim())             { toast.error('Please enter a purpose'); return; }
    try {
      setSubmitting(true);
      await bookingService.create({
        resourceId: form.resourceId, bookingDate: form.bookingDate,
        startTime: form.startTime + ':00', endTime: form.endTime + ':00',
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      });
      toast.success('Booking submitted — awaiting admin approval');
      setShowModal(false);
      setForm({ resourceId:'', bookingDate:'', startTime:'', endTime:'', purpose:'', expectedAttendees:'' });
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create booking'); }
    finally { setSubmitting(false); }
  }
  async function handleCancel(b) {
    if (!window.confirm(`Cancel booking for ${b.resourceName}?`)) return;
    try { await bookingService.cancel(b.id); toast.success('Booking cancelled'); loadBookings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  }
  async function handleViewQR(b) {
    try { const r = await bookingService.getQRCode(b.id); setShowQR({ ...b, qrCode: r.data }); }
    catch { toast.error('Failed to load QR code'); }
  }
  function downloadQR(qrBase64, id) {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${qrBase64}`;
    a.download = `booking-qr-${id}.png`;
    a.click();
  }

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const today    = new Date().toISOString().split('T')[0];
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#1e293b', outline:'none', fontFamily:'inherit', background:'#f8fafc' };
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' };

  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();
  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  }

  return (
    <>
      <style>{`html,body{overflow:hidden!important;height:100%;margin:0;padding:0;}`}</style>

      <div style={{ fontFamily:'Inter,system-ui,sans-serif', background:'#F1F5F9', height:'calc(100vh - 65px)', overflow:'hidden', display:'flex', flexDirection:'column', padding:'32px 0', boxSizing:'border-box' }}>
        <div style={{ maxWidth:1200, width:'100%', margin:'0 auto', padding:'0 24px', flex:1, minHeight:0, display:'flex', gap:24, alignItems:'stretch', boxSizing:'border-box' }}>

          {/* ════ SIDEBAR ════ */}
          <aside style={{ width:230, flexShrink:0, background:'#fff', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', display:'flex', flexDirection:'column' }}>
            <div style={{ background:'linear-gradient(160deg,#0F172A 0%,#1E3A5F 100%)', borderRadius:'16px 16px 0 0', display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'32px 20px', flexShrink:0 }}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="avatar" style={{ width:68,height:68,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,255,255,0.2)' }} />
                : <div style={{ width:68,height:68,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'3px solid rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'bold',fontSize:26 }}>{initial}</div>
              }
              <div style={{ textAlign:'center' }}>
                <div style={{ color:'#fff',fontWeight:600,fontSize:15,lineHeight:1.3 }}>{user?.name||'—'}</div>
                <div style={{ color:'rgba(255,255,255,0.45)',fontSize:11.5,marginTop:2,maxWidth:170,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.email}</div>
              </div>
              <span style={{ background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',fontSize:11,fontWeight:600,borderRadius:20,padding:'2px 12px' }}>{user?.role||'USER'}</span>
            </div>

            <div style={{ height:1,background:'#F1F5F9',flexShrink:0 }} />

            <nav style={{ display:'flex',flexDirection:'column',padding:'8px 0',flex:1 }}>
              {NAV_ITEMS.map((item) => {
                // My Bookings is the current active page
                const active = item.id === 'bookings';
                return (
                  <button key={item.id} onClick={() => navigate(item.path)} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 20px',fontSize:13.5,fontWeight:500,width:'100%',textAlign:'left',border:'none',cursor:'pointer',background:active?'#EFF6FF':'transparent',color:active?'#1D4ED8':'#4B5563',borderLeft:active?'3px solid #1D4ED8':'3px solid transparent',transition:'all 0.15s' }}>
                    <span style={{ color:active?'#1D4ED8':'#9CA3AF' }}><item.Icon /></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div style={{ borderTop:'1px solid #F1F5F9',padding:'16px 20px',flexShrink:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:8,height:8,borderRadius:'50%',flexShrink:0,background:user?.status==='ACTIVE'?'#22C55E':'#F59E0B',display:'inline-block' }} />
                <span style={{ fontSize:12,fontWeight:500,color:'#6B7280' }}>{user?.status||'ACTIVE'}</span>
              </div>
              <div style={{ fontSize:11,color:'#9CA3AF',marginTop:2 }}>Member since {formatDate(user?.createdAt)}</div>
            </div>
          </aside>

          {/* ════ MAIN ════ */}
          <main style={{ flex:1,minWidth:0,minHeight:0,display:'flex',flexDirection:'column' }}>
            <div style={{ flex:1,minHeight:0,background:'#fff',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',padding:'28px',display:'flex',flexDirection:'column',boxSizing:'border-box',overflow:'hidden' }}>

              <div style={{ flexShrink:0,marginBottom:28 }}>
                <h1 style={{ fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:4,letterSpacing:'-0.3px' }}>My Bookings</h1>
                <p style={{ fontSize:13,color:'#64748b' }}>View and manage your campus resource booking requests</p>
              </div>

              <div style={{ flexShrink:0,display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' }}>
                {STATUS_FILTERS.map(s => {
                  const active  = filter === s;
                  const counts  = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length;
                  return (
                    <button key={s} onClick={() => setFilter(s)} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',border:'1px solid',borderColor:active?'#1d4ed8':'#e2e8f0',background:active?'#1d4ed8':'#fff',color:active?'#fff':'#64748b' }}>
                      {s === 'ALL' ? 'All' : s}
                      <span style={{ padding:'1px 6px',borderRadius:10,fontSize:10,fontWeight:700,background:active?'rgba(255,255,255,0.25)':'#f1f5f9',color:active?'#fff':'#94a3b8' }}>{counts}</span>
                    </button>
                  );
                })}
              </div>

              {/* scrollable cards list */}
              <div style={{ flex:1,minHeight:0,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#CBD5E1 transparent',paddingRight:4 }}>
                {loading && (
                  <div style={{ textAlign:'center',padding:'80px 0' }}>
                    <div style={{ width:36,height:36,border:'3px solid #e2e8f0',borderTopColor:'#1d4ed8',borderRadius:'50%',margin:'0 auto 14px',animation:'spin 0.8s linear infinite' }} />
                    <p style={{ fontSize:13,color:'#94a3b8' }}>Loading your bookings...</p>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}

                {!loading && filtered.length === 0 && (
                  <div style={{ background:'#f8fafc',borderRadius:14,border:'1px solid #e2e8f0',padding:'70px 20px',textAlign:'center' }}>
                    <div style={{ width:56,height:56,borderRadius:14,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <h3 style={{ fontSize:16,fontWeight:700,color:'#334155',marginBottom:6 }}>
                      {filter === 'ALL' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}
                    </h3>
                    <p style={{ fontSize:13,color:'#94a3b8',marginBottom:20 }}>
                      {filter === 'ALL' ? 'Submit a booking request to reserve a campus resource' : 'Try switching to a different filter'}
                    </p>
                    {filter === 'ALL' && (
                      <button onClick={() => setShowModal(true)} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 20px',background:'#1d4ed8',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer' }}>
                        <PlusIcon /> Make your first booking
                      </button>
                    )}
                  </div>
                )}

                {!loading && filtered.map(b => (
                  <div key={b.id}
                    style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'20px 22px',marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,0.04)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',transition:'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}
                  >
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                        <div style={{ width:34,height:34,borderRadius:9,background:'#eff6ff',border:'1px solid #bfdbfe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><BuildingIcon /></div>
                        <div>
                          <div style={{ fontSize:15,fontWeight:700,color:'#0f172a' }}>{b.resourceName}</div>
                          <div style={{ fontSize:11,color:'#94a3b8',marginTop:1 }}>Booking #{b.id?.slice(-6)?.toUpperCase()}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex',gap:16,flexWrap:'wrap',marginBottom:8,paddingLeft:42 }}>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#64748b' }}><CalendarIcon />{b.bookingDate}</span>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#64748b' }}><ClockIcon />{b.startTime?.substring(0,5)} – {b.endTime?.substring(0,5)}</span>
                        {b.expectedAttendees && <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#64748b' }}><UsersIcon />{b.expectedAttendees} attendees</span>}
                      </div>
                      <div style={{ fontSize:12,color:'#94a3b8',paddingLeft:42 }}>{b.purpose}</div>
                      {b.adminRemarks && (
                        <div style={{ marginTop:8,paddingLeft:42 }}>
                          <span style={{ fontSize:11,color:'#475569',background:'#f8fafc',border:'1px solid #e2e8f0',padding:'3px 10px',borderRadius:6,display:'inline-block' }}>Note: {b.adminRemarks}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10,marginLeft:20,flexShrink:0 }}>
                      <StatusBadge status={b.status} />
                      <div style={{ display:'flex',gap:7 }}>
                        {b.status === 'APPROVED' && (
                          <button onClick={() => handleViewQR(b)} style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',transition:'all 0.15s' }}>
                            <QRIcon /> View QR
                          </button>
                        )}
                        {['PENDING','APPROVED'].includes(b.status) && (
                          <button onClick={() => handleCancel(b)} style={{ padding:'6px 12px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',background:'#f8fafc',color:'#64748b',border:'1px solid #e2e8f0',transition:'all 0.15s' }}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff',borderRadius:16,padding:32,width:500,maxWidth:'95vw',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:2 }}>New Booking Request</h2>
                <p style={{ fontSize:12,color:'#94a3b8' }}>Fill in the details to reserve a campus resource</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width:32,height:32,borderRadius:'50%',background:'#f1f5f9',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',fontSize:16 }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:16 }}><label style={lbl}>Resource *</label>
                <select value={form.resourceId} onChange={e => setForm({...form,resourceId:e.target.value})} style={inp}>
                  <option value="">Select a campus resource...</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name} — {r.location} (cap. {r.capacity})</option>)}
                </select>
              </div>
              <div style={{ marginBottom:16 }}><label style={lbl}>Booking Date *</label>
                <input type="date" min={today} value={form.bookingDate} onChange={e => setForm({...form,bookingDate:e.target.value})} style={inp} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16 }}>
                <div><label style={lbl}>Start Time *</label><input type="time" value={form.startTime} onChange={e => setForm({...form,startTime:e.target.value})} style={inp} /></div>
                <div><label style={lbl}>End Time *</label><input type="time" value={form.endTime} onChange={e => setForm({...form,endTime:e.target.value})} style={inp} /></div>
              </div>
              <div style={{ marginBottom:16 }}><label style={lbl}>Purpose *</label>
                <textarea value={form.purpose} onChange={e => setForm({...form,purpose:e.target.value})} placeholder="e.g. CS3001 Study Group, Project Meeting..." rows={2} style={{ ...inp,resize:'none' }} />
              </div>
              <div style={{ marginBottom:24 }}><label style={lbl}>Expected Attendees</label>
                <input type="number" min="1" value={form.expectedAttendees} onChange={e => setForm({...form,expectedAttendees:e.target.value})} placeholder="e.g. 15" style={{ ...inp,width:130 }} />
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',gap:10,paddingTop:4,borderTop:'1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding:'10px 20px',background:'#f8fafc',color:'#475569',border:'1px solid #e2e8f0',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding:'10px 22px',background:submitting?'#93c5fd':'#1d4ed8',color:'#fff',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:submitting?'not-allowed':'pointer' }}>
                  {submitting?'Submitting...':'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff',borderRadius:16,padding:32,width:360,maxWidth:'95vw',boxShadow:'0 24px 60px rgba(0,0,0,0.18)',textAlign:'center' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
              <h2 style={{ fontSize:18,fontWeight:800,color:'#0f172a' }}>Check-in QR Code</h2>
              <button onClick={() => setShowQR(null)} style={{ width:32,height:32,borderRadius:'50%',background:'#f1f5f9',border:'none',cursor:'pointer',fontSize:16,color:'#64748b' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc',borderRadius:14,padding:16,border:'1px solid #e2e8f0',marginBottom:18,display:'inline-block' }}>
              {showQR.qrCode
                ? <img src={`data:image/png;base64,${showQR.qrCode}`} alt="QR" style={{ width:180,height:180,display:'block' }} />
                : <div style={{ width:180,height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:13 }}>Loading...</div>
              }
            </div>
            <h3 style={{ fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:4 }}>{showQR.resourceName}</h3>
            <p style={{ fontSize:12,color:'#64748b',marginBottom:4 }}>{showQR.bookingDate} &nbsp;·&nbsp; {showQR.startTime?.substring(0,5)} – {showQR.endTime?.substring(0,5)}</p>
            <p style={{ fontSize:11,color:'#94a3b8',fontFamily:'monospace',marginBottom:16 }}>ID: {showQR.id?.slice(-10)?.toUpperCase()}</p>
            <div style={{ padding:'8px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,fontSize:12,color:'#15803d',marginBottom:20,display:'inline-flex',alignItems:'center',gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Booking approved — show at entrance
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
              {showQR.qrCode && (
                <button onClick={() => downloadQR(showQR.qrCode,showQR.id)} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:'#1d4ed8',color:'#fff',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer' }}>
                  <DownloadIcon /> Download
                </button>
              )}
              <button onClick={() => setShowQR(null)} style={{ padding:'9px 18px',background:'#f8fafc',color:'#475569',border:'1px solid #e2e8f0',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}