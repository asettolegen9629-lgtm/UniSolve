import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Eye, Trash2, Check, X, Star, Shield, CheckCircle2, Plus } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'status', 'rate', 'delete'

  useEffect(() => {
    fetchReports();
    // Auto-refresh every 10 seconds to catch new reports
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, categoryFilter]);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports for admin...');
      const data = await reportsAPI.getAllForAdmin();
      console.log('✅ Reports received:', data.length);
      console.log('   Pending:', data.filter(r => !r.isApproved).length);
      console.log('   Approved:', data.filter(r => r.isApproved).length);
      
      if (data && Array.isArray(data)) {
        setReports(data);
        setFilteredReports(data);
      } else {
        console.error('❌ Invalid data format:', data);
        toast.error('Invalid data received from server');
        setReports([]);
        setFilteredReports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      toast.error(`Failed to load reports: ${errorMessage}`);
      
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(r => !r.isApproved);
      } else {
        filtered = filtered.filter(r => r.status === statusFilter && r.isApproved);
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    setFilteredReports(filtered);
  };

  // Get unique categories from reports
  const getUniqueCategories = () => {
    const categories = [...new Set(reports.map(r => r.category).filter(Boolean))];
    return categories.sort();
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return statusFilter !== 'all' || categoryFilter !== 'all' || searchTerm !== '';
  };

  const handleApprove = async (reportId, approve = true) => {
    try {
      await reportsAPI.approve(reportId, approve);
      toast.success(approve ? 'Report approved and published! User will be notified.' : 'Report rejected! User will be notified.');
      setShowModal(false);
      // Обновляем данные с небольшой задержкой для синхронизации с сервером
      setTimeout(() => {
        fetchReports();
      }, 500);
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error(error.response?.data?.error || 'Failed to update report');
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportsAPI.updateStatus(reportId, newStatus);
      const statusLabel = newStatus === 'done' ? 'Solved' : newStatus === 'in-progress' ? 'In Progress' : newStatus;
      toast.success(`Report status changed to "${statusLabel}"! User will be notified.`);
      setShowModal(false);
      // Обновляем данные с небольшой задержкой для синхронизации с сервером
      setTimeout(() => {
        fetchReports();
      }, 500);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleRate = async (reportId, rating) => {
    try {
      await reportsAPI.rate(reportId, rating);
      toast.success('Report rated!');
      fetchReports();
      setShowModal(false);
    } catch (error) {
      console.error('Error rating report:', error);
      toast.error('Failed to rate report');
    }
  };

  const handleVerify = async (reportId, isVerified) => {
    try {
      await reportsAPI.verify(reportId, isVerified);
      toast.success(isVerified ? 'Report verified!' : 'Report unverified!');
      setShowModal(false);
      // Обновляем данные с небольшой задержкой для синхронизации с сервером
      setTimeout(() => {
        fetchReports();
      }, 500);
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      await reportsAPI.delete(reportId);
      toast.success('Report deleted!');
      setShowModal(false);
      // Обновляем данные с небольшой задержкой для синхронизации с сервером
      setTimeout(() => {
        fetchReports();
      }, 500);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const getStatusColor = (status, isApproved) => {
    if (!isApproved) return 'bg-blue-100 text-blue-700';
    if (status === 'done') return 'bg-green-100 text-green-700';
    if (status === 'in-progress') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusLabel = (status, isApproved) => {
    if (!isApproved) return 'New';
    return status === 'done' ? 'Solved' : status === 'in-progress' ? 'Being Solved' : 'New';
  };

  // Используем useMemo для автоматического пересчета счетчиков при изменении reports
  // ВАЖНО: хуки должны быть до условного возврата!
  const pendingCount = useMemo(() => 
    reports.filter(r => !r.isApproved).length, 
    [reports]
  );
  const inProgressCount = useMemo(() => 
    reports.filter(r => r.isApproved && r.status === 'in-progress').length, 
    [reports]
  );
  const solvedCount = useMemo(() => 
    reports.filter(r => r.isApproved && r.status === 'done').length, 
    [reports]
  );
  const totalCount = reports.length;

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
        <h1 className="text-3xl font-bold text-gray-900">Manage Reports</h1>
        <p className="text-gray-600 mt-1">Edit all reports</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => setShowFiltersModal(true)}
          className={`px-4 py-2 border rounded-lg transition flex items-center gap-2 ${
            hasActiveFilters() 
              ? 'border-orange-500 bg-orange-50 text-orange-700' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters() && (
            <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
              {[statusFilter !== 'all' ? 1 : 0, categoryFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New reports
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-300">
          <p className="text-gray-600 text-sm font-medium">New</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium">In progress</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Solved</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{solvedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {statusFilter !== 'all' && (
                <span className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full flex items-center gap-2">
                  Status: {statusFilter === 'pending' ? 'New' : statusFilter === 'in-progress' ? 'In Progress' : 'Solved'}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full flex items-center gap-2">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full flex items-center gap-2">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total reports loaded: {reports.length}</p>
          <p>Filtered reports: {filteredReports.length}</p>
          <p>Pending: {pendingCount}, In Progress: {inProgressCount}, Solved: {solvedCount}</p>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Manage reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Works</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No reports found</p>
                      <p className="text-sm">Create a new report or check your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={report.user?.profilePicture || `https://ui-avatars.com/api/?name=${report.user?.fullName || 'User'}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.user?.fullName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">@{report.user?.username || 'unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">{report.description || 'No description'}</div>
                    <div className="text-xs text-gray-500 mt-1">{report.category || 'Uncategorized'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status, report.isApproved)}`}>
                      {getStatusLabel(report.status, report.isApproved)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">---</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {moment(report.createdAt).format('DD.MM.YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      {/* Edit button - Change status (in-progress or done) */}
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setActionType('status');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition"
                        title="Change Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Checkmark button - Approve report (official publication) */}
                      {!report.isApproved && (
                        <button
                          onClick={async () => {
                            try {
                              await handleApprove(report.id, true);
                            } catch (error) {
                              console.error('Error approving report:', error);
                            }
                          }}
                          className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition"
                          title="Approve Report"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {/* View button - Only show for approved reports */}
                      {report.isApproved && (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType('view');
                            setShowModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setActionType('delete');
                          setShowModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">New (Pending)</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Solved</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Filters Info */}
                {hasActiveFilters() && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-800 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== 'all' && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                          Status: {statusFilter === 'pending' ? 'New' : statusFilter === 'in-progress' ? 'In Progress' : 'Solved'}
                        </span>
                      )}
                      {categoryFilter !== 'all' && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                          Category: {categoryFilter}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedReport && (
        <ActionModal
          report={selectedReport}
          actionType={actionType}
          onClose={() => {
            setShowModal(false);
            setSelectedReport(null);
            setActionType(null);
          }}
          onApprove={(approve) => handleApprove(selectedReport.id, approve)}
          onStatusChange={(status) => handleStatusChange(selectedReport.id, status)}
          onRate={(rating) => handleRate(selectedReport.id, rating)}
          onVerify={(isVerified) => handleVerify(selectedReport.id, isVerified)}
          onDelete={() => handleDelete(selectedReport.id)}
        />
      )}
    </div>
  );
};

// Action Modal Component
const ActionModal = ({ report, actionType, onClose, onApprove, onStatusChange, onRate, onVerify, onDelete }) => {
  const [rating, setRating] = useState(report.adminRating || 0);
  const [status, setStatus] = useState(report.status || 'in-progress');
  
  // Reset state when report changes
  React.useEffect(() => {
    setRating(report.adminRating || 0);
    setStatus(report.status || 'in-progress');
  }, [report]);

  if (actionType === 'view') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Student</label>
                <p className="text-gray-900">{report.user?.fullName} (@{report.user?.username})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{report.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{report.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900">{report.status}</p>
              </div>
              {report.images && report.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Images</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {report.images.map((img, i) => (
                      <img key={i} src={`${API_URL}${img.url}`} alt="" className="rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (actionType === 'approve' || actionType === 'reject') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Approve Report' : 'Reject Report'}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'reject'} this report?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(actionType === 'approve')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionType === 'status' || actionType === 'edit') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Report Status</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done (Solved)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  The user will receive a notification about this status change.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> {report.status === 'done' ? 'Done' : report.status === 'in-progress' ? 'In Progress' : 'New'}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Approval:</strong> {report.isApproved ? 'Approved (Published)' : 'Pending Approval'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onStatusChange(status);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
              >
                Update Status
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionType === 'rate') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Report</h2>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onRate(rating)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Rate
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionType === 'verify') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {report.isVerified ? 'Unverify Report' : 'Verify Report'}
            </h2>
            <p className="text-gray-600 mb-6">
              {report.isVerified 
                ? 'Are you sure you want to unverify this report?'
                : 'Are you sure you want to verify this report as legitimate?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onVerify(!report.isVerified)}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  report.isVerified
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {report.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actionType === 'delete') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Report</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ManageReports;

