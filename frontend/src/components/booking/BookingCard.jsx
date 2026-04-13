import React from 'react';

// ── Icons ──────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    <path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/>
  </svg>
);

// ── Status badge ────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = {
    APPROVED:  { bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
    PENDING:   { bg:'#fef9c3', color:'#854d0e', dot:'#ca8a04' },
    REJECTED:  { bg:'#fee2e2', color:'#991b1b', dot:'#dc2626' },
    CANCELLED: { bg:'#f1f5f9', color:'#475569', dot:'#94a3b8' },
  };
  const s = cfg[status] || cfg.CANCELLED;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, letterSpacing:'0.3px' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

/**
 * BookingCard — reusable card component for displaying a single booking.
 *
 * Props:
 *   booking     — booking object from API
 *   onCancel    — callback(booking) when cancel clicked
 *   onViewQR    — callback(booking) when View QR clicked
 *   showUser    — bool, show userName (for admin views)
 */
export default function BookingCard({ booking: b, onCancel, onViewQR, showUser = false }) {
  if (!b) return null;

  return (
    <div
      style={{
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:12,
        padding:'18px 20px', marginBottom:12,
        boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        transition:'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}
    >
      {/* Left side */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'#eff6ff', border:'1px solid #bfdbfe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <BuildingIcon />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>{b.resourceName}</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>
              #{b.id?.slice(-6)?.toUpperCase()}
              {showUser && b.userName && ` · ${b.userName}`}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:16, flexWrap:'wrap', paddingLeft:42, marginBottom:6 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:'#64748b' }}>
            <CalendarIcon />{b.bookingDate}
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:'#64748b' }}>
            <ClockIcon />{b.startTime?.substring(0,5)} – {b.endTime?.substring(0,5)}
          </span>
          {b.expectedAttendees && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:'#64748b' }}>
              <UsersIcon />{b.expectedAttendees} attendees
            </span>
          )}
        </div>

        <div style={{ fontSize:12, color:'#94a3b8', paddingLeft:42 }}>{b.purpose}</div>

        {b.adminRemarks && (
          <div style={{ marginTop:8, paddingLeft:42 }}>
            <span style={{ fontSize:11, color:'#475569', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'3px 10px', borderRadius:6, display:'inline-block' }}>
              Note: {b.adminRemarks}
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, marginLeft:18, flexShrink:0 }}>
        <StatusBadge status={b.status} />
        <div style={{ display:'flex', gap:7 }}>
          {b.status === 'APPROVED' && onViewQR && (
            <button onClick={() => onViewQR(b)}
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#dbeafe'}
              onMouseLeave={e => e.currentTarget.style.background='#eff6ff'}
            >
              <QRIcon /> View QR
            </button>
          )}
          {['PENDING','APPROVED'].includes(b.status) && onCancel && (
            <button onClick={() => onCancel(b)}
              style={{ padding:'6px 12px', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', background:'#f8fafc', color:'#64748b', border:'1px solid #e2e8f0', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background='#f8fafc'}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}