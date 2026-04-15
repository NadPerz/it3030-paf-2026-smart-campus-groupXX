import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';

const STATUS_STYLES = {
  OPEN:'bg-blue-100 text-blue-700', IN_PROGRESS:'bg-amber-100 text-amber-700',
  RESOLVED:'bg-green-100 text-green-700', CLOSED:'bg-gray-100 text-gray-600',
  REJECTED:'bg-red-100 text-red-700',
};
const PRIORITY_STYLES = {
  LOW:'bg-green-50 text-green-700', MEDIUM:'bg-yellow-50 text-yellow-700',
  HIGH:'bg-orange-50 text-orange-700', CRITICAL:'bg-red-50 text-red-700',
};
const STEPS = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket]         = useState(null);
  const [comments, setComments]     = useState([]);
  const [comment, setComment]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [aiOpen, setAiOpen]         = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [editing, setEditing]       = useState(false);
  const [editForm, setEditForm]     = useState({
    title:'', category:'', priority:'', location:'', description:''
  });

  const load = () => {
    Promise.all([
      ticketService.getTicketById(id),
      ticketService.getComments(id),
    ]).then(([t, c]) => {
      setTicket(t.data);
      setComments(c.data);
      setEditForm({
        title:       t.data.title       || '',
        category:    t.data.category    || 'GENERAL',
        priority:    t.data.priority    || 'MEDIUM',
        location:    t.data.location    || '',
        description: t.data.description || '',
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const sendComment = async () => {
    if (!comment.trim()) return;
    await ticketService.addComment(id, { content: comment });
    setComment('');
    ticketService.getComments(id).then(r => setComments(r.data));
  };

  const runTriage = async () => {
    setTriageLoading(true);
    await ticketService.runTriage(id);
    await new Promise(r => setTimeout(r, 2000));
    const t = await ticketService.getTicketById(id);
    setTicket(t.data);
    setTriageLoading(false);
  };

  const handleUpdate = async () => {
    try {
      await ticketService.updateTicket(id, editForm);
      setEditing(false);
      load();
    } catch (e) {
      alert('Failed to update ticket');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      await ticketService.deleteTicket(id);
      navigate('/tickets');
    } catch (e) {
      alert('Failed to delete ticket');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!ticket) return (
    <div className="text-center py-20 text-gray-500">Ticket not found</div>
  );

  const currentStep = STEPS.indexOf(ticket.status);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate('/tickets')}
            className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}>
              {ticket.status?.replace('_',' ')}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_STYLES[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {ticket.category}
            </span>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">{ticket.title}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">

        {/* Rejected banner */}
        {ticket.status === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-sm">Ticket Rejected</p>
            <p className="text-red-600 text-sm mt-1">{ticket.rejectionReason}</p>
          </div>
        )}

        {/* Status timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Status Timeline</p>
          <div className="flex items-center">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i < currentStep ? '✓' : i+1}
                  </div>
                  <span className={`text-xs mt-1 text-center w-16 ${
                    i <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}>
                    {step.replace('_',' ')}
                  </span>
                </div>
                {i < STEPS.length-1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${
                    i < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Left — main content */}
          <div className="md:col-span-2 space-y-4">

            {/* Details card with edit/delete */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)}
                    className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition">
                    ✏️ Edit
                  </button>
                  <button onClick={handleDelete}
                    className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition">
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Title</label>
                    <input value={editForm.title}
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Category</label>
                      <select value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white">
                        {['ELECTRICAL','PLUMBING','IT','HVAC','GENERAL'].map(c=>(
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Priority</label>
                      <select value={editForm.priority}
                        onChange={e => setEditForm({...editForm, priority: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-white">
                        {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Location</label>
                    <input value={editForm.location}
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Description</label>
                    <textarea value={editForm.description} rows={4}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleUpdate}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Save Changes
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    ['Description', ticket.description],
                    ['Location',    ticket.location],
                    ['Reporter',    ticket.userName || 'Unknown'],
                    ['Technician',  ticket.assignedToName || 'Unassigned'],
                    ['Contact',     ticket.contactDetails || '—'],
                    ['Created',     ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'],
                  ].map(([k,v]) => (
                    <div key={k} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500 w-24 shrink-0">{k}</span>
                      <span className="text-sm text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolution notes */}
            {ticket.resolutionNotes && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">Resolution Notes</p>
                <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Comments ({comments.length})
              </p>
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
              )}
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{c.userName}</span>
                      <span className="text-xs text-gray-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && sendComment()}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button onClick={sendComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* AI Triage */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-blue-700">🤖 AI Triage</p>
                <button onClick={runTriage} disabled={triageLoading}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {triageLoading ? '...' : ticket.aiTriage ? 'Re-Analyze' : 'Run Analysis'}
                </button>
              </div>
              {triageLoading && (
                <div className="text-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-blue-600 mt-2">Analyzing with AI...</p>
                </div>
              )}
              {ticket.aiTriage && !triageLoading && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-500">Suggested Priority</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mt-1 inline-block ${PRIORITY_STYLES[ticket.aiTriage.suggestedPriority]}`}>
                      {ticket.aiTriage.suggestedPriority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">Est. Resolution</p>
                    <p className="text-xs font-medium text-blue-700">{ticket.aiTriage.estimatedResolutionTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">Recommended Action</p>
                    <p className="text-xs text-blue-700">{ticket.aiTriage.recommendedAction}</p>
                  </div>
                  <button onClick={() => setAiOpen(!aiOpen)}
                    className="text-xs text-blue-500 underline mt-1">
                    {aiOpen ? 'Hide' : 'Show'} reasoning
                  </button>
                  {aiOpen && (
                    <p className="text-xs text-blue-600 italic bg-white rounded-lg p-2">
                      {ticket.aiTriage.reasoning}
                    </p>
                  )}
                </div>
              )}
              {!ticket.aiTriage && !triageLoading && (
                <p className="text-xs text-blue-400 text-center py-2">Click Run Analysis to start</p>
              )}
            </div>

            {/* Image attachments */}
            {ticket.imageUrls && ticket.imageUrls.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Attachments ({ticket.imageUrls.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ticket.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt={`attachment ${i+1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}