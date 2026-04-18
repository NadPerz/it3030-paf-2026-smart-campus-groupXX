import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

/**
 * NotificationBell — live bell icon with dropdown.
 * Uses SSE (fetch + ReadableStream) for real-time updates.
 * Falls back to polling every 30s if SSE disconnects.
 */
function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setForceUpdate] = useState(0);
  const dropdownRef = useRef(null);
  const sseAbortRef = useRef(null);
  const navigate = useNavigate();

  // ── SSE connection ──────────────────────────────
  const connectSSE = useCallback(() => {
    // Abort any existing connection first
    if (sseAbortRef.current) sseAbortRef.current.abort();

    const controller = new AbortController();
    sseAbortRef.current = controller;
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const response = await fetch('/api/notifications/stream', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // keep incomplete last chunk

          for (const part of parts) {
            for (const line of part.split('\n')) {
              if (line.startsWith('data:')) {
                try {
                  const newNotif = JSON.parse(line.slice(5).trim());
                  // New notification arrived — bump count and prepend to list
                  setUnreadCount(prev => prev + 1);
                  setNotifications(prev => [newNotif, ...prev].slice(0, 5));
                  soundService.playNotificationSound(newNotif.type);
                } catch (_) {}
              }
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // intentional disconnect
        // Network error — retry after 10 seconds
        setTimeout(connectSSE, 10000);
      }
    })();
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    connectSSE();
    return () => { if (sseAbortRef.current) sseAbortRef.current.abort(); };
  }, [connectSSE]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── API calls ───────────────────────────────────
  async function fetchUnreadCount() {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.count ?? 0);
    } catch (_) {}
  }

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications((res.data || []).slice(0, 5));
    } catch (_) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(e, id) {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      const deleted = notifications.find(n => n.id === id);
      if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (_) {}
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {}
  }

  // Click a notification item → mark as read + go to /notifications
  async function handleItemClick(n) {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (_) {}
    }
    setOpen(false);
    navigate('/notifications');
  }

  // ── Helpers ─────────────────────────────────────
  function formatTime(dateStr) {
    if (!dateStr) return '';
    const diffMins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const h = Math.floor(diffMins / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function getTypeIcon(type) {
    const icons = {
      ACCOUNT_APPROVED: '✅', ACCOUNT_SUSPENDED: '🚫', ACCOUNT_REACTIVATED: '🔓',
      ACCOUNT_PENDING: '⏳', NEW_USER_PENDING: '👤', PROFILE_UPDATED: '✏️',
      USER_PROFILE_UPDATED: '✏️', ROLE_CHANGED: '🔑', BOOKING_APPROVED: '📅',
      BOOKING_REJECTED: '❌', TICKET_STATUS_CHANGED: '🎫', TICKET_COMMENT: '💬',
      RESOURCE_OUT_OF_SERVICE: '⚠️',
    };
    return icons[type] || '🔔';
  }

  // ── Render ───────────────────────────────────────
  return (
    <div className="nb-wrapper" ref={dropdownRef}>
      <button className="nb-btn" onClick={handleOpen} aria-label="Notifications">
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      <button
        onClick={() => {
          soundService.toggleSound();
          setForceUpdate(p => p + 1);
        }}
        title={soundService.isSoundEnabled() ? 'Sound on' : 'Sound off'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '14px', opacity: 0.6, padding: '2px 4px',
        }}
      >
        {soundService.isSoundEnabled() ? '🔔' : '🔕'}
      </button>

      {open && (
        <div className="nb-dropdown">
          {/* Header */}
          <div className="nb-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="nb-mark-all" onClick={handleMarkAllRead}>
                <FiCheckCircle size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="nb-list">
            {loading ? (
              <p className="nb-empty">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="nb-empty">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`nb-item ${!n.isRead ? 'nb-unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleItemClick(n)}
                >
                  <span className="nb-icon">{getTypeIcon(n.type)}</span>
                  <div className="nb-body">
                    <div className="nb-title">{n.title}</div>
                    <div className="nb-msg">{n.message}</div>
                    <div className="nb-time">{formatTime(n.createdAt)}</div>
                  </div>
                  <div className="nb-actions" onClick={e => e.stopPropagation()}>
                    {!n.isRead && (
                      <button className="nb-act" onClick={e => handleMarkAsRead(e, n.id)} title="Mark as read">
                        <FiCheck size={13} />
                      </button>
                    )}
                    <button className="nb-act nb-del" onClick={e => handleDelete(e, n.id)} title="Delete">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="nb-footer">
            <button className="nb-view-all" onClick={() => { setOpen(false); navigate('/notifications'); }}>
              View all notifications
            </button>
          </div>
        </div>
      )}

      <style>{`
        .nb-wrapper { position: relative; display: inline-flex; align-items: center; }
        .nb-btn {
          background: none; border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          padding: 6px; border-radius: 8px; position: relative; transition: background 0.2s;
        }
        .nb-btn:hover { background: rgba(255,255,255,0.15); }
        .nb-badge {
          position: absolute; top: 0; right: 0;
          background: #ef4444; color: white; font-size: 10px; font-weight: 700;
          min-width: 16px; height: 16px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px; line-height: 1;
        }
        .nb-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0; width: 340px;
          background: white; border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15); z-index: 1000;
          overflow: hidden; border: 1px solid #e5e7eb;
        }
        .nb-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px; border-bottom: 1px solid #f0f0f0;
          font-weight: 600; font-size: 14px; color: #111;
        }
        .nb-mark-all {
          background: none; border: none; cursor: pointer; color: #6366f1;
          font-size: 12px; display: flex; align-items: center; gap: 4px;
          padding: 4px 8px; border-radius: 6px; transition: background 0.2s;
        }
        .nb-mark-all:hover { background: #f0f0ff; }
        .nb-list { max-height: 320px; overflow-y: auto; }
        .nb-empty { padding: 24px; text-align: center; color: #9ca3af; font-size: 13px; }
        .nb-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px; border-bottom: 1px solid #f5f5f5;
          cursor: pointer; transition: background 0.15s;
        }
        .nb-item:hover { background: #f5f5ff; }
        .nb-unread { background: #fafbff; }
        .nb-unread .nb-title { font-weight: 700; color: #1e1b4b; }
        .nb-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .nb-body { flex: 1; min-width: 0; }
        .nb-title { font-size: 13px; font-weight: 500; color: #111; margin-bottom: 2px; }
        .nb-msg {
          font-size: 12px; color: #6b7280; margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nb-time { font-size: 11px; color: #9ca3af; }
        .nb-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
        .nb-act {
          background: none; border: none; cursor: pointer; color: #9ca3af;
          padding: 3px; border-radius: 4px; display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .nb-act:hover { color: #6366f1; background: #f0f0ff; }
        .nb-del:hover { color: #ef4444 !important; background: #fff0f0 !important; }
        .nb-footer { padding: 10px 16px; border-top: 1px solid #f0f0f0; }
        .nb-view-all {
          width: 100%; background: #f5f3ff; border: none; cursor: pointer;
          color: #6366f1; font-size: 13px; font-weight: 500;
          padding: 8px; border-radius: 8px; transition: background 0.2s;
        }
        .nb-view-all:hover { background: #ede9fe; }
      `}</style>
    </div>
  );
}

export default NotificationBell;