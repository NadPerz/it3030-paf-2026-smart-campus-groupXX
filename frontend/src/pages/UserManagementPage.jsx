<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminLayout from '../components/common/AdminLayout';

<<<<<<< HEAD
/**
 * Admin User Management Page — Member 4 responsibility.
 */
=======
// ─── Design tokens (from docs/ui-auth-users.md Prompt 6) ────────────────────

const STATUS_STYLES = {
  ACTIVE:    'bg-[#F0FDF4] text-[#166534]',
  PENDING:   'bg-[#FFFBEB] text-[#92400E]',
  SUSPENDED: 'bg-[#FEF2F2] text-[#991B1B]',
};

const ROLE_STYLES = {
  USER:       'bg-[#EFF6FF] text-[#1E40AF]',
  ADMIN:      'bg-[#F5F3FF] text-[#6D28D9]',
  TECHNICIAN: 'bg-[#F0FDF4] text-[#15803D]',
};

// ─── Helper components ───────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.ACTIVE}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role, userId, selfUser, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (
        (!buttonRef.current  || !buttonRef.current.contains(e.target)) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleToggle() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const DROPDOWN_H = 126; // 3 items × 36px + 18px padding
    const top = window.innerHeight - rect.bottom < DROPDOWN_H + 4
      ? rect.top - DROPDOWN_H - 4
      : rect.bottom + 4;
    setDropPos({ top, left: rect.left });
    setOpen(v => !v);
  }

  const base = `inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${ROLE_STYLES[role] ?? ROLE_STYLES.USER}`;

  if (disabled || selfUser) {
    return <span className={base}>{role}</span>;
  }

  return (
    <>
      <button ref={buttonRef} onClick={handleToggle} className={`${base} hover:opacity-80 transition-opacity`}>
        {role} ▾
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1.5 min-w-[160px] border border-[#E5E7EB]"
          style={{ top: dropPos.top, left: dropPos.left }}
        >
          {['USER', 'ADMIN', 'TECHNICIAN'].map(r => (
            <button
              key={r}
              onClick={() => { onChange(userId, r); setOpen(false); }}
              className={`w-full text-left px-4 h-9 text-[14px] transition-colors ${
                r === role
                  ? 'font-medium text-[#1D4ED8] bg-[#EFF6FF]'
                  : 'text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              {r === role ? '● ' : '\u00A0\u00A0'}{r}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function ConfirmModal({ modal, onClose, onConfirm }) {
  const isSuspend = modal.type === 'suspend';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl px-8 py-8 max-w-[420px] w-full mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.16)] text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-2xl ${
          isSuspend ? 'bg-[#FFFBEB]' : 'bg-[#FEF2F2]'
        }`}>
          {isSuspend ? '⏸' : '🗑'}
        </div>
        <h3 className={`text-[18px] font-bold mt-4 ${isSuspend ? 'text-[#111827]' : 'text-[#DC2626]'}`}>
          {isSuspend ? 'Suspend User' : 'Remove User'}
        </h3>
        <p className="text-[14px] text-[#6B7280] mt-2 leading-relaxed">
          {isSuspend
            ? `Are you sure you want to suspend ${modal.userName}? They will lose all access until reactivated.`
            : `Are you sure you want to permanently remove ${modal.userName}? This action cannot be undone.`}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={onClose}
            className="w-[140px] h-11 border-[1.5px] border-[#E5E7EB] text-[#374151] rounded-lg text-[14px] font-semibold hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(modal.userId)}
            className={`w-[140px] h-11 text-white rounded-lg text-[14px] font-semibold transition-colors ${
              isSuspend ? 'bg-[#D97706] hover:bg-[#B45309]' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
            }`}
          >
            {isSuspend ? 'Suspend' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Drawer ──────────────────────────────────────────────────────

function UserDetailDrawer({ userId, users, updating, onClose, onApprove, onSuspend, onReactivate, onDelete, onRoleChange }) {
  const drawerUser = users.find(u => u.id === userId);
  if (!drawerUser) return null;

  const initial = (drawerUser.name?.charAt(0) || '?').toUpperCase();
  const isBusy  = updating === drawerUser.id;

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.30)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 z-50 h-screen bg-white flex flex-col"
        style={{ width: '400px', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB] shrink-0">
          <span className="text-[16px] font-bold text-[#111827]">User Details</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-lg leading-none hover:bg-[#F3F4F6] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* User identity block */}
          <div className="flex items-center gap-4">
            {drawerUser.profilePicture ? (
              <img
                src={drawerUser.profilePicture}
                alt=""
                className="rounded-full object-cover shrink-0"
                style={{ width: '80px', height: '80px', border: '3px solid #E5E7EB' }}
              />
            ) : (
              <div
                className="rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold shrink-0"
                style={{ width: '80px', height: '80px', border: '3px solid #E5E7EB', fontSize: '28px' }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-[18px] font-bold text-[#111827] truncate">{drawerUser.name || '—'}</div>
              <div className="text-[13px] text-[#6B7280] mt-1 truncate">{drawerUser.email}</div>
              <div className="mt-1.5">
                <StatusBadge status={drawerUser.status || 'ACTIVE'} />
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-4">
              <span
                className="text-[12px] font-semibold uppercase text-[#9CA3AF] shrink-0 pt-0.5"
                style={{ letterSpacing: '0.5px', minWidth: '96px' }}
              >
                Role
              </span>
              <RoleBadge
                role={drawerUser.role || 'USER'}
                userId={drawerUser.id}
                selfUser={false}
                disabled={isBusy}
                onChange={onRoleChange}
              />
            </div>

            <div className="flex items-center gap-4">
              <span
                className="text-[12px] font-semibold uppercase text-[#9CA3AF] shrink-0"
                style={{ letterSpacing: '0.5px', minWidth: '96px' }}
              >
                Status
              </span>
              <StatusBadge status={drawerUser.status || 'ACTIVE'} />
            </div>

            <div className="flex items-center gap-4">
              <span
                className="text-[12px] font-semibold uppercase text-[#9CA3AF] shrink-0"
                style={{ letterSpacing: '0.5px', minWidth: '96px' }}
              >
                Member Since
              </span>
              <span className="text-[14px] text-[#6B7280]">
                {formatDate(drawerUser.createdAt || drawerUser.joinedAt)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E7EB]" />

          {/* Actions */}
          <div>
            <div
              className="text-[12px] font-semibold uppercase text-[#9CA3AF] mb-3"
              style={{ letterSpacing: '0.8px' }}
            >
              ACTIONS
            </div>

            {isBusy && <p className="text-[13px] text-[#9CA3AF] mb-3">Saving…</p>}

            {drawerUser.status === 'PENDING' && (
              <button
                onClick={() => onApprove(drawerUser.id)}
                disabled={isBusy}
                className="w-full h-11 bg-[#16A34A] text-white text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#15803D] transition-colors disabled:opacity-60"
              >
                ✓ Approve User
              </button>
            )}

            {drawerUser.status === 'ACTIVE' && (
              <button
                onClick={() => onSuspend(drawerUser.id, drawerUser.name || drawerUser.email)}
                disabled={isBusy}
                className="w-full h-11 bg-white border-[1.5px] border-[#D97706] text-[#D97706] text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#FFFBEB] transition-colors disabled:opacity-60"
              >
                ⏸ Suspend User
              </button>
            )}

            {drawerUser.status === 'SUSPENDED' && (
              <button
                onClick={() => onReactivate(drawerUser.id)}
                disabled={isBusy}
                className="w-full h-11 bg-white border-[1.5px] border-[#1D4ED8] text-[#1D4ED8] text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors disabled:opacity-60"
              >
                ▶ Reactivate User
              </button>
            )}

            <button
              onClick={() => onDelete(drawerUser.id, drawerUser.name || drawerUser.email)}
              disabled={isBusy}
              className="w-full h-11 mt-2 bg-white border-[1.5px] border-[#DC2626] text-[#DC2626] text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#FEF2F2] transition-colors disabled:opacity-60"
            >
              🗑 Delete User
            </button>

            <p className="text-[12px] text-[#9CA3AF] text-center mt-1.5">
              Removing this user is permanent and cannot be undone.
            </p>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('ALL');
<<<<<<< HEAD

  useEffect(() => {
    fetchUsers();
  }, []);

=======
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Close row action menu on outside click
  useEffect(() => {
    function handle(e) {
      if (!e.target.closest('[data-rowmenu]')) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  // Auto-close drawer when the selected user is deleted
  useEffect(() => {
    if (selectedUserId && !users.find(u => u.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [users, selectedUserId]);

>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
  async function fetchUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId) {
<<<<<<< HEAD
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/approve`);
      setUsers(users.map(u => u.id === userId ? response.data : u));
=======
    setOpenMenuId(null);
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/approve`);
      setUsers(prev => prev.map(u => u.id === userId ? response.data : u));
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    } catch (err) {
      alert('Failed to approve user.');
    } finally {
      setUpdating(null);
    }
  }

<<<<<<< HEAD
  async function handleSuspend(userId) {
    if (!window.confirm('Suspend this user?')) return;
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/suspend`);
      setUsers(users.map(u => u.id === userId ? response.data : u));
=======
  function handleSuspend(userId, userName) {
    setOpenMenuId(null);
    setConfirmModal({ type: 'suspend', userId, userName });
  }

  async function doSuspend(userId) {
    setConfirmModal(null);
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/suspend`);
      setUsers(prev => prev.map(u => u.id === userId ? response.data : u));
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    } catch (err) {
      alert('Failed to suspend user.');
    } finally {
      setUpdating(null);
    }
  }

  async function handleReactivate(userId) {
<<<<<<< HEAD
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/reactivate`);
      setUsers(users.map(u => u.id === userId ? response.data : u));
=======
    setOpenMenuId(null);
    setUpdating(userId);
    try {
      const response = await api.put(`/users/${userId}/reactivate`);
      setUsers(prev => prev.map(u => u.id === userId ? response.data : u));
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    } catch (err) {
      alert('Failed to reactivate user.');
    } finally {
      setUpdating(null);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
<<<<<<< HEAD
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
=======
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    } catch (err) {
      alert('Failed to update role.');
    } finally {
      setUpdating(null);
    }
  }

<<<<<<< HEAD
  async function handleDelete(userId) {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
=======
  function handleDelete(userId, userName) {
    setOpenMenuId(null);
    setConfirmModal({ type: 'delete', userId, userName });
  }

  async function doDelete(userId) {
    setConfirmModal(null);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    } catch (err) {
      alert('Failed to delete user.');
    }
  }

  const stats = {
<<<<<<< HEAD
    all: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pending: users.filter(u => u.status === 'PENDING').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };

  const filteredUsers = filter === 'ALL' ? users :
    users.filter(u => u.status === filter);

  const pendingCount = stats.pending;

  function getStatusBadge(status) {
    const styles = {
      ACTIVE: { backgroundColor: '#d4edda', color: '#155724' },
      PENDING: { backgroundColor: '#fff3cd', color: '#856404' },
      SUSPENDED: { backgroundColor: '#f8d7da', color: '#721c24' },
    };
    return (
      <span style={{
        ...styles[status],
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {status}
      </span>
    );
  }

  if (loading) return <AdminLayout><div style={{ padding: '2rem' }}>Loading users...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ padding: '2rem', color: 'red' }}>{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>

        {/* Header */}
        <h2 style={{ marginBottom: '0.25rem' }}>👥 User Management</h2>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>
          Manage user accounts, roles and access
        </p>

        {/* Warning Banner */}
        {pendingCount > 0 && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span style={{ color: '#92400e', fontWeight: '500' }}>
              {pendingCount} user{pendingCount > 1 ? 's are' : ' is'} waiting for approval
            </span>
            <button
              onClick={() => setFilter('PENDING')}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
=======
    all:       users.length,
    active:    users.filter(u => u.status === 'ACTIVE').length,
    pending:   users.filter(u => u.status === 'PENDING').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  };

  const filteredUsers = users.filter(u => {
    if (filter !== 'ALL' && u.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.name || '').toLowerCase().includes(q) ||
             (u.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  function formatJoined(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  if (loading) return (
    <AdminLayout>
      <div className="p-8 text-sm text-[#6B7280]">Loading users…</div>
    </AdminLayout>
  );
  if (error) return (
    <AdminLayout>
      <div className="p-8 text-sm text-[#DC2626]">{error}</div>
    </AdminLayout>
  );

  const STATS_CARDS = [
    { label: 'Total Users', value: stats.all,       numColor: '#1D4ED8', bg: '#EFF6FF', border: '#1D4ED8' },
    { label: 'Active',      value: stats.active,    numColor: '#16A34A', bg: '#F0FDF4', border: '#16A34A' },
    { label: 'Pending',     value: stats.pending,   numColor: '#D97706', bg: '#FFFBEB', border: '#D97706' },
    { label: 'Suspended',   value: stats.suspended, numColor: '#DC2626', bg: '#FEF2F2', border: '#DC2626' },
  ];

  const FILTER_TABS = [
    { key: 'ALL',       count: stats.all },
    { key: 'ACTIVE',    count: stats.active },
    { key: 'PENDING',   count: stats.pending },
    { key: 'SUSPENDED', count: stats.suspended },
  ];

  return (
    <AdminLayout>
      <div className="p-8 bg-[#F8FAFC] min-h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[22px] font-bold text-[#111827]">User Management</h1>
          {stats.pending > 0 && (
            <button
              onClick={() => setFilter('PENDING')}
              className="flex items-center gap-1.5 bg-[#FFFBEB] border border-[#FCD34D] text-[#92400E] text-[13px] font-semibold px-3.5 py-1.5 rounded-full hover:bg-[#FEF3C7] transition-colors"
            >
              ⚠ {stats.pending} Pending
            </button>
          )}
        </div>
        <p className="text-[14px] text-[#6B7280] mb-8">Manage accounts, roles and campus access.</p>

        {/* ── Pending banner ── */}
        {stats.pending > 0 && (
          <div className="flex items-center gap-2.5 bg-[#FFFBEB] border border-[#FCD34D] rounded-[10px] px-4 py-3 mb-8">
            <span className="text-lg shrink-0">⚠️</span>
            <span className="text-[14px] text-[#92400E] font-medium flex-1">
              {stats.pending} user{stats.pending > 1 ? 's are' : ' is'} waiting for approval
            </span>
            <button
              onClick={() => setFilter('PENDING')}
              className="shrink-0 bg-[#F59E0B] text-white text-[13px] font-semibold px-3.5 py-1 rounded-md hover:bg-[#D97706] transition-colors"
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
            >
              Review Now
            </button>
          </div>
        )}

<<<<<<< HEAD
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {[
            { label: 'Total Users', value: stats.all, color: '#3182ce', bg: '#ebf8ff' },
            { label: 'Active', value: stats.active, color: '#38a169', bg: '#f0fff4' },
            { label: 'Pending', value: stats.pending, color: '#d69e2e', bg: '#fffff0' },
            { label: 'Suspended', value: stats.suspended, color: '#e53e3e', bg: '#fff5f5' },
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
=======
        {/* ── Stats cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS_CARDS.map(s => (
            <div
              key={s.label}
              className="rounded-[10px] px-5 py-4 border-l-4"
              style={{ backgroundColor: s.bg, borderLeftColor: s.border }}
            >
              <div className="text-[28px] font-bold leading-none" style={{ color: s.numColor }}>
                {s.value}
              </div>
              <div className="text-[13px] text-[#6B7280] mt-1">{s.label}</div>
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
            </div>
          ))}
        </div>

<<<<<<< HEAD
        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: filter === f ? '#1a73e8' : '#e2e8f0',
                backgroundColor: filter === f ? '#1a73e8' : 'white',
                color: filter === f ? 'white' : '#555',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              {f} {f === 'ALL' ? `(${stats.all})` :
                   f === 'ACTIVE' ? `(${stats.active})` :
                   f === 'PENDING' ? `(${stats.pending})` :
                   `(${stats.suspended})`}
=======
        {/* ── Search + filter bar ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full h-10 pl-9 pr-3 border-[1.5px] border-[#E5E7EB] rounded-lg text-[14px] text-[#111827] bg-white outline-none transition-colors focus:border-[#1D4ED8]"
              style={{ '::placeholder': { color: '#9CA3AF' } }}
            />
          </div>
          {FILTER_TABS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`h-9 px-4 rounded-full text-[13px] font-medium border-[1.5px] whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
              }`}
            >
              {f.key} ({f.count})
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
            </button>
          ))}
        </div>

<<<<<<< HEAD
        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={th}>User</th>
                <th style={th}>Email</th>
                <th style={th}>Status</th>
                <th style={th}>Role</th>
                <th style={th}>Actions</th>
=======
        {/* ── Data table ── */}
        <div className="bg-white rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b-2 border-[#E5E7EB]">
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[12px] font-semibold uppercase text-[#6B7280]"
                    style={{ letterSpacing: '0.8px' }}
                  >
                    {col}
                  </th>
                ))}
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
<<<<<<< HEAD
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
=======
                  <td colSpan={6} className="py-10 text-center text-[14px] text-[#9CA3AF]">
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
                    No users found
                  </td>
                </tr>
              ) : (
<<<<<<< HEAD
                filteredUsers.map(u => (
                  <tr key={u.id} style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: u.status === 'PENDING' ? '#fffbeb' : 'white'
                  }}>
                    {/* User */}
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="profile"
                            style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#3182ce', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '600'
                          }}>
                            {u.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span style={{ fontWeight: '500' }}>{u.name || '—'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={td}>{u.email}</td>

                    {/* Status */}
                    <td style={td}>{getStatusBadge(u.status || 'ACTIVE')}</td>

                    {/* Role */}
                    <td style={td}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id || u.email === user?.email}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={td}>
                      {u.email !== user?.email && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {u.status === 'PENDING' && (
                            <button onClick={() => handleApprove(u.id)}
                              disabled={updating === u.id}
                              style={actionBtn('#38a169')}>
                              ✅ Approve
                            </button>
                          )}
                          {u.status === 'ACTIVE' && (
                            <button onClick={() => handleSuspend(u.id)}
                              disabled={updating === u.id}
                              style={actionBtn('#d69e2e')}>
                              ⏸ Suspend
                            </button>
                          )}
                          {u.status === 'SUSPENDED' && (
                            <button onClick={() => handleReactivate(u.id)}
                              disabled={updating === u.id}
                              style={actionBtn('#3182ce')}>
                              ▶ Reactivate
                            </button>
                          )}
                          <button onClick={() => handleDelete(u.id)}
                            disabled={updating === u.id}
                            style={actionBtn('#e53e3e')}>
                            🗑
                          </button>
                        </div>
                      )}
                      {updating === u.id && (
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>saving...</span>
                      )}
                    </td>
                  </tr>
                ))
=======
                filteredUsers.map(u => {
                  const isSelf = u.email === user?.email;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-[#F3F4F6]"
                      style={{
                        height: '56px',
                        backgroundColor: u.status === 'PENDING' ? '#FFFBEB' : 'white',
                      }}
                    >
                      {/* User */}
                      <td className="px-4">
                        <div className="flex items-center gap-2.5">
                          {u.profilePicture ? (
                            <img
                              src={u.profilePicture}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-[14px] font-semibold shrink-0">
                              {(u.name?.charAt(0) || '?').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-[14px] font-medium text-[#111827] leading-tight">
                              {u.name || '—'}
                            </div>
                            {isSelf && (
                              <div className="text-[11px] text-[#9CA3AF] leading-tight">You</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 text-[14px] text-[#6B7280]">{u.email}</td>

                      {/* Role */}
                      <td className="px-4">
                        <RoleBadge
                          role={u.role || 'USER'}
                          userId={u.id}
                          selfUser={isSelf}
                          disabled={updating === u.id}
                          onChange={handleRoleChange}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4">
                        <StatusBadge status={u.status || 'ACTIVE'} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 text-[13px] text-[#9CA3AF]">
                        {formatJoined(u.createdAt || u.joinedAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4">
                        {isSelf ? (
                          <span className="text-[13px] text-[#9CA3AF]">—</span>
                        ) : updating === u.id ? (
                          <span className="text-[12px] text-[#9CA3AF]">Saving…</span>
                        ) : (
                          <div data-rowmenu>
                            <button
                              data-rowmenu
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const DROPDOWN_H = 120;
                                const top = window.innerHeight - rect.bottom < DROPDOWN_H + 4
                                  ? rect.top - DROPDOWN_H - 4
                                  : rect.bottom + 4;
                                setMenuPos({ top, left: Math.max(4, rect.right - 160) });
                                setOpenMenuId(openMenuId === u.id ? null : u.id);
                              }}
                              className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                              aria-label="Row actions"
                            >
                              <span className="text-[16px] font-bold leading-none" style={{ letterSpacing: '2px' }}>···</span>
                            </button>

                            {openMenuId === u.id && createPortal(
                              <div
                                data-rowmenu
                                className="fixed z-50 bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 min-w-[160px] border border-[#E5E7EB]"
                                style={{ top: menuPos.top, left: menuPos.left }}
                              >
                                <button
                                  onClick={() => { setOpenMenuId(null); setSelectedUserId(u.id); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                                >
                                  👤 View Details
                                </button>
                                <div className="h-px bg-[#F3F4F6] my-1" />
                                {u.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleApprove(u.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
                                  >
                                    ✓ Approve
                                  </button>
                                )}
                                {u.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleSuspend(u.id, u.name || u.email)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[#D97706] hover:bg-[#FFFBEB] transition-colors"
                                  >
                                    ⏸ Suspend
                                  </button>
                                )}
                                {u.status === 'SUSPENDED' && (
                                  <button
                                    onClick={() => handleReactivate(u.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors"
                                  >
                                    ▶ Reactivate
                                  </button>
                                )}
                                <div className="h-px bg-[#F3F4F6] my-1" />
                                <button
                                  onClick={() => handleDelete(u.id, u.name || u.email)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                                >
                                  🗑 Delete
                                </button>
                              </div>,
                              document.body
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
              )}
            </tbody>
          </table>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Confirmation modal */}
      {confirmModal && (
        <ConfirmModal
          modal={confirmModal}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.type === 'suspend' ? doSuspend : doDelete}
        />
      )}

      {/* User detail drawer */}
      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          users={users}
          updating={updating}
          onClose={() => setSelectedUserId(null)}
          onApprove={handleApprove}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
          onDelete={handleDelete}
          onRoleChange={handleRoleChange}
        />
      )}
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
    </AdminLayout>
  );
}

<<<<<<< HEAD
function actionBtn(color) {
  return {
    padding: '4px 10px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500'
  };
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
  verticalAlign: 'middle'
};

export default UserManagementPage;
=======
export default UserManagementPage;
>>>>>>> 34989d76b78d03033b43aa7bad422808243e5249
