import { useEffect, useState } from "react";
import { ticketService } from "../services/ticketService";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  OPEN: "#004085",
  IN_PROGRESS: "#92400e",
  RESOLVED: "#14532d",
  CLOSED: "#374151",
  REJECTED: "#7f1d1d",
};
const STATUS_BG = {
  OPEN: "#dbeafe",
  IN_PROGRESS: "#fef3c7",
  RESOLVED: "#dcfce7",
  CLOSED: "#f3f4f6",
  REJECTED: "#fee2e2",
};
const STATUS_DOT = {
  OPEN: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  RESOLVED: "#22c55e",
  CLOSED: "#9ca3af",
  REJECTED: "#ef4444",
};
const PRIORITY_COLOR = {
  LOW: "#16a34a",
  MEDIUM: "#d97706",
  HIGH: "#dc2626",
  CRITICAL: "#7c3aed",
};
const PRIORITY_BG = {
  LOW: "#dcfce7",
  MEDIUM: "#fef3c7",
  HIGH: "#fee2e2",
  CRITICAL: "#ede9fe",
};
const CHART_STATUS = {
  OPEN: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  RESOLVED: "#22c55e",
  CLOSED: "#9ca3af",
  REJECTED: "#ef4444",
};
const CHART_PRIORITY = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#7c3aed",
};

const TECHNICIANS = [
  { id: "tech-001", name: "Siyumi Fonseka", email: "fonsekasiyumi@gmail.com" },
];

// inject pulse keyframe once
if (!document.getElementById("pulse-kf")) {
  const s = document.createElement("style");
  s.id = "pulse-kf";
  s.innerHTML = `@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`;
  document.head.appendChild(s);
}

// ── OUTSIDE component — never remounts ────────────────────────────────────────
const Modal = ({ children, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(2px)",
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
      }}
    >
      {children}
    </div>
  </div>
);

