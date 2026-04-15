import { useState, useRef } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PRIORITY_COLORS = {
  LOW: '#2e7d32', MEDIUM: '#f57c00', HIGH: '#e53935', CRITICAL: '#b71c1c'
};

const FACULTIES = [
  'Faculty of Computing',
  'School of Business',
  'Faculty of Engineering',
  'Faculty of Humanities & Sciences',
  'School of Architecture',
  'Faculty of Graduate Studies & Research',
];

export default function CreateTicketPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef();

  // Auto-fill from OAuth user
  const email    = user?.email || '';
  const name     = user?.name  || '';
  const regNo    = email.includes('@') ? email.split('@')[0].toUpperCase() : '';

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [images, setImages]   = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    title: '', category: '', priority: 'MEDIUM',
    location: '', description: '', contactDetails: '',
    faculty: '', resourceId: '',
  });

  const up = (f, v) => setForm({ ...form, [f]: v });

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f =>
      ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 5*1024*1024
    );
    setImages(prev => [...prev, ...valid].slice(0, 3));
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const validateStep1 = () => {
    if (!name)             { setError('You must be logged in to submit a ticket.'); return false; }
    if (!regNo)            { setError('Registration number could not be determined.'); return false; }
    if (!form.faculty)     { setError('Please select your Faculty / School.'); return false; }
    if (!form.contactDetails.trim()) { setError('Contact number is required.'); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!form.title.trim())    { setError('Issue title is required.'); return false; }
    if (!form.category)        { setError('Please select a category.'); return false; }
    if (!form.location.trim()) { setError('Location is required.'); return false; }
    if (form.description.length < 10) { setError('Description must be at least 10 characters.'); return false; }
    setError(''); return true;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const reset = () => {
    setForm({ title:'', category:'', priority:'MEDIUM', location:'', description:'', contactDetails:'', faculty:'', resourceId:'' });
    setImages([]);
    setError('');
    setStep(1);
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        title: form.title,
        description: `[${regNo}] [${form.faculty}]\n\n${form.description}`,
      };
      const res = await ticketService.createTicket(payload);
      navigate(`/tickets/${res.data.id}`);
    } catch {
      setError('Failed to submit. Please try again.');
      setLoading(false);
    }
  };

  const fs = {
    width:'100%', padding:'10px 14px', border:'1px solid #ccc',
    borderRadius:'4px', fontSize:'0.95rem', outline:'none',
    boxSizing:'border-box', background:'#fafafa', transition:'border-color 0.2s',
  };
  const ls = { display:'block', fontWeight:'600', fontSize:'0.9rem', marginBottom:'4px', color:'#222' };
  const hs = { fontSize:'0.8rem', color:'#666', marginBottom:'6px' };
  const ss = { background:'white', border:'1px solid #e0e0e0', borderRadius:'8px', padding:'28px', marginBottom:'20px' };
  const ts = { fontSize:'1rem', fontWeight:'700', color:'#1a73e8', borderBottom:'1px solid #e8f0fe', paddingBottom:'10px', marginTop:0, marginBottom:'22px' };

  const readonlyStyle = { ...fs, background:'#f1f3f4', color:'#555', cursor:'not-allowed' };

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:'24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/tickets')}
          style={{ marginBottom:'10px', fontSize:'0.85rem' }}>← Back</button>
        <h2 style={{ margin:0, color:'#1a73e8' }}>Submit a New Ticket</h2>
        <p style={{ margin:'4px 0 0', color:'#666', fontSize:'0.9rem' }}>
          Please complete this form and a technician will be assigned as soon as possible.
        </p>
      </div>

      {/* Step bar */}
      <div style={{ display:'flex', marginBottom:'24px' }}>
        {['Your Details','Issue Details','Review & Submit'].map((s,i) => (
          <div key={s} style={{ flex:1, textAlign:'center' }}>
            <div style={{
              padding:'8px 4px', fontSize:'0.82rem', fontWeight:'600',
              background: step===i+1?'#1a73e8': step>i+1?'#d4edda':'#f1f3f4',
              color: step===i+1?'white': step>i+1?'#155724':'#888',
              borderRight: i<2?'1px solid white':'none',
              borderRadius: i===0?'6px 0 0 6px': i===2?'0 6px 6px 0':'0'
            }}>
              {step>i+1?'✓ ':`${i+1}. `}{s}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'#fdecea', border:'1px solid #f5c6cb', color:'#721c24',
          padding:'10px 14px', borderRadius:'6px', marginBottom:'16px', fontSize:'0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ══ STEP 1 — Your Details ══ */}
      {step === 1 && (
        <div style={ss}>
          <h3 style={ts}>👤 Section 1 — Your Details</h3>
          <p style={{ color:'#666', fontSize:'0.85rem', marginBottom:'20px' }}>
            Please complete this form and one of our technicians will reply as soon as possible.
          </p>

          {/* Name & Email — auto filled */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'18px' }}>
            <div>
              <label style={ls}>Name *</label>
              <input style={readonlyStyle} value={name} readOnly />
            </div>
            <div>
              <label style={ls}>Email</label>
              <input style={readonlyStyle} value={email} readOnly />
              <p style={{ fontSize:'0.75rem', color:'#1a73e8', margin:'4px 0 0' }}>
                Manage my email addresses
              </p>
            </div>
          </div>

          {/* Registration number — auto filled */}
          <div style={{ marginBottom:'18px' }}>
            <label style={ls}>Registration Number *</label>
            <input style={readonlyStyle} value={regNo} readOnly
              placeholder="Auto-filled from your email" />
          </div>

          {/* Faculty */}
          <div style={{ marginBottom:'18px' }}>
            <label style={ls}>Faculty / School *</label>
            <p style={hs}>Please select your faculty</p>
            <select style={fs} value={form.faculty} onChange={e => up('faculty', e.target.value)}
              onFocus={e => e.target.style.borderColor='#1a73e8'}
              onBlur={e => e.target.style.borderColor='#ccc'}>
              <option value="">Select</option>
              {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Contact */}
          <div>
            <label style={ls}>Contact Number *</label>
            <p style={hs}>Enter your mobile telephone number</p>
            <input style={fs} value={form.contactDetails}
              onChange={e => up('contactDetails', e.target.value)}
              placeholder="e.g. 077-1234567"
              onFocus={e => e.target.style.borderColor='#1a73e8'}
              onBlur={e => e.target.style.borderColor='#ccc'} />
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Issue Details ══ */}
      {step === 2 && (
        <div style={ss}>
          <h3 style={ts}>🔧 Section 2 — Issue Details</h3>

          {/* Title */}
          <div style={{ marginBottom:'18px' }}>
            <label style={ls}>Issue Title *</label>
            <p style={hs}>Briefly describe the problem</p>
            <input style={fs} value={form.title}
              onChange={e => up('title', e.target.value)}
              placeholder="e.g. AC not working in Lab 3"
              onFocus={e => e.target.style.borderColor='#1a73e8'}
              onBlur={e => e.target.style.borderColor='#ccc'} />
          </div>

          {/* Category & Priority */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'18px' }}>
            <div>
              <label style={ls}>Category *</label>
              <p style={hs}>Select the most suitable option</p>
              <select style={fs} value={form.category}
                onChange={e => up('category', e.target.value)}>
                <option value="">-- Select Category --</option>
                <option value="ELECTRICAL">⚡ Electrical</option>
                <option value="PLUMBING">🔧 Plumbing</option>
                <option value="IT">💻 IT / Network</option>
                <option value="HVAC">❄️ HVAC / Air Conditioning</option>
                <option value="GENERAL">📦 General Maintenance</option>
              </select>
            </div>
            <div>
              <label style={ls}>Priority *</label>
              <p style={hs}>How urgent is this issue?</p>
              <select style={{ ...fs, borderLeft:`4px solid ${PRIORITY_COLORS[form.priority]}` }}
                value={form.priority} onChange={e => up('priority', e.target.value)}>
                <option value="LOW">🟢 Low — Minor, not urgent</option>
                <option value="MEDIUM">🟡 Medium — Needs attention soon</option>
                <option value="HIGH">🔴 High — Urgent, significant impact</option>
                <option value="CRITICAL">🚨 Critical — Emergency!</option>
              </select>
            </div>
          </div>

          {/* Priority hint */}
          <div style={{ background:'#f8f9fa', borderRadius:'6px', padding:'10px 14px',
            fontSize:'0.82rem', color:'#555', marginBottom:'18px',
            borderLeft:`3px solid ${PRIORITY_COLORS[form.priority]}` }}>
            {form.priority==='LOW'      && '🟢 Will be addressed within the week.'}
            {form.priority==='MEDIUM'   && '🟡 Will be addressed within 2–3 working days.'}
            {form.priority==='HIGH'     && '🔴 Will be addressed within 24 hours.'}
            {form.priority==='CRITICAL' && '🚨 Emergency — technician will respond immediately.'}
          </div>

          {/* Location & Resource */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'18px' }}>
            <div>
              <label style={ls}>Location *</label>
              <p style={hs}>Building, floor, and room number</p>
              <input style={fs} value={form.location}
                onChange={e => up('location', e.target.value)}
                placeholder="e.g. Building A, Floor 2, Lab 3"
                onFocus={e => e.target.style.borderColor='#1a73e8'}
                onBlur={e => e.target.style.borderColor='#ccc'} />
            </div>
            <div>
              <label style={ls}>Resource / Asset <span style={{ fontWeight:'400', color:'#999' }}>(optional)</span></label>
              <p style={hs}>Enter resource ID if applicable</p>
              <input style={fs} value={form.resourceId}
                onChange={e => up('resourceId', e.target.value)}
                placeholder="e.g. PROJ-001 or LAB-A3"
                onFocus={e => e.target.style.borderColor='#1a73e8'}
                onBlur={e => e.target.style.borderColor='#ccc'} />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:'18px' }}>
            <label style={{ ...ls, display:'flex', justifyContent:'space-between' }}>
              <span>Message / Description *</span>
              <span style={{ fontWeight:'400', fontSize:'0.82rem',
                color: form.description.length > 1900 ? '#e53935':'#999' }}>
                {form.description.length} / 2000
              </span>
            </label>
            <p style={hs}>Describe the issue — when it started, how it affects you, what you have tried.</p>
            <textarea style={{ ...fs, resize:'vertical', fontFamily:'inherit', minHeight:'160px' }}
              value={form.description}
              onChange={e => up('description', e.target.value.slice(0,2000))}
              placeholder="Please describe the issue in detail..."
              onFocus={e => e.target.style.borderColor='#1a73e8'}
              onBlur={e => e.target.style.borderColor='#ccc'} />
          </div>

          {/* File upload */}
          <div>
            <label style={ls}>Add Attachment
              <span style={{ fontWeight:'400', color:'#999' }}> (optional — max 3 images)</span>
            </label>
            <p style={hs}>Supported: jpg, png, webp — max 5MB each</p>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => images.length < 3 && fileRef.current.click()}
              style={{ border:`2px dashed ${dragOver?'#1a73e8':'#ccc'}`,
                borderRadius:'6px', padding:'24px', textAlign:'center',
                background: dragOver?'#e8f0fe':'#fafafa', cursor:'pointer', transition:'all 0.2s' }}>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'12px' }}>
                <button type="button" className="btn btn-secondary"
                  style={{ fontSize:'0.85rem', padding:'6px 16px' }}
                  onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
                  📎 Choose files
                </button>
                <span style={{ color:'#999', fontSize:'0.9rem' }}>or Drag and drop</span>
              </div>
              {images.length >= 3 && (
                <p style={{ margin:'8px 0 0', color:'#e53935', fontSize:'0.82rem' }}>
                  Maximum 3 images reached
                </p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple style={{ display:'none' }}
              onChange={e => handleFiles(e.target.files)} />
            {images.length > 0 && (
              <div style={{ display:'flex', gap:'10px', marginTop:'12px', flexWrap:'wrap' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position:'relative' }}>
                    <img src={URL.createObjectURL(img)} alt=""
                      style={{ width:'80px', height:'80px', objectFit:'cover',
                        borderRadius:'6px', border:'1px solid #ddd' }} />
                    <button type="button" onClick={() => removeImage(i)}
                      style={{ position:'absolute', top:'-6px', right:'-6px',
                        background:'#e53935', color:'white', border:'none',
                        borderRadius:'50%', width:'20px', height:'20px',
                        cursor:'pointer', fontSize:'12px',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ✕
                    </button>
                    <p style={{ margin:'3px 0 0', fontSize:'0.7rem', color:'#666',
                      maxWidth:'80px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Review ══ */}
      {step === 3 && (
        <div style={ss}>
          <h3 style={ts}>✅ Section 3 — Review & Submit</h3>
          <p style={{ color:'#666', fontSize:'0.9rem', marginBottom:'20px' }}>
            Please review your ticket details before submitting.
          </p>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'20px' }}>
            <tbody>
              {[
                ['Name',          name],
                ['Email',         email],
                ['Reg. Number',   regNo],
                ['Faculty',       form.faculty],
                ['Contact',       form.contactDetails],
                ['Title',         form.title],
                ['Category',      form.category],
                ['Priority',      form.priority],
                ['Location',      form.location],
                ['Resource',      form.resourceId || '—'],
                ['Description',   form.description],
                ['Attachments',   `${images.length} image(s)`],
              ].map(([k,v]) => (
                <tr key={k} style={{ borderBottom:'1px solid #f0f0f0' }}>
                  <td style={{ padding:'8px 12px', color:'#666', fontSize:'0.85rem',
                    fontWeight:'600', width:'130px', verticalAlign:'top' }}>{k}</td>
                  <td style={{ padding:'8px 12px', fontSize:'0.88rem', color:'#222' }}>
                    {k==='Priority'
                      ? <span style={{ color:PRIORITY_COLORS[v], fontWeight:'600' }}>● {v}</span>
                      : v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length > 0 && (
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
              {images.map((img,i) => (
                <img key={i} src={URL.createObjectURL(img)} alt=""
                  style={{ width:'64px', height:'64px', objectFit:'cover',
                    borderRadius:'6px', border:'1px solid #ddd' }} />
              ))}
            </div>
          )}
          <div style={{ background:'#e8f0fe', borderRadius:'6px',
            padding:'12px 16px', fontSize:'0.85rem', color:'#1a73e8' }}>
            🤖 AI triage will automatically analyze your ticket after submission.
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px' }}>
        <div style={{ display:'flex', gap:'8px' }}>
          {step > 1 && (
            <button type="button" className="btn btn-secondary"
              onClick={() => { setError(''); setStep(s => s-1); }}>← Back</button>
          )}
          <button type="button" className="btn btn-secondary" onClick={reset}>Reset</button>
        </div>
        <div>
          {step < 3
            ? <button type="button" className="btn btn-primary" onClick={goNext}>Next →</button>
            : <button type="button" className="btn btn-primary"
                onClick={submit} disabled={loading}
                style={{ padding:'10px 28px', fontSize:'1rem' }}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}