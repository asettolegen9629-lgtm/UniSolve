// import React from 'react'

// const Profile = () => {
//   return (
//     <div>Profile</div>
//   )
// }

// export default Profile

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Camera, Mail, Lock, Moon, Sun, Heart, MessageCircle, Edit2, Save, X } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard'
import { usersAPI, reportsAPI } from '../services/api'
import { likesAPI } from '../services/api'

const Profile = () => {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  useEffect(() => {
    if (clerkUser) {
      fetchUserData();
      fetchUserReports();
    }
  }, [clerkUser]);

  const fetchUserData = async () => {
    try {
      // Sync user with backend
      if (clerkUser) {
        const syncData = {
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress,
          username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0],
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User',
          profilePicture: clerkUser.imageUrl
        };
        console.log('Syncing user in Profile:', syncData);
        await usersAPI.sync(syncData);
      }
      const userData = await usersAPI.getCurrent();
      console.log('User data in Profile:', userData);
      setUser(userData);
      setEmail(userData.email);
      setUsername(userData.username);
      setProfilePicturePreview(userData.profilePicture || clerkUser?.imageUrl);
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load user data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    setReportsLoading(true);
    try {
      const reports = await reportsAPI.getMyReports();
      console.log('Fetched user reports:', reports);
      
      // Transform to match frontend format (same as Feed.jsx)
      const transformedReports = (reports || []).map(report => ({
        _id: report.id,
        user: {
          _id: report.user?.id || 'unknown',
          full_name: report.user?.fullName || 'Unknown User',
          username: report.user?.username || 'unknown',
          profile_picture: report.user?.profilePicture || ''
        },
        content: report.description || '',
        image_urls: (report.images || []).map(img => {
          const url = img.url || img;
          return url.startsWith('http') ? url : `http://localhost:3000${url}`;
        }),
        likes_count: (report.likes || []).map(like => like.user?.id || like.userId || like.id),
        createdAt: report.createdAt,
        category: report.category || 'Uncategorized',
        status: report.status || 'in-progress',
        comments: report.comments || [],
        isApproved: report.isApproved ?? true,
      }));
      
      console.log('Transformed reports:', transformedReports);
      setUserReports(transformedReports);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load reports');
      setUserReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Convert to base64 so we can persist and reload after refresh
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Update profile picture if changed
      let profilePictureUrl = profilePicturePreview;
      if (profilePicture) {
        // In production, upload image to server first
        // For now, we'll use the preview URL
        profilePictureUrl = profilePicturePreview;
      }

      const updatedUser = await usersAPI.update({
        email,
        username,
        fullName: clerkUser?.fullName,
        profilePicture: profilePictureUrl
      });

      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likesAPI.toggleReportLike(postId);
      // Refresh reports
      fetchUserReports();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user && !clerkUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold overflow-hidden">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  'JD'
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mt-4">{user?.fullName || clerkUser?.fullName}</h2>
            <p className="text-slate-600">@{user?.username || clerkUser?.username}</p>
          </div>

          {/* Account Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Account Settings</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEmail(user?.email || '');
                    setUsername(user?.username || '');
                    setPassword('');
                    setProfilePicturePreview(user?.profilePicture || '');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="john.doe@university.edu"
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="john_warren"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder={isEditing ? "Enter new password" : "••••••"}
                />
              </div>
            </div>

            {/* Update Button */}
            {isEditing && (
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition active:scale-95"
              >
                <Save className="w-5 h-5" />
                Update Profile
              </button>
            )}
          </div>
        </div>

        {/* Your Reports Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Reports</h2>
          <p className="text-slate-600 mb-4">List of all reports you submitted</p>
        </div>

        {/* Reports List */}
        {reportsLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your reports...</p>
          </div>
        ) : userReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">You haven't submitted any reports yet.</p>
            <p className="text-gray-500 mt-2">Create your first report to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {userReports.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isPending={post.isApproved === false}
              />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Profile;