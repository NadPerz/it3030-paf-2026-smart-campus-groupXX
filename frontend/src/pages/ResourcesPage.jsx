import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceService } from '../services/resourceService';
import BookingFormModal from './BookingFormPage';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TYPE_CONFIG = {
  LECTURE_HALL: { label: 'Lecture Hall', icon: '🎓', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  LAB:          { label: 'Lab',          icon: '🔬', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  MEETING_ROOM: { label: 'Meeting Room', icon: '🤝', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  PROJECTOR:    { label: 'Projector',    icon: '📽️', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  CAMERA:       { label: 'Camera',       icon: '📷', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  OTHER:        { label: 'Other',        icon: '📦', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

const FILTER_TABS = [
  { key: '',             label: 'All Types' },
  { key: 'LECTURE_HALL', label: 'Lecture Hall' },
  { key: 'LAB',          label: 'Lab' },
  { key: 'MEETING_ROOM', label: 'Meeting Room' },
  { key: 'OTHER',        label: 'Other' },
];

function ResourceCard({ resource, isAdmin, onEdit, onDelete, onToggleStatus, onBookNow }) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.OTHER;
  const isActive = resource.status === 'ACTIVE';

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ height: '4px', background: cfg.color }} />
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{resource.name}</h3>
              <span style={{ fontSize: '11px', fontWeight: '600', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: '999px', display: 'inline-block', marginTop: '3px' }}>
                {cfg.label}
              </span>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', flexShrink: 0, background: isActive ? '#ECFDF5' : '#FEF2F2', color: isActive ? '#059669' : '#DC2626' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#059669' : '#DC2626', display: 'inline-block' }} />
            {isActive ? 'ACTIVE' : 'OUT OF SERVICE'}
          </span>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {resource.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748B' }}>
              <span style={{ color: '#94A3B8' }}><MapPinIcon /></span>{resource.location}
            </div>
          )}
          {resource.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748B' }}>
              <span style={{ color: '#94A3B8' }}><UsersIcon /></span>Capacity: {resource.capacity} people
            </div>
          )}
          {resource.availabilityStart && resource.availabilityEnd && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748B' }}>
              <span style={{ color: '#94A3B8' }}><CalendarIcon /></span>
              {resource.availabilityStart.substring(0, 5)} – {resource.availabilityEnd.substring(0, 5)}
            </div>
          )}
          {resource.description && (
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0', lineHeight: '1.5', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {resource.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

          {/* Book Now — ONLY for non-admin users */}
          {isActive && !isAdmin && (
            <button
              onClick={() => onBookNow(resource)}
              style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0F172A', color: 'white', border: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
              onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
            >
              <CalendarIcon /> Book Now
            </button>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <>
              <button onClick={() => onEdit(resource)}
                style={{ padding: '9px 12px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
              >
                <EditIcon /> Edit
              </button>
              <button onClick={() => onToggleStatus(resource)}
                style={{ padding: '9px 12px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: isActive ? '#FFFBEB' : '#ECFDF5', color: isActive ? '#D97706' : '#059669', border: `1px solid ${isActive ? '#FDE68A' : '#6EE7B7'}`, transition: 'all 0.15s' }}
              >
                {isActive ? '⏸' : '▶'} {isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => onDelete(resource.id)}
                style={{ padding: '9px 12px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceForm({ existing, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    type: existing?.type || 'LECTURE_HALL',
    capacity: existing?.capacity || '',
    location: existing?.location || '',
    description: existing?.description || '',
    availabilityStart: existing?.availabilityStart?.substring(0, 5) || '',
    availabilityEnd: existing?.availabilityEnd?.substring(0, 5) || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '9px', fontSize: '14px', color: '#0F172A', outline: 'none', fontFamily: 'inherit', background: '#F8FAFC', boxSizing: 'border-box', transition: 'border-color 0.15s' };
  const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.location.trim()) { setError('Location is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, capacity: form.capacity ? parseInt(form.capacity) : null, availabilityStart: form.availabilityStart ? form.availabilityStart + ':00' : null, availabilityEnd: form.availabilityEnd ? form.availabilityEnd + ':00' : null };
      if (existing) { await resourceService.update(existing.id, payload); } else { await resourceService.create(payload); }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource. Check that the backend is running.');
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={lbl}>Resource Name *</label>
        <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lecture Hall A" required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={lbl}>Type *</label>
          <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.icon} {cfg.label}</option>))}
          </select>
        </div>
        <div>
          <label style={lbl}>Capacity</label>
          <input style={inp} type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 120" />
        </div>
      </div>
      <div>
        <label style={lbl}>Location *</label>
        <input style={inp} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Block A, Floor 1" required />
      </div>
      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, resize: 'none', height: '80px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={lbl}>Available From</label>
          <input style={inp} type="time" value={form.availabilityStart} onChange={e => setForm({ ...form, availabilityStart: e.target.value })} />
        </div>
        <div>
          <label style={lbl}>Available Until</label>
          <input style={inp} type="time" value={form.availabilityEnd} onChange={e => setForm({ ...form, availabilityEnd: e.target.value })} />
        </div>
      </div>
      {error && (<div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', color: '#DC2626', fontSize: '13px' }}>⚠️ {error}</div>)}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: saving ? '#93C5FD' : '#0F172A', color: 'white', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving...' : (existing ? 'Save Changes' : 'Add Resource')}
        </button>
      </div>
    </form>
  );
}

function ResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [resources, setResources]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [search, setSearch]                   = useState('');
  const [typeFilter, setTypeFilter]           = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [showForm, setShowForm]               = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingResource, setSelectedBookingResource] = useState(null);

  async function fetchResources() {
    setLoading(true); setError('');
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = Object.keys(params).length > 0 ? await resourceService.search(params) : await resourceService.getAll();
      setResources(res.data);
    } catch { setError('Failed to load resources. Make sure the backend is running on port 8080.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchResources(); }, [typeFilter, statusFilter]);

  const filtered = resources.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
  });

  async function handleToggleStatus(resource) {
    const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try { await resourceService.updateStatus(resource.id, newStatus); fetchResources(); }
    catch { alert('Failed to update status.'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this resource permanently?')) return;
    try { await resourceService.delete(id); fetchResources(); }
    catch { alert('Failed to delete resource.'); }
  }

  const activeCount       = resources.filter(r => r.status === 'ACTIVE').length;
  const outOfServiceCount = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .rp-tab-btn { transition: all 0.15s; }
        .rp-tab-btn:hover { background: #F1F5F9 !important; color: #0F172A !important; }
        .rp-search-input:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.08) !important; background: white !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>🏛️</span>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>Campus Resources</h1>
            </div>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Browse and manage campus facilities and assets</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditingResource(null); setShowForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: '#0F172A', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
              onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
            >
              <PlusIcon /> Add Resource
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Resources', value: resources.length, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
            { label: 'Active',          value: activeCount,       color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
            { label: 'Out of Service',  value: outOfServiceCount, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: s.color, fontWeight: '600', marginTop: '4px', opacity: 0.75 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}><SearchIcon /></span>
          <input className="rp-search-input" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', color: '#0F172A', outline: 'none', background: '#F8FAFC', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {FILTER_TABS.map(tab => {
            const active = typeFilter === tab.key;
            return (
              <button key={tab.key} className="rp-tab-btn" onClick={() => setTypeFilter(tab.key)}
                style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', borderColor: active ? '#0F172A' : '#E2E8F0', background: active ? '#0F172A' : 'white', color: active ? 'white' : '#64748B', fontFamily: 'inherit' }}>
                {tab.label}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {[{ key: '', label: 'All Status' }, { key: 'ACTIVE', label: '● Active' }, { key: 'OUT_OF_SERVICE', label: '● Out of Service' }].map(s => {
              const active = statusFilter === s.key;
              const dotColor = s.key === 'ACTIVE' ? '#059669' : s.key === 'OUT_OF_SERVICE' ? '#DC2626' : null;
              return (
                <button key={s.key} className="rp-tab-btn" onClick={() => setStatusFilter(s.key)}
                  style={{ padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', borderColor: active ? (dotColor || '#64748B') : '#E2E8F0', background: active ? (dotColor ? `${dotColor}15` : '#F1F5F9') : 'white', color: active ? (dotColor || '#64748B') : '#94A3B8', fontFamily: 'inherit' }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {!loading && (<p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>Showing {filtered.length} resource{filtered.length !== 1 ? 's' : ''}{typeFilter && ` · ${TYPE_CONFIG[typeFilter]?.label}`}{statusFilter && ` · ${statusFilter === 'ACTIVE' ? 'Active' : 'Out of Service'}`}</p>)}

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>Loading resources...</p>
          </div>
        )}

        {error && (<div style={{ padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', fontSize: '14px', marginBottom: '20px' }}>❌ {error}</div>)}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>{search ? `No results for "${search}"` : 'No resources found'}</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>{isAdmin ? 'Click "Add Resource" to create your first resource.' : 'Check back later.'}</p>
            {(search || typeFilter || statusFilter) && (
              <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }} style={{ marginTop: '16px', padding: '9px 20px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Clear filters</button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {filtered.map(resource => (
              <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin}
                onEdit={r => { setEditingResource(r); setShowForm(true); }}
                onDelete={handleDelete} onToggleStatus={handleToggleStatus}
                onBookNow={(r) => { setSelectedBookingResource(r); setBookingModalOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingFormModal 
        isOpen={bookingModalOpen}
        resourceId={selectedBookingResource?.id}
        resourceName={selectedBookingResource?.name}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => { fetchResources(); setBookingModalOpen(false); }}
      />
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>{editingResource ? 'Update the resource details below.' : 'Fill in the details to add a campus resource.'}</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditingResource(null); }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><XIcon /></button>
            </div>
            <ResourceForm existing={editingResource} onSuccess={() => { setShowForm(false); setEditingResource(null); fetchResources(); }} onCancel={() => { setShowForm(false); setEditingResource(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcesPage;