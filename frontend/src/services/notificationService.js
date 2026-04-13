import api from './api';

/**
 * Notification service — Member 4 responsibility.
 * Calls /api/notifications endpoints.
 */

export const notificationService = {
  getAll: ()           => api.get('/notifications'),
  markAsRead: (id)     => api.put(`/notifications/${id}/read`),   // PUT not PATCH
  markAllAsRead: ()    => api.put('/notifications/read-all'),      // PUT not PATCH
  delete: (id)         => api.delete(`/notifications/${id}`),
  getUnreadCount: ()   => api.get('/notifications/unread-count'),
};