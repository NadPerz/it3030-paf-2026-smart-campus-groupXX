import React, { useEffect, useState } from 'react';

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

/**
 * ResourceAvailabilityHeatmap
 * Displays a visual calendar grid showing available and booked time slots for a resource
 * 
 * Props:
 *   - resourceId: String - The ID of the resource
 *   - getResourceBookings: Function - Function to fetch bookings for the resource
 *   - daysToShow: Number - Number of days to display (default: 7)
 */
function ResourceAvailabilityHeatmap({ resourceId, getResourceBookings, daysToShow = 7 }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [error, setError] = useState('');

  // Hour ranges (8 AM to 6 PM)
  const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
  const DAYS_SHOWN = daysToShow;

  useEffect(() => {
    fetchBookings();
  }, [resourceId]);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError('');
      const response = await getResourceBookings(resourceId);
      // Handle both direct array response and axios response with .data property
      const data = Array.isArray(response) ? response : (response?.data || []);
      console.log('Bookings loaded:', data);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load availability';
      setError(errorMsg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate() {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  function hasBooking(day, hour) {
    const currentDate = new Date(getStartDate());
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = getDateString(currentDate);

    return bookings.filter(b => {
      if (!b.bookingDate || b.status === 'REJECTED' || b.status === 'CANCELLED') return false;

      const bookingDateStr = b.bookingDate;
      if (bookingDateStr !== dateStr) return false;

      const startHour = parseInt(b.startTime?.substring(0, 2) || '0');
      const endHour = parseInt(b.endTime?.substring(0, 2) || '23');

      return hour >= startHour && hour < endHour;
    });
  }

  function getSlotBookings(day, hour) {
    const currentDate = new Date(getStartDate());
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = getDateString(currentDate);

    return bookings.filter(b => {
      if (!b.bookingDate || b.status === 'REJECTED' || b.status === 'CANCELLED') return false;

      const bookingDateStr = b.bookingDate;
      if (bookingDateStr !== dateStr) return false;

      const startHour = parseInt(b.startTime?.substring(0, 2) || '0');
      const endHour = parseInt(b.endTime?.substring(0, 2) || '23');

      return hour >= startHour && hour < endHour;
    });
  }

  function formatTime(hour) {
    return `${hour}:00`;
  }

  function formatDate(day) {
    const d = new Date(getStartDate());
    d.setDate(d.getDate() + day);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${daysOfWeek[d.getDay()]} ${d.getDate()}`;
  }

  function changeDate(direction) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: '13px', fontWeight: '500' }}>Loading availability...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <InfoIcon /> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Header with date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Availability View</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
          <button
            onClick={() => changeDate(-DAYS_SHOWN)}
            style={{
              background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '13px', fontFamily: 'inherit', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChevronLeftIcon /> Prev
          </button>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155', minWidth: '140px', textAlign: 'center', padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}>
            {formatDate(0)} — {formatDate(DAYS_SHOWN - 1)}
          </span>
          <button
            onClick={() => changeDate(DAYS_SHOWN)}
            style={{
              background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '13px', fontFamily: 'inherit', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Next <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: 'auto', overflowY: 'hidden', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#64748B', textAlign: 'left', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', minWidth: '60px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</th>
              {Array.from({ length: DAYS_SHOWN }).map((_, day) => (
                <th
                  key={day}
                  style={{
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#64748B',
                    textAlign: 'center',
                    background: '#F1F5F9',
                    borderBottom: '1px solid #E2E8F0',
                    minWidth: '80px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatDate(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#475569', background: '#F8FAFC' }}>
                  {formatTime(hour)}
                </td>
                {Array.from({ length: DAYS_SHOWN }).map((_, day) => {
                  const slotBookings = getSlotBookings(day, hour);
                  const isBooked = slotBookings.length > 0;
                  const slotKey = `${day}-${hour}`;

                  // Determine color based on booking status
                  let bgColor = '#ECFDF5'; // Available - Green
                  let borderColor = '#6EE7B7';
                  let hoverBgColor = '#D1FAE5';

                  if (isBooked) {
                    const booking = slotBookings[0];
                    if (booking.status === 'PENDING') {
                      bgColor = '#FEF3C7'; // Amber - Pending
                      borderColor = '#FCD34D';
                      hoverBgColor = '#FEE08C';
                    } else if (booking.status === 'APPROVED') {
                      bgColor = '#FEE2E2'; // Red - Booked
                      borderColor = '#FECACA';
                      hoverBgColor = '#FCA5A5';
                    } else if (booking.status === 'COMPLETED') {
                      bgColor = '#E0E7FF'; // Indigo - Completed
                      borderColor = '#C7D2FE';
                      hoverBgColor = '#A5B4FC';
                    }
                  }

                  return (
                    <td
                      key={slotKey}
                      style={{
                        padding: '6px',
                        textAlign: 'center',
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        cursor: isBooked ? 'pointer' : 'default',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: isBooked ? '#475569' : '#059669',
                        position: 'relative',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        setHoveredSlot(slotKey);
                        e.currentTarget.style.background = hoverBgColor;
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.1)';
                      }}
                      onMouseLeave={e => {
                        setHoveredSlot(null);
                        e.currentTarget.style.background = bgColor;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isBooked ? '📌' : '✓'}
                      {/* Tooltip for booked slots */}
                      {hoveredSlot === slotKey && isBooked && (
                        <div style={{
                          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                          background: '#1E293B', color: 'white', padding: '8px 10px', borderRadius: '6px',
                          fontSize: '11px', whiteSpace: 'nowrap', zIndex: 1000, marginBottom: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', pointerEvents: 'none'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>{slotBookings[0].resourceName}</div>
                          <div style={{ color: '#B4E0FF', fontSize: '10px' }}>{slotBookings[0].status}</div>
                          <div style={{ fontSize: '10px', marginTop: '3px', color: '#E2E8F0' }}>
                            by {slotBookings[0].userName}
                          </div>
                          {/* Tooltip arrow */}
                          <div style={{
                            position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)',
                            width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                            borderTop: '4px solid #1E293B'
                          }} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#ECFDF5', border: '1px solid #6EE7B7' }} />
          <span style={{ fontWeight: '500' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FEE2E2', border: '1px solid #FECACA' }} />
          <span style={{ fontWeight: '500' }}>Booked (Approved)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FEF3C7', border: '1px solid #FCD34D' }} />
          <span style={{ fontWeight: '500' }}>Pending</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#E0E7FF', border: '1px solid #C7D2FE' }} />
          <span style={{ fontWeight: '500' }}>Completed</span>
        </div>
      </div>
    </div>
  );
}

export default ResourceAvailabilityHeatmap;
