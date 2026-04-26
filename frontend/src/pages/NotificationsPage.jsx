import React, { useState, useEffect } from 'react';
import {
  FiTrash2, FiCheck, FiCheckCircle, FiBell,
  FiUser, FiEdit2, FiKey, FiCalendar, FiX,
  FiClock, FiUnlock, FiAlertTriangle, FiTag,
  FiMessageSquare, FiSlash, FiUserCheck,
} from 'react-icons/fi';
import { notificationService } from '../services/notificationService';

const CATEGORY_CONFIG = {
  ALL:      { label: 'All',       color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  USERS:    { label: 'Users',     color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  BOOKINGS: { label: 'Bookings',  color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  TICKETS:  { label: 'Tickets',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
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

function NotificationsPage() {
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
    <>
      {/* ✅ THE ONLY CHANGE: stops the outer page from scrolling */}
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div style={{
        fontFamily: 'Inter,system-ui,sans-serif',
        background: '#F1F5F9',
        height: 'calc(100vh - 65px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: 800,
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>

          {/* ── Static top section ── */}
          <div style={{ flexShrink: 0, padding: '28px 28px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#111' }}>Notifications</h1>
                {totalUnread > 0 && (
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                    {totalUnread} unread notification{totalUnread !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowUnreadOnly(p => !p)}
                  style={{
                    padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', border: '1px solid',
                    background: showUnreadOnly ? '#f0f0ff' : 'white',
                    color: showUnreadOnly ? '#4f46e5' : '#6b7280',
                    borderColor: showUnreadOnly ? '#c7d2fe' : '#e5e7eb',
                  }}
                >
                  {showUnreadOnly ? '● Unread only' : '○ Show all'}
                </button>
                {totalUnread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: '#f0f0ff', border: '1px solid #c7d2fe',
                      color: '#4f46e5', padding: '7px 14px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                    }}
                  >
                    <FiCheckCircle size={15} /> Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', gap: '0' }}>
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
                      padding: '10px 16px',
                      fontSize: '13px', fontWeight: isActive ? '600' : '500',
                      cursor: 'pointer',
                      border: 'none',
                      borderBottom: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                      marginBottom: '-2px',
                      background: 'transparent',
                      color: isActive ? config.color : '#6b7280',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {config.label}
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      background: isActive ? config.bg : '#f3f4f6',
                      color: isActive ? config.color : '#6b7280',
                      border: isActive ? `1px solid ${config.border}` : '1px solid transparent',
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

          {/* ── Scrollable notifications list only ── */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            padding: '16px 28px 28px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 transparent',
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading notifications...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: '#fff5f5', borderRadius: '12px', border: '1px solid #fecaca' }}>
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <FiBell size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
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
                      padding: '16px', borderRadius: '12px',
                      background: !n.isRead ? '#fafbff' : 'white',
                      border: `1px solid ${!n.isRead ? '#e0e7ff' : '#f0f0f0'}`,
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
                          <span style={{ fontSize: '13px', fontWeight: !n.isRead ? '700' : '600', color: '#111' }}>
                            {n.title}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: '600', padding: '2px 7px',
                            borderRadius: '999px', letterSpacing: '0.4px',
                            background: catCfg.bg, color: catCfg.color, border: `1px solid ${catCfg.border}`,
                          }}>
                            {catCfg.label}
                          </span>
                          {!n.isRead && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4f46e5', display: 'inline-block', flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>{n.message}</p>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatTime(n.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {!n.isRead && (
                          <button onClick={() => handleMarkAsRead(n.id)} title="Mark as read"
                            style={{ background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#6b7280', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            onMouseOver={e => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                            onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                            <FiCheck size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(n.id)} title="Delete"
                          style={{ background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#6b7280', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                          onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                          onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
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
      </div>
    </>
  );
}

export default NotificationsPage;