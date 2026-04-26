import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../services/ticketService";
import { useAuth } from "../context/AuthContext.jsx";
import CommentSection from "../components/common/CommentSection.jsx";

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
const STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const FACULTIES = [
  "Faculty of Computing",
  "School of Business",
  "Faculty of Engineering",
  "Faculty of Humanities & Sciences",
  "School of Architecture",
  "Faculty of Graduate Studies & Research",
];

const Chip = ({ label, status, type = "status" }) => {
  const c =
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
        background: c.bg,
        color: c.color,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "0.72rem",
        fontWeight: "700",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    priority: "MEDIUM",
    location: "",
    description: "",
    contactDetails: "",
    faculty: "",
    resourceId: "",
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      ticketService.getTicketById(id),
      ticketService.getComments(id),
    ])
      .then(([t, c]) => {
        setTicket(t.data);
        setComments(c.data);
        setEditForm({
          title: t.data.title || "",
          category: t.data.category || "GENERAL",
          priority: t.data.priority || "MEDIUM",
          location: t.data.location || "",
          description: t.data.description || "",
          contactDetails: t.data.contactDetails || "",
          faculty: t.data.faculty || "",
          resourceId: t.data.resourceId || "",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const refreshComments = () =>
    ticketService.getComments(id).then((r) => setComments(r.data));

  const runTriage = async () => {
    setTriageLoading(true);
    try {
      await ticketService.runTriage(id);
      await new Promise((r) => setTimeout(r, 2000));
      const t = await ticketService.getTicketById(id);
      setTicket(t.data);
    } catch {
      alert("AI triage failed");
    }
    setTriageLoading(false);
  };

  const handleUpdate = async () => {
    setSaveLoading(true);
    try {
      await ticketService.updateTicket(id, editForm);
      setEditing(false);
      load();
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Cannot edit — ticket may already be processed",
      );
    }
    setSaveLoading(false);
  };

  const handleDelete = async () => {
    if (ticket.status !== "OPEN") {
      alert("Cannot delete — ticket has already been processed");
      return;
    }
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await ticketService.deleteTicket(id);
      navigate("/tickets");
    } catch {
      alert("Failed to delete ticket");
    }
  };

  const fs = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fafafa",
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  if (!ticket)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
        Ticket not found
      </div>
    );

  const currentStep = STEPS.indexOf(ticket.status);
  const canEdit = ticket.status === "OPEN";

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px 28px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* TOP BAR */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "0.82rem",
            fontWeight: "600",
            color: "#374151",
            cursor: "pointer",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 10px",
                color: "#0f172a",
                fontSize: "1.4rem",
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              {ticket.title}
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Chip
                label={ticket.status?.replace("_", " ")}
                status={ticket.status}
                type="status"
              />
              <Chip
                label={ticket.priority}
                status={ticket.priority}
                type="priority"
              />
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: "600",
                }}
              >
                {ticket.category}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {canEdit ? (
              <>
                <button
                  onClick={() => setEditing(!editing)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "1px solid #e5e7eb",
                    background: editing ? "#f3f4f6" : "white",
                    color: "#374151",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {editing ? "✕ Cancel" : "Edit"}
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  fontStyle: "italic",
                  alignSelf: "center",
                  background: "#f8fafc",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
              >
                Locked — {ticket.status?.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* REJECTED BANNER */}
      {ticket.status === "REJECTED" && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontWeight: "700",
              color: "#7f1d1d",
              fontSize: "0.9rem",
            }}
          >
            Ticket Rejected
          </p>
          <p style={{ margin: 0, color: "#991b1b", fontSize: "0.875rem" }}>
            {ticket.rejectionReason}
          </p>
        </div>
      )}

      {/* STATUS TIMELINE */}
      <div
        style={{
          background: "white",
          border: "1px solid #f0f0f0",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: "700",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "20px",
          }}
        >
          Status Timeline
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {STEPS.map((step, i) => (
            <div
              key={step}
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background:
                      i <= currentStep
                        ? "#22c55e"
                        : i === currentStep
                          ? "#1d4ed8"
                          : "#f1f5f9",
                    color: i <= currentStep ? "white" : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    boxShadow:
                      i <= currentStep
                        ? "0 2px 8px rgba(29,78,216,0.2)"
                        : "none",
                  }}
                >
                  {i <= currentStep ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    marginTop: "6px",
                    textAlign: "center",
                    width: "70px",
                    color: i <= currentStep ? "#1d4ed8" : "#94a3b8",
                    fontWeight: i <= currentStep ? "700" : "400",
                  }}
                >
                  {step.replace("_", " ")}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "3px",
                    margin: "0 4px",
                    marginBottom: "22px",
                    background:
                      i < currentStep
                        ? "linear-gradient(90deg,#22c55e,#1d4ed8)"
                        : "#f1f5f9",
                    borderRadius: "2px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "20px",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Details / Edit */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #f8fafc",
                background: "#f8fafc",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {editing ? "Edit Ticket" : "Ticket Details"}
              </span>
            </div>

            {editing ? (
              <div style={{ padding: "20px 24px" }}>
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Title *
                  </label>
                  <input
                    style={fs}
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Category
                    </label>
                    <select
                      style={fs}
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                    >
                      {["ELECTRICAL", "PLUMBING", "IT", "HVAC", "GENERAL"].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Priority
                    </label>
                    <select
                      style={{
                        ...fs,
                        borderLeft: `3px solid ${PRIORITY_COLOR[editForm.priority]}`,
                      }}
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value })
                      }
                    >
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Location
                  </label>
                  <input
                    style={fs}
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Faculty
                  </label>
                  <select
                    style={fs}
                    value={editForm.faculty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, faculty: e.target.value })
                    }
                  >
                    <option value="">-- Select --</option>
                    {FACULTIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Resource ID
                    </label>
                    <input
                      style={fs}
                      value={editForm.resourceId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, resourceId: e.target.value })
                      }
                      placeholder="e.g. LAB-A3"
                    />
                  </div>
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      Contact
                    </label>
                    <input
                      style={fs}
                      value={editForm.contactDetails}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactDetails: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    style={{ ...fs, minHeight: "100px", resize: "vertical" }}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={handleUpdate}
                    disabled={saveLoading}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
                    }}
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      border: "1px solid #e5e7eb",
                      background: "white",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1px",
                    background: "#f8fafc",
                  }}
                >
                  {[
                    ["Reporter", ticket.userName || "—"],
                    ["Email", ticket.userEmail || "—"],
                    ["Reg. Number", ticket.userRegNo || "—"],
                    ["Contact", ticket.contactDetails || "—"],
                    ["Faculty", ticket.faculty || "—"],
                    ["Resource ID", ticket.resourceId || "—"],
                    ["Location", ticket.location || "—"],
                    ["Technician", ticket.assignedToName || "Unassigned"],
                    [
                      "Created",
                      ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : "—",
                    ],
                    [
                      "Updated",
                      ticket.updatedAt
                        ? new Date(ticket.updatedAt).toLocaleString()
                        : "—",
                    ],
                    [
                      "First Response",
                      ticket.timeToFirstResponse
                        ? `⏱ ${ticket.timeToFirstResponse}`
                        : ticket.status === "OPEN"
                          ? "⏳ Pending"
                          : "—",
                    ],
                    [
                      "Resolution Time",
                      ticket.timeToResolution
                        ? `✓ ${ticket.timeToResolution}`
                        : ["IN_PROGRESS", "OPEN"].includes(ticket.status)
                          ? "⏳ In progress"
                          : "—",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        background: "white",
                        padding: "12px 20px",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "3px",
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#0f172a",
                          fontWeight: "500",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: "700",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "8px",
                    }}
                  >
                    Description
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "#374151",
                      lineHeight: "1.6",
                    }}
                  >
                    {ticket.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resolution notes */}
          {ticket.resolutionNotes && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "16px 20px",
                borderLeft: "4px solid #22c55e",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  color: "#14532d",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Resolution Notes
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#166534",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
              >
                {ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* ── COMMENTS — using shared CommentSection ── */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: "14px",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CommentSection
              ticketId={id}
              comments={comments}
              onRefresh={refreshComments}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* AI Triage */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #f8fafc",
                background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                AI Triage Analysis
              </span>
              <button
                onClick={runTriage}
                disabled={triageLoading}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {triageLoading
                  ? "..."
                  : ticket.aiTriage
                    ? "Re-Analyze"
                    : "Run Analysis"}
              </button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {triageLoading && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div
                    className="spinner"
                    style={{ width: "28px", height: "28px", margin: "0 auto" }}
                  />
                  <p
                    style={{
                      color: "#1d4ed8",
                      fontSize: "0.82rem",
                      marginTop: "8px",
                    }}
                  >
                    Analyzing...
                  </p>
                </div>
              )}
              {ticket.aiTriage && !triageLoading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {[
                    {
                      label: "Suggested Priority",
                      value: ticket.aiTriage.suggestedPriority,
                      render: (v) => (
                        <Chip label={v} status={v} type="priority" />
                      ),
                    },
                    {
                      label: "Est. Resolution",
                      value: ticket.aiTriage.estimatedResolutionTime,
                      render: (v) => (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            color: "#0f172a",
                          }}
                        >
                          {v}
                        </span>
                      ),
                    },
                    {
                      label: "Recommended Action",
                      value: ticket.aiTriage.recommendedAction,
                      render: (v) => (
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "#374151",
                            lineHeight: "1.4",
                          }}
                        >
                          {v}
                        </span>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </div>
                      {item.render(item.value)}
                    </div>
                  ))}
                  <button
                    onClick={() => setAiOpen(!aiOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontWeight: "600",
                      textAlign: "left",
                      padding: 0,
                    }}
                  >
                    {aiOpen ? "Hide" : "Show"} AI reasoning
                  </button>
                  {aiOpen && (
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "0.82rem",
                        color: "#1e40af",
                        fontStyle: "italic",
                        lineHeight: "1.5",
                      }}
                    >
                      {ticket.aiTriage.reasoning}
                    </div>
                  )}
                </div>
              )}
              {!ticket.aiTriage && !triageLoading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#94a3b8",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: "8px",
                      opacity: 0.5,
                    }}
                  >
                    🤖
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    Click Run Analysis to get AI suggestions
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #f8fafc",
                  background: "#f8fafc",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Attachments ({ticket.imageUrls.length})
                </span>
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {ticket.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`attachment ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onClick={() => window.open(url, "_blank")}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.85")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
