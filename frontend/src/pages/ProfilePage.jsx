import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ─── Design tokens ────────────────────────────────────────────────────────────

const ROLE_BADGE = {
  USER: { bg: "#EFF6FF", text: "#1E40AF" },
  ADMIN: { bg: "#F5F3FF", text: "#6D28D9" },
  TECHNICIAN: { bg: "#F0FDF4", text: "#15803D" },
};

const STATUS_BADGE = {
  ACTIVE: { bg: "#F0FDF4", text: "#166534" },
  PENDING: { bg: "#FFFBEB", text: "#92400E" },
  SUSPENDED: { bg: "#FEF2F2", text: "#991B1B" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconOverview = () => (
  <svg
    width="17"
    height="17"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="17"
    height="17"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconBooking = () => (
  <svg
    width="17"
    height="17"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconTicket = () => (
  <svg
    width="17"
    height="17"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" />
    <path d="M6 10V6a6 6 0 0 1 12 0v4" />
  </svg>
);
const IconChevron = () => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const NAV_ITEMS = [
  { id: "overview", label: "Profile Overview", Icon: IconOverview },
  { id: "edit", label: "Edit Profile", Icon: IconEdit },
  {
    id: "bookings",
    label: "My Bookings",
    Icon: IconBooking,
    redirect: "/bookings",
  },
  {
    id: "tickets",
    label: "My Tickets",
    Icon: IconTicket,
    redirect: "/tickets",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const { data } = await api.put("/users/profile", { name, phone, bio });
      login({ ...user, name: data.name, phone: data.phone, bio: data.bio });
      setSuccess(true);
    } catch {
      setError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setBio(user?.bio || "");
    setError(null);
    setSuccess(false);
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (!user) return null;

  const roleBadge = ROLE_BADGE[user.role] || ROLE_BADGE.USER;
  const statusBadge = STATUS_BADGE[user.status] || STATUS_BADGE.ACTIVE;
  const initial = (
    user.name?.charAt(0) ||
    user.email?.charAt(0) ||
    "?"
  ).toUpperCase();

  function onNav(item) {
    if (item.redirect) {
      navigate(item.redirect);
      return;
    }
    setActiveTab(item.id);
    setSuccess(false);
    setError(null);
  }

  const PANEL_MIN_H = "560px";

  return (
    <div
      className="min-h-screen bg-[#F1F5F9] py-10"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: "1200px" }}>
        <div className="flex gap-6" style={{ alignItems: "stretch" }}>
          {/* ── Sidebar ── */}
          <aside
            className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] shrink-0 flex flex-col"
            style={{
              width: "230px",
              minHeight: PANEL_MIN_H,
              borderRadius: 16,
              position: "sticky",
              top: 40,
              alignSelf: "flex-start",
            }}
          >
            {/* Deep navy header */}
            <div
              className="flex flex-col items-center gap-3 px-5 py-8"
              style={{
                background: "linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)",
              }}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="avatar"
                  className="rounded-full object-cover"
                  style={{
                    width: "68px",
                    height: "68px",
                    border: "3px solid rgba(255,255,255,0.2)",
                  }}
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center text-white font-bold"
                  style={{
                    width: "68px",
                    height: "68px",
                    fontSize: "26px",
                    background: "rgba(255,255,255,0.1)",
                    border: "3px solid rgba(255,255,255,0.18)",
                  }}
                >
                  {initial}
                </div>
              )}
              <div className="text-center">
                <div className="text-white font-semibold text-[15px] leading-snug">
                  {user.name || "—"}
                </div>
                <div
                  className="text-[11.5px] mt-0.5 truncate"
                  style={{ color: "rgba(255,255,255,0.45)", maxWidth: "170px" }}
                >
                  {user.email}
                </div>
              </div>
              <span
                className="text-[11px] font-semibold rounded-full px-3 py-0.5"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {user.role || "USER"}
              </span>
            </div>

            <div style={{ height: "1px", background: "#F1F5F9" }} />

            {/* Nav items */}
            <nav className="flex flex-col py-2 flex-1">
              {NAV_ITEMS.map((item) => {
                const active = !item.redirect && activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNav(item)}
                    className="flex items-center gap-3 px-5 py-3 text-[13.5px] font-medium w-full text-left transition-all"
                    style={{
                      color: active ? "#1D4ED8" : "#4B5563",
                      background: active ? "#EFF6FF" : "transparent",
                      borderLeft: active
                        ? "3px solid #1D4ED8"
                        : "3px solid transparent",
                    }}
                  >
                    <span style={{ color: active ? "#1D4ED8" : "#9CA3AF" }}>
                      <item.Icon />
                    </span>
                    <span>{item.label}</span>
                    {item.redirect && (
                      <span className="ml-auto" style={{ color: "#D1D5DB" }}>
                        <IconChevron />
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom status */}
            <div
              className="px-5 py-4"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      user.status === "ACTIVE" ? "#22C55E" : "#F59E0B",
                    display: "inline-block",
                  }}
                />
                <span className="text-[12px] font-medium text-[#6B7280]">
                  {user.status || "ACTIVE"}
                </span>
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                Member since {formatDate(user.createdAt)}
              </div>
            </div>
          </aside>

          {/* ── Main panel ── */}
          <main className="flex-1 min-w-0">
            {/* ─── OVERVIEW ─── */}
            {activeTab === "overview" && (
              <div
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
                style={{ minHeight: PANEL_MIN_H }}
              >
                {/* Banner */}
                <div
                  style={{
                    height: "80px",
                    background: "linear-gradient(135deg)",
                    flexShrink: 0,
                  }}
                />

                <div
                  className="px-7 flex-1 flex flex-col"
                  style={{ marginTop: "-44px" }}
                >
                  {/* Avatar row */}
                  <div className="flex items-end gap-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="avatar"
                        className="rounded-full object-cover shrink-0"
                        style={{
                          width: "88px",
                          height: "88px",
                          border: "4px solid white",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold shrink-0"
                        style={{
                          width: "88px",
                          height: "88px",
                          border: "4px solid white",
                          fontSize: "30px",
                        }}
                      >
                        {initial}
                      </div>
                    )}
                    <div className="pb-2 flex-1 min-w-0">
                      <div className="text-[22px] font-bold text-[#0F172A] leading-tight">
                        {user.name || "—"}
                      </div>
                      <div className="text-[13px] text-[#6B7280] truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="pb-2 shrink-0">
                      <span
                        className="inline-block text-[12px] font-semibold rounded-full px-3 py-1"
                        style={{
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.text,
                        }}
                      >
                        {user.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio ? (
                    <p className="mt-5 text-[14px] text-[#4B5563] leading-relaxed">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="mt-5 text-[13px] text-[#D1D5DB] italic">
                      No bio added yet.
                    </p>
                  )}

                  {/* Info grid */}
                  <div
                    className="grid gap-x-8 gap-y-5 mt-6 pt-5 pb-8"
                    style={{
                      borderTop: "1px solid #F1F5F9",
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    <InfoRow label="Role">
                      <span
                        className="inline-block text-[12px] font-semibold rounded-full px-3 py-0.5"
                        style={{
                          backgroundColor: roleBadge.bg,
                          color: roleBadge.text,
                        }}
                      >
                        {user.role || "USER"}
                      </span>
                    </InfoRow>

                    <InfoRow label="Member Since">
                      <span className="text-[14px] text-[#374151]">
                        {formatDate(user.createdAt)}
                      </span>
                    </InfoRow>

                    <InfoRow label="Email">
                      <span className="text-[14px] text-[#374151] break-all">
                        {user.email}
                      </span>
                    </InfoRow>

                    <InfoRow label="Phone">
                      <span className="text-[14px] text-[#374151]">
                        {user.phone || (
                          <span className="text-[#D1D5DB] italic">Not set</span>
                        )}
                      </span>
                    </InfoRow>
                  </div>

                  <p className="text-[11px] text-[#9CA3AF] italic pb-6">
                    (Profile picture managed by Google)
                  </p>
                </div>
              </div>
            )}

            {/* ─── EDIT PROFILE ─── */}
            {activeTab === "edit" && (
              <div
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-7 flex flex-col"
                style={{ minHeight: PANEL_MIN_H }}
              >
                <div
                  className="text-[11px] font-semibold uppercase text-[#9CA3AF] mb-6"
                  style={{ letterSpacing: "1px" }}
                >
                  Edit Profile
                </div>

                <div className="flex flex-col gap-5 flex-1">
                  <Field label="Display Name">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full border-[1.5px] border-[#E5E7EB] rounded-lg text-[14px] text-[#111827] bg-white outline-none focus:border-[#1D4ED8] transition-colors"
                      style={{ height: "44px", padding: "0 12px" }}
                    />
                  </Field>

                  <Field label="Email (managed by Google)">
                    <div
                      className="w-full border-[1.5px] border-[#F3F4F6] rounded-lg text-[14px] text-[#9CA3AF] bg-[#F9FAFB] flex items-center"
                      style={{ height: "44px", padding: "0 12px" }}
                    >
                      {user.email}
                    </div>
                  </Field>

                  <div
                    className="grid gap-5"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    <Field label="Role (assigned by admin)">
                      <span
                        className="inline-block text-[12px] font-semibold rounded-full px-3 py-0.5"
                        style={{
                          backgroundColor: roleBadge.bg,
                          color: roleBadge.text,
                        }}
                      >
                        {user.role || "USER"}
                      </span>
                    </Field>

                    <Field label="Member Since">
                      <div className="text-[14px] text-[#9CA3AF]">
                        {formatDate(user.createdAt)}
                      </div>
                    </Field>
                  </div>

                  {success && (
                    <div className="text-[13px] font-semibold text-[#16A34A]">
                      ✓ Profile updated successfully!
                    </div>
                  )}
                  {error && (
                    <div className="text-[13px] text-[#DC2626]">{error}</div>
                  )}

                  <div className="flex gap-3 pt-2 mt-auto">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#1D4ED8] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-60"
                      style={{ width: "140px", height: "44px" }}
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={handleDiscard}
                      disabled={saving}
                      className="border-[1.5px] border-[#E5E7EB] text-[#374151] text-[14px] font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
                      style={{ width: "140px", height: "44px" }}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label
        className="block text-[11px] font-semibold uppercase text-[#6B7280] mb-1.5"
        style={{ letterSpacing: "0.6px" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div>
      <div
        className="text-[11px] font-semibold uppercase text-[#9CA3AF] mb-1"
        style={{ letterSpacing: "0.5px" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
