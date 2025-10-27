'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalOrders: number;
    totalSubscriptions: number;
    totalSpent: number;
    lastOrderDate: string | null;
  };
}

interface Stats {
  total: number;
  active: number;
  blocked: number;
  newThisMonth: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [exporting, setExporting] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [statusFilter, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/food/customers?status=${statusFilter}&search=${searchTerm}`
      );
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/customers/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleBlockClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowBlockModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/food/customers/${selectedCustomer._id}/toggle-status`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        showToast(
          `Customer ${selectedCustomer.isActive ? 'blocked' : 'unblocked'} successfully`,
          'success'
        );
        setShowBlockModal(false);
        setSelectedCustomer(null);
        await loadCustomers();
        await loadStats();
      } else {
        showToast('Failed to update customer status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update customer status', 'error');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(`${API_BASE_URL}/api/food/customers/export`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Customers exported successfully', 'success');
      } else {
        showToast('Failed to export customers', 'error');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      showToast('Failed to export customers', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          style={{
            backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
            color: '#FFFFFF'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
            Customer Management
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Manage and view all your customers
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
          onMouseEnter={(e: any) => !exporting && (e.currentTarget.style.backgroundColor = '#047857')}
          onMouseLeave={(e: any) => !exporting && (e.currentTarget.style.backgroundColor = '#059669')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Total Customers</p>
                <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                <svg className="w-6 h-6" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Active</p>
                <p className="text-2xl font-bold" style={{ color: '#059669' }}>{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-6 h-6" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Blocked</p>
                <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{stats.blocked}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <svg className="w-6 h-6" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>New This Month</p>
                <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stats.newThisMonth}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
              placeholder="Search by name, email, or phone..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
            <svg className="w-10 h-10" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Customers Found</h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'No customers match your filters' 
              : 'No customers have registered yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>Contact</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B7280' }}>Orders</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B7280' }}>Subscriptions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#6B7280' }}>Total Spent</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B7280' }}>Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#6B7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr 
                    key={customer._id} 
                    className="border-t transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#0E1214' }}>{customer.name}</div>
                        <div className="text-xs" style={{ color: '#6B7280' }}>
                          Joined {formatDate(customer.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs" style={{ color: '#0E1214' }}>{customer.email}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{customer.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                        {customer.stats.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                        {customer.stats.totalSubscriptions}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold" style={{ color: '#059669' }}>
                        ₹{customer.stats.totalSpent.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span 
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: customer.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: customer.isActive ? '#047857' : '#991B1B'
                        }}
                      >
                        {customer.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/customers/${customer._id}`)}
                          className="p-2 rounded-lg transition-all hover:bg-gray-100"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleBlockClick(customer)}
                          className="p-2 rounded-lg transition-all hover:bg-gray-100"
                          title={customer.isActive ? 'Block User' : 'Unblock User'}
                        >
                          <svg 
                            className="w-4 h-4" 
                            style={{ color: customer.isActive ? '#DC2626' : '#059669' }} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            {customer.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Block/Unblock Modal */}
      {showBlockModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" 
              style={{ backgroundColor: selectedCustomer.isActive ? '#FEE2E2' : '#D1FAE5' }}>
              <svg 
                className="w-6 h-6" 
                style={{ color: selectedCustomer.isActive ? '#DC2626' : '#059669' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
              {selectedCustomer.isActive ? 'Block Customer?' : 'Unblock Customer?'}
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to {selectedCustomer.isActive ? 'block' : 'unblock'}{' '}
              <strong>{selectedCustomer.name}</strong>?
              {selectedCustomer.isActive && ' They will not be able to place orders.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  backgroundColor: selectedCustomer.isActive ? '#DC2626' : '#059669', 
                  color: '#FFFFFF' 
                }}
              >
                {selectedCustomer.isActive ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

