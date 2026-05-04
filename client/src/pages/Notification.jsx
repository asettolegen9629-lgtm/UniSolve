import React, { useState, useEffect } from "react";
import { notificationsAPI, toAbsoluteApiUrl } from '../services/api';
import moment from 'moment';

const styles = {
  pageContainer: {
    padding: '40px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    color: '#718096',
    marginBottom: '32px',
    fontSize: '15px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '900px',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0,
    marginRight: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    margin: 0,
    color: '#2d3748',
    lineHeight: 1.6,
    fontSize: '15px',
    fontWeight: 500,
  },
  itemTime: {
    fontSize: '13px',
    color: '#a0aec0',
    marginTop: '8px',
    display: 'block',
  }
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Function to get avatar color based on initials
const getAvatarColor = (initial) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
};

// Helper to truncate long text
const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Image Modal Component
const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '0',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          <span>←</span> Back
        </button>
        <img
          src={imageUrl}
          alt="Report"
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>
    </div>
  );
};

// Renders a single notification item
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const initial = getInitials(notification.message.split(' ')[0]);
  const isUnread = !notification.isRead;
  const report = notification.report;
  
  // Derive human-friendly status for the related report
  let reportStatusLabel = '';
  if (report) {
    if (!report.isApproved) {
      reportStatusLabel = 'Pending admin approval';
    } else if (report.status === 'done') {
      reportStatusLabel = 'Done';
    } else {
      reportStatusLabel = 'In progress';
    }
  }
  
  // Get image URLs
  const imageUrls = report?.images?.map(img => {
    const url = img.url || img;
    return toAbsoluteApiUrl(url);
  }) || [];
  
  const handleToggleDetails = (e) => {
    e.stopPropagation();
    if (report) {
      setShowDetails(!showDetails);
    }
  };
  
  return (
    <>
      <div 
        style={{
          ...styles.itemContainer,
          backgroundColor: isUnread ? '#f0f9ff' : 'white',
          borderLeft: isUnread ? '4px solid #3b82f6' : '4px solid transparent',
        }}
      >
        <div style={{
          ...styles.avatar,
          backgroundColor: getAvatarColor(initial)
        }}>
          {initial}
        </div>
        <div style={styles.itemContent}>
          <p style={styles.itemText}>
            {notification.message}
          </p>
          {report ? (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#4a5568' }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#2d3748' }}>Report:</span>{' '}
                <span style={{ color: '#4a5568' }}>&quot;{truncateText(report.description || 'No description')}&quot;</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {report.category && (
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    backgroundColor: '#eef2ff', 
                    color: '#6366f1',
                    fontWeight: 500
                  }}>
                    {report.category}
                  </span>
                )}
                {reportStatusLabel && (
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    backgroundColor: reportStatusLabel === 'Done' ? '#d1fae5' : reportStatusLabel === 'Pending admin approval' ? '#fef3c7' : '#dbeafe',
                    color: reportStatusLabel === 'Done' ? '#059669' : reportStatusLabel === 'Pending admin approval' ? '#d97706' : '#2563eb',
                    fontWeight: 500
                  }}>
                    {reportStatusLabel}
                  </span>
                )}
              </div>
            </div>
          ) : notification.reportId && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#a0aec0', fontStyle: 'italic' }}>
              Report details not available
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <span style={styles.itemTime}>{moment(notification.createdAt).fromNow()}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4f46e5';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6366f1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Mark as read
                </button>
              )}
              {report && (
                <button
                  onClick={handleToggleDetails}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: showDetails ? '#6366f1' : '#f1f5f9',
                    color: showDetails ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!showDetails) {
                      e.target.style.backgroundColor = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDetails) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>
          </div>
          
          {/* Expanded details card */}
          {showDetails && report && (
            <div style={{
              marginTop: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  color: '#1a202c', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <span style={{ fontSize: '24px' }}>📋</span>
                  Report Details
                </h4>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <p style={{ 
                    fontSize: '15px', 
                    color: '#4a5568', 
                    lineHeight: 1.7, 
                    whiteSpace: 'pre-wrap', 
                    margin: 0 
                  }}>
                    {report.description || 'No description available'}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '12px', 
                marginBottom: '16px' 
              }}>
                {report.category && (
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</div>
                    <div style={{ fontSize: '15px', color: '#6366f1', fontWeight: 600 }}>
                      {report.category}
                    </div>
                  </div>
                )}
                
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                  <div style={{ 
                    fontSize: '15px', 
                    color: reportStatusLabel === 'Done' ? '#059669' : reportStatusLabel === 'Pending admin approval' ? '#d97706' : '#2563eb',
                    fontWeight: 600
                  }}>
                    {reportStatusLabel}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
                  <div style={{ fontSize: '15px', color: '#2d3748', fontWeight: 600 }}>
                    {moment(report.createdAt).format('MMM DD, YYYY')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                    {moment(report.createdAt).format('HH:mm')}
                  </div>
                </div>
              </div>
              
              {imageUrls.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#1a202c', 
                    marginBottom: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                    <span style={{ fontSize: '20px' }}>🖼️</span>
                    Images ({imageUrls.length})
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: '12px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    {imageUrls.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          position: 'relative',
                          padding: '8px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(imgUrl);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                          e.currentTarget.style.borderColor = '#6366f1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <img 
                          src={imgUrl}
                          alt={`Report image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

// Main notifications page component
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getAll();
      console.log('Fetched notifications:', data);
      // Log report data for debugging
      data.forEach((notif, index) => {
        if (notif.report) {
          console.log(`Notification ${index + 1} has report:`, {
            id: notif.report.id,
            description: notif.report.description,
            category: notif.report.category,
            images: notif.report.images?.length || 0
          });
        } else {
          console.log(`Notification ${index + 1} has NO report`);
        }
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      // Notify other components (MenuItems) to refresh unread counter
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          fontSize: '16px',
          color: '#718096'
        }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Notifications</h1>
      <p style={styles.pageSubtitle}>Comments and updates on your reports</p>
      
      <div style={styles.listContainer}>
        {notifications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <p style={{ color: '#718096', fontSize: '16px', margin: 0 }}>
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
