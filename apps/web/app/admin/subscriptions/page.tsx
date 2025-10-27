'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  productId: {
    _id: string;
    name: string;
    image?: string;
  };
  productName: string;
  basePrice: number;
  duration: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed' | 'payment-failed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliverySlot: string;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  
  // Delete all state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    console.log('🔧 Admin Subscriptions Page - Starting fetch');
    console.log('📡 API URL:', `${API_BASE_URL}/api/food/subscriptions/admin/all`);
    
    // First load with loading state
    fetchSubscriptions(false, false);
    
    // Auto-refresh every 5 seconds in background (silent updates)
    const interval = setInterval(() => {
      fetchSubscriptions(false, true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptions = async (showRefreshingState = false, isBackgroundRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      
      // Only show loading state on first load or manual refresh
      if (showRefreshingState) {
        setRefreshing(true);
      } else if (!isBackgroundRefresh) {
        setLoading(true);
      }
      
      const token = localStorage.getItem('token');
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}/api/food/subscriptions/admin/all`;
      
      const response = await fetch(url, { 
        headers,
        method: 'GET',
        cache: 'no-store'
      }).catch(fetchError => {
        console.error('Network error:', fetchError);
        throw new Error('Unable to connect to server. Please check if backend is running.');
      });

      if (!response.ok) {
        let errorText = 'Unknown error';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = response.statusText;
        }
        console.error(`API Error [${response.status}]:`, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success !== false) {
        setSubscriptions(data.data || []);
        // Clear error on successful refresh
        if (error) {
          setError('');
        }
      } else {
        console.warn('API returned success: false', data);
      }
    } catch (err: any) {
      console.error('Fetch subscriptions error:', err);
      // Only set error on first load, not on background refresh
      if (!isBackgroundRefresh) {
        setError(err.message || 'Failed to load subscriptions. Check console for details.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'active': { bg: '#D1FAE5', text: '#059669' },
      'paused': { bg: '#FEF3C7', text: '#92400E' },
      'cancelled': { bg: '#FEE2E2', text: '#DC2626' },
      'completed': { bg: '#E0E7FF', text: '#3730A3' },
      'payment-failed': { bg: '#FCE7F3', text: '#9F1239' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getPaymentColor = (status: string) => {
    const colors: any = {
      'paid': { bg: '#D1FAE5', text: '#059669' },
      'pending': { bg: '#FEF3C7', text: '#92400E' },
      'failed': { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setDeletingSubscription(subscription);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubscription) return;

    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/food/subscriptions/${deletingSubscription._id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from local state
        setSubscriptions(prevSubs => prevSubs.filter(sub => sub._id !== deletingSubscription._id));
        setShowDeleteModal(false);
        setDeletingSubscription(null);
        
        // Show success toast
        alert('Subscription deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      
      const response = await fetch(`${API_BASE_URL}/api/food/subscriptions/admin/delete-all-subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all subscriptions');
      }

      // Clear subscriptions list
      setSubscriptions([]);
      
      // Close modal
      setShowDeleteAllModal(false);
      
      // Show success message
      alert(`Successfully deleted ${data.deletedCount} subscriptions!`);
    } catch (err: any) {
      console.error('Error deleting all subscriptions:', err);
      alert(err.message || 'Failed to delete all subscriptions');
    } finally {
      setDeletingAll(false);
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !subscription.subscriptionNumber?.toLowerCase().includes(searchLower) &&
        !subscription.userId?.name?.toLowerCase().includes(searchLower) &&
        !subscription.userId?.email?.toLowerCase().includes(searchLower) &&
        !subscription.productName?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && subscription.status !== statusFilter) {
      return false;
    }

    // Payment filter
    if (paymentFilter !== 'all' && subscription.paymentStatus !== paymentFilter) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>Subscriptions</h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Manage customer meal subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {subscriptions.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: '#DC2626',
                color: '#DC2626',
                fontSize: '0.875rem' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Delete all subscriptions"
            >
              <i className="fa-solid fa-trash-can"></i>
              Delete All
            </button>
          )}
          <button
            onClick={() => fetchSubscriptions(true)}
            disabled={refreshing}
            className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
            onMouseEnter={(e) => {
              if (!refreshing) e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              if (!refreshing) e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            <i className={`fa-solid fa-rotate ${refreshing ? 'fa-spin' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280', fontSize: '0.875rem' }}></i>
            <input
              type="text"
              placeholder="Search by subscription number, customer or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Subscription Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="payment-failed">Payment Failed</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#0E1214',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={{ color: '#E11D48', fontSize: '0.875rem' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <i className="fa-solid fa-exclamation-circle" style={{ color: '#E11D48', fontSize: '1.25rem' }}></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Error Loading Subscriptions</h3>
              <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{error}</p>
              <p className="mt-2 text-xs" style={{ color: '#991B1B' }}>
                <i className="fa-solid fa-lightbulb mr-1"></i>
                Troubleshooting: Check if backend server is running on port 5000
              </p>
            </div>
            <button
              onClick={() => fetchSubscriptions(true, false)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
            >
              <i className="fa-solid fa-redo mr-2"></i>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl shadow-sm p-8 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <i className={`fa-solid ${subscriptions.length === 0 ? 'fa-calendar-check' : 'fa-filter-circle-xmark'} text-4xl`} style={{ color: '#E11D48' }}></i>
          </div>
          <p className="mb-2 font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>
            {subscriptions.length === 0 ? 'No subscriptions yet' : 'No matching subscriptions'}
          </p>
          <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {subscriptions.length === 0 
              ? 'Subscriptions will appear here once customers subscribe to meal plans' 
              : 'Try adjusting your filters or search query'}
          </p>
          {subscriptions.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2 border"
              style={{ 
                color: '#E11D48',
                borderColor: '#E11D48',
                backgroundColor: 'transparent',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* Subscriptions Table */
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Subscription
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Product
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription, index) => (
                  <tr
                    key={subscription._id}
                    className="transition-colors"
                    style={{ borderBottom: index !== filteredSubscriptions.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>
                          {subscription.subscriptionNumber || `SUB-${subscription._id.slice(-6)}`}
                        </div>
                        <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          {formatDate(subscription.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                          {subscription.userId?.name || 'N/A'}
                        </div>
                        <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          {subscription.userId?.phone || subscription.userId?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        {subscription.productName || subscription.productId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: 600 }}>
                          {subscription.duration || 0} days
                        </div>
                        <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          {subscription.startDate ? formatDate(subscription.startDate) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: '#E11D48', fontSize: '0.875rem' }}>
                        {formatCurrency(subscription.totalAmount || 0)}
                      </div>
                      <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                        {formatCurrency(subscription.basePrice || 0)}/day
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 capitalize"
                        style={{
                          backgroundColor: getStatusColor(subscription.status).bg,
                          color: getStatusColor(subscription.status).text,
                          fontSize: '0.75rem'
                        }}
                      >
                        {subscription.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 capitalize"
                        style={{
                          backgroundColor: getPaymentColor(subscription.paymentStatus).bg,
                          color: getPaymentColor(subscription.paymentStatus).text,
                          fontSize: '0.75rem'
                        }}
                      >
                        {subscription.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openDropdown === subscription._id) {
                              setOpenDropdown(null);
                              setDropdownPosition(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPosition({
                                top: rect.bottom + 8,
                                right: window.innerWidth - rect.right
                              });
                              setOpenDropdown(subscription._id);
                            }
                          }}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ 
                            color: '#6B7280',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dropdown Menu - Rendered outside table with fixed positioning */}
          {openDropdown && dropdownPosition && (
            <>
              <div 
                className="fixed inset-0"
                style={{ zIndex: 999 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(null);
                  setDropdownPosition(null);
                }}
              ></div>
              
              <div 
                className="fixed w-48 rounded-xl shadow-lg border"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                  zIndex: 1000
                }}
              >
                <div className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(null);
                      setDropdownPosition(null);
                      router.push(`/admin/subscriptions/${openDropdown}`);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                    style={{ color: '#0E1214', fontSize: '0.875rem' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.color = '#E11D48';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#0E1214';
                    }}
                  >
                    <i className="fa-solid fa-eye w-4"></i>
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(null);
                      setDropdownPosition(null);
                      // TODO: Manage subscription
                      console.log('Manage subscription:', openDropdown);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                    style={{ color: '#0E1214', fontSize: '0.875rem' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#CFFAFE';
                      e.currentTarget.style.color = '#0891B2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#0E1214';
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square w-4"></i>
                    Manage
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const subscription = subscriptions.find(sub => sub._id === openDropdown);
                      if (subscription) {
                        handleDeleteClick(subscription);
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200"
                    style={{ color: '#0E1214', fontSize: '0.875rem' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEE2E2';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#0E1214';
                    }}
                  >
                    <i className="fa-solid fa-trash w-4"></i>
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Subscriptions Count */}
      {!loading && subscriptions.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-calendar-check"></i>
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </div>
          {filteredSubscriptions.length !== subscriptions.length && (
            <div style={{ color: '#E11D48', fontSize: '0.875rem' }}>
              <i className="fa-solid fa-filter"></i> Filters applied
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingSubscription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg className="w-8 h-8" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
              Delete Subscription?
            </h3>
            <p className="text-sm text-center mb-2" style={{ color: '#6B7280' }}>
              Are you sure you want to delete subscription <strong>#{deletingSubscription.subscriptionNumber}</strong>?
            </p>
            <p className="text-sm text-center mb-6" style={{ color: '#DC2626' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingSubscription(null);
                }}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all border"
                style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#DC2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => !deletingAll && setShowDeleteAllModal(false)}
          ></div>

          {/* Modal */}
          <div 
            className="relative rounded-2xl shadow-2xl max-w-md w-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FEE2E2' }}>
                  <i className="fa-solid fa-triangle-exclamation text-xl" style={{ color: '#DC2626' }}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#0E1214' }}>
                    Delete All Subscriptions
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                    ⚠️ This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                <i className="fa-solid fa-circle-exclamation mt-0.5" style={{ color: '#DC2626' }}></i>
                <div>
                  <p className="font-bold mb-2" style={{ color: '#DC2626', fontSize: '0.9375rem' }}>
                    WARNING: You are about to delete ALL subscriptions!
                  </p>
                  <p className="text-sm mb-2" style={{ color: '#0E1214' }}>
                    This will permanently delete <strong>{subscriptions.length} subscriptions</strong> from the database.
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    This action is irreversible. All data will be lost forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  opacity: deletingAll ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: deletingAll ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  if (!deletingAll) e.currentTarget.style.backgroundColor = '#DC2626';
                }}
              >
                {deletingAll ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Deleting All...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can"></i>
                    Yes, Delete All {subscriptions.length} Subscriptions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

