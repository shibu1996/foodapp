'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface Subscription {
  _id: string;
  productId: {
    name: string;
    image: string;
  };
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface Stats {
  totalOrders: number;
  completedOrders: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  totalSpent: number;
  averageOrderValue: number;
  joinedDate: string;
}

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'subscriptions'>('overview');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (customerId) {
      loadCustomerDetails();
    }
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/customers/${customerId}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomer(data.data.customer);
        setRecentOrders(data.data.recentOrders);
        setRecentSubscriptions(data.data.recentSubscriptions);
        setStats(data.data.stats);
      } else {
        showToast('Customer not found', 'error');
        setTimeout(() => router.push('/admin/customers'), 2000);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      showToast('Failed to load customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleToggleStatus = async () => {
    if (!customer) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/food/customers/${customer._id}/toggle-status`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        showToast(
          `Customer ${customer.isActive ? 'blocked' : 'unblocked'} successfully`,
          'success'
        );
        setShowBlockModal(false);
        await loadCustomerDetails();
      } else {
        showToast('Failed to update customer status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update customer status', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
      preparing: { bg: '#E0E7FF', text: '#3730A3' },
      'out-for-delivery': { bg: '#FED7AA', text: '#9A3412' },
      delivered: { bg: '#D1FAE5', text: '#065F46' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B' },
      active: { bg: '#D1FAE5', text: '#065F46' },
      paused: { bg: '#FEF3C7', text: '#92400E' },
      completed: { bg: '#E5E7EB', text: '#374151' }
    };
    return colors[status] || { bg: '#E5E7EB', text: '#6B7280' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" 
          style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!customer || !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold" style={{ color: '#6B7280' }}>Customer not found</p>
      </div>
    );
  }

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

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors"
        style={{ color: '#6B7280' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#E11D48'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Customers
      </button>

      {/* Customer Header */}
      <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" 
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
              {customer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>{customer.name}</h1>
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{customer.email}</p>
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{customer.phone}</p>
              <div className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: customer.isActive ? '#D1FAE5' : '#FEE2E2',
                    color: customer.isActive ? '#047857' : '#991B1B'
                  }}
                >
                  {customer.isActive ? 'Active' : 'Blocked'}
                </span>
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  Member since {formatDate(stats.joinedDate)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
            style={{ 
              backgroundColor: customer.isActive ? '#FEE2E2' : '#D1FAE5',
              color: customer.isActive ? '#DC2626' : '#059669'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {customer.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {customer.isActive ? 'Block Customer' : 'Unblock Customer'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Total Orders</p>
          <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{stats.totalOrders}</p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {stats.completedOrders} completed
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Total Spent</p>
          <p className="text-2xl font-bold" style={{ color: '#059669' }}>
            ₹{stats.totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            ₹{stats.averageOrderValue.toFixed(0)} avg order
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Subscriptions</p>
          <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>{stats.totalSubscriptions}</p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {stats.activeSubscriptions} active
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Account Age</p>
          <p className="text-2xl font-bold" style={{ color: '#0E1214' }}>
            {Math.floor((new Date().getTime() - new Date(stats.joinedDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            Since {formatDate(stats.joinedDate)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex-1 px-6 py-3 font-semibold text-sm transition-all"
            style={{
              color: activeTab === 'overview' ? '#E11D48' : '#6B7280',
              borderBottom: activeTab === 'overview' ? '2px solid #E11D48' : '2px solid transparent'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="flex-1 px-6 py-3 font-semibold text-sm transition-all"
            style={{
              color: activeTab === 'orders' ? '#E11D48' : '#6B7280',
              borderBottom: activeTab === 'orders' ? '2px solid #E11D48' : '2px solid transparent'
            }}
          >
            Orders ({stats.totalOrders})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className="flex-1 px-6 py-3 font-semibold text-sm transition-all"
            style={{
              color: activeTab === 'subscriptions' ? '#E11D48' : '#6B7280',
              borderBottom: activeTab === 'subscriptions' ? '2px solid #E11D48' : '2px solid transparent'
            }}
          >
            Subscriptions ({stats.totalSubscriptions})
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Recent Orders</h3>
                {recentOrders.length === 0 ? (
                  <p className="text-sm" style={{ color: '#6B7280' }}>No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getStatusColor(order.status).bg,
                              color: getStatusColor(order.status).text
                            }}
                          >
                            {order.status}
                          </span>
                          <p className="text-sm font-bold" style={{ color: '#059669' }}>
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>Recent Subscriptions</h3>
                {recentSubscriptions.length === 0 ? (
                  <p className="text-sm" style={{ color: '#6B7280' }}>No subscriptions yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentSubscriptions.slice(0, 5).map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex items-center gap-3">
                          {sub.productId?.image && (
                            <img src={sub.productId.image} alt={sub.productId.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                              {sub.productId?.name}
                            </p>
                            <p className="text-xs" style={{ color: '#6B7280' }}>
                              {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getStatusColor(sub.status).bg,
                              color: getStatusColor(sub.status).text
                            }}
                          >
                            {sub.status}
                          </span>
                          <p className="text-sm font-bold" style={{ color: '#059669' }}>
                            ₹{sub.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>All Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-sm" style={{ color: '#6B7280' }}>No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span 
                            className="px-2 py-1 rounded text-xs font-semibold inline-block mb-2"
                            style={{
                              backgroundColor: getStatusColor(order.status).bg,
                              color: getStatusColor(order.status).text
                            }}
                          >
                            {order.status}
                          </span>
                          <p className="text-lg font-bold" style={{ color: '#059669' }}>
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0E1214' }}>All Subscriptions</h3>
              {recentSubscriptions.length === 0 ? (
                <p className="text-sm" style={{ color: '#6B7280' }}>No subscriptions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSubscriptions.map((sub) => (
                    <div key={sub._id} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                      <div className="flex items-start gap-4">
                        {sub.productId?.image && (
                          <img src={sub.productId.image} alt={sub.productId.name} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold mb-1" style={{ color: '#0E1214' }}>
                            {sub.productId?.name}
                          </p>
                          <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                            {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                          </p>
                          <div className="flex items-center gap-3">
                            <span 
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: getStatusColor(sub.status).bg,
                                color: getStatusColor(sub.status).text
                              }}
                            >
                              {sub.status}
                            </span>
                            <p className="text-sm font-bold" style={{ color: '#059669' }}>
                              ₹{sub.totalPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Block/Unblock Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" 
              style={{ backgroundColor: customer.isActive ? '#FEE2E2' : '#D1FAE5' }}>
              <svg 
                className="w-6 h-6" 
                style={{ color: customer.isActive ? '#DC2626' : '#059669' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
              {customer.isActive ? 'Block Customer?' : 'Unblock Customer?'}
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to {customer.isActive ? 'block' : 'unblock'}{' '}
              <strong>{customer.name}</strong>?
              {customer.isActive && ' They will not be able to place orders.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ 
                  backgroundColor: customer.isActive ? '#DC2626' : '#059669', 
                  color: '#FFFFFF' 
                }}
              >
                {customer.isActive ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

