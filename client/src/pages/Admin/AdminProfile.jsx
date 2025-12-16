import React, { useState, useEffect } from 'react';
import { Camera, Mail, Lock, Edit2, Save, X, User } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  useEffect(() => {
    if (clerkUser) {
      fetchUserData();
    }
  }, [clerkUser]);

  const fetchUserData = async () => {
    try {
      const userData = await usersAPI.getCurrent();
      setUser(userData);
      setEmail(userData.email);
      setUsername(userData.username);
      setProfilePicturePreview(userData.profilePicture || clerkUser?.imageUrl);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
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
      let profilePictureUrl = profilePicturePreview;
      if (profilePicture) {
        // Convert to base64 for storage
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

  if (loading && !user) {
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
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage profile info.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'A'
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition">
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
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">{user?.fullName || clerkUser?.fullName}</h2>
            <p className="text-gray-600">{user?.email || clerkUser?.primaryEmailAddress?.emailAddress}</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition"
              >
                Change photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Personal info.</h3>
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

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={user?.fullName || clerkUser?.fullName || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Change password.</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder={isEditing ? "Enter new password" : "••••••••"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Update Button */}
        {isEditing && (
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Update Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;

