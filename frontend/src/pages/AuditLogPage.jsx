import React, { useEffect, useState } from 'react';
import api from '../services/api';

function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }

  const actions = ['ALL', 'LOGIN', 'ROLE_CHANGED', 'USER_APPROVED',
    'USER_SUSPENDED', 'USER_REACTIVATED', 'USER_DELETED',
    'PROFILE_UPDATED', 'NEW_USER_REGISTERED'];

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(log => log.action === filter);

  function getActionStyle(action) {
    const styles = {
      LOGIN:               { bg: '#e8f5e9', color: '#2e7d32', label: '🔐 LOGIN' },
      NEW_USER_REGISTERED: { bg: '#e3f2fd', color: '#1565c0', label: '👤 REGISTERED' },
      ROLE_CHANGED:        { bg: '#fff3e0', color: '#e65100', label: '🔄 ROLE CHANGED' },
      USER_APPROVED:       { bg: '#e8f5e9', color: '#2e7d32', label: '✅ APPROVED' },
      USER_SUSPENDED:      { bg: '#fce4ec', color: '#c62828', label: '⏸ SUSPENDED' },
      USER_REACTIVATED:    { bg: '#e8f5e9', color: '#2e7d32', label: '▶ REACTIVATED' },
      USER_DELETED:        { bg: '#fce4ec', color: '#c62828', label: '🗑 DELETED' },
      PROFILE_UPDATED:     { bg: '#f3e5f5', color: '#6a1b9a', label: '✏️ PROFILE UPDATED' },
    };
    return styles[action] || { bg: '#f5f5f5', color: '#333', label: action };
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  if (loading) return (
    <div style={{ padding: '1rem 1rem' }}>Loading audit logs...</div>
  );

  return (
    <div style={{ padding: '1rem 1rem' }}>

      {/* Header */}
      <h2 style={{ marginBottom: '0.25rem' }}>📋 Audit Log</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        Track all system activity — who did what and when
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[
          { label: 'Total Events', value: logs.length, color: '#3182ce', bg: '#ebf8ff' },
          { label: 'Logins', value: logs.filter(l => l.action === 'LOGIN').length, color: '#38a169', bg: '#f0fff4' },
          { label: 'Role Changes', value: logs.filter(l => l.action === 'ROLE_CHANGED').length, color: '#d69e2e', bg: '#fffff0' },
          { label: 'Suspensions', value: logs.filter(l => l.action === 'USER_SUSPENDED').length, color: '#e53e3e', bg: '#fff5f5' },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: stat.bg,
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {actions.map(action => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: filter === action ? '#1a73e8' : '#e2e8f0',
              backgroundColor: filter === action ? '#1a73e8' : 'white',
              color: filter === action ? 'white' : '#555',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            {action.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={fetchLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={th}>Action</th>
              <th style={th}>Performed By</th>
              <th style={th}>Target User</th>
              <th style={th}>Details</th>
              <th style={th}>IP Address</th>
              <th style={th}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  No logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const style = getActionStyle(log.action);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={td}>
                      <span style={{
                        backgroundColor: style.bg,
                        color: style.color,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={td}>{log.performedBy || '—'}</td>
                    <td style={td}>{log.targetUser || '—'}</td>
                    <td style={td}>{log.details || '—'}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {log.ipAddress || '—'}
                    </td>
                    <td style={{ ...td, fontSize: '0.85rem', color: '#666' }}>
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  borderBottom: '2px solid #eee',
  color: '#555',
  fontSize: '0.85rem'
};

const td = {
  padding: '12px 16px',
  verticalAlign: 'middle',
  fontSize: '0.9rem'
};

export default AuditLogPage;