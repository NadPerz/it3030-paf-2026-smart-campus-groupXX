import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingService } from '../services/bookingService';
import { resourceService } from '../services/resourceService';

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/**
 * BookingFormModal — A modal component for creating bookings
 * Used as an overlay on ResourcesPage
 */
export default function BookingFormModal({ isOpen, resourceId, resourceName, onClose, onSuccess }) {
  const [resources, setResources] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    resourceId: resourceId || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadResources();
      setForm(prev => ({ ...prev, resourceId: resourceId || '' }));
    }
  }, [isOpen, resourceId]);

  async function loadResources() {
    try {
      const r = await resourceService.getAll();
      setResources(r.data.filter(x => x.status === 'ACTIVE'));
    } catch (err) {
      toast.error('Failed to load resources');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.resourceId) { toast.error('Please select a resource'); return; }
    if (!form.bookingDate) { toast.error('Please select a date'); return; }
    if (!form.startTime || !form.endTime) { toast.error('Please select start and end times'); return; }
    if (form.startTime >= form.endTime) { toast.error('Start time must be before end time'); return; }
    if (!form.purpose.trim()) { toast.error('Please enter a purpose'); return; }

    try {
      setSubmitting(true);
      await bookingService.create({
        resourceId: form.resourceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime + ':00',
        endTime: form.endTime + ':00',
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      });
      toast.success('Booking submitted — awaiting admin approval');
      handleClose();
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm({ resourceId: resourceId || '', bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' });
    onClose();
  }

  if (!isOpen) return null;

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#1e293b', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', transition: 'border-color 0.15s' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Glassy transparent backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-in-out'
        }}
      />

      {/* Modal container */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', padding: 32, fontFamily: 'Inter, system-ui, sans-serif' }}>
          
          {/* Header with close button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Create Booking</h1>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                transition: 'color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <XIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Resource Selection */}
            <div>
              <label style={lbl}>Resource</label>
              <select
                value={form.resourceId}
                onChange={e => setForm({ ...form, resourceId: e.target.value })}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">Select a resource</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Date */}
            <div>
              <label style={lbl}>Booking Date</label>
              <input
                type="date"
                min={today}
                value={form.bookingDate}
                onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                style={inp}
              />
            </div>

            {/* Time inputs in row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  style={inp}
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label style={lbl}>Purpose</label>
              <textarea
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                placeholder="Why do you need this resource?"
                style={{ ...inp, fontFamily: 'inherit', minHeight: 70, resize: 'vertical', padding: '9px 12px' }}
              />
            </div>

            {/* Expected Attendees */}
            <div>
              <label style={lbl}>Expected Attendees (optional)</label>
              <input
                type="number"
                min="1"
                value={form.expectedAttendees}
                onChange={e => setForm({ ...form, expectedAttendees: e.target.value })}
                placeholder="Number of people"
                style={inp}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  background: submitting ? '#cbd5e1' : '#0f172a',
                  color: 'white',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => !submitting && (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={e => !submitting && (e.currentTarget.style.background = '#0f172a')}
              >
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}

