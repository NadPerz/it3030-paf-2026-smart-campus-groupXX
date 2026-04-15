import React, { useState, useEffect } from 'react';
import { FiTrash2, FiCheck, FiCheckCircle, FiBell } from 'react-icons/fi';
import { notificationService } from '../services/notificationService';

/**
 * AdminNotificationsPage — content only, no layout wrapper.
 * AdminLayout is provided by the nested route in App.jsx.
 * Route: /admin/notifications
 */
function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (_) {}
  }

  async function handleDelete(id) {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (_) {}
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function getTypeIcon(type) {
    const icons = {
      NEW_USER_PENDING: '👤', USER_PROFILE_UPDATED: '✏️',
      ACCOUNT_APPROVED: '✅', ACCOUNT_SUSPENDED: '🚫',
      ACCOUNT_REACTIVATED: '🔓', ACCOUNT_PENDING: '⏳',
      PROFILE_UPDATED: '✏️', ROLE_CHANGED: '🔑',
      BOOKING_APPROVED: '📅', BOOKING_REJECTED: '❌',
      TICKET_STATUS_CHANGED: '🎫', TICKET_COMMENT: '💬',
      RESOURCE_OUT_OF_SERVICE: '⚠️',
    };
    return icons[type] || '🔔';
  }

  function getTypeLabel(type) {
    const labels = {
      NEW_USER_PENDING: 'User', USER_PROFILE_UPDATED: 'Profile',
      ACCOUNT_APPROVED: 'Account', ACCOUNT_SUSPENDED: 'Account',
      ACCOUNT_REACTIVATED: 'Account', ACCOUNT_PENDING: 'Account',
      PROFILE_UPDATED: 'Profile', ROLE_CHANGED: 'Role',
      BOOKING_APPROVED: 'Booking', BOOKING_REJECTED: 'Booking',
      TICKET_STATUS_CHANGED: 'Ticket', TICKET_COMMENT: 'Ticket',
      RESOURCE_OUT_OF_SERVICE: 'Resource',
    };
    return labels[type] || 'General';
  }

  const displayed = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: '#0F172A' }}>
          Notification Management
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
          Your admin notifications — new users, profile changes, and system alerts.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'unread'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding: '6px 16px', borderRadius: '999px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer', border: '1px solid',
              background: filter === tab ? '#1D4ED8' : 'white',
              color: filter === tab ? 'white' : '#64748B',
              borderColor: filter === tab ? '#1D4ED8' : '#E2E8F0',
            }}>
              {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'white', border: '1px solid #E2E8F0', color: '#1D4ED8',
            padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          }}>
            <FiCheckCircle size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading notifications...</div>
      ) : error ? (
        <div style={{ padding: '20px', borderRadius: '10px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '14px' }}>
          {error}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <FiBell size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontWeight: '500' }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayed.map(n => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '16px 18px', borderRadius: '10px',
              background: !n.isRead ? '#F0F4FF' : 'white',
              border: `1px solid ${!n.isRead ? '#C7D7FB' : '#E2E8F0'}`,
            }}>
              <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{getTypeIcon(n.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: !n.isRead ? '700' : '600', color: '#0F172A' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '999px', background: '#F1F5F9', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {getTypeLabel(n.type)}
                  </span>
                  {!n.isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1D4ED8', display: 'inline-block' }} />}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{n.message}</p>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{formatTime(n.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n.id)} title="Mark as read"
                    style={{ background: 'none', border: '1px solid #E2E8F0', cursor: 'pointer', color: '#94A3B8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#1D4ED8'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                    <FiCheck size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(n.id)} title="Delete"
                  style={{ background: 'none', border: '1px solid #E2E8F0', cursor: 'pointer', color: '#94A3B8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                  onMouseOver={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminNotificationsPage;