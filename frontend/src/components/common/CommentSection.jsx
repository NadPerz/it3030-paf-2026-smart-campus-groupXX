import { useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CommentSection({ ticketId, comments, onRefresh }) {
  const { user } = useAuth();
  const currentUser = user?.name || 'Anonymous';

  const [comment, setComment]               = useState('');
  const [replyTo, setReplyTo]               = useState(null); // { id, userName }
  const [editingId, setEditingId]           = useState(null);
  const [editContent, setEditContent]       = useState('');
  const [likes, setLikes]                   = useState({}); // commentId -> bool
  const [sending, setSending]               = useState(false);

  const sendComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const content = replyTo
        ? `@${replyTo.userName} ${comment}`
        : comment;
      await ticketService.addComment(ticketId, { content, userName: currentUser });
      setComment('');
      setReplyTo(null);
      onRefresh();
    } catch { alert('Failed to send comment'); }
    setSending(false);
  };

  const saveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await ticketService.editComment(ticketId, commentId, { content: editContent });
      setEditingId(null);
      setEditContent('');
      onRefresh();
    } catch { alert('Failed to edit comment'); }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await ticketService.deleteComment(ticketId, commentId);
      onRefresh();
    } catch { alert('Failed to delete comment'); }
  };

  const toggleLike = (commentId) => {
    setLikes(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const isMe = (userName) => userName === currentUser;

  return (
    <div style={{ fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ fontSize:'0.78rem', fontWeight:'700', color:'#94a3b8',
        textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px',
        display:'flex', alignItems:'center', gap:'8px' }}>
        Comments
        <span style={{ background:'#e5e7eb', color:'#374151',
          padding:'1px 8px', borderRadius:'10px', fontSize:'0.72rem', fontWeight:'700' }}>
          {comments.length}
        </span>
      </div>

      {/* Reply banner */}
      {replyTo && (
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe',
          borderRadius:'8px', padding:'8px 14px', marginBottom:'10px',
          fontSize:'0.82rem', color:'#1d4ed8',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>Replying to <strong>@{replyTo.userName}</strong></span>
          <button onClick={() => setReplyTo(null)} style={{
            background:'none', border:'none', color:'#6b7280',
            cursor:'pointer', fontSize:'0.8rem', fontWeight:'600' }}>✕ Cancel</button>
        </div>
      )}

      {/* Comment list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
        {comments.length === 0 && (
          <div style={{ textAlign:'center', padding:'24px', color:'#94a3b8',
            background:'#f8fafc', borderRadius:'10px', fontSize:'0.875rem' }}>
            No comments yet — be the first to comment
          </div>
        )}

        {comments.map(c => {
          const mine = isMe(c.userName);
          const liked = likes[c.id] || false;
          const isReply = c.content?.startsWith('@');
          const replyMatch = isReply ? c.content.match(/^(@\S+)\s(.*)$/s) : null;

          return (
            <div key={c.id} style={{
              display:'flex', flexDirection:'column',
              alignItems: mine ? 'flex-end' : 'flex-start',
            }}>
              {/* Sender name + time */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px',
                marginBottom:'4px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                {/* Avatar */}
                <div style={{
                  width:'30px', height:'30px', borderRadius:'50%', flexShrink:0,
                  background: mine ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : '#e5e7eb',
                  color: mine ? 'white' : '#374151',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:'700'
                }}>
                  {c.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize:'0.78rem', fontWeight:'700',
                  color: mine ? '#1d4ed8' : '#374151' }}>
                  {c.userName}
                  {mine && <span style={{ marginLeft:'4px', fontSize:'0.65rem',
                    color:'#60a5fa', fontWeight:'500' }}>(you)</span>}
                </span>
                <span style={{ fontSize:'0.7rem', color:'#9ca3af' }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                </span>
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth:'75%',
                background: mine
                  ? 'linear-gradient(135deg,#1e40af,#3b82f6)'
                  : 'white',
                color: mine ? 'white' : '#374151',
                borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                padding:'10px 14px',
                border: mine ? 'none' : '1px solid #f0f0f0',
                boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
              }}>

                {editingId === c.id ? (
                  <div>
                    <textarea value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb',
                        borderRadius:'6px', fontSize:'0.875rem', resize:'vertical',
                        fontFamily:'inherit', boxSizing:'border-box', minHeight:'60px' }}
                      rows={2} />
                    <div style={{ display:'flex', gap:'6px', marginTop:'6px' }}>
                      <button onClick={() => saveEdit(c.id)} style={{
                        padding:'4px 14px', borderRadius:'6px', border:'none',
                        background:'#1d4ed8', color:'white', fontSize:'0.78rem',
                        fontWeight:'600', cursor:'pointer' }}>Save</button>
                      <button onClick={() => { setEditingId(null); setEditContent(''); }}
                        style={{ padding:'4px 14px', borderRadius:'6px',
                          border:'1px solid #e5e7eb', background:'white',
                          color:'#374151', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Reply preview */}
                    {replyMatch && (
                      <div style={{ fontSize:'0.75rem', marginBottom:'6px',
                        opacity:0.75, fontStyle:'italic' }}>
                        <span style={{ fontWeight:'700' }}>{replyMatch[1]}</span>
                      </div>
                    )}
                    <p style={{ margin:0, fontSize:'0.875rem', lineHeight:'1.5',
                      wordBreak:'break-word' }}>
                      {replyMatch ? replyMatch[2] : c.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions row */}
              {editingId !== c.id && (
                <div style={{ display:'flex', gap:'10px', marginTop:'5px',
                  flexDirection: mine ? 'row-reverse' : 'row',
                  alignItems:'center' }}>

                  {/* Like */}
                  <button onClick={() => toggleLike(c.id)} style={{
                    background:'none', border:'none', cursor:'pointer',
                    fontSize:'0.75rem', color: liked ? '#dc2626' : '#9ca3af',
                    fontWeight:'600', padding:'2px 6px', borderRadius:'6px',
                    display:'flex', alignItems:'center', gap:'3px',
                    transition:'all 0.15s'
                  }}>
                    {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
                  </button>

                  {/* Reply — only for others */}
                  {!mine && (
                    <button onClick={() => {
                      setReplyTo({ id:c.id, userName:c.userName });
                      document.getElementById('comment-input')?.focus();
                    }} style={{
                      background:'none', border:'none', cursor:'pointer',
                      fontSize:'0.75rem', color:'#6b7280', fontWeight:'600',
                      padding:'2px 6px', borderRadius:'6px',
                      display:'flex', alignItems:'center', gap:'3px'
                    }}>
                      ↩ Reply
                    </button>
                  )}

                  {/* Edit & Delete — only own comments */}
                  {mine && (
                    <>
                      <button onClick={() => {
                        setEditingId(c.id);
                        setEditContent(c.content);
                      }} style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontSize:'0.75rem', color:'#60a5fa', fontWeight:'600',
                        padding:'2px 6px', borderRadius:'6px'
                      }}>Edit</button>
                      <button onClick={() => deleteComment(c.id)} style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontSize:'0.75rem', color:'#f87171', fontWeight:'600',
                        padding:'2px 6px', borderRadius:'6px'
                      }}>Delete</button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'10px',
        border:'1px solid #f0f0f0' }}>
        <textarea
          id="comment-input"
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }}}
          placeholder={replyTo ? `Reply to @${replyTo.userName}...` : 'Write a comment... (Enter to send, Shift+Enter for new line)'}
          style={{ width:'100%', border:'none', background:'transparent',
            outline:'none', fontSize:'0.875rem', fontFamily:'inherit',
            resize:'none', minHeight:'60px', color:'#374151', boxSizing:'border-box' }}
          rows={2} />
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginTop:'6px' }}>
          <span style={{ fontSize:'0.72rem', color:'#9ca3af' }}>
            Commenting as <strong style={{color:'#374151'}}>{currentUser}</strong>
          </span>
          <button onClick={sendComment} disabled={sending || !comment.trim()} style={{
            background: comment.trim()
              ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : '#e5e7eb',
            color: comment.trim() ? 'white' : '#9ca3af',
            border:'none', borderRadius:'8px', padding:'7px 18px',
            fontSize:'0.82rem', fontWeight:'700', cursor: comment.trim() ? 'pointer' : 'default',
            transition:'all 0.2s',
            boxShadow: comment.trim() ? '0 2px 8px rgba(29,78,216,0.3)' : 'none'
          }}>
            {sending ? 'Sending...' : replyTo ? '↩ Reply' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}