import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Store Clerk user for use in interceptors
let currentClerkUser = null;

// Helper function to set Clerk headers
export const setClerkHeaders = (user) => {
  currentClerkUser = user;
  if (user) {
    api.defaults.headers.common['x-clerk-user-id'] = user.id;
    api.defaults.headers.common['x-clerk-email'] = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    api.defaults.headers.common['x-clerk-username'] = user.username;
    api.defaults.headers.common['x-clerk-full-name'] = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName;
  }
};

// Add request interceptor to include Clerk auth headers and handle errors
api.interceptors.request.use(
  async (config) => {
    // Set Clerk headers if user is available
    if (currentClerkUser) {
      config.headers['x-clerk-user-id'] = currentClerkUser.id;
      config.headers['x-clerk-email'] = currentClerkUser.primaryEmailAddress?.emailAddress || currentClerkUser.emailAddresses?.[0]?.emailAddress;
      config.headers['x-clerk-username'] = currentClerkUser.username;
      config.headers['x-clerk-full-name'] = `${currentClerkUser.firstName || ''} ${currentClerkUser.lastName || ''}`.trim() || currentClerkUser.fullName;
    }
    
    // Don't set Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', 'No response from server. Is the backend running?');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Users API
export const usersAPI = {
  sync: async (userData) => {
    const response = await api.post('/users/sync', userData);
    return response.data;
  },
  getCurrent: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getMyReports: async () => {
    const response = await api.get('/reports/user/me');
    return response.data;
  },
  updateStatus: async (id, status, isVerified) => {
    const response = await api.put(`/reports/${id}/status`, { status, isVerified });
    return response.data;
  },
  rate: async (id, rating) => {
    const response = await api.put(`/reports/${id}/rate`, { rating });
    return response.data;
  },
  rateByUser: async (id, rating) => {
    const response = await api.put(`/reports/${id}/user-rating`, { rating });
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getByReport: async (reportId) => {
    const response = await api.get(`/comments/report/${reportId}`);
    return response.data;
  },
  create: async (reportId, content, parentCommentId = null) => {
    const response = await api.post(`/comments/report/${reportId}`, { content, parentCommentId });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

// Likes API
export const likesAPI = {
  toggleReportLike: async (reportId) => {
    const response = await api.post(`/likes/report/${reportId}`);
    return response.data;
  },
  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/likes/comment/${commentId}`);
    return response.data;
  },
  getReportLikes: async (reportId) => {
    const response = await api.get(`/likes/report/${reportId}`);
    return response.data;
  },
  getCommentLikes: async (commentId) => {
    const response = await api.get(`/likes/comment/${commentId}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

export default api;

