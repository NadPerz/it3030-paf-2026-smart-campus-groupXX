import React, { useState, useEffect } from 'react';
import { FiTrash2, FiCheck, FiCheckCircle, FiBell } from 'react-icons/fi';
import { notificationService } from '../services/notificationService';

/**
 * NotificationsPage — full view of all user notifications.
 * Route: /notifications
 */
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  }

  async function handleDelete(id) {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {}
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {}
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function getTypeIcon(type) {
    const icons = {
      ACCOUNT_APPROVED: '✅',
      ACCOUNT_SUSPENDED: '🚫',
      ACCOUNT_REACTIVATED: '🔓',
      ACCOUNT_PENDING: '⏳',
      NEW_USER_PENDING: '👤',
      PROFILE_UPDATED: '✏️',
      USER_PROFILE_UPDATED: '✏️',
      ROLE_CHANGED: '🔑',
      BOOKING_APPROVED: '📅',
      BOOKING_REJECTED: '❌',
      TICKET_STATUS_CHANGED: '🎫',
      TICKET_COMMENT: '💬',
      RESOURCE_OUT_OF_SERVICE: '⚠️',
    };
    return icons[type] || '🔔';
  }

  function getTypeLabel(type) {
    const labels = {
      ACCOUNT_APPROVED: 'Account',
      ACCOUNT_SUSPENDED: 'Account',
      ACCOUNT_REACTIVATED: 'Account',
      ACCOUNT_PENDING: 'Account',
      NEW_USER_PENDING: 'User',
      PROFILE_UPDATED: 'Profile',
      USER_PROFILE_UPDATED: 'Profile',
      ROLE_CHANGED: 'Role',
      BOOKING_APPROVED: 'Booking',
      BOOKING_REJECTED: 'Booking',
      TICKET_STATUS_CHANGED: 'Ticket',
      TICKET_COMMENT: 'Ticket',
      RESOURCE_OUT_OF_SERVICE: 'Resource',
    };
    return labels[type] || 'General';
  }

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#111' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f0f0ff', border: '1px solid #c7d2fe',
              color: '#4f46e5', padding: '8px 14px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500'
            }}
          >
            <FiCheckCircle size={15} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'unread'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 16px', borderRadius: '999px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer', border: '1px solid',
              background: filter === tab ? '#4f46e5' : 'white',
              color: filter === tab ? 'white' : '#6b7280',
              borderColor: filter === tab ? '#4f46e5' : '#e5e7eb',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading notifications...
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center', padding: '40px', color: '#ef4444',
          background: '#fff5f5', borderRadius: '12px', border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', color: '#9ca3af',
          background: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0'
        }}>
          <FiBell size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: '500' }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayed.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px', borderRadius: '12px',
                background: !n.isRead ? '#fafbff' : 'white',
                border: `1px solid ${!n.isRead ? '#e0e7ff' : '#f0f0f0'}`,
                transition: 'background 0.15s',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>
                {getTypeIcon(n.type)}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: !n.isRead ? '700' : '600',
                    color: '#111',
                  }}>
                    {n.title}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '2px 6px',
                    borderRadius: '999px', background: '#f3f4f6', color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {getTypeLabel(n.type)}
                  </span>
                  {!n.isRead && (
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#4f46e5', display: 'inline-block', flexShrink: 0
                    }} />
                  )}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {formatTime(n.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    style={{
                      background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer',
                      color: '#6b7280', padding: '6px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <FiCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                  style={{
                    background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer',
                    color: '#6b7280', padding: '6px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
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

export default NotificationsPage;
