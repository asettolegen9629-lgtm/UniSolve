import React, { useState, useEffect } from 'react';
import { Search, Shield, UserCheck, UserX, Users } from 'lucide-react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleMakeAdmin = async (userId, isAdmin) => {
    try {
      await usersAPI.makeAdmin(userId, isAdmin);
      toast.success(isAdmin ? 'User is now an admin!' : 'Admin privileges removed!');
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.isAdmin).length;
  const regularUserCount = users.filter(u => !u.isAdmin).length;
  const totalCount = users.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-600 mt-1">View and manage all users</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Admins</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Regular Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{regularUserCount}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName || 'User'}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">@{user.username || 'unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user._count?.reports || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user._count?.comments || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isAdmin 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {moment(user.createdAt).format('DD.MM.YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                        user.isAdmin
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.isAdmin ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Make Admin
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedUser.isAdmin ? 'Remove Admin Privileges' : 'Make User Admin'}
              </h2>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <strong>User:</strong> {selectedUser.fullName} (@{selectedUser.username})
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                {selectedUser.isAdmin
                  ? 'Are you sure you want to remove admin privileges from this user?'
                  : 'Are you sure you want to make this user an admin? They will have access to the admin panel.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleMakeAdmin(selectedUser.id, !selectedUser.isAdmin)}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    selectedUser.isAdmin
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {selectedUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

