import axios from 'axios';

const DEV_FALLBACK_API_URL = 'http://localhost:3000/api';

/**
 * Render: `unislove.onrender.com` is often a typo or unused hostname (no Web Service → no CORS).
 * The live UniSolve API runs on `unisolve.onrender.com`. Normalizes the common mistake at runtime
 * so production works even if Vercel still has the wrong VITE_API_URL.
 */
function normalizeProductionApiUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/unislove\.onrender\.com/gi, 'unisolve.onrender.com');
}

const rawApiUrl = normalizeProductionApiUrl(import.meta.env.VITE_API_URL);
export const API_URL = rawApiUrl || (import.meta.env.DEV ? DEV_FALLBACK_API_URL : '');
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const toAbsoluteApiUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    const legacyLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i;
    if (legacyLocal.test(url)) {
      const pathOnly = url.replace(/^https?:\/\/[^/]+/, '');
      return `${API_ORIGIN}${pathOnly}`;
    }
    return url;
  }
  return `${API_ORIGIN}${url}`;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Keeping requests from hanging forever when backend is down.
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
    if (!API_URL) {
      return Promise.reject(
        new Error('Missing VITE_API_URL in production environment')
      );
    }

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
  // Admin methods
  getAll: async () => {
    const response = await api.get('/users/admin/all');
    return response.data;
  },
  makeAdmin: async (id, isAdmin) => {
    const response = await api.put(`/users/admin/${id}/make-admin`, { isAdmin });
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
  verify: async (id, isVerified) => {
    const response = await api.put(`/reports/${id}/status`, { isVerified });
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
  // Admin methods
  getAllForAdmin: async () => {
    const response = await api.get('/reports/admin/all');
    return response.data;
  },
  getAdminStatistics: async () => {
    const response = await api.get('/reports/admin/statistics');
    return response.data;
  },
  approve: async (id, approve = true) => {
    const response = await api.put(`/reports/${id}/approve`, { isApproved: approve });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/reports/${id}`);
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
  // Admin methods
  getAdminNotifications: async () => {
    const response = await api.get('/notifications/admin/all');
    return response.data;
  },
  getAdminUnreadCount: async () => {
    const response = await api.get('/notifications/admin/unread-count');
    return response.data;
  },
  markAdminNotificationAsRead: async (id) => {
    const response = await api.put(`/notifications/admin/${id}/read`);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  create: async (message, type, reportId = null) => {
    const response = await api.post('/feedback', { message, type, reportId });
    return response.data;
  },
  getByReport: async (reportId) => {
    const response = await api.get(`/feedback/report/${reportId}`);
    return response.data;
  },
  // Admin methods
  getAllForAdmin: async () => {
    const response = await api.get('/feedback/admin/all');
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get('/feedback/admin/statistics');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/feedback/admin/${id}/read`);
    return response.data;
  },
};

export default api;

