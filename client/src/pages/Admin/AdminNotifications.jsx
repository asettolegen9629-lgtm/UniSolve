import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI, feedbackAPI, toAbsoluteApiUrl } from '../../services/api';
import { useDocumentVisibleInterval } from '../../hooks/useDocumentVisibleInterval';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Bell, MessageSquare, FileText, X } from 'lucide-react';

const ADMIN_NOTIFICATIONS_POLL_MS = 5000;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchNotifications = useCallback(async (opts = {}) => {
    const silent = opts.silent === true;
    try {
      const data = await notificationsAPI.getAdminNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      if (!silent) toast.error('Failed to load notifications');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications({ silent: false });
  }, [fetchNotifications]);

  useDocumentVisibleInterval(() => fetchNotifications({ silent: true }), ADMIN_NOTIFICATIONS_POLL_MS);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAdminNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      // Refresh unread count and notify other components
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'feedback_received') return <MessageSquare className="w-5 h-5" />;
    if (type === 'new_report') return <FileText className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type) => {
    if (type === 'feedback_received') return 'bg-purple-100 text-purple-700';
    if (type === 'new_report') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getInitials = (text) => {
    if (!text) return 'A';
    const words = text.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">New reports and feedback from users</p>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-2">New reports and feedback will appear here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${
                !notification.isRead 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                } ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">{notification.message}</p>
                  
                  {/* Report Info */}
                  {notification.report && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Report:</span>
                        <span className="text-sm font-medium text-gray-900">
                          &quot;{notification.report.description?.substring(0, 50)}
                          {notification.report.description?.length > 50 ? '...' : ''}&quot;
                        </span>
                      </div>
                      {notification.report.user && (
                        <div className="text-sm text-gray-600 mb-2">
                          From: <span className="font-medium text-gray-900">
                            {notification.report.user.fullName} (@{notification.report.user.username})
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {notification.report.category && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {notification.report.category}
                          </span>
                        )}
                        {!notification.report.isApproved && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                            Pending admin approval
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback Info */}
                  {notification.feedback && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-semibold text-purple-900 mb-2">
                        New Feedback from User
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Type:</strong> {
                          notification.feedback.type === 'problem_solved' ? 'Problem solved' :
                          notification.feedback.type === 'still_have_question' ? 'I still have question' :
                          'Help me again, please'
                        }
                      </p>
                      <p className="text-sm text-gray-800 bg-white p-2 rounded border border-purple-100">
                        {notification.feedback.message}
                      </p>
                      {notification.report && (
                        <p className="text-xs text-gray-600 mt-2">
                          Related to report: &quot;{notification.report.description?.substring(0, 40)}...&quot;
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {moment(notification.createdAt).fromNow()}
                    </span>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.report && (
                        <button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowDetails(true);
                          }}
                          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                          Show Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedNotification && selectedNotification.report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedNotification(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 mt-1">{selectedNotification.report.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 mt-1">{selectedNotification.report.category}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900 mt-1">
                    {!selectedNotification.report.isApproved ? 'Pending Approval' :
                     selectedNotification.report.status === 'done' ? 'Done' :
                     selectedNotification.report.status === 'in-progress' ? 'In Progress' :
                     'New'}
                  </p>
                </div>

                {selectedNotification.report.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">User</label>
                    <p className="text-gray-900 mt-1">
                      {selectedNotification.report.user.fullName} (@{selectedNotification.report.user.username})
                    </p>
                  </div>
                )}

                {selectedNotification.report.images && selectedNotification.report.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Images ({selectedNotification.report.images.length})
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedNotification.report.images.map((img, i) => (
                        <img
                          key={i}
                          src={toAbsoluteApiUrl(img.url)}
                          alt={`Report image ${i + 1}`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

