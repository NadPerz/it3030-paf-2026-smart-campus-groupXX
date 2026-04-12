import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Design tokens ───────────────────────────────────────────────────────────

const ROLE_BADGE = {
  USER:       { bg: '#EFF6FF', text: '#1E40AF' },
  ADMIN:      { bg: '#F5F3FF', text: '#6D28D9' },
  TECHNICIAN: { bg: '#F0FDF4', text: '#15803D' },
};

const STATUS_BADGE = {
  ACTIVE:    { bg: '#F0FDF4', text: '#166534' },
  PENDING:   { bg: '#FFFBEB', text: '#92400E' },
  SUSPENDED: { bg: '#FEF2F2', text: '#991B1B' },
};

// ─── Page ────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const response = await api.put('/users/profile', { name });
      login({ ...user, name: response.data.name });
      setSuccess(true);
      setEditing(false);
    } catch (err) {
      setError('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setName(user?.name || '');
    setError(null);
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  if (!user) return null;

  const roleBadge   = ROLE_BADGE[user.role]   || ROLE_BADGE.USER;
  const statusBadge = STATUS_BADGE[user.status] || STATUS_BADGE.ACTIVE;
  const initial     = (user.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase();

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] py-10"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="mx-auto px-4" style={{ maxWidth: '600px' }}>

        {/* ── Back link ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[14px] text-[#1D4ED8] hover:text-[#1E40AF] transition-colors mb-6"
        >
          ← Back
        </button>

        {/* ── Profile header card ── */}
        <div className="bg-white rounded-[12px] p-6 flex items-center gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

          {/* Avatar + role badge */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="profile"
                className="rounded-full object-cover"
                style={{ width: '96px', height: '96px', border: '3px solid #1D4ED8' }}
              />
            ) : (
              <div
                className="rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold"
                style={{ width: '96px', height: '96px', border: '3px solid #1D4ED8', fontSize: '32px' }}
              >
                {initial}
              </div>
            )}
            <span
              className="text-[12px] font-semibold rounded-full px-3 py-0.5"
              style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}
            >
              {user.role || 'USER'}
            </span>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <div className="text-[20px] font-bold text-[#111827] leading-tight truncate">
              {user.name || '—'}
            </div>
            <div className="text-[14px] text-[#6B7280] mt-1 truncate">{user.email}</div>
            <div className="text-[11px] text-[#9CA3AF] italic mt-0.5">
              (Profile picture managed by Google)
            </div>
            <div className="mt-2">
              <span
                className="inline-block text-[12px] font-semibold rounded-full px-3 py-0.5"
                style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
              >
                {user.status || 'ACTIVE'}
              </span>
            </div>
            <div className="text-[12px] text-[#9CA3AF] mt-1.5">
              Member since {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        {/* ── Edit form card ── */}
        <div className="bg-white rounded-[12px] p-6 mt-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

          {/* Section label */}
          <div
            className="text-[12px] font-semibold uppercase text-[#9CA3AF] mb-5"
            style={{ letterSpacing: '0.8px' }}
          >
            EDIT PROFILE
          </div>

          <div className="flex flex-col gap-5">

            {/* Display Name */}
            <div>
              <label
                className="block text-[12px] font-semibold uppercase text-[#6B7280] mb-1.5"
                style={{ letterSpacing: '0.5px' }}
              >
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                  className="w-full border-[1.5px] border-[#E5E7EB] rounded-lg text-[14px] text-[#111827] bg-white outline-none transition-colors focus:border-[#1D4ED8]"
                  style={{ height: '44px', padding: '0 12px' }}
                />
              ) : (
                <div className="text-[14px] text-[#111827]">{user.name || '—'}</div>
              )}
            </div>

            {/* Email — read-only */}
            <div>
              <label
                className="block text-[12px] font-semibold uppercase text-[#6B7280] mb-1.5"
                style={{ letterSpacing: '0.5px' }}
              >
                Email (managed by Google)
              </label>
              <div className="text-[14px] text-[#9CA3AF]">{user.email}</div>
            </div>

            {/* Role — read-only */}
            <div>
              <label
                className="block text-[12px] font-semibold uppercase text-[#6B7280] mb-1.5"
                style={{ letterSpacing: '0.5px' }}
              >
                Role (assigned by admin)
              </label>
              <span
                className="inline-block text-[12px] font-semibold rounded-full px-3 py-0.5"
                style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}
              >
                {user.role || 'USER'}
              </span>
            </div>

            {/* Member Since — read-only */}
            <div>
              <label
                className="block text-[12px] font-semibold uppercase text-[#6B7280] mb-1.5"
                style={{ letterSpacing: '0.5px' }}
              >
                Member Since
              </label>
              <div className="text-[14px] text-[#9CA3AF]">{formatDate(user.createdAt)}</div>
            </div>

            {/* Inline feedback */}
            {success && (
              <div className="text-[13px] font-semibold text-[#16A34A]">
                ✓ Name updated successfully!
              </div>
            )}
            {error && (
              <div className="text-[13px] text-[#DC2626]">{error}</div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1D4ED8] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-60"
                    style={{ width: '140px', height: '44px' }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="border-[1.5px] border-[#E5E7EB] text-[#374151] text-[14px] font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
                    style={{ width: '140px', height: '44px' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setEditing(true); setSuccess(false); }}
                  className="bg-[#1D4ED8] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors"
                  style={{ width: '140px', height: '44px' }}
                >
                  Edit Name
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
