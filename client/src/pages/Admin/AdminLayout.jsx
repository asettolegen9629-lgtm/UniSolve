import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Bell, Star, User, Users, LogOut, Menu, X } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { usersAPI, notificationsAPI, setClerkHeaders } from '../../services/api';
import { useDocumentVisibleInterval } from '../../hooks/useDocumentVisibleInterval';

const ADMIN_UNREAD_POLL_MS = 8000;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (clerkUser) {
        // Set Clerk headers for all API requests
        setClerkHeaders(clerkUser);
        
        try {
          const userData = await usersAPI.getCurrent();
          setUser(userData);
          setIsAdmin(userData.isAdmin || false);
          
          if (!userData.isAdmin) {
            // Redirect to regular user pages if not admin
            navigate('/');
          } else {
            // Fetch admin unread count
            fetchAdminUnreadCount();
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
  }, [clerkUser, navigate]);

  const fetchAdminUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsAPI.getAdminUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching admin unread count:', error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUnreadCount();
      const onUpdated = () => fetchAdminUnreadCount();
      window.addEventListener('notifications-updated', onUpdated);
      return () => {
        window.removeEventListener('notifications-updated', onUpdated);
      };
    }
  }, [isAdmin, fetchAdminUnreadCount]);

  useDocumentVisibleInterval(
    () => {
      if (isAdmin) fetchAdminUnreadCount();
    },
    isAdmin ? ADMIN_UNREAD_POLL_MS : null
  );

  if (!isAdmin && user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/reports', label: 'Manage Reports', icon: FileText },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/feedback', label: 'Feedback', icon: Star },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
                    isActive
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.to === '/admin/notifications' && unreadCount > 0 && (
                  <span className="absolute left-6 top-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => signOut(() => navigate('/'))}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

