import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Clock, CheckCircle, FileText, Edit, Eye, Trash2 } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { useDocumentVisibleInterval } from '../../hooks/useDocumentVisibleInterval';
import toast from 'react-hot-toast';
import moment from 'moment';

const ADMIN_DASHBOARD_POLL_MS = 5000;

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (opts = {}) => {
    const silent = opts.silent === true;
    try {
      const [statsData, reportsData] = await Promise.all([
        reportsAPI.getAdminStatistics(),
        reportsAPI.getAllForAdmin(),
      ]);
      setStatistics(statsData);
      setReports(reportsData.slice(0, 4));
    } catch (error) {
      console.error('Error fetching data:', error);
      if (!silent) toast.error('Failed to load data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData({ silent: false });
  }, [fetchData]);

  useDocumentVisibleInterval(() => fetchData({ silent: true }), ADMIN_DASHBOARD_POLL_MS);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Failed to load statistics</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(...statistics.byCategory.map(c => c.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage Reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#8B4513] rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">New Reports</p>
              <p className="text-3xl font-bold mt-2">{statistics.reports.pending}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-orange-500 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold mt-2">{statistics.reports.inProgress}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-purple-500 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Solved</p>
              <p className="text-3xl font-bold mt-2">{statistics.reports.done}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-purple-200 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.reports.total}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Categories Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reports by Categories</h2>
          <div className="space-y-4">
            <div className="flex items-end gap-4 h-48 overflow-hidden border border-gray-200 rounded-lg p-4 bg-gray-50">
              {statistics.byCategory.slice(0, 3).map((item, index) => {
                const height = (item.count / maxCategoryCount) * 100;
                const colors = ['#8B4513', '#FFA500', '#FFB6C1'];
                const color = colors[index] || '#8B4513';
                
                return (
                  <div key={item.category} className="flex-1 flex flex-col items-center h-full max-h-full">
                    <div className="w-full flex flex-col items-center justify-end flex-1 min-h-0" style={{ maxHeight: '160px' }}>
                      <div
                        className="w-full rounded-t transition-all duration-500"
                        style={{ 
                          height: `${Math.min(height, 100)}%`,
                          backgroundColor: color,
                          minHeight: height > 0 ? '20px' : '0',
                          maxHeight: '100%'
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-700 truncate w-full text-center">{item.category}</div>
                    <div className="text-xs text-gray-500">{item.count}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">amount of reports</span>
            </div>
          </div>
        </div>

        {/* Manage Reports Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Manage Reports</h2>
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
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.user?.fullName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{report.description || 'No description'}</div>
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
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
