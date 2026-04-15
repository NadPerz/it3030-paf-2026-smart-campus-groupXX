import { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-gray-100 text-gray-600',
  REJECTED:    'bg-red-100 text-red-700',
};

const PRIORITY_STYLES = {
  LOW:      'bg-green-50 text-green-700',
  MEDIUM:   'bg-yellow-50 text-yellow-700',
  HIGH:     'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ status:'', priority:'', search:'' });
  const navigate = useNavigate();

  useEffect(() => {
    ticketService.getAllTickets()
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t =>
    (!filter.status   || t.status   === filter.status) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.search   || t.title?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Tickets</h1>
          <p className="text-sm text-gray-500">Track your incident reports</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Ticket
        </button>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total',       value: tickets.length,                                    color:'text-gray-700', bg:'bg-white' },
            { label:'Open',        value: tickets.filter(t=>t.status==='OPEN').length,       color:'text-blue-600', bg:'bg-blue-50' },
            { label:'In Progress', value: tickets.filter(t=>t.status==='IN_PROGRESS').length,color:'text-amber-600',bg:'bg-amber-50' },
            { label:'Resolved',    value: tickets.filter(t=>t.status==='RESOLVED').length,   color:'text-green-600',bg:'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text" placeholder="Search tickets..."
            value={filter.search}
            onChange={e => setFilter({...filter, search:e.target.value})}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select value={filter.status}
            onChange={e => setFilter({...filter, status:e.target.value})}
            className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Statuses</option>
            {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s=>(
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </select>
          <select value={filter.priority}
            onChange={e => setFilter({...filter, priority:e.target.value})}
            className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Priorities</option>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p=>(
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(filter.status||filter.priority||filter.search) && (
            <button onClick={()=>setFilter({status:'',priority:'',search:''})}
              className="text-sm text-red-500 px-2">✕ Clear</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-semibold text-gray-600">No tickets found</h3>
            <p className="text-gray-400 text-sm mt-1">Create your first ticket to get started</p>
            <button onClick={()=>navigate('/tickets/new')}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm">
              + Create Ticket
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ticket => (
            <div key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800 text-sm flex-1 line-clamp-2 pr-2">
                  {ticket.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[ticket.status]}`}>
                  {ticket.status?.replace('_',' ')}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {ticket.category}
                </span>
              </div>
              <p className="text-gray-500 text-xs line-clamp-2 mb-3">{ticket.description}</p>
              <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span>📍 {ticket.location}</span>
                <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
              </div>
              {ticket.aiTriage && (
                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-xs text-blue-600">
                  🤖 AI: {ticket.aiTriage.suggestedPriority} — {ticket.aiTriage.recommendedAction?.slice(0,40)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}