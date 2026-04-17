import { useState, useRef } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PRIORITY_COLOR = { LOW:'#16a34a', MEDIUM:'#d97706', HIGH:'#dc2626', CRITICAL:'#7c3aed' };
const PRIORITY_BG    = { LOW:'#dcfce7', MEDIUM:'#fef3c7', HIGH:'#fee2e2', CRITICAL:'#ede9fe' };

const FACULTIES = [
  'Faculty of Computing','School of Business','Faculty of Engineering',
  'Faculty of Humanities & Sciences','School of Architecture',
  'Faculty of Graduate Studies & Research',
];

const CATEGORIES = [
  { value:'ELECTRICAL', label:'Electrical',          icon:'⚡' },
  { value:'PLUMBING',   label:'Plumbing',            icon:'🔧' },
  { value:'IT',         label:'IT / Network',        icon:'💻' },
  { value:'HVAC',       label:'HVAC / Air Con',      icon:'❄️' },
  { value:'GENERAL',    label:'General Maintenance', icon:'📦' },
];

const PRIORITIES = [
  { value:'LOW',      label:'Low',      sub:'Minor, not urgent',         color:'#16a34a' },
  { value:'MEDIUM',   label:'Medium',   sub:'Needs attention soon',      color:'#d97706' },
  { value:'HIGH',     label:'High',     sub:'Urgent, significant impact', color:'#dc2626' },
  { value:'CRITICAL', label:'Critical', sub:'Emergency!',                color:'#7c3aed' },
];

