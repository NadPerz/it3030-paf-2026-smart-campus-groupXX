import React, { useState, useEffect } from 'react';
import {
  FiTrash2, FiCheck, FiCheckCircle, FiBell,
  FiUser, FiEdit2, FiKey, FiCalendar, FiX,
  FiClock, FiUnlock, FiAlertTriangle, FiTag,
  FiMessageSquare, FiSlash, FiUserCheck,
} from 'react-icons/fi';
import { notificationService } from '../services/notificationService';

const CATEGORY_CONFIG = {
  ALL:      { label: 'All',       color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  USERS:    { label: 'Users',     color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  BOOKINGS: { label: 'Bookings',  color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  TICKETS:  { label: 'Tickets',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  RESOURCES:{ label: 'Resources', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  ACCOUNT:  { label: 'Account',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

const TYPE_TO_CATEGORY = {
  NEW_USER_PENDING: 'USERS', USER_PROFILE_UPDATED: 'USERS',
  ACCOUNT_APPROVED: 'ACCOUNT', ACCOUNT_SUSPENDED: 'ACCOUNT',
  ACCOUNT_REACTIVATED: 'ACCOUNT', ACCOUNT_PENDING: 'ACCOUNT',
  PROFILE_UPDATED: 'ACCOUNT', ROLE_CHANGED: 'ACCOUNT',
  BOOKING_APPROVED: 'BOOKINGS', BOOKING_REJECTED: 'BOOKINGS',
  BOOKING_CREATED: 'BOOKINGS', BOOKING_CANCELLED: 'BOOKINGS',
  TICKET_STATUS_CHANGED: 'TICKETS', TICKET_COMMENT: 'TICKETS',
  RESOURCE_OUT_OF_SERVICE: 'RESOURCES',
};

function getCategory(type) {
  return TYPE_TO_CATEGORY[type] || 'ACCOUNT';
}

function getTypeIcon(type) {
  const size = 18;
  const icons = {
    ACCOUNT_APPROVED:        <FiUserCheck size={size} />,
    ACCOUNT_SUSPENDED:       <FiSlash size={size} />,
    ACCOUNT_REACTIVATED:     <FiUnlock size={size} />,
    ACCOUNT_PENDING:         <FiClock size={size} />,
    NEW_USER_PENDING:        <FiUser size={size} />,
    PROFILE_UPDATED:         <FiEdit2 size={size} />,
    USER_PROFILE_UPDATED:    <FiEdit2 size={size} />,
    ROLE_CHANGED:            <FiKey size={size} />,
    BOOKING_APPROVED:        <FiCalendar size={size} />,
    BOOKING_REJECTED:        <FiX size={size} />,
    BOOKING_CREATED:         <FiCalendar size={size} />,
    BOOKING_CANCELLED:       <FiX size={size} />,
    TICKET_STATUS_CHANGED:   <FiTag size={size} />,
    TICKET_COMMENT:          <FiMessageSquare size={size} />,
    RESOURCE_OUT_OF_SERVICE: <FiAlertTriangle size={size} />,
  };
  return icons[type] || <FiBell size={size} />;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
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

  function getUnreadCountForCategory(cat) {
    if (cat === 'ALL') return notifications.filter(n => !n.isRead).length;
    return notifications.filter(n => !n.isRead && getCategory(n.type) === cat).length;
  }

  function getCountForCategory(cat) {
    if (cat === 'ALL') return notifications.length;
    return notifications.filter(n => getCategory(n.type) === cat).length;
  }

  const filtered = notifications.filter(n => {
    const catMatch = activeCategory === 'ALL' || getCategory(n.type) === activeCategory;
    const readMatch = !showUnreadOnly || !n.isRead;
    return catMatch && readMatch;
  });

  const totalUnread = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}>

      {/* Static top section */}
      <div>
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: '#0F172A' }}>Notification Management</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
            Your admin notifications — new users, profile changes, and system alerts.
          </p>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 14px' }}>
          <button
            onClick={() => setShowUnreadOnly(p => !p)}
            style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', border: '1px solid',
              background: showUnreadOnly ? '#EFF6FF' : 'white',
              color: showUnreadOnly ? '#1D4ED8' : '#64748B',
              borderColor: showUnreadOnly ? '#BFDBFE' : '#E2E8F0',
            }}
          >
            {showUnreadOnly ? '● Unread only' : '○ Show all'}
          </button>
          {totalUnread > 0 && (
            <button onClick={handleMarkAllRead} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'white', border: '1px solid #E2E8F0', color: '#1D4ED8',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            }}>
              <FiCheckCircle size={14} /> Mark all as read
            </button>
          )}
        </div>

        {/* Category filter chips — sticky */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', paddingBottom: '12px', paddingTop: '4px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const unread = getUnreadCountForCategory(key);
              const total = getCountForCategory(key);
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer', border: '1px solid',
                    background: isActive ? config.bg : 'white',
                    color: isActive ? config.color : '#64748B',
                    borderColor: isActive ? config.border : '#E2E8F0',
                    transition: 'all 0.15s',
                  }}
                >
                  {config.label}
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    background: isActive ? config.color : '#F1F5F9',
                    color: isActive ? 'white' : '#64748B',
                    padding: '1px 6px', borderRadius: '999px',
                  }}>
                    {total}
                  </span>
                  {unread > 0 && (
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      background: '#ef4444', color: 'white',
                      padding: '1px 5px', borderRadius: '999px',
                    }}>
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable notifications list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading notifications...</div>
        ) : error ? (
          <div style={{ padding: '20px', borderRadius: '10px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '14px' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <FiBell size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontWeight: '500' }}>No notifications in this category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(n => {
              const cat = getCategory(n.type);
              const catCfg = CATEGORY_CONFIG[cat];
              return (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 18px', borderRadius: '10px',
                  background: !n.isRead ? '#F0F4FF' : 'white',
                  border: `1px solid ${!n.isRead ? '#C7D7FB' : '#E2E8F0'}`,
                }}>
                  <div style={{
                    flexShrink: 0, marginTop: '2px',
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: catCfg.bg, border: `1px solid ${catCfg.border}`,
                    color: catCfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getTypeIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: !n.isRead ? '700' : '600', color: '#0F172A' }}>{n.title}</span>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 7px',
                        borderRadius: '999px', letterSpacing: '0.4px',
                        background: catCfg.bg, color: catCfg.color, border: `1px solid ${catCfg.border}`,
                      }}>
                        {catCfg.label}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNotificationsPage;