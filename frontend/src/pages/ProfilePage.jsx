import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { bookingService } from "../services/bookingService";

const ROLE_BADGE = {
  USER:       { bg: "#EFF6FF", text: "#1E40AF" },
  ADMIN:      { bg: "#F5F3FF", text: "#6D28D9" },
  TECHNICIAN: { bg: "#F0FDF4", text: "#15803D" },
};
const STATUS_BADGE = {
  ACTIVE:    { bg: "#F0FDF4", text: "#166534" },
  PENDING:   { bg: "#FFFBEB", text: "#92400E" },
  SUSPENDED: { bg: "#FEF2F2", text: "#991B1B" },
};

const IcoDash = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IcoUser = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoCal = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoTicket = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/>
    <path d="M6 10V6a6 6 0 0 1 12 0v4"/>
  </svg>
);
const IcoChevron = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",       Icon: IcoDash,    path: "/profile" },
  { id: "overview",  label: "Profile Overview", Icon: IcoUser,    path: "/profile/overview" },
  { id: "edit",      label: "Edit Profile",     Icon: IcoEdit,    path: "/profile/edit" },
  { id: "bookings",  label: "My Bookings",       Icon: IcoCal,     path: "/bookings",  external: true },
  { id: "tickets",   label: "My Tickets",        Icon: IcoTicket,  path: "/tickets",   external: true },
];

function tabFromPath(p) {
  if (p === "/profile/edit")     return "edit";
  if (p === "/profile/overview") return "overview";
  return "dashboard";
}

function StatCard({ label, value, accent, icon, onClick, loading }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? accent.bg2 : "#FFF", border: `1.5px solid ${hover ? accent.border2 : "#E8EDF3"}`, borderRadius:14, padding:"18px 20px", cursor:"pointer", transition:"all 0.18s", boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:accent.icon, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
        <span style={{ color: hover ? accent.text : "#CBD5E1", transition:"color 0.18s" }}><IcoArrow /></span>
      </div>
      <div style={{ marginTop:12, fontSize:30, fontWeight:800, color:"#0F172A", lineHeight:1 }}>
        {loading ? <span style={{ fontSize:20, color:"#CBD5E1" }}>—</span> : value}
      </div>
      <div style={{ fontSize:12, color:"#64748B", marginTop:5, fontWeight:500 }}>{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState(() => tabFromPath(location.pathname));
  useEffect(() => setActiveTab(tabFromPath(location.pathname)), [location.pathname]);

  const [name,    setName]    = useState(user?.name  || "");
  const [phone,   setPhone]   = useState(user?.phone || "");
  const [bio,     setBio]     = useState(user?.bio   || "");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);

  const [bookings, setBookings] = useState([]);
  const [loadingB, setLoadingB] = useState(true);

  useEffect(() => {
    bookingService.getMyBookings()
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoadingB(false));
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true); setSuccess(false); setError(null);
    try {
      const { data } = await api.put("/users/profile", { name, phone, bio });
      login({ ...user, name: data.name, phone: data.phone, bio: data.bio });
      setSuccess(true);
    } catch { setError("Failed to update. Please try again."); }
    finally   { setSaving(false); }
  }
  function handleDiscard() {
    setName(user?.name || ""); setPhone(user?.phone || ""); setBio(user?.bio || "");
    setError(null); setSuccess(false);
  }
  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  }

  if (!user) return null;

  const roleBadge   = ROLE_BADGE[user.role]     || ROLE_BADGE.USER;
  const statusBadge = STATUS_BADGE[user.status] || STATUS_BADGE.ACTIVE;
  const initial     = (user.name?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase();

  const total     = bookings.length;
  const approved  = bookings.filter(b => b.status === "APPROVED").length;
  const pending   = bookings.filter(b => b.status === "PENDING").length;
  const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
  const rejected  = bookings.filter(b => b.status === "REJECTED").length;
  const recent    = [...bookings].sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,4);

  const cardBase = {
    flex:1, minHeight:0, background:"white", borderRadius:16,
    boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex",
    flexDirection:"column", overflow:"hidden",
  };

  return (
    <>
      <style>{`
        html,body{overflow:hidden!important;height:100%;margin:0;padding:0;}
        .ds::-webkit-scrollbar{width:5px;}
        .ds::-webkit-scrollbar-track{background:transparent;}
        .ds::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:10px;}
      `}</style>

      <div style={{ fontFamily:"Inter,system-ui,sans-serif", background:"#F1F5F9", height:"calc(100vh - 65px)", overflow:"hidden", display:"flex", flexDirection:"column", padding:"32px 0", boxSizing:"border-box" }}>
        <div style={{ maxWidth:1200, width:"100%", margin:"0 auto", padding:"0 24px", flex:1, minHeight:0, display:"flex", gap:24, alignItems:"stretch", boxSizing:"border-box" }}>

          {/* ════ SIDEBAR ════ */}
          <aside style={{ width:230, flexShrink:0, background:"white", borderRadius:16, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", flexDirection:"column" }}>
            <div style={{ background:"linear-gradient(160deg,#0F172A 0%,#1E3A5F 100%)", borderRadius:"16px 16px 0 0", display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"32px 20px", flexShrink:0 }}>
              {user.profilePicture
                ? <img src={user.profilePicture} alt="avatar" style={{ width:68,height:68,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.2)" }} />
                : <div style={{ width:68,height:68,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"3px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold",fontSize:26 }}>{initial}</div>
              }
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"white",fontWeight:600,fontSize:15,lineHeight:1.3 }}>{user.name||"—"}</div>
                <div style={{ fontSize:11.5,marginTop:2,color:"rgba(255,255,255,0.45)",maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.email}</div>
              </div>
              <span style={{ background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",fontSize:11,fontWeight:600,borderRadius:9999,padding:"2px 12px" }}>{user.role||"USER"}</span>
            </div>
            <div style={{ height:1,background:"#F1F5F9",flexShrink:0 }} />
            <nav style={{ display:"flex",flexDirection:"column",padding:"8px 0",flex:1 }}>
              {NAV_ITEMS.map(item => {
                const active = !item.external && activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => navigate(item.path)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 20px",fontSize:13.5,fontWeight:500,width:"100%",textAlign:"left",border:"none",cursor:"pointer",color:active?"#1D4ED8":"#4B5563",background:active?"#EFF6FF":"transparent",borderLeft:active?"3px solid #1D4ED8":"3px solid transparent",transition:"all 0.15s" }}>
                    <span style={{ color:active?"#1D4ED8":"#9CA3AF" }}><item.Icon /></span>
                    <span>{item.label}</span>
                    {item.external && <span style={{ marginLeft:"auto",color:"#D1D5DB" }}><IcoChevron /></span>}
                  </button>
                );
              })}
            </nav>
            <div style={{ borderTop:"1px solid #F1F5F9",padding:"16px 20px",flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,background:user.status==="ACTIVE"?"#22C55E":"#F59E0B",display:"inline-block" }} />
                <span style={{ fontSize:12,fontWeight:500,color:"#6B7280" }}>{user.status||"ACTIVE"}</span>
              </div>
              <div style={{ fontSize:11,color:"#9CA3AF",marginTop:2 }}>Member since {formatDate(user.createdAt)}</div>
            </div>
          </aside>

          {/* ════ MAIN ════ */}
          <main style={{ flex:1,minWidth:0,minHeight:0,display:"flex",flexDirection:"column" }}>

            {/* ══ DASHBOARD ══ */}
            {activeTab === "dashboard" && (
              <div style={{ ...cardBase }}>
                <div style={{ padding:"24px 28px 0",flexShrink:0 }}>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:20,fontWeight:800,color:"#0F172A",letterSpacing:"-0.3px" }}>Good day, {user.name?.split(" ")[0]||"there"}</div>
                    <div style={{ fontSize:13,color:"#64748B",marginTop:2 }}>Here's your Smart Campus overview</div>
                  </div>
                  <div style={{ height:1,background:"#F1F5F9" }} />
                </div>

                <div className="ds" style={{ flex:1,minHeight:0,overflowY:"auto",padding:"20px 28px 28px" }}>

                  {/* SECTION 1 — Booking Overview */}
                  <SL>Booking Overview</SL>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24 }}>
                    <StatCard label="Total Bookings" value={total} loading={loadingB} onClick={() => navigate("/bookings")}
                      accent={{ bg2:"#EFF6FF",border2:"#BFDBFE",icon:"#EFF6FF",text:"#1D4ED8" }}
                      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                    />
                    <StatCard label="Approved" value={approved} loading={loadingB} onClick={() => navigate("/bookings")}
                      accent={{ bg2:"#F0FDF4",border2:"#BBF7D0",icon:"#F0FDF4",text:"#15803D" }}
                      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    />
                    <StatCard label="Pending" value={pending} loading={loadingB} onClick={() => navigate("/bookings")}
                      accent={{ bg2:"#FFFBEB",border2:"#FDE68A",icon:"#FFFBEB",text:"#92400E" }}
                      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
                    />
                    <StatCard label="Cancelled" value={cancelled} loading={loadingB} onClick={() => navigate("/bookings")}
                      accent={{ bg2:"#F8FAFC",border2:"#E2E8F0",icon:"#F1F5F9",text:"#475569" }}
                      icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                    />
                  </div>

                  {/* SECTION 2 — Status Breakdown */}
                  {!loadingB && total > 0 && (
                    <>
                      <SL>Status Breakdown</SL>
                      <div onClick={() => navigate("/bookings")}
                        style={{ background:"white",border:"1.5px solid #E8EDF3",borderRadius:14,padding:"18px 20px",marginBottom:24,cursor:"pointer",transition:"box-shadow 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
                      >
                        <div style={{ display:"flex",gap:3,height:10,borderRadius:8,overflow:"hidden",marginBottom:14 }}>
                          {approved  > 0 && <div style={{ flex:approved,  background:"#22C55E" }} />}
                          {pending   > 0 && <div style={{ flex:pending,   background:"#F59E0B" }} />}
                          {rejected  > 0 && <div style={{ flex:rejected,  background:"#EF4444" }} />}
                          {cancelled > 0 && <div style={{ flex:cancelled, background:"#94A3B8" }} />}
                        </div>
                        <div style={{ display:"flex",gap:20,flexWrap:"wrap" }}>
                          {[
                            { label:"Approved",  n:approved,  dot:"#22C55E", pct:total?Math.round(approved/total*100):0  },
                            { label:"Pending",   n:pending,   dot:"#F59E0B", pct:total?Math.round(pending/total*100):0   },
                            { label:"Rejected",  n:rejected,  dot:"#EF4444", pct:total?Math.round(rejected/total*100):0  },
                            { label:"Cancelled", n:cancelled, dot:"#94A3B8", pct:total?Math.round(cancelled/total*100):0 },
                          ].map(x => (
                            <div key={x.label} style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <span style={{ width:8,height:8,borderRadius:"50%",background:x.dot,display:"inline-block",flexShrink:0 }} />
                              <span style={{ fontSize:12,color:"#64748B" }}>{x.label}</span>
                              <span style={{ fontSize:12,fontWeight:700,color:"#0F172A" }}>{x.n}</span>
                              <span style={{ fontSize:11,color:"#94A3B8" }}>({x.pct}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SECTION 3 — Recent Bookings */}
                  {!loadingB && recent.length > 0 && (
                    <>
                      <SL>Recent Bookings</SL>
                      <div style={{ background:"white",border:"1.5px solid #E8EDF3",borderRadius:14,overflow:"hidden" }}>
                        {recent.map((b,i) => {
                          const sc = { APPROVED:{bg:"#F0FDF4",text:"#15803D",dot:"#22C55E"}, PENDING:{bg:"#FFFBEB",text:"#92400E",dot:"#F59E0B"}, REJECTED:{bg:"#FEF2F2",text:"#991B1B",dot:"#EF4444"}, CANCELLED:{bg:"#F1F5F9",text:"#475569",dot:"#94A3B8"} };
                          const s = sc[b.status] || sc.CANCELLED;
                          return (
                            <div key={b.id} onClick={() => navigate("/bookings")}
                              style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:i<recent.length-1?"1px solid #F1F5F9":"none",cursor:"pointer",transition:"background 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                              onMouseLeave={e => e.currentTarget.style.background="transparent"}
                            >
                              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                                <div style={{ width:34,height:34,borderRadius:9,background:"#EFF6FF",border:"1px solid #BFDBFE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><IcoCal /></div>
                                <div>
                                  <div style={{ fontSize:13,fontWeight:600,color:"#0F172A" }}>{b.resourceName}</div>
                                  <div style={{ fontSize:11,color:"#94A3B8",marginTop:1 }}>{b.bookingDate} · {b.startTime?.substring(0,5)} – {b.endTime?.substring(0,5)}</div>
                                </div>
                              </div>
                              <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:s.bg,color:s.text }}>
                                <span style={{ width:5,height:5,borderRadius:"50%",background:s.dot,display:"inline-block" }} />{b.status}
                              </span>
                            </div>
                          );
                        })}
                        <div onClick={() => navigate("/bookings")}
                          style={{ padding:"12px 20px",textAlign:"center",fontSize:12,fontWeight:600,color:"#1D4ED8",cursor:"pointer",borderTop:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}
                          onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}
                        >
                          View all bookings <IcoArrow />
                        </div>
                      </div>
                    </>
                  )}

                  {!loadingB && total === 0 && (
                    <div style={{ textAlign:"center",padding:"40px 0",color:"#94A3B8",fontSize:13 }}>
                      No bookings yet. <span style={{ color:"#1D4ED8",cursor:"pointer" }} onClick={() => navigate("/bookings")}>Make your first booking →</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ PROFILE OVERVIEW ══ */}
            {activeTab === "overview" && (
              <div style={{ ...cardBase }}>
                <div className="ds" style={{ flex:1,minHeight:0,overflowY:"auto" }}>
                  <div style={{ padding:"28px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:16,paddingBottom:20,borderBottom:"1px solid #F1F5F9",marginBottom:20 }}>
                      {user.profilePicture
                        ? <img src={user.profilePicture} alt="avatar" style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid #E8EDF3",flexShrink:0 }} />
                        : <div style={{ width:72,height:72,borderRadius:"50%",background:"#1D4ED8",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold",fontSize:26,flexShrink:0 }}>{initial}</div>
                      }
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:20,fontWeight:700,color:"#0F172A",lineHeight:1.2 }}>{user.name||"—"}</div>
                        <div style={{ fontSize:13,color:"#6B7280",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.email}</div>
                      </div>
                      <span style={{ display:"inline-block",fontSize:12,fontWeight:600,borderRadius:9999,padding:"4px 12px",backgroundColor:statusBadge.bg,color:statusBadge.text,flexShrink:0 }}>{user.status||"ACTIVE"}</span>
                    </div>
                    {user.bio
                      ? <p style={{ fontSize:14,color:"#4B5563",lineHeight:1.7,marginBottom:20 }}>{user.bio}</p>
                      : <p style={{ fontSize:13,color:"#D1D5DB",fontStyle:"italic",marginBottom:20 }}>No bio added yet.</p>
                    }
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px 32px" }}>
                      <InfoRow label="Role"><span style={{ display:"inline-block",fontSize:12,fontWeight:600,borderRadius:9999,padding:"2px 12px",backgroundColor:roleBadge.bg,color:roleBadge.text }}>{user.role||"USER"}</span></InfoRow>
                      <InfoRow label="Member Since"><span style={{ fontSize:14,color:"#374151" }}>{formatDate(user.createdAt)}</span></InfoRow>
                      <InfoRow label="Email"><span style={{ fontSize:14,color:"#374151",wordBreak:"break-all" }}>{user.email}</span></InfoRow>
                      <InfoRow label="Phone"><span style={{ fontSize:14,color:"#374151" }}>{user.phone||<span style={{ color:"#D1D5DB",fontStyle:"italic" }}>Not set</span>}</span></InfoRow>
                    </div>
                    <p style={{ fontSize:11,color:"#9CA3AF",fontStyle:"italic",marginTop:24 }}>(Profile picture managed by Google)</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ EDIT PROFILE ══ */}
            {activeTab === "edit" && (
              <div style={{ ...cardBase }}>
                <div style={{ padding:"28px 28px 0",flexShrink:0 }}>
                  <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#9CA3AF",letterSpacing:"1px",marginBottom:20 }}>Edit Profile</div>
                </div>
                <div className="ds" style={{ flex:1,minHeight:0,overflowY:"auto",padding:"0 28px 28px",display:"flex",flexDirection:"column",gap:20 }}>
                  <Field label="Display Name">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"
                      style={{ width:"100%",height:44,padding:"0 12px",border:"1.5px solid #E5E7EB",borderRadius:8,fontSize:14,color:"#111827",background:"white",outline:"none",boxSizing:"border-box" }}
                      onFocus={e=>(e.target.style.borderColor="#1D4ED8")}
                      onBlur={e =>(e.target.style.borderColor="#E5E7EB")}
                    />
                  </Field>
                  <Field label="Email (managed by Google)">
                    <div style={{ height:44,padding:"0 12px",border:"1.5px solid #F3F4F6",borderRadius:8,fontSize:14,color:"#9CA3AF",background:"#F9FAFB",display:"flex",alignItems:"center" }}>{user.email}</div>
                  </Field>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                    <Field label="Role (assigned by admin)">
                      <span style={{ display:"inline-block",fontSize:12,fontWeight:600,borderRadius:9999,padding:"2px 12px",backgroundColor:roleBadge.bg,color:roleBadge.text }}>{user.role||"USER"}</span>
                    </Field>
                    <Field label="Member Since">
                      <div style={{ fontSize:14,color:"#9CA3AF" }}>{formatDate(user.createdAt)}</div>
                    </Field>
                  </div>
                  {success && <div style={{ fontSize:13,fontWeight:600,color:"#16A34A" }}>✓ Profile updated successfully!</div>}
                  {error   && <div style={{ fontSize:13,color:"#DC2626" }}>{error}</div>}
                  <div style={{ marginTop:"auto",display:"flex",gap:12,paddingTop:8 }}>
                    <button onClick={handleSave} disabled={saving} style={{ width:140,height:44,background:saving?"#93C5FD":"#1D4ED8",color:"white",fontSize:14,fontWeight:600,borderRadius:8,border:"none",cursor:saving?"not-allowed":"pointer" }}>
                      {saving?"Saving…":"Save Changes"}
                    </button>
                    <button onClick={handleDiscard} disabled={saving} style={{ width:140,height:44,background:"white",color:"#374151",fontSize:14,fontWeight:600,borderRadius:8,border:"1.5px solid #E5E7EB",cursor:saving?"not-allowed":"pointer" }}>
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

function SL({ children }) {
  return <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",color:"#94A3B8",letterSpacing:"0.8px",marginBottom:10 }}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:"block",fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#6B7280",letterSpacing:"0.6px",marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}
function InfoRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",color:"#9CA3AF",letterSpacing:"0.5px",marginBottom:4 }}>{label}</div>
      {children}
    </div>
  );
}