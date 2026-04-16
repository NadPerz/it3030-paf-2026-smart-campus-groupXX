import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../services/ticketService";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLORS = {
  OPEN: "#004085",
  IN_PROGRESS: "#856404",
  RESOLVED: "#155724",
  CLOSED: "#383d41",
  REJECTED: "#721c24",
};
const STATUS_BG = {
  OPEN: "#cce5ff",
  IN_PROGRESS: "#fff3cd",
  RESOLVED: "#d4edda",
  CLOSED: "#e2e3e5",
  REJECTED: "#f8d7da",
};
const PRIORITY_COLORS = {
  LOW: "#2e7d32",
  MEDIUM: "#f57c00",
  HIGH: "#e53935",
  CRITICAL: "#b71c1c",
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

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
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

  const sendComment = async () => {
    if (!comment.trim()) return;
    try {
      await ticketService.addComment(id, {
        content: comment,
        userName: user?.name || "Anonymous",
      });
      setComment("");
      ticketService.getComments(id).then((r) => setComments(r.data));
    } catch {
      alert("Failed to add comment");
    }
  };

  const saveEditComment = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      await ticketService.editComment(id, commentId, {
        content: editingContent,
      });
      setEditingCommentId(null);
      setEditingContent("");
      ticketService.getComments(id).then((r) => setComments(r.data));
    } catch {
      alert("Failed to edit comment");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketService.deleteComment(id, commentId);
      ticketService.getComments(id).then((r) => setComments(r.data));
    } catch {
      alert("Failed to delete comment");
    }
  };

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
      alert("Cannot delete — ticket has already been processed by admin");
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
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Top bar */}
      <div style={{ marginBottom: "24px" }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: "12px", fontSize: "0.85rem" }}
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
            <h2 style={{ margin: 0, color: "#1a73e8", fontSize: "1.4rem" }}>
              {ticket.title}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: STATUS_BG[ticket.status],
                  color: STATUS_COLORS[ticket.status],
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                }}
              >
                {ticket.status?.replace("_", " ")}
              </span>
              <span
                style={{
                  background: "#f1f3f4",
                  color: PRIORITY_COLORS[ticket.priority],
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                }}
              >
                ● {ticket.priority}
              </span>
              <span
                style={{
                  background: "#f1f3f4",
                  color: "#555",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.78rem",
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
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "✕ Cancel Edit" : "✏️ Edit"}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: "0.85rem" }}
                  onClick={handleDelete}
                >
                  🗑️ Delete
                </button>
              </>
            ) : (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#999",
                  fontStyle: "italic",
                  alignSelf: "center",
                }}
              >
                Locked — ticket is {ticket.status?.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rejected banner */}
      {ticket.status === "REJECTED" && (
        <div
          style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "600", color: "#721c24" }}>
            ❌ Ticket Rejected
          </p>
          <p
            style={{ margin: "4px 0 0", color: "#721c24", fontSize: "0.9rem" }}
          >
            {ticket.rejectionReason}
          </p>
        </div>
      )}

      {/* Status timeline */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Status Timeline
        </p>
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
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: i <= currentStep ? "#1a73e8" : "#e0e0e0",
                    color: i <= currentStep ? "white" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                  }}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    marginTop: "4px",
                    textAlign: "center",
                    width: "60px",
                    color: i <= currentStep ? "#1a73e8" : "#999",
                    fontWeight: i <= currentStep ? "600" : "400",
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
                    marginBottom: "18px",
                    background: i < currentStep ? "#1a73e8" : "#e0e0e0",
                    borderRadius: "2px",
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "20px",
        }}
      >
        {/* LEFT */}
        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {editing ? "✏️ Editing Ticket" : "Ticket Details"}
            </p>

            {editing ? (
              <div>
                <div className="form-group">
                  <label>Title *</label>
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
                    <label>Category</label>
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
                    <label>Priority</label>
                    <select
                      style={{
                        ...fs,
                        borderLeft: `4px solid ${PRIORITY_COLORS[editForm.priority]}`,
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
                  <label>Location</label>
                  <input
                    style={fs}
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Faculty / School</label>
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
                <div className="form-group">
                  <label>Resource ID</label>
                  <input
                    style={fs}
                    value={editForm.resourceId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, resourceId: e.target.value })
                    }
                    placeholder="e.g. PROJ-001"
                  />
                </div>
                <div className="form-group">
                  <label>Contact</label>
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
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    style={{ ...fs, minHeight: "120px", resize: "vertical" }}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdate}
                    disabled={saveLoading}
                  >
                    {saveLoading ? "Saving..." : "✓ Save Changes"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Title", ticket.title],
                    ["Description", ticket.description],
                    ["Category", ticket.category],
                    ["Priority", ticket.priority],
                    ["Location", ticket.location],
                    ["Faculty", ticket.faculty || "—"],
                    ["Resource ID", ticket.resourceId || "—"],
                    ["Reporter", ticket.userName || "—"],
                    ["Email", ticket.userEmail || "—"],
                    ["Reg. Number", ticket.userRegNo || "—"],
                    ["Contact", ticket.contactDetails || "—"],
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
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#666",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          width: "130px",
                          verticalAlign: "top",
                        }}
                      >
                        {k}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.9rem",
                          color: "#222",
                        }}
                      >
                        {k === "Priority" ? (
                          <span
                            style={{
                              color: PRIORITY_COLORS[v],
                              fontWeight: "600",
                            }}
                          >
                            ● {v}
                          </span>
                        ) : (
                          v
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Resolution notes */}
          {ticket.resolutionNotes && (
            <div
              style={{
                background: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#155724",
                  textTransform: "uppercase",
                }}
              >
                ✓ Resolution Notes
              </p>
              <p style={{ margin: 0, color: "#155724", fontSize: "0.9rem" }}>
                {ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Comments ({comments.length})
            </p>
            {comments.length === 0 && (
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No comments yet
              </p>
            )}
            <div style={{ marginBottom: "16px" }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {c.userName}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#999" }}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  {editingCommentId === c.id ? (
                    <div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                        rows={2}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginTop: "6px",
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: "0.78rem", padding: "4px 12px" }}
                          onClick={() => saveEditComment(c.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: "0.78rem", padding: "4px 12px" }}
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: "0.9rem",
                          color: "#555",
                        }}
                      >
                        {c.content}
                      </p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditingContent(c.content);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#1a73e8",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteComment(c.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e53935",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-control"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
                placeholder="Add a comment..."
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={sendComment}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT panel */}
        <div>
          <div
            style={{
              background: "#e8f0fe",
              border: "1px solid #c5d8f8",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#1a73e8",
                }}
              >
                🤖 AI Triage Analysis
              </p>
              <button
                className="btn btn-primary"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                onClick={runTriage}
                disabled={triageLoading}
              >
                {triageLoading
                  ? "..."
                  : ticket.aiTriage
                    ? "Re-Analyze"
                    : "Run Analysis"}
              </button>
            </div>
            {triageLoading && (
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div
                  className="spinner"
                  style={{ width: "28px", height: "28px", margin: "0 auto" }}
                ></div>
                <p
                  style={{
                    color: "#1a73e8",
                    fontSize: "0.82rem",
                    marginTop: "8px",
                  }}
                >
                  Analyzing with AI...
                </p>
              </div>
            )}
            {ticket.aiTriage && !triageLoading && (
              <div>
                <div style={{ marginBottom: "10px" }}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "0.78rem",
                      color: "#5a7fc7",
                    }}
                  >
                    Suggested Priority
                  </p>
                  <span
                    style={{
                      background: "#fff",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: PRIORITY_COLORS[ticket.aiTriage.suggestedPriority],
                    }}
                  >
                    ● {ticket.aiTriage.suggestedPriority}
                  </span>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "0.78rem",
                      color: "#5a7fc7",
                    }}
                  >
                    Est. Resolution Time
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a73e8",
                    }}
                  >
                    {ticket.aiTriage.estimatedResolutionTime}
                  </p>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "0.78rem",
                      color: "#5a7fc7",
                    }}
                  >
                    Recommended Action
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.85rem", color: "#1a73e8" }}
                  >
                    {ticket.aiTriage.recommendedAction}
                  </p>
                </div>
                <button
                  onClick={() => setAiOpen(!aiOpen)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1a73e8",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  {aiOpen ? "Hide" : "Show"} AI reasoning
                </button>
                {aiOpen && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "6px",
                      padding: "10px",
                      marginTop: "8px",
                      fontSize: "0.82rem",
                      color: "#555",
                      fontStyle: "italic",
                    }}
                  >
                    {ticket.aiTriage.reasoning}
                  </div>
                )}
              </div>
            )}
            {!ticket.aiTriage && !triageLoading && (
              <p
                style={{
                  color: "#5a7fc7",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Click Run Analysis to get AI suggestions
              </p>
            )}
          </div>

          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="card">
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#666",
                  textTransform: "uppercase",
                }}
              >
                Attachments ({ticket.imageUrls.length})
              </p>
              <div
                style={{
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
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(url, "_blank")}
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
