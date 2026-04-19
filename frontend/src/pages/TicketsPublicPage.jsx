import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CreateTicketPage from './CreateTicketPage';

const CATEGORIES = [
  { title:'Maintenance & Facilities', desc:'Electrical, plumbing, HVAC, furniture, cleaning' },
  { title:'IT & Network', desc:'Wi-Fi, computers, projectors, software access' },
  { title:'Academic & Study Issues', desc:'Room bookings, library access, lab availability' },
  { title:'Safety & Security', desc:'Campus hazards, lost property, access control' },
];

export default function TicketsPublicPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#1a1a2e'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
      `}</style>

      {/* MAIN CONTAINER */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '36px 24px'
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.3px'
            }}>
              Incident <span style={{ color:'#0e0e0e' }}>Tickets</span>
            </h1>
          </div>

          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Track and manage all your campus support requests in one place
          </p>
        </div>

        {/* DESCRIPTION */}
        <p style={{ margin:'0 0 32px', color:'#374151', fontSize:'0.95rem',
          maxWidth:'680px', lineHeight:'1.7' }}>
          Students can submit tickets for any campus issue — from a broken AC unit to a Wi-Fi outage,
          a missing lab resource, or a study space concern. Every report is automatically triaged and
          routed to the right team, so nothing gets lost. Track your ticket status in real time and
          get notified when it's resolved.
        </p>

        {/* CATEGORY CARDS */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
          gap:'16px',
          marginBottom:'40px'
        }}>
          {CATEGORIES.map(c => (
            <div key={c.title} style={{ background:'white', border:'1px solid #e5e7eb',
              borderRadius:'10px', padding:'20px 22px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.05)', cursor:'default' }}>
              <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'0.95rem',
                marginBottom:'4px' }}>{c.title}</div>
              <div style={{ color:'#6b7280', fontSize:'0.82rem' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* SUBMIT SECTION */}
        <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'48px' }}>
          <p style={{ fontSize:'0.78rem', fontWeight:'700', color:'#1a73e8',
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>
            SUBMIT A REPORT
          </p>

          <h2 style={{ margin:'0 0 8px', fontSize:'1.8rem', fontWeight:'800', color:'#0f172a' }}>
            Let's create your ticket
          </h2>

          <p style={{ margin:'0 0 32px', color:'#64748b', fontSize:'0.9rem' }}>
            Fill in the form below and a responsible team member will be assigned as soon as possible.
          </p>

          {/* FORM DIRECTLY HERE */}
          <div style={{
            marginTop: '24px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px'
          }}>
            <CreateTicketPage lightMode />
          </div>

        </div>

      </div>
    </div>
  );
}