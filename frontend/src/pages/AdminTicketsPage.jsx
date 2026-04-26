import { useEffect, useState } from "react";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer,
} from "recharts";

// ── Icons ──────────────────────────────────────────────────────────────
const CheckIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TrashIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const EyeIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ── Color maps ─────────────────────────────────────────────────────────
const STATUS_COLORS  = { OPEN:"#004085", IN_PROGRESS:"#92400e", RESOLVED:"#14532d", CLOSED:"#374151", REJECTED:"#7f1d1d" };
const STATUS_BG      = { OPEN:"#dbeafe", IN_PROGRESS:"#fef3c7", RESOLVED:"#dcfce7", CLOSED:"#f3f4f6", REJECTED:"#fee2e2" };
const STATUS_DOT     = { OPEN:"#3b82f6", IN_PROGRESS:"#f59e0b", RESOLVED:"#22c55e", CLOSED:"#9ca3af", REJECTED:"#ef4444" };
const PRIORITY_COLOR = { LOW:"#16a34a", MEDIUM:"#d97706", HIGH:"#dc2626", CRITICAL:"#7c3aed" };
const PRIORITY_BG    = { LOW:"#dcfce7", MEDIUM:"#fef3c7", HIGH:"#fee2e2", CRITICAL:"#ede9fe" };
const CHART_STATUS   = { OPEN:"#3b82f6", IN_PROGRESS:"#f59e0b", RESOLVED:"#22c55e", CLOSED:"#9ca3af", REJECTED:"#ef4444" };
const CHART_PRIORITY = { LOW:"#22c55e", MEDIUM:"#f59e0b", HIGH:"#f97316", CRITICAL:"#7c3aed" };

// ── Shared small button ────────────────────────────────────────────────
function Btn({ onClick, bg, color, border, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        display:"inline-flex", alignItems:"center", gap:5,
        padding:"5px 11px", borderRadius:7, fontSize:11, fontWeight:700,
        cursor: disabled ? "not-allowed" : "pointer",
        background: bg, color, border:`1px solid ${border}`,
        whiteSpace:"nowrap", opacity: disabled ? 0.6 : 1, transition:"opacity 0.15s",
      }}>
      {children}
    </button>
  );
}

// ── Status / Priority chips ────────────────────────────────────────────
const Chip = ({ label, status, type = "status" }) => {
  const colors = type === "status"
    ? { bg: STATUS_BG[status],   color: STATUS_COLORS[status],  dot: STATUS_DOT[status] }
    : { bg: PRIORITY_BG[status], color: PRIORITY_COLOR[status], dot: PRIORITY_COLOR[status] };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:colors.bg, color:colors.color, padding:"3px 10px", borderRadius:20, fontSize:"0.7rem", fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:colors.dot, flexShrink:0 }} />
      {label}
    </span>
  );
};

// ── Modal wrapper ──────────────────────────────────────────────────────
const Modal = ({ children, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div style={{ background:"white", borderRadius:16, padding:30, width:"100%", maxWidth:480, boxShadow:"0 24px 60px rgba(0,0,0,0.18)" }}>
      {children}
    </div>
  </div>
);

// ── Chart helpers ──────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background:"white", border:"1px solid #f0f0f0", borderRadius:14, padding:"22px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", ...style }}>
    {children}
  </div>
);
const ChartTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom:18 }}>
    <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#111827" }}>{title}</div>
    {subtitle && <div style={{ fontSize:"0.78rem", color:"#9ca3af", marginTop:3 }}>{subtitle}</div>}
  </div>
);
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:10, padding:"12px 16px", fontSize:"0.82rem", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
      <div style={{ fontWeight:700, marginBottom:6, color:"#111827" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color:p.color, marginTop:3, display:"flex", gap:6 }}>
          <span>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
export default function AdminTicketsPage() {
  const [tickets, setTickets]           = useState([]);
  const [technicians, setTechnicians]   = useState([]);   // ← NEW
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("Tickets");
  const [filter, setFilter]             = useState({ status:"", priority:"", category:"", search:"" });
  const [rejectModal, setRejectModal]   = useState(null);
  const [assignModal, setAssignModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    ticketService.getAllTickets()
      .then((r) => {
        const sorted = [...r.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // ── On mount: load tickets + fetch all users, filter TECHNICIAN role ──
  useEffect(() => {
    load();
    userService.getAllUsers()
      .then((r) => {
        const techs = r.data.filter((u) => u.role === "TECHNICIAN");
        setTechnicians(techs);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = tickets.filter((t) =>
    (!filter.status   || t.status   === filter.status)   &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.category || t.category === filter.category) &&
    (!filter.search   ||
      t.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.userName?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  // ── Actions ────────────────────────────────────────────────────────────
  const handleApproveAndAssign = async () => {
    if (!selectedTech) { alert("Please select a technician"); return; }
    setActionLoading(true);
    try {
      const tech = technicians.find((t) => t.id === selectedTech); // ← uses state
      await ticketService.assignTechnician(assignModal.id, { technicianId: tech.id, technicianName: tech.name });
      setAssignModal(null); setSelectedTech(""); load();
    } catch { alert("Failed to assign technician"); }
    setActionLoading(false);
  };
  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Please enter a rejection reason"); return; }
    setActionLoading(true);
    try {
      await ticketService.rejectTicket(rejectModal.id, { reason: rejectReason });
      setRejectModal(null); setRejectReason(""); load();
    } catch { alert("Failed to reject ticket"); }
    setActionLoading(false);
  };
  const handleResolve = async (id) => {
    if (!window.confirm("Mark this ticket as resolved?")) return;
    try { await ticketService.updateStatus(id, { status:"RESOLVED" }); load(); } catch { alert("Failed"); }
  };
  const handleClose = async (id) => {
    if (!window.confirm("Close this ticket?")) return;
    try { await ticketService.updateStatus(id, { status:"CLOSED" }); load(); } catch { alert("Failed"); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this ticket?")) return;
    try { await ticketService.deleteTicket(id); load(); } catch { alert("Failed"); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    total:      tickets.length,
    open:       tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved:   tickets.filter((t) => t.status === "RESOLVED").length,
    rejected:   tickets.filter((t) => t.status === "REJECTED").length,
    closed:     tickets.filter((t) => t.status === "CLOSED").length,
    critical:   tickets.filter((t) => t.priority === "CRITICAL").length,
  };

  // ── Chart data ─────────────────────────────────────────────────────────
  const statusData   = ["OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"].map((s) => ({ name: s.replace("_"," "), value: tickets.filter((t) => t.status === s).length, color: CHART_STATUS[s] })).filter((d) => d.value > 0);
  const priorityData = ["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => ({ name: p, value: tickets.filter((t) => t.priority === p).length, color: CHART_PRIORITY[p] })).filter((d) => d.value > 0);
  const categoryData = ["ELECTRICAL","PLUMBING","IT","HVAC","GENERAL"].map((c) => ({
    name: c,
    Total:    tickets.filter((t) => t.category === c).length,
    Resolved: tickets.filter((t) => t.category === c && t.status === "RESOLVED").length,
    Open:     tickets.filter((t) => t.category === c && t.status === "OPEN").length,
  })).filter((d) => d.Total > 0);

  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length:6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = d.toLocaleString("default", { month:"short", year:"2-digit" });
      const mt = tickets.filter((t) => {
        if (!t.createdAt) return false;
        const td = new Date(t.createdAt);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      return { month:label, Total:mt.length, Resolved:mt.filter((t) => t.status === "RESOLVED").length, Open:mt.filter((t) => t.status === "OPEN").length };
    });
  })();

  const withAI         = tickets.filter((t) => t.aiTriage);
  const aiMatch        = withAI.filter((t) => t.aiTriage?.suggestedPriority === t.priority).length;
  const aiAccuracy     = withAI.length > 0 ? Math.round((aiMatch / withAI.length) * 100) : 0;
  const resolutionRate = stats.total > 0   ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const facultyData = (() => {
    const faculties = [...new Set(tickets.map((t) => t.faculty).filter(Boolean))];
    return faculties.map((f) => ({
      name:     f.replace("Faculty of ","").replace("School of ",""),
      Total:    tickets.filter((t) => t.faculty === f).length,
      Resolved: tickets.filter((t) => t.faculty === f && t.status === "RESOLVED").length,
    })).sort((a, b) => b.Total - a.Total);
  })();

  const th = { padding:"10px 14px", fontSize:11, fontWeight:700, color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:"0.7px", whiteSpace:"nowrap", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" };
  const td = { padding:"12px 14px", fontSize:13, verticalAlign:"middle", borderBottom:"1px solid #f8fafc" };

  // ════════════════════════════════════════════════════════════════════
  return (
    <div>

      {/* HEADER */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:"1.5rem", fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>Incident Tickets</h2>
        <p style={{ margin:"4px 0 0", color:"#94a3b8", fontSize:"0.875rem" }}>Review, approve, assign and resolve campus incident reports</p>
      </div>

      {/* STAT CARDS */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
      {[
        { label:'Total Tickets', value:stats.total,      numColor:'#1d4ed8', bg:'#eff6ff',  border:'#1d4ed8' },
        { label:'Open',          value:stats.open,       numColor:'#d97706', bg:'#fffbeb',  border:'#d97706' },
        { label:'In Progress',   value:stats.inProgress, numColor:'#0e7490', bg:'#ecfeff',  border:'#0e7490' },
        { label:'Resolved',      value:stats.resolved,   numColor:'#16a34a', bg:'#f0fdf4',  border:'#16a34a' },
        { label:'Critical',      value:stats.critical,   numColor:'#7c3aed', bg:'#f5f3ff',  border:'#7c3aed' },
       ].map(s => (
    <div key={s.label} style={{
      background: s.bg,
      borderRadius: 10,
      padding: '16px 20px',
      borderLeft: `4px solid ${s.border}`,
    }}>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:6, fontWeight:500 }}>{s.label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:s.numColor, lineHeight:1 }}>{s.value}</div>
    </div>
  ))}
  </div>

      {/* OPEN TICKETS ALERT */}
      {stats.open > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"#fefce8", border:"1px solid #fde68a", borderRadius:10, marginBottom:18 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:13, color:"#92400e", flex:1 }}>
            {stats.open} open ticket{stats.open > 1 ? "s" : ""} waiting for approval
          </span>
          <button onClick={() => { setActiveTab("Tickets"); setFilter((f) => ({ ...f, status:"OPEN" })); }}
            style={{ padding:"5px 14px", background:"#92400e", color:"#fff", border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Review Now
          </button>
        </div>
      )}

      {/* TABS */}
      <div style={{ display:"flex", borderBottom:"2px solid #e5e7eb", marginBottom:24 }}>
        {[
          { key:"Tickets",   label:"Tickets",   count:stats.total },
          { key:"Analytics", label:"Analytics", count:null },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding:"10px 24px", fontSize:"0.875rem", fontWeight:600, border:"none", background:"none", cursor:"pointer",
            color: activeTab === tab.key ? "#1d4ed8" : "#6b7280",
            borderBottom: activeTab === tab.key ? "2px solid #1d4ed8" : "2px solid transparent",
            marginBottom:"-2px", transition:"all 0.15s", display:"flex", alignItems:"center", gap:8,
          }}>
            {tab.label}
            {tab.count !== null && (
              <span style={{ background: activeTab === tab.key ? "#dbeafe" : "#f3f4f6", color: activeTab === tab.key ? "#1d4ed8" : "#6b7280", padding:"1px 8px", borderRadius:20, fontSize:"0.72rem", fontWeight:700 }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TICKETS TAB ══ */}
      {activeTab === "Tickets" && (
        <>
          {/* Quick filter pills */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {[
              { label:"All",         value:"",            count:stats.total      },
              { label:"Open",        value:"OPEN",        count:stats.open       },
              { label:"In Progress", value:"IN_PROGRESS", count:stats.inProgress },
              { label:"Resolved",    value:"RESOLVED",    count:stats.resolved   },
              { label:"Rejected",    value:"REJECTED",    count:stats.rejected   },
              { label:"Closed",      value:"CLOSED",      count:stats.closed     },
            ].map((tab) => (
              <button key={tab.value} onClick={() => setFilter((f) => ({ ...f, status:tab.value }))} style={{
                padding:"6px 14px", borderRadius:20, fontSize:"0.8rem", fontWeight:600, cursor:"pointer",
                border: filter.status === tab.value ? "none" : "1px solid #e5e7eb",
                background: filter.status === tab.value ? "#1d4ed8" : "white",
                color: filter.status === tab.value ? "white" : "#374151",
                boxShadow: filter.status === tab.value ? "0 2px 8px rgba(29,78,216,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
                transition:"all 0.15s", display:"flex", alignItems:"center", gap:6,
              }}>
                {tab.label}
                <span style={{
                  padding:"1px 6px", borderRadius:10, fontSize:"0.7rem", fontWeight:700,
                  background: filter.status === tab.value ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                  color: filter.status === tab.value ? "white" : "#6b7280",
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search & filter bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:12, flexWrap:"wrap" }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <select value={filter.priority} onChange={(e) => setFilter((f) => ({ ...f, priority:e.target.value }))}
                style={{ padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, color:"#0f172a", outline:"none", background:"#f8fafc", fontFamily:"inherit", cursor:"pointer" }}>
                <option value="">All Priorities</option>
                {["LOW","MEDIUM","HIGH","CRITICAL"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category:e.target.value }))}
                style={{ padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, color:"#0f172a", outline:"none", background:"#f8fafc", fontFamily:"inherit", cursor:"pointer" }}>
                <option value="">All Categories</option>
                {["ELECTRICAL","PLUMBING","IT","HVAC","GENERAL"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {(filter.status || filter.priority || filter.category || filter.search) && (
                <button onClick={() => setFilter({ status:"", priority:"", category:"", search:"" })}
                  style={{ padding:"8px 14px", background:"#f8fafc", color:"#475569", border:"1px solid #e2e8f0", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  Clear all
                </button>
              )}
            </div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}><SearchIcon /></span>
              <input
                placeholder="Search by title or reporter..."
                value={filter.search}
                onChange={(e) => setFilter((f) => ({ ...f, search:e.target.value }))}
                style={{ padding:"8px 12px 8px 32px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, color:"#0f172a", outline:"none", width:250, background:"#f8fafc", fontFamily:"inherit" }}
              />
            </div>
          </div>

          {/* ── ASSIGN MODAL ── */}
          {assignModal && (
            <Modal onClose={() => { setAssignModal(null); setSelectedTech(""); }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>✅</div>
                <div>
                  <h3 style={{ margin:0, fontSize:"1.05rem", fontWeight:700, color:"#0f172a" }}>Approve & Assign Technician</h3>
                  <p style={{ margin:0, color:"#94a3b8", fontSize:"0.82rem" }}>Ticket will move to In Progress</p>
                </div>
              </div>
              <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:16, border:"1px solid #f0f0f0", fontSize:13 }}>
                <div style={{ fontWeight:700, color:"#0f172a", marginBottom:8 }}>{assignModal.title}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, fontSize:12, color:"#64748b" }}>
                  <div>Reporter: <strong style={{ color:"#334155" }}>{assignModal.userName}</strong></div>
                  <div>Location: <strong style={{ color:"#334155" }}>{assignModal.location}</strong></div>
                  <div>Category: <strong style={{ color:"#334155" }}>{assignModal.category}</strong></div>
                  <div>Priority: <strong style={{ color:PRIORITY_COLOR[assignModal.priority] }}>{assignModal.priority}</strong></div>
                </div>
              </div>
              {assignModal.aiTriage && (
                <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:"0.82rem", color:"#1d4ed8" }}>
                  🤖 AI suggests <strong>{assignModal.aiTriage.suggestedPriority}</strong> priority — {assignModal.aiTriage.recommendedAction}
                </div>
              )}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Assign Technician *
                </label>

                {/* ── DYNAMIC TECHNICIAN DROPDOWN ── */}
                <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none", background:"#f8fafc", fontFamily:"inherit", color:"#0f172a" }}>
                  <option value="">-- Select Technician --</option>
                  {technicians.length === 0
                    ? <option disabled>No technicians available</option>
                    : technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} — {t.email}</option>
                      ))
                  }
                </select>

                {/* helpful hint if empty */}
                {technicians.length === 0 && (
                  <p style={{ margin:"6px 0 0", fontSize:11, color:"#f59e0b" }}>
                    ⚠ No users have the TECHNICIAN role yet. Assign the role from the Users page first.
                  </p>
                )}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleApproveAndAssign} disabled={actionLoading}
                  style={{ flex:1, padding:11, borderRadius:9, border:"none", background:"#16a34a", color:"white", fontWeight:700, cursor:"pointer", fontSize:"0.88rem", boxShadow:"0 2px 8px rgba(22,163,74,0.3)" }}>
                  {actionLoading ? "Assigning..." : "Approve & Assign"}
                </button>
                <button onClick={() => { setAssignModal(null); setSelectedTech(""); }}
                  style={{ flex:1, padding:11, borderRadius:9, border:"1px solid #e2e8f0", background:"white", color:"#374151", fontWeight:600, cursor:"pointer", fontSize:"0.88rem" }}>
                  Cancel
                </button>
              </div>
            </Modal>
          )}

          {/* ── REJECT MODAL ── */}
          {rejectModal && (
            <Modal onClose={() => { setRejectModal(null); setRejectReason(""); }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>❌</div>
                <div>
                  <h3 style={{ margin:0, fontSize:"1.05rem", fontWeight:700, color:"#0f172a" }}>Reject Ticket</h3>
                  <p style={{ margin:0, color:"#94a3b8", fontSize:"0.82rem" }}>Reporter will be notified with your reason</p>
                </div>
              </div>
              <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:16, border:"1px solid #f0f0f0", fontSize:13 }}>
                <div style={{ fontWeight:700, color:"#0f172a", marginBottom:6 }}>{rejectModal.title}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, fontSize:12, color:"#64748b" }}>
                  <div>Reporter: <strong style={{ color:"#334155" }}>{rejectModal.userName}</strong></div>
                  <div>Location: <strong style={{ color:"#334155" }}>{rejectModal.location}</strong></div>
                  <div>Category: <strong style={{ color:"#334155" }}>{rejectModal.category}</strong></div>
                  <div>Priority: <strong style={{ color:PRIORITY_COLOR[rejectModal.priority] }}>{rejectModal.priority}</strong></div>
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Reason for Rejection *</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3} style={{ width:"100%", padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none", resize:"none", fontFamily:"inherit", background:"#f8fafc", color:"#0f172a", boxSizing:"border-box" }}
                  autoFocus />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleReject} disabled={actionLoading}
                  style={{ flex:1, padding:11, borderRadius:9, border:"none", background:"#dc2626", color:"white", fontWeight:700, cursor:"pointer", fontSize:"0.88rem", boxShadow:"0 2px 8px rgba(220,38,38,0.3)" }}>
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  style={{ flex:1, padding:11, borderRadius:9, border:"1px solid #e2e8f0", background:"white", color:"#374151", fontWeight:600, cursor:"pointer", fontSize:"0.88rem" }}>
                  Cancel
                </button>
              </div>
            </Modal>
          )}

          {loading && <div className="spinner-container"><div className="spinner"></div></div>}

          {/* ── TABLE ── */}
          {!loading && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"70px", color:"#94a3b8" }}>
                  <div style={{ fontSize:"3rem", marginBottom:12, opacity:0.5 }}>📋</div>
                  <div style={{ fontWeight:600, fontSize:"1rem", color:"#374151" }}>No tickets found</div>
                  <div style={{ fontSize:"0.85rem", marginTop:4 }}>Try adjusting your search or filters</div>
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
                  <colgroup>
                    <col style={{ width:"26%" }} />
                    <col style={{ width:"11%" }} />
                    <col style={{ width:"10%" }} />
                    <col style={{ width:"13%" }} />
                    <col style={{ width:"22%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {["Ticket","Category","Priority","Status","Actions"].map((h, i) => (
                        <th key={h} style={{ ...th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ticket) => (
                      <tr key={ticket.id}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        style={{ borderLeft: ticket.priority === "CRITICAL" ? "3px solid #7c3aed" : "3px solid transparent" }}
                      >
                        <td style={td}>
                          <div style={{ fontWeight:700, color:"#0f172a", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>
                            {ticket.title}
                          </div>
                          <div style={{ fontSize:11, color:"#64748b", display:"flex", gap:5 }}>
                            <span>{ticket.userName || "Unknown"}</span>
                            <span style={{ color:"#d1d5db" }}>·</span>
                            <span>{ticket.location}</span>
                          </div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : ""}
                          </div>
                        </td>
                        <td style={td}>
                          <span style={{ background:"#f1f5f9", color:"#475569", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>
                            {ticket.category}
                          </span>
                        </td>
                        <td style={td}>
                          <Chip label={ticket.priority} status={ticket.priority} type="priority" />
                        </td>
                        <td style={td}>
                          <Chip label={ticket.status?.replace("_"," ")} status={ticket.status} type="status" />
                          {ticket.assignedToName && (
                            <div style={{ fontSize:10, color:"#6b7280", marginTop:3 }}>{ticket.assignedToName}</div>
                          )}
                        </td>
                        <td style={{ ...td, textAlign:"right" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:5 }}>
                            <Btn onClick={() => navigate(`/admin/tickets/${ticket.id}`)} bg="#f8fafc" color="#475569" border="#e2e8f0">
                              View
                            </Btn>
                            {ticket.status === "OPEN" && <>
                              <Btn onClick={() => setAssignModal(ticket)} bg="#f0fdf4" color="#15803d" border="#bbf7d0">
                                Approve
                              </Btn>
                              <Btn onClick={() => setRejectModal(ticket)} bg="#fef2f2" color="#991b1b" border="#fecaca">
                                Reject
                              </Btn>
                            </>}
                            {ticket.status === "IN_PROGRESS" && <>
                              <Btn onClick={() => handleResolve(ticket.id)} bg="#f0fdf4" color="#15803d" border="#bbf7d0">
                                Resolve
                              </Btn>
                              <Btn onClick={() => setRejectModal(ticket)} bg="#fef2f2" color="#991b1b" border="#fecaca">
                                Reject
                              </Btn>
                            </>}
                            {ticket.status === "RESOLVED" && (
                              <Btn onClick={() => handleClose(ticket.id)} bg="#f1f5f9" color="#475569" border="#e2e8f0">
                                Close
                              </Btn>
                            )}
                            {ticket.status === "REJECTED" && (
                              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, fontSize:11, fontWeight:700, background:"#fef2f2", color:"#991b1b", border:"1px solid #fecaca" }}>
                                <XIcon />Rejected
                              </span>
                            )}
                            {ticket.status === "CLOSED" && (
                              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, fontSize:11, fontWeight:700, background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0" }}>
                                Closed
                              </span>
                            )}
                            <Btn onClick={() => handleDelete(ticket.id)} bg="#fef2f2" color="#dc2626" border="#fecaca">
                              <TrashIcon />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* ══ ANALYTICS TAB ══ */}
      {activeTab === "Analytics" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
            {[
              { label:"Resolution Rate", value:`${resolutionRate}%`, sub:`${stats.resolved} of ${stats.total} resolved`, color:"#16a34a" },
              { label:"AI Accuracy",     value:`${aiAccuracy}%`,     sub:`${aiMatch} of ${withAI.length} matched`,       color:"#1d4ed8" },
              {
                label:"Avg per Month",
                value: monthlyData.filter((m) => m.Total > 0).length
                  ? Math.round(monthlyData.reduce((s, m) => s + m.Total, 0) / monthlyData.filter((m) => m.Total > 0).length)
                  : 0,
                sub:"tickets per month", color:"#d97706",
              },
              {
                label:"Critical Rate",
                value: stats.total > 0 ? `${Math.round((stats.critical / stats.total) * 100)}%` : "0%",
                sub:`${stats.critical} critical tickets`, color:"#7c3aed",
              },
              {
                label:"Avg Resolution",
                value: (() => {
                  const resolved = tickets.filter((t) => t.resolvedAt && t.createdAt);
                  if (!resolved.length) return "—";
                  const avgMins = resolved.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000, 0) / resolved.length;
                  if (avgMins < 60)   return `${Math.round(avgMins)}m`;
                  if (avgMins < 1440) return `${Math.round(avgMins / 60)}h`;
                  return `${Math.round(avgMins / 1440)}d`;
                })(),
                sub:"average time to resolve", color:"#0e7490",
              },
            ].map((k) => (
              <Card key={k.label}>
                <div style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{k.label}</div>
                <div style={{ fontSize:"2rem", fontWeight:800, color:k.color, lineHeight:1, marginBottom:4 }}>{k.value}</div>
                <div style={{ fontSize:"0.75rem", color:"#6b7280" }}>{k.sub}</div>
              </Card>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Card>
              <ChartTitle title="Status Distribution" subtitle="Current state of all tickets" />
              {statusData.length === 0 ? <p style={{ color:"#9ca3af", textAlign:"center", padding:"40px 0" }}>No data yet</p> : (
                <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                  <PieChart width={180} height={180}>
                    <Pie data={statusData} dataKey="value" cx={85} cy={85} innerRadius={48} outerRadius={82} paddingAngle={3}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip />
                  </PieChart>
                  <div style={{ flex:1 }}>
                    {statusData.map((d) => (
                      <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid #f8fafc" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:d.color }} />
                          <span style={{ fontSize:"0.8rem", color:"#374151" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize:"0.82rem", fontWeight:700, color:d.color }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            <Card>
              <ChartTitle title="Priority Distribution" subtitle="Tickets by urgency level" />
              {priorityData.length === 0 ? <p style={{ color:"#9ca3af", textAlign:"center", padding:"40px 0" }}>No data yet</p> : (
                <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                  <PieChart width={180} height={180}>
                    <Pie data={priorityData} dataKey="value" cx={85} cy={85} innerRadius={48} outerRadius={82} paddingAngle={3}>
                      {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip />
                  </PieChart>
                  <div style={{ flex:1 }}>
                    {priorityData.map((d) => (
                      <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid #f8fafc" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:d.color }} />
                          <span style={{ fontSize:"0.8rem", color:"#374151" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize:"0.82rem", fontWeight:700, color:d.color }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <ChartTitle title="Ticket Volume Over Time" subtitle="Monthly trend for the last 6 months" />
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:"0.82rem" }} />
                <Area type="monotone" dataKey="Total"    stroke="#3b82f6" strokeWidth={2.5} fill="url(#totalGrad)"    dot={{ r:4, fill:"#3b82f6" }} />
                <Area type="monotone" dataKey="Resolved" stroke="#22c55e" strokeWidth={2.5} fill="url(#resolvedGrad)" dot={{ r:4, fill:"#22c55e" }} />
                <Area type="monotone" dataKey="Open"     stroke="#f59e0b" strokeWidth={2.5} fill="none"               dot={{ r:4, fill:"#f59e0b" }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16 }}>
            <Card>
              <ChartTitle title="Tickets by Category" subtitle="Volume per maintenance category" />
              {categoryData.length === 0 ? <p style={{ color:"#9ca3af", textAlign:"center", padding:"40px 0" }}>No data yet</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize:"0.8rem" }} />
                    <Bar dataKey="Total"    fill="#3b82f6" radius={[6,6,0,0]} maxBarSize={30} />
                    <Bar dataKey="Resolved" fill="#22c55e" radius={[6,6,0,0]} maxBarSize={30} />
                    <Bar dataKey="Open"     fill="#f59e0b" radius={[6,6,0,0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card>
              <ChartTitle title="AI Triage Performance" subtitle="Priority prediction accuracy" />
              <div style={{ textAlign:"center", paddingTop:8 }}>
                <div style={{ fontSize:"3.5rem", fontWeight:900, lineHeight:1, marginBottom:4, color:aiAccuracy >= 70 ? "#16a34a" : "#f59e0b" }}>{aiAccuracy}%</div>
                <div style={{ fontSize:"0.8rem", color:"#94a3b8", marginBottom:16 }}>accuracy rate</div>
                <div style={{ background:"#f8fafc", borderRadius:10, height:8, marginBottom:20, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:10, background: aiAccuracy >= 70 ? "linear-gradient(90deg,#16a34a,#22c55e)" : "linear-gradient(90deg,#d97706,#f59e0b)", width:`${aiAccuracy}%`, transition:"width 0.8s ease" }} />
                </div>
                {[
                  { label:"Analysed tickets", value:withAI.length,       color:"#1d4ed8" },
                  { label:"Correct matches",  value:aiMatch,              color:"#16a34a" },
                  { label:"Resolution rate",  value:`${resolutionRate}%`, color:"#7c3aed" },
                ].map((s) => (
                  <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 12px", borderRadius:8, marginBottom:4, background:"#f8fafc", fontSize:"0.82rem" }}>
                    <span style={{ color:"#374151" }}>{s.label}</span>
                    <strong style={{ color:s.color }}>{s.value}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {facultyData.length > 0 && (
            <Card>
              <ChartTitle title="Tickets by Faculty" subtitle="Which faculties submit the most tickets" />
              <ResponsiveContainer width="100%" height={Math.max(160, facultyData.length * 50)}>
                <BarChart data={facultyData} layout="vertical" margin={{ top:0, right:20, left:90, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#374151" }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:"0.8rem" }} />
                  <Bar dataKey="Total"    fill="#3b82f6" radius={[0,6,6,0]} maxBarSize={24} />
                  <Bar dataKey="Resolved" fill="#22c55e" radius={[0,6,6,0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}