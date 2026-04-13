import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';

// ── Icons ──────────────────────────────────────────────────────────────
const CheckCircle = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const XCircle = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 22V12h6v10"/><path d="M3 9h18"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function QRCheckInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const [state, setState] = useState('loading'); // loading | success | error | already
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setState('error');
      setErrorMsg('No booking ID found in this QR code. Please scan a valid booking QR.');
      return;
    }
    fetchAndCheckIn();
  }, [bookingId]);

  async function fetchAndCheckIn() {
    try {
      setState('loading');
      // First fetch the booking to show details
      const res = await bookingService.getById(bookingId);
      const b = res.data;
      setBooking(b);

      if (b.status !== 'APPROVED') {
        setState('error');
        setErrorMsg(`This booking cannot be checked in. Current status: ${b.status}`);
        return;
      }

      // Perform check-in
      const token = `http://localhost:3000/check-in?bookingId=${bookingId}`;
      await bookingService.checkIn(token);
      setState('success');

    } catch (err) {
      setState('error');
      const msg = err.response?.data?.message || 'Failed to process check-in. Please try again.';
      setErrorMsg(msg);
    }
  }

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
      <span style={{ color:'#94a3b8', flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:12, color:'#64748b', width:100, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4fa', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h4"/><path d="M17 21v-4"/></svg>
            <span style={{ fontSize:13, fontWeight:700, color:'#1d4ed8' }}>Smart Campus QR Check-in</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', overflow:'hidden' }}>

          {/* Loading */}
          {state === 'loading' && (
            <div style={{ padding:'60px 32px', textAlign:'center' }}>
              <div style={{ width:48, height:48, border:'4px solid #e2e8f0', borderTopColor:'#1d4ed8', borderRadius:'50%', margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }} />
              <div style={{ fontSize:16, fontWeight:700, color:'#0f172a', marginBottom:6 }}>Verifying booking...</div>
              <div style={{ fontSize:13, color:'#94a3b8' }}>Please wait while we process your check-in</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Success */}
          {state === 'success' && booking && (
            <>
              <div style={{ background:'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding:'32px 32px 24px', textAlign:'center', borderBottom:'1px solid #bbf7d0' }}>
                <div style={{ marginBottom:14 }}><CheckCircle /></div>
                <div style={{ fontSize:22, fontWeight:900, color:'#15803d', marginBottom:4 }}>Check-in Successful!</div>
                <div style={{ fontSize:14, color:'#16a34a' }}>Welcome — your booking is confirmed</div>
              </div>
              <div style={{ padding:'24px 28px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:14 }}>Booking Details</div>
                <InfoRow icon={<BuildingIcon />} label="Resource" value={booking.resourceName} />
                <InfoRow icon={<CalendarIcon />} label="Date" value={booking.bookingDate} />
                <InfoRow icon={<ClockIcon />} label="Time" value={`${booking.startTime?.substring(0,5)} – ${booking.endTime?.substring(0,5)}`} />
                <InfoRow icon={<UserIcon />} label="Booked by" value={booking.userName} />
                {booking.expectedAttendees && <InfoRow icon={<UsersIcon />} label="Attendees" value={`${booking.expectedAttendees} people`} />}
                <div style={{ marginTop:6, paddingTop:6 }}>
                  <InfoRow icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Purpose" value={booking.purpose} />
                </div>
                <div style={{ marginTop:20, padding:'12px 16px', background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0', fontSize:12, color:'#15803d', textAlign:'center', fontWeight:600 }}>
                  Entry granted — enjoy your session!
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div style={{ background:'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)', padding:'32px 32px 24px', textAlign:'center', borderBottom:'1px solid #fecaca' }}>
                <div style={{ marginBottom:14 }}><XCircle /></div>
                <div style={{ fontSize:22, fontWeight:900, color:'#991b1b', marginBottom:4 }}>Check-in Failed</div>
                <div style={{ fontSize:14, color:'#dc2626' }}>Unable to process this booking</div>
              </div>
              <div style={{ padding:'28px' }}>
                <div style={{ padding:'14px 16px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:13, color:'#991b1b', marginBottom:20, lineHeight:1.6 }}>
                  {errorMsg || 'This QR code is invalid or the booking is not approved.'}
                </div>
                {booking && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:12 }}>Booking Info</div>
                    <InfoRow icon={<BuildingIcon />} label="Resource" value={booking.resourceName} />
                    <InfoRow icon={<CalendarIcon />} label="Date" value={booking.bookingDate} />
                    <div style={{ marginTop:10 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background:'#fef9c3', color:'#854d0e' }}>
                        Status: {booking.status}
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center', lineHeight:1.7 }}>
                  Contact the campus admin if you believe this is an error.
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ padding:'16px 28px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#94a3b8' }}>Smart Campus Hub · IT3030 PAF 2026</span>
            <button onClick={() => navigate('/')}
              style={{ fontSize:12, color:'#1d4ed8', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Go to Home →
            </button>
          </div>
        </div>

        {/* Booking ID for reference */}
        {bookingId && (
          <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'#94a3b8', fontFamily:'monospace' }}>
            Booking ID: {bookingId?.slice(-12)?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}