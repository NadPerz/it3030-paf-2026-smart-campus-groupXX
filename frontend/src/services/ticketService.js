import api from './api';

/**
 * Ticket service — Member 3 responsibility.
 * Calls /api/tickets endpoints.
 */
export const ticketService = {
  // ── TICKETS ───────────────────────────────────────────────
  createTicket:      (data)        => api.post('/tickets', data),
  getAllTickets:      ()            => api.get('/tickets'),
  getMyTickets:      ()            => api.get('/tickets/my'),
  getAssignedTickets:()            => api.get('/tickets/assigned'),
  getTicketById:     (id)          => api.get(`/tickets/${id}`),
  updateTicket:      (id, data)    => api.put(`/tickets/${id}`, data),
  deleteTicket:      (id)          => api.delete(`/tickets/${id}`),

  // ── STATUS & ACTIONS ──────────────────────────────────────
  updateStatus:      (id, data)    => api.patch(`/tickets/${id}/status`, data),
  assignTechnician:  (id, data)    => api.patch(`/tickets/${id}/assign`, data),
  rejectTicket:      (id, data)    => api.patch(`/tickets/${id}/reject`, data),
  resolveTicket:     (id, data)    => api.patch(`/tickets/${id}/resolve`, data),

  // ── COMMENTS ──────────────────────────────────────────────
  getComments:       (id)          => api.get(`/tickets/${id}/comments`),
  addComment:        (id, data)    => api.post(`/tickets/${id}/comments`, data),
  editComment:       (id, cid, data) => api.put(`/tickets/${id}/comments/${cid}`, data),
  deleteComment:     (id, cid)     => api.delete(`/tickets/${id}/comments/${cid}`),

  // ── AI TRIAGE ─────────────────────────────────────────────
  runTriage:         (id)          => api.post(`/tickets/${id}/triage`),
  getTriageResult:   (id)          => api.get(`/tickets/${id}/triage`),

  // ── IMAGE UPLOAD ──────────────────────────────────────────
  uploadImages: (id, files) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return api.post(`/tickets/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (id, imgId) => api.delete(`/tickets/${id}/images/${imgId}`),
};