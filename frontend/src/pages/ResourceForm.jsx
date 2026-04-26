cat > /home/claude/it3030-paf-2026-smart-campus-groupXX/frontend/src/components/resource/ResourceCard.jsx << 'EOF'
import React from 'react';

/**
 * ResourceCard — Member 1 (Sarada) responsibility.
 * Displays a single resource's details in a card layout.
 * Receives the resource object and admin action callbacks as props.
 */

// Maps resource type enum to a readable label + icon
const TYPE_LABELS = {
  LECTURE_HALL: { label: 'Lecture Hall', icon: '🎓' },
  LAB: { label: 'Lab', icon: '🔬' },
  MEETING_ROOM: { label: 'Meeting Room', icon: '🤝' },
  PROJECTOR: { label: 'Projector', icon: '📽️' },
  CAMERA: { label: 'Camera', icon: '📷' },
  OTHER: { label: 'Other', icon: '📦' },
};

function ResourceCard({ resource, isAdmin, onEdit, onDelete, onToggleStatus }) {
  const typeInfo = TYPE_LABELS[resource.type] || { label: resource.type, icon: '📦' };
  const isActive = resource.status === 'ACTIVE';

  function formatTime(time) {
    if (!time) return null;
    // time comes as "HH:MM:SS" from Java LocalTime
    const parts = time.split(':');
    const h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: `1px solid ${isActive ? '#e2e8f0' : '#fed7d7'}`,
      transition: 'box-shadow 0.2s',
      opacity: isActive ? 1 : 0.85,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
    }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>{typeInfo.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a202c' }}>{resource.name}</h3>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>{typeInfo.label}</span>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: isActive ? '#d4edda' : '#f8d7da',
          color: isActive ? '#155724' : '#721c24',
        }}>
          {isActive ? '✓ Active' : '⚠ Out of Service'}
        </span>
      </div>

      {/* ── Details ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#555' }}>
        <div>📍 <strong>Location:</strong> {resource.location}</div>
        {resource.capacity && (
          <div>👥 <strong>Capacity:</strong> {resource.capacity} people</div>
        )}
        {resource.availabilityStart && resource.availabilityEnd && (
          <div>🕐 <strong>Available:</strong> {formatTime(resource.availabilityStart)} – {formatTime(resource.availabilityEnd)}</div>
        )}
        {resource.description && (
          <div style={{ color: '#777', fontStyle: 'italic', marginTop: '4px' }}>
            {resource.description}
          </div>
        )}
      </div>

      {/* ── Admin Actions ────────────────────────────────────── */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onEdit(resource)}
            style={{
              flex: 1, padding: '7px', backgroundColor: '#ebf4ff',
              color: '#1a73e8', border: '1px solid #bee3f8',
              borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onToggleStatus(resource)}
            style={{
              flex: 1, padding: '7px',
              backgroundColor: isActive ? '#fff3cd' : '#d4edda',
              color: isActive ? '#856404' : '#155724',
              border: `1px solid ${isActive ? '#fcd34d' : '#b2dfdb'}`,
              borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
            }}
          >
            {isActive ? '⏸ Deactivate' : '▶ Activate'}
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            style={{
              padding: '7px 12px', backgroundColor: '#fff5f5',
              color: '#e53e3e', border: '1px solid #feb2b2',
              borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem'
            }}
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
}

export default ResourceCard;
EOF