export default function CreateTicketPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef();

  const email = user?.email || '';
  const name  = user?.name  || '';
  const regNo = email.includes('@') ? email.split('@')[0].toUpperCase() : '';

  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [images, setImages]     = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [form, setForm] = useState({
    title:'', category:'', priority:'MEDIUM',
    location:'', description:'', contactDetails:'',
    faculty:'', resourceId:'', userEmail:'', userRegNo:'',
  });

  const up = (f, v) => setForm({ ...form, [f]: v });

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f =>
      ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 5*1024*1024
    );
    setImages(prev => [...prev, ...valid].slice(0, 3));
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Contact number is required.';
    if (!phone.startsWith('0')) return 'Contact number must start with 0.';
    if (!/^\d+$/.test(phone)) return 'Contact number must contain digits only.';
    if (phone.length !== 10) return 'Contact number must be exactly 10 digits.';
    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    up('contactDetails', val);
    if (val.length > 0) setPhoneError(validatePhone(val));
    else setPhoneError('');
  };

  const validateStep1 = () => {
    if (!name) { setError('You must be logged in to submit a ticket.'); return false; }
    if (!form.faculty) { setError('Please select your Faculty / School.'); return false; }
    const pe = validatePhone(form.contactDetails);
    if (pe) { setError(pe); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!form.title.trim())          { setError('Issue title is required.'); return false; }
    if (!form.category)              { setError('Please select a category.'); return false; }
    if (!form.location.trim())       { setError('Location is required.'); return false; }
    if (form.description.length < 10){ setError('Description must be at least 10 characters.'); return false; }
    setError(''); return true;
  };

  const goNext = () => {
    if (step===1 && validateStep1()) setStep(2);
    if (step===2 && validateStep2()) setStep(3);
  };

  const reset = () => {
    setForm({ title:'', category:'', priority:'MEDIUM', location:'', description:'',
      contactDetails:'', faculty:'', resourceId:'', userEmail:'', userRegNo:'' });
    setImages([]); setError(''); setPhoneError(''); setStep(1);
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await ticketService.createTicket({
        title:          form.title,
        category:       form.category,
        priority:       form.priority,
        location:       form.location,
        description:    form.description,
        contactDetails: form.contactDetails,
        faculty:        form.faculty,
        resourceId:     form.resourceId,
        userName:       name,
        userEmail:      form.userEmail  || email,
        userRegNo:      form.userRegNo  || regNo,
      });
      navigate(`/tickets/${res.data.id}`);
    } catch {
      setError('Failed to submit. Please try again.');
      setLoading(false);
    }
  };

  const inp = {
    width:'100%', padding:'10px 14px', border:'1px solid #e5e7eb',
    borderRadius:'8px', fontSize:'0.875rem', outline:'none',
    boxSizing:'border-box', background:'white', fontFamily:'inherit',
    transition:'border-color 0.2s, box-shadow 0.2s'
  };
  const ro  = { ...inp, background:'#f8fafc', color:'#6b7280', cursor:'not-allowed' };
  const lbl = { display:'block', fontWeight:'600', fontSize:'0.82rem', marginBottom:'5px', color:'#374151' };
  const hint= { fontSize:'0.75rem', color:'#94a3b8', marginBottom:'6px' };

  const focusStyle = (e) => {
    e.target.style.borderColor='#3b82f6';
    e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor='#e5e7eb';
    e.target.style.boxShadow='none';
  };

  const steps = ['Your Details','Issue Details','Review & Submit'];

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'24px 28px',
      fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom:'24px' }}>
        <button onClick={() => navigate('/tickets')} style={{
          background:'white', border:'1px solid #e5e7eb', borderRadius:'8px',
          padding:'7px 14px', fontSize:'0.82rem', fontWeight:'600',
          color:'#374151', cursor:'pointer', marginBottom:'16px',
          boxShadow:'0 1px 3px rgba(0,0,0,0.06)'
        }}>← Back</button>
        <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:'800',
          color:'#0f172a', letterSpacing:'-0.02em' }}>
          Submit a New Ticket
        </h2>
        <p style={{ margin:'5px 0 0', color:'#94a3b8', fontSize:'0.875rem' }}>
          Complete this form and a technician will be assigned as soon as possible
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:'28px' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center',
            flex: i < steps.length-1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width:'36px', height:'36px', borderRadius:'50%', fontWeight:'700',
                fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center',
                background: step>i+1 ? '#22c55e' : step===i+1
                  ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : '#f1f5f9',
                color: step>=i+1 ? 'white' : '#94a3b8',
                boxShadow: step===i+1 ? '0 2px 8px rgba(29,78,216,0.3)' : 'none',
                transition:'all 0.3s'
              }}>
                {step>i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontSize:'0.7rem', marginTop:'5px', fontWeight:'600',
                color: step===i+1 ? '#1d4ed8' : step>i+1 ? '#22c55e' : '#94a3b8',
                whiteSpace:'nowrap' }}>
                {s}
              </span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:'2px', margin:'0 8px', marginBottom:'20px',
                background: step>i+1 ? 'linear-gradient(90deg,#22c55e,#3b82f6)' : '#f1f5f9',
                borderRadius:'2px' }} />
            )}
          </div>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background:'#fee2e2', border:'1px solid #fecaca', color:'#7f1d1d',
          padding:'12px 16px', borderRadius:'10px', marginBottom:'16px',
          fontSize:'0.875rem', borderLeft:'4px solid #dc2626' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <div style={{ background:'white', border:'1px solid #f0f0f0', borderRadius:'14px',
          overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:'20px' }}>
          <div style={{ padding:'16px 24px',
            background:'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
            <h3 style={{ margin:0, color:'white', fontSize:'1rem', fontWeight:'700' }}>
              Your Details
            </h3>
            <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,0.75)', fontSize:'0.82rem' }}>
              Auto-filled from your account — edit if needed
            </p>
          </div>
          <div style={{ padding:'24px' }}>

            {/* Name — readonly */}
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Full Name</label>
              <div style={{ position:'relative' }}>
                <input style={ro} value={name} readOnly />
                <span style={{ position:'absolute', right:'12px', top:'50%',
                  transform:'translateY(-50%)', fontSize:'0.7rem', color:'#94a3b8' }}>
                  auto-filled
                </span>
              </div>
            </div>

            {/* Email — editable */}
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Email Address *</label>
              <p style={hint}>Auto-filled — you can edit if needed</p>
              <input style={inp}
                value={form.userEmail || email}
                onChange={e => up('userEmail', e.target.value)}
                placeholder="your@email.com"
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Reg No — editable */}
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Registration Number *</label>
              <p style={hint}>Auto-filled from your email — you can edit if needed</p>
              <input style={inp}
                value={form.userRegNo || regNo}
                onChange={e => up('userRegNo', e.target.value.toUpperCase())}
                placeholder="e.g. IT23654280"
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Faculty */}
            <div style={{ marginBottom:'16px' }}>
              <label style={lbl}>Faculty / School *</label>
              <p style={hint}>Select your faculty or school</p>
              <select style={inp} value={form.faculty}
                onChange={e => up('faculty', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">-- Select Faculty --</option>
                {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Phone — validated */}
            <div>
              <label style={lbl}>Contact Number *</label>
              <p style={hint}>Must start with 0 and be exactly 10 digits</p>
              <div style={{ position:'relative' }}>
                <input style={{
                  ...inp,
                  borderColor: phoneError ? '#dc2626'
                    : form.contactDetails.length===10 && !phoneError ? '#22c55e'
                    : '#e5e7eb',
                  boxShadow: phoneError ? '0 0 0 3px rgba(220,38,38,0.1)'
                    : form.contactDetails.length===10 && !phoneError
                    ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none'
                }}
                  value={form.contactDetails}
                  onChange={handlePhoneChange}
                  placeholder="0771234567"
                  maxLength={10}
                  inputMode="numeric"
                  onFocus={focusStyle}
                  onBlur={e => {
                    blurStyle(e);
                    if (form.contactDetails) setPhoneError(validatePhone(form.contactDetails));
                  }} />
                {/* character counter */}
                <span style={{ position:'absolute', right:'12px', top:'50%',
                  transform:'translateY(-50%)', fontSize:'0.72rem',
                  color: form.contactDetails.length===10 ? '#22c55e' : '#94a3b8',
                  fontWeight:'600' }}>
                  {form.contactDetails.length}/10
                </span>
              </div>
              {phoneError && (
                <div style={{ fontSize:'0.75rem', color:'#dc2626', marginTop:'5px',
                  display:'flex', alignItems:'center', gap:'4px' }}>
                  ⚠ {phoneError}
                </div>
              )}
              {form.contactDetails.length===10 && !phoneError && (
                <div style={{ fontSize:'0.75rem', color:'#16a34a', marginTop:'5px',
                  display:'flex', alignItems:'center', gap:'4px' }}>
                  ✓ Valid contact number
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 2 ══ */}
      {step === 2 && (
        <div style={{ background:'white', border:'1px solid #f0f0f0', borderRadius:'14px',
          overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:'20px' }}>
          <div style={{ padding:'16px 24px',
            background:'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
            <h3 style={{ margin:0, color:'white', fontSize:'1rem', fontWeight:'700' }}>
              Issue Details
            </h3>
            <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,0.75)', fontSize:'0.82rem' }}>
              Describe the problem you are experiencing
            </p>
          </div>
          <div style={{ padding:'24px' }}>

            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Issue Title *</label>
              <p style={hint}>A brief summary of the problem</p>
              <input style={inp} value={form.title}
                onChange={e => up('title', e.target.value)}
                placeholder="e.g. AC not working in Lab 3"
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Category cards */}
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Category *</label>
              <p style={hint}>Select the most appropriate category</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px' }}>
                {CATEGORIES.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => up('category', c.value)}
                    style={{
                      padding:'10px 6px', borderRadius:'10px', cursor:'pointer',
                      border: form.category===c.value ? '2px solid #1d4ed8' : '1px solid #e5e7eb',
                      background: form.category===c.value ? '#eff6ff' : 'white',
                      color: form.category===c.value ? '#1d4ed8' : '#374151',
                      textAlign:'center', transition:'all 0.15s',
                      boxShadow: form.category===c.value ? '0 0 0 3px rgba(29,78,216,0.1)' : 'none'
                    }}>
                    <div style={{ fontSize:'1.3rem', marginBottom:'4px' }}>{c.icon}</div>
                    <div style={{ fontSize:'0.65rem', fontWeight:'600', lineHeight:'1.2' }}>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority cards */}
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Priority *</label>
              <p style={hint}>How urgent is this issue?</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button"
                    onClick={() => up('priority', p.value)}
                    style={{
                      padding:'10px 8px', borderRadius:'10px', cursor:'pointer',
                      textAlign:'center',
                      border: form.priority===p.value ? `2px solid ${p.color}` : '1px solid #e5e7eb',
                      background: form.priority===p.value ? PRIORITY_BG[p.value] : 'white',
                      color: form.priority===p.value ? p.color : '#374151',
                      transition:'all 0.15s',
                      boxShadow: form.priority===p.value ? `0 0 0 3px ${p.color}20` : 'none'
                    }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:'700', marginBottom:'2px' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize:'0.65rem', opacity:0.75, lineHeight:'1.2' }}>
                      {p.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
              <div>
                <label style={lbl}>Location *</label>
                <p style={hint}>Building, floor, room number</p>
                <input style={inp} value={form.location}
                  onChange={e => up('location', e.target.value)}
                  placeholder="e.g. Building A, Lab 3"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label style={lbl}>Resource / Asset
                  <span style={{fontWeight:'400', color:'#94a3b8'}}> (optional)</span>
                </label>
                <p style={hint}>Enter resource ID if applicable</p>
                <input style={inp} value={form.resourceId}
                  onChange={e => up('resourceId', e.target.value)}
                  placeholder="e.g. PROJ-001"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <label style={{...lbl, marginBottom:0}}>Description *</label>
                <span style={{ fontSize:'0.75rem',
                  color: form.description.length>1900 ? '#dc2626' : '#94a3b8' }}>
                  {form.description.length} / 2000
                </span>
              </div>
              <p style={hint}>Describe the issue in detail — when it started, impact, what you tried</p>
              <textarea style={{...inp, resize:'vertical', minHeight:'140px', lineHeight:'1.6'}}
                value={form.description}
                onChange={e => up('description', e.target.value.slice(0,2000))}
                placeholder="Please describe the issue in detail..."
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* File upload */}
            <div>
              <label style={lbl}>Attachments
                <span style={{fontWeight:'400', color:'#94a3b8'}}> (optional — max 3 images)</span>
              </label>
              <p style={hint}>jpg, png, webp — max 5MB each</p>
              <div onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}}
                onClick={() => images.length<3 && fileRef.current.click()}
                style={{ border:`2px dashed ${dragOver?'#3b82f6':'#e5e7eb'}`,
                  borderRadius:'10px', padding:'28px 20px', textAlign:'center',
                  background: dragOver?'#eff6ff':'#f8fafc', cursor:'pointer',
                  transition:'all 0.2s' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px', opacity:0.5 }}>📎</div>
                <div style={{ fontSize:'0.875rem', color:'#374151', fontWeight:'600', marginBottom:'4px' }}>
                  Drop files here or{' '}
                  <span style={{ color:'#1d4ed8', textDecoration:'underline' }}>browse</span>
                </div>
                <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>
                  {images.length>=3 ? 'Maximum 3 images reached'
                    : `${3-images.length} slot${3-images.length!==1?'s':''} remaining`}
                </div>
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
                          borderRadius:'8px', border:'1px solid #e5e7eb' }} />
                      <button type="button" onClick={() => removeImage(i)} style={{
                        position:'absolute', top:'-6px', right:'-6px',
                        background:'#dc2626', color:'white', border:'none',
                        borderRadius:'50%', width:'20px', height:'20px',
                        cursor:'pointer', fontSize:'11px', display:'flex',
                        alignItems:'center', justifyContent:'center',
                        boxShadow:'0 1px 4px rgba(0,0,0,0.2)'
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Review ══ */}
      {step === 3 && (
        <div style={{ background:'white', border:'1px solid #f0f0f0', borderRadius:'14px',
          overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:'20px' }}>
          <div style={{ padding:'16px 24px',
            background:'linear-gradient(135deg,#15803d,#22c55e)' }}>
            <h3 style={{ margin:0, color:'white', fontSize:'1rem', fontWeight:'700' }}>
              Review & Submit
            </h3>
            <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,0.75)', fontSize:'0.82rem' }}>
              Please review your details before submitting
            </p>
          </div>
          <div style={{ padding:'24px' }}>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
              {/* Reporter */}
              <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'16px',
                border:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:'700', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'12px' }}>
                  Reporter
                </div>
                {[
                  ['Name',    name],
                  ['Email',   form.userEmail  || email],
                  ['Reg. No', form.userRegNo  || regNo],
                  ['Faculty', form.faculty],
                  ['Contact', form.contactDetails],
                ].map(([k,v]) => (
                  <div key={k} style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:'600',
                      textTransform:'uppercase', letterSpacing:'0.04em' }}>{k}</div>
                    <div style={{ fontSize:'0.82rem', color:'#0f172a', fontWeight:'500',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v||'—'}</div>
                  </div>
                ))}
              </div>

              {/* Issue */}
              <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'16px',
                border:'1px solid #f0f0f0' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:'700', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'12px' }}>
                  Issue
                </div>
                {[
                  ['Title',    form.title],
                  ['Category', form.category],
                  ['Location', form.location],
                  ['Resource', form.resourceId||'—'],
                ].map(([k,v]) => (
                  <div key={k} style={{ marginBottom:'8px' }}>
                    <div style={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:'600',
                      textTransform:'uppercase', letterSpacing:'0.04em' }}>{k}</div>
                    <div style={{ fontSize:'0.82rem', color:'#0f172a', fontWeight:'500' }}>{v||'—'}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:'600',
                    textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'3px' }}>Priority</div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
                    background:PRIORITY_BG[form.priority], color:PRIORITY_COLOR[form.priority],
                    padding:'3px 10px', borderRadius:'20px', fontSize:'0.72rem', fontWeight:'700' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%',
                      background:PRIORITY_COLOR[form.priority] }} />
                    {form.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'14px 16px',
              marginBottom:'16px', border:'1px solid #f0f0f0' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:'700', color:'#94a3b8',
                textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' }}>
                Description
              </div>
              <p style={{ margin:0, fontSize:'0.85rem', color:'#374151', lineHeight:'1.6' }}>
                {form.description}
              </p>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'0.68rem', fontWeight:'700', color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px' }}>
                  Attachments ({images.length})
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {images.map((img,i) => (
                    <img key={i} src={URL.createObjectURL(img)} alt=""
                      style={{ width:'72px', height:'72px', objectFit:'cover',
                        borderRadius:'8px', border:'1px solid #e5e7eb' }} />
                  ))}
                </div>
              </div>
            )}

            {/* AI notice */}
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe',
              borderRadius:'10px', padding:'12px 16px', fontSize:'0.82rem', color:'#1d4ed8' }}>
              🤖 AI triage will automatically analyze your ticket after submission.
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:'8px' }}>
          {step > 1 && (
            <button onClick={() => { setError(''); setStep(s=>s-1); }} style={{
              padding:'9px 18px', borderRadius:'8px', fontWeight:'600',
              border:'1px solid #e5e7eb', background:'white', color:'#374151',
              cursor:'pointer', fontSize:'0.875rem'
            }}>← Back</button>
          )}
          <button onClick={reset} style={{
            padding:'9px 18px', borderRadius:'8px', fontWeight:'600',
            border:'1px solid #e5e7eb', background:'white', color:'#6b7280',
            cursor:'pointer', fontSize:'0.875rem'
          }}>Reset</button>
        </div>

        {step < 3 ? (
          <button onClick={goNext} style={{
            padding:'10px 28px', borderRadius:'10px', fontWeight:'700',
            border:'none', background:'linear-gradient(135deg,#1e40af,#3b82f6)',
            color:'white', cursor:'pointer', fontSize:'0.875rem',
            boxShadow:'0 2px 8px rgba(29,78,216,0.3)'
          }}>Next →</button>
        ) : (
          <button onClick={submit} disabled={loading} style={{
            padding:'12px 36px', borderRadius:'10px', fontWeight:'700', border:'none',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg,#15803d,#22c55e)',
            color:'white', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize:'0.95rem',
            boxShadow: loading ? 'none' : '0 2px 8px rgba(22,163,74,0.35)',
            transition:'all 0.2s'
          }}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        )}
      </div>
    </div>
  );
}