const Chip = ({ label, status, type = "status" }) => {
  const colors =
    type === "status"
      ? {
          bg: STATUS_BG[status],
          color: STATUS_COLORS[status],
          dot: STATUS_DOT[status],
        }
      : {
          bg: PRIORITY_BG[status],
          color: PRIORITY_COLOR[status],
          dot: PRIORITY_COLOR[status],
        };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: colors.bg,
        color: colors.color,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: "700",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: colors.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

const ActionBtn = ({ label, onClick, variant }) => {
  const v =
    {
      view: {
        bg: "white",
        color: "#374151",
        border: "1px solid #e5e7eb",
        hov: "#f9fafb",
      },
      approve: {
        bg: "#16a34a",
        color: "white",
        border: "none",
        hov: "#15803d",
      },
      resolve: {
        bg: "#16a34a",
        color: "white",
        border: "none",
        hov: "#15803d",
      },
      reject: {
        bg: "white",
        color: "#dc2626",
        border: "1px solid #fca5a5",
        hov: "#fff5f5",
      },
      close: {
        bg: "white",
        color: "#6b7280",
        border: "1px solid #e5e7eb",
        hov: "#f9fafb",
      },
      delete: {
        bg: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fca5a5",
        hov: "#fecaca",
      },
    }[variant] || {};
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "0.72rem",
        padding: "5px 11px",
        borderRadius: "6px",
        border: v.border,
        background: v.bg,
        color: v.color,
        cursor: "pointer",
        fontWeight: "600",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "all 0.15s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = v.hov)}
      onMouseLeave={(e) => (e.currentTarget.style.background = v.bg)}
    >
      {label}
    </button>
  );
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: "white",
      border: "1px solid #f0f0f0",
      borderRadius: "14px",
      padding: "22px 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

const ChartTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: "18px" }}>
    <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111827" }}>
      {title}
    </div>
    {subtitle && (
      <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "3px" }}>
        {subtitle}
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "0.82rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ fontWeight: "700", marginBottom: "6px", color: "#111827" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            color: p.color,
            marginTop: "3px",
            display: "flex",
            gap: "6px",
          }}
        >
          <span>{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tickets");
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
  });
  const [rejectModal, setRejectModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── New-ticket badge ──────────────────────────────────────────────────────
  const [lastSeen, setLastSeen] = useState(() =>
    parseInt(localStorage.getItem("admin_lastSeen") || "0"),
  );
  const markAllSeen = () => {
    const now = Date.now();
    localStorage.setItem("admin_lastSeen", now.toString());
    setLastSeen(now);
  };

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    ticketService
      .getAllTickets()
      .then((r) => {
        const sorted = [...r.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setTickets(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  // auto-refresh every 30s to pick up new tickets
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const newCount = tickets.filter(
    (t) => t.createdAt && new Date(t.createdAt).getTime() > lastSeen,
  ).length;

  const filtered = tickets.filter(
    (t) =>
      (!filter.status || t.status === filter.status) &&
      (!filter.priority || t.priority === filter.priority) &&
      (!filter.category || t.category === filter.category) &&
      (!filter.search ||
        t.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        t.userName?.toLowerCase().includes(filter.search.toLowerCase())),
  );

  const handleApproveAndAssign = async () => {
    if (!selectedTech) {
      alert("Please select a technician");
      return;
    }
    setActionLoading(true);
    try {
      const tech = TECHNICIANS.find((t) => t.id === selectedTech);
      await ticketService.assignTechnician(assignModal.id, {
        technicianId: tech.id,
        technicianName: tech.name,
      });
      setAssignModal(null);
      setSelectedTech("");
      load();
    } catch {
      alert("Failed to assign technician");
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await ticketService.rejectTicket(rejectModal.id, {
        reason: rejectReason,
      });
      setRejectModal(null);
      setRejectReason("");
      load();
    } catch {
      alert("Failed to reject ticket");
    }
    setActionLoading(false);
  };

  const handleResolve = async (id) => {
    if (!window.confirm("Mark this ticket as resolved?")) return;
    try {
      await ticketService.updateStatus(id, { status: "RESOLVED" });
      load();
    } catch {
      alert("Failed");
    }
  };
  const handleClose = async (id) => {
    if (!window.confirm("Close this ticket?")) return;
    try {
      await ticketService.updateStatus(id, { status: "CLOSED" });
      load();
    } catch {
      alert("Failed");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this ticket?")) return;
    try {
      await ticketService.deleteTicket(id);
      load();
    } catch {
      alert("Failed");
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    rejected: tickets.filter((t) => t.status === "REJECTED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
  };

  const statusData = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]
    .map((s) => ({
      name: s.replace("_", " "),
      value: tickets.filter((t) => t.status === s).length,
      color: CHART_STATUS[s],
    }))
    .filter((d) => d.value > 0);
  const priorityData = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    .map((p) => ({
      name: p,
      value: tickets.filter((t) => t.priority === p).length,
      color: CHART_PRIORITY[p],
    }))
    .filter((d) => d.value > 0);
  const categoryData = ["ELECTRICAL", "PLUMBING", "IT", "HVAC", "GENERAL"]
    .map((c) => ({
      name: c,
      Total: tickets.filter((t) => t.category === c).length,
      Resolved: tickets.filter(
        (t) => t.category === c && t.status === "RESOLVED",
      ).length,
      Open: tickets.filter((t) => t.category === c && t.status === "OPEN")
        .length,
    }))
    .filter((d) => d.Total > 0);

  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const mt = tickets.filter((t) => {
        if (!t.createdAt) return false;
        const td = new Date(t.createdAt);
        return (
          td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
        );
      });
      return {
        month: label,
        Total: mt.length,
        Resolved: mt.filter((t) => t.status === "RESOLVED").length,
        Open: mt.filter((t) => t.status === "OPEN").length,
      };
    });
  })();

  const withAI = tickets.filter((t) => t.aiTriage);
  const aiMatch = withAI.filter(
    (t) => t.aiTriage?.suggestedPriority === t.priority,
  ).length;
  const aiAccuracy =
    withAI.length > 0 ? Math.round((aiMatch / withAI.length) * 100) : 0;
  const resolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const facultyData = (() => {
    const faculties = [
      ...new Set(tickets.map((t) => t.faculty).filter(Boolean)),
    ];
    return faculties
      .map((f) => ({
        name: f.replace("Faculty of ", "").replace("School of ", ""),
        Total: tickets.filter((t) => t.faculty === f).length,
        Resolved: tickets.filter(
          (t) => t.faculty === f && t.status === "RESOLVED",
        ).length,
      }))
      .sort((a, b) => b.Total - a.Total);
  })();

  const isNew = (t) =>
    t.createdAt && new Date(t.createdAt).getTime() > lastSeen;

  return (
    <div
      style={{
        padding: "28px 32px",
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Incident Tickets
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            Review, approve, assign and resolve campus incident reports
          </p>
        </div>

        {/* New ticket notification button */}
        {newCount > 0 && (
          <button
            onClick={markAllSeen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.875rem",
              boxShadow: "0 4px 12px rgba(220,38,38,0.4)",
              animation: "pulse 1.5s infinite",
            }}
          >
            <span
              style={{
                background: "white",
                color: "#dc2626",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.78rem",
                fontWeight: "900",
                flexShrink: 0,
              }}
            >
              {newCount}
            </span>
            New ticket{newCount > 1 ? "s" : ""} — Click to dismiss
          </button>
        )}
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total",
            value: stats.total,
            bg: "linear-gradient(135deg,#1e40af,#3b82f6)",
            icon: "🎫",
          },
          {
            label: "Open",
            value: stats.open,
            bg: "linear-gradient(135deg,#b45309,#f59e0b)",
            icon: "📬",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            bg: "linear-gradient(135deg,#0e7490,#06b6d4)",
            icon: "⚙️",
          },
          {
            label: "Resolved",
            value: stats.resolved,
            bg: "linear-gradient(135deg,#15803d,#22c55e)",
            icon: "✓",
          },
          {
            label: "Critical",
            value: stats.critical,
            bg: "linear-gradient(135deg,#7c2d12,#ef4444)",
            icon: "⚠",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: "14px",
              padding: "20px",
              color: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-8px",
                top: "-8px",
                fontSize: "3rem",
                opacity: 0.15,
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                opacity: 0.85,
                marginBottom: "10px",
              }}
            >
              {s.label}
            </div>
            <div
              style={{ fontSize: "2.2rem", fontWeight: "800", lineHeight: "1" }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        {[
          { key: "Tickets", label: "Tickets", count: stats.total },
          { key: "Analytics", label: "Analytics", count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 24px",
              fontSize: "0.875rem",
              fontWeight: "600",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === tab.key ? "#1d4ed8" : "#6b7280",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #1d4ed8"
                  : "2px solid transparent",
              marginBottom: "-2px",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    background: activeTab === tab.key ? "#dbeafe" : "#f3f4f6",
                    color: activeTab === tab.key ? "#1d4ed8" : "#6b7280",
                    padding: "1px 8px",
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                  }}
                >
                  {tab.count}
                </span>
                {newCount > 0 && tab.key === "Tickets" && (
                  <span
                    style={{
                      background: "#dc2626",
                      color: "white",
                      padding: "1px 7px",
                      borderRadius: "20px",
                      fontSize: "0.68rem",
                      fontWeight: "800",
                      animation: "pulse 1.5s infinite",
                    }}
                  >
                    +{newCount} new
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ══ TICKETS TAB ══ */}
      {activeTab === "Tickets" && (
        <>
          {/* Quick pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "All", value: "", count: stats.total },
              { label: "Open", value: "OPEN", count: stats.open },
              {
                label: "In Progress",
                value: "IN_PROGRESS",
                count: stats.inProgress,
              },
              { label: "Resolved", value: "RESOLVED", count: stats.resolved },
              { label: "Rejected", value: "REJECTED", count: stats.rejected },
              { label: "Closed", value: "CLOSED", count: stats.closed },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter({ ...filter, status: tab.value })}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border:
                    filter.status === tab.value ? "none" : "1px solid #e5e7eb",
                  background: filter.status === tab.value ? "#1d4ed8" : "white",
                  color: filter.status === tab.value ? "white" : "#374151",
                  boxShadow:
                    filter.status === tab.value
                      ? "0 2px 8px rgba(29,78,216,0.3)"
                      : "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {tab.label}
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    background:
                      filter.status === tab.value
                        ? "rgba(255,255,255,0.2)"
                        : "#f3f4f6",
                    color: filter.status === tab.value ? "white" : "#6b7280",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & filter bar */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "0.9rem",
                }}
              >
                🔍
              </span>
              <input
                className="form-control"
                style={{ paddingLeft: "34px" }}
                placeholder="Search tickets by title or reporter..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
              />
            </div>
            <select
              className="form-control"
              style={{ width: "130px" }}
              value={filter.priority}
              onChange={(e) =>
                setFilter({ ...filter, priority: e.target.value })
              }
            >
              <option value="">All Priorities</option>
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ width: "140px" }}
              value={filter.category}
              onChange={(e) =>
                setFilter({ ...filter, category: e.target.value })
              }
            >
              <option value="">All Categories</option>
              {["ELECTRICAL", "PLUMBING", "IT", "HVAC", "GENERAL"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {(filter.status ||
              filter.priority ||
              filter.category ||
              filter.search) && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem" }}
                onClick={() =>
                  setFilter({
                    status: "",
                    priority: "",
                    category: "",
                    search: "",
                  })
                }
              >
                Clear all
              </button>
            )}
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.8rem",
                color: "#9ca3af",
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ASSIGN MODAL */}
          {assignModal && (
            <Modal
              onClose={() => {
                setAssignModal(null);
                setSelectedTech("");
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  ✅
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Approve & Assign Technician
                  </h3>
                  <p
                    style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem" }}
                  >
                    Ticket will move to In Progress
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "16px",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "10px",
                    fontSize: "0.9rem",
                  }}
                >
                  {assignModal.title}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "0.82rem",
                    color: "#6b7280",
                  }}
                >
                  <div>
                    Reporter:{" "}
                    <strong style={{ color: "#374151" }}>
                      {assignModal.userName}
                    </strong>
                  </div>
                  <div>
                    Location:{" "}
                    <strong style={{ color: "#374151" }}>
                      {assignModal.location}
                    </strong>
                  </div>
                  <div>
                    Category:{" "}
                    <strong style={{ color: "#374151" }}>
                      {assignModal.category}
                    </strong>
                  </div>
                  <div>
                    Priority:{" "}
                    <strong
                      style={{ color: PRIORITY_COLOR[assignModal.priority] }}
                    >
                      {assignModal.priority}
                    </strong>
                  </div>
                </div>
              </div>
              {assignModal.aiTriage && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                    fontSize: "0.82rem",
                    color: "#1d4ed8",
                  }}
                >
                  🤖 AI suggests{" "}
                  <strong>{assignModal.aiTriage.suggestedPriority}</strong>{" "}
                  priority — {assignModal.aiTriage.recommendedAction}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    color: "#374151",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Assign Technician *
                </label>
                <select
                  className="form-control"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="">-- Select Technician --</option>
                  {TECHNICIANS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleApproveAndAssign}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#16a34a",
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                  }}
                >
                  {actionLoading ? "Assigning..." : "Approve & Assign"}
                </button>
                <button
                  onClick={() => {
                    setAssignModal(null);
                    setSelectedTech("");
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </Modal>
          )}

          {/* REJECT MODAL */}
          {rejectModal && (
            <Modal
              onClose={() => {
                setRejectModal(null);
                setRejectReason("");
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  ❌
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Reject Ticket
                  </h3>
                  <p
                    style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem" }}
                  >
                    Reporter will be notified with your reason
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  border: "1px solid #f0f0f0",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {rejectModal.title}
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    color: "#374151",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Reason for Rejection *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  style={{ resize: "vertical" }}
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                  }}
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </Modal>
          )}

          {loading && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}

          {/* TABLE */}
          {!loading && (
            <div
              style={{
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.6fr 0.9fr 0.9fr 1.2fr 1.6fr",
                  padding: "13px 22px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {["Ticket", "Category", "Priority", "Status", "Actions"].map(
                  (h) => (
                    <div
                      key={h}
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {h}
                    </div>
                  ),
                )}
              </div>

              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "70px",
                    color: "#94a3b8",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "12px",
                      opacity: 0.5,
                    }}
                  >
                    📋
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "1rem",
                      color: "#374151",
                    }}
                  >
                    No tickets found
                  </div>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                    Try adjusting your search or filters
                  </div>
                </div>
              )}

              {filtered.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.6fr 0.9fr 0.9fr 1.2fr 1.6fr",
                    padding: "15px 22px",
                    borderBottom:
                      idx < filtered.length - 1 ? "1px solid #f8fafc" : "none",
                    alignItems: "center",
                    borderLeft:
                      ticket.priority === "CRITICAL"
                        ? "4px solid #7c3aed"
                        : isNew(ticket)
                          ? "4px solid #dc2626"
                          : "4px solid transparent",
                    background: isNew(ticket) ? "#fffbfb" : "white",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isNew(ticket)
                      ? "#fffbfb"
                      : "white")
                  }
                >
                  <div style={{ paddingRight: "16px" }}>
                    {/* Title + NEW badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#0f172a",
                          fontSize: "0.875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {ticket.title}
                      </div>
                      {isNew(ticket) && (
                        <span
                          style={{
                            background: "#dc2626",
                            color: "white",
                            fontSize: "0.6rem",
                            fontWeight: "800",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            flexShrink: 0,
                            letterSpacing: "0.06em",
                            animation: "pulse 1.5s infinite",
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <span>{ticket.userName || "Unknown"}</span>
                      <span style={{ color: "#d1d5db" }}>·</span>
                      <span>{ticket.location}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        marginTop: "2px",
                      }}
                    >
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                      }}
                    >
                      {ticket.category}
                    </span>
                  </div>

                  <div>
                    <Chip
                      label={ticket.priority}
                      status={ticket.priority}
                      type="priority"
                    />
                  </div>

                  <div>
                    <Chip
                      label={ticket.status?.replace("_", " ")}
                      status={ticket.status}
                      type="status"
                    />
                    {ticket.assignedToName && (
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        {ticket.assignedToName}
                      </div>
                    )}
                  </div>

                  <div
                    style={{ display: "flex", gap: "5px", flexWrap: "nowrap" }}
                  >
                    <ActionBtn
                      label="View"
                      onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                      variant="view"
                    />
                    {ticket.status === "OPEN" && (
                      <>
                        <ActionBtn
                          label="Approve"
                          onClick={() => setAssignModal(ticket)}
                          variant="approve"
                        />
                        <ActionBtn
                          label="Reject"
                          onClick={() => setRejectModal(ticket)}
                          variant="reject"
                        />
                      </>
                    )}
                    {ticket.status === "IN_PROGRESS" && (
                      <>
                        <ActionBtn
                          label="Resolve"
                          onClick={() => handleResolve(ticket.id)}
                          variant="resolve"
                        />
                        <ActionBtn
                          label="Reject"
                          onClick={() => setRejectModal(ticket)}
                          variant="reject"
                        />
                      </>
                    )}
                    {ticket.status === "RESOLVED" && (
                      <ActionBtn
                        label="Close"
                        onClick={() => handleClose(ticket.id)}
                        variant="close"
                      />
                    )}
                    <ActionBtn
                      label="🗑"
                      onClick={() => handleDelete(ticket.id)}
                      variant="delete"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ ANALYTICS TAB ══ */}
      {activeTab === "Analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "14px",
            }}
          >
            {[
              {
                label: "Resolution Rate",
                value: `${resolutionRate}%`,
                sub: `${stats.resolved} of ${stats.total} resolved`,
                color: "#16a34a",
              },
              {
                label: "AI Accuracy",
                value: `${aiAccuracy}%`,
                sub: `${aiMatch} of ${withAI.length} matched`,
                color: "#1d4ed8",
              },
              {
                label: "Avg per Month",
                value: monthlyData.filter((m) => m.Total > 0).length
                  ? Math.round(
                      monthlyData.reduce((s, m) => s + m.Total, 0) /
                        monthlyData.filter((m) => m.Total > 0).length,
                    )
                  : 0,
                sub: "tickets per month",
                color: "#d97706",
              },
              {
                label: "Critical Rate",
                value:
                  stats.total > 0
                    ? `${Math.round((stats.critical / stats.total) * 100)}%`
                    : "0%",
                sub: `${stats.critical} critical tickets`,
                color: "#7c3aed",
              },
              {
                label: "Avg Resolution",
                value: (() => {
                  const resolved = tickets.filter(
                    (t) => t.resolvedAt && t.createdAt,
                  );
                  if (!resolved.length) return "—";
                  const avgMins =
                    resolved.reduce((sum, t) => {
                      return (
                        sum +
                        (new Date(t.resolvedAt) - new Date(t.createdAt)) / 60000
                      );
                    }, 0) / resolved.length;
                  if (avgMins < 60) return `${Math.round(avgMins)}m`;
                  if (avgMins < 1440) return `${Math.round(avgMins / 60)}h`;
                  return `${Math.round(avgMins / 1440)}d`;
                })(),
                sub: "average time to resolve",
                color: "#0e7490",
              },
            ].map((k) => (
              <Card key={k.label}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "800",
                    color: k.color,
                    lineHeight: "1",
                    marginBottom: "4px",
                  }}
                >
                  {k.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {k.sub}
                </div>
              </Card>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Card>
              <ChartTitle
                title="Status Distribution"
                subtitle="Current state of all tickets"
              />
              {statusData.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  No data yet
                </p>
              ) : (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <PieChart width={180} height={180}>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      cx={85}
                      cy={85}
                      innerRadius={48}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {statusData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {statusData.map((d) => (
                      <div
                        key={d.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 0",
                          borderBottom: "1px solid #f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: d.color,
                            }}
                          />
                          <span
                            style={{ fontSize: "0.8rem", color: "#374151" }}
                          >
                            {d.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: "700",
                            color: d.color,
                          }}
                        >
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            <Card>
              <ChartTitle
                title="Priority Distribution"
                subtitle="Tickets by urgency level"
              />
              {priorityData.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  No data yet
                </p>
              ) : (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <PieChart width={180} height={180}>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      cx={85}
                      cy={85}
                      innerRadius={48}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {priorityData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {priorityData.map((d) => (
                      <div
                        key={d.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 0",
                          borderBottom: "1px solid #f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: d.color,
                            }}
                          />
                          <span
                            style={{ fontSize: "0.8rem", color: "#374151" }}
                          >
                            {d.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: "700",
                            color: d.color,
                          }}
                        >
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <ChartTitle
              title="Ticket Volume Over Time"
              subtitle="Monthly trend for the last 6 months"
            />
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#totalGrad)"
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
                <Area
                  type="monotone"
                  dataKey="Resolved"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#resolvedGrad)"
                  dot={{ r: 4, fill: "#22c55e" }}
                />
                <Area
                  type="monotone"
                  dataKey="Open"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="none"
                  dot={{ r: 4, fill: "#f59e0b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: "16px",
            }}
          >
            <Card>
              <ChartTitle
                title="Tickets by Category"
                subtitle="Volume per maintenance category"
              />
              {categoryData.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  No data yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={categoryData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                    <Bar
                      dataKey="Total"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey="Resolved"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey="Open"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card>
              <ChartTitle
                title="AI Triage Performance"
                subtitle="Priority prediction accuracy"
              />
              <div style={{ textAlign: "center", paddingTop: "8px" }}>
                <div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: "900",
                    lineHeight: "1",
                    marginBottom: "4px",
                    color: aiAccuracy >= 70 ? "#16a34a" : "#f59e0b",
                  }}
                >
                  {aiAccuracy}%
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    marginBottom: "16px",
                  }}
                >
                  accuracy rate
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "10px",
                    height: "8px",
                    marginBottom: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "10px",
                      background:
                        aiAccuracy >= 70
                          ? "linear-gradient(90deg,#16a34a,#22c55e)"
                          : "linear-gradient(90deg,#d97706,#f59e0b)",
                      width: `${aiAccuracy}%`,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
                {[
                  {
                    label: "Analysed tickets",
                    value: withAI.length,
                    color: "#1d4ed8",
                  },
                  {
                    label: "Correct matches",
                    value: aiMatch,
                    color: "#16a34a",
                  },
                  {
                    label: "Resolution rate",
                    value: `${resolutionRate}%`,
                    color: "#7c3aed",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      marginBottom: "4px",
                      background: "#f8fafc",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ color: "#374151" }}>{s.label}</span>
                    <strong style={{ color: s.color }}>{s.value}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {facultyData.length > 0 && (
            <Card>
              <ChartTitle
                title="Tickets by Faculty"
                subtitle="Which faculties submit the most tickets"
              />
              <ResponsiveContainer
                width="100%"
                height={Math.max(160, facultyData.length * 50)}
              >
                <BarChart
                  data={facultyData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 90, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f8fafc"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#374151" }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                  <Bar
                    dataKey="Total"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="Resolved"
                    fill="#22c55e"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
