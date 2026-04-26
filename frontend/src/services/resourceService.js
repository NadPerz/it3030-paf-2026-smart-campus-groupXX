import api from './api';

export const resourceService = {
  getAll: () => api.get('/resources'),
  search: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  updateStatus: (id, status) => api.patch(`/resources/${id}/status`, { status }),
  delete: (id) => api.delete(`/resources/${id}`),
};