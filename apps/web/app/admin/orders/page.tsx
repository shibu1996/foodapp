'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  orderNumber: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: {
    fullAddress: string;
  };
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Delete all state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/food/orders/admin/all`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/food/orders/admin/${orderToDelete._id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Remove order from list
      setOrders(orders.filter(o => o._id !== orderToDelete._id));
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert(err.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      
      const response = await fetch(`${API_BASE_URL}/api/food/orders/admin/delete-all-orders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all orders');
      }

      // Clear orders list
      setOrders([]);
      
      // Close modal
      setShowDeleteAllModal(false);
      
      // Show success message
      alert(`Successfully deleted ${data.deletedCount} orders!`);
    } catch (err: any) {
      console.error('Error deleting all orders:', err);
      alert(err.message || 'Failed to delete all orders');
    } finally {
      setDeletingAll(false);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': { bg: '#FEF3C7', text: '#92400E' },
      'confirmed': { bg: '#DBEAFE', text: '#1E40AF' },
      'preparing': { bg: '#E0E7FF', text: '#3730A3' },
      'out-for-delivery': { bg: '#FCE7F3', text: '#9F1239' },
      'delivered': { bg: '#D1FAE5', text: '#059669' },
      'cancelled': { bg: '#FEE2E2', text: '#DC2626' }
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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !order.orderNumber.toLowerCase().includes(searchLower) &&
        !order.userId?.name?.toLowerCase().includes(searchLower) &&
        !order.userId?.phone?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Payment filter
    if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>Orders</h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          {orders.length > 0 && (
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
              title="Delete all orders"
            >
              <i className="fa-solid fa-trash-can"></i>
              Delete All
            </button>
          )}
          <button
            onClick={fetchOrders}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border"
            style={{ 
              backgroundColor: 'transparent',
              color: '#E11D48',
              borderColor: '#E11D48',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <i className="fa-solid fa-rotate"></i>
            Refresh
          </button>
          <button
            onClick={() => router.push('/admin/orders/new')}
            className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: '#E11D48', fontSize: '0.875rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            <i className="fa-solid fa-plus"></i>
            Add New Order
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
              placeholder="Search by order number, customer name or phone..."
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
          {/* Order Status Filter */}
          <div>
            <label className="block font-medium mb-2" style={{ color: '#6B7280', fontSize: '0.75rem' }}>Order Status</label>
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
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
        <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <p style={{ color: '#E11D48', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl shadow-sm p-8 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
            border: '3px solid #FEF2F2',
            borderTop: '3px solid #E11D48'
          }}></div>
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <i className={`fa-solid ${orders.length === 0 ? 'fa-shopping-cart' : 'fa-filter-circle-xmark'} text-4xl`} style={{ color: '#E11D48' }}></i>
          </div>
          <p className="mb-2 font-semibold" style={{ color: '#0E1214', fontSize: '1rem' }}>
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </p>
          <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {orders.length === 0 
              ? 'Orders will appear here once customers start placing them' 
              : 'Try adjusting your filters or search query'}
          </p>
          {orders.length > 0 && (
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
        /* Orders Table */
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                    Items
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
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className="transition-colors"
                    style={{ borderBottom: index !== filteredOrders.length - 1 ? '1px solid #E5E7EB' : 'none' }}
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
                          {order.orderNumber}
                        </div>
                        <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                          {order.userId?.name || 'N/A'}
                        </div>
                        <div className="mt-1" style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                          {order.userId?.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: '#0E1214', fontSize: '0.875rem' }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 capitalize"
                        style={{
                          backgroundColor: getStatusColor(order.status).bg,
                          color: getStatusColor(order.status).text,
                          fontSize: '0.75rem'
                        }}
                      >
                        {order.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 capitalize"
                        style={{
                          backgroundColor: getPaymentColor(order.paymentStatus).bg,
                          color: getPaymentColor(order.paymentStatus).text,
                          fontSize: '0.75rem'
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          ref={(el) => {
                            if (el && openDropdown === order._id) {
                              const rect = el.getBoundingClientRect();
                              const dropdown = document.getElementById(`dropdown-${order._id}`);
                              if (dropdown) {
                                dropdown.style.top = `${rect.bottom + 8}px`;
                                dropdown.style.right = `${window.innerWidth - rect.right}px`;
                              }
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === order._id ? null : order._id);
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
        </div>
      )}

      {/* Orders Count */}
      {!loading && orders.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-shopping-cart"></i>
            Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
          {filteredOrders.length !== orders.length && (
            <div style={{ color: '#E11D48', fontSize: '0.875rem' }}>
              <i className="fa-solid fa-filter"></i> Filters applied
            </div>
          )}
        </div>
      )}

      {/* Dropdown Menus (Fixed Position) */}
      {openDropdown && filteredOrders.map((order) => (
        order._id === openDropdown && (
          <div key={`dropdown-portal-${order._id}`}>
            {/* Backdrop */}
            <div 
              className="fixed inset-0"
              style={{ zIndex: 999 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(null);
              }}
            />
            
            {/* Dropdown Menu */}
            <div 
              id={`dropdown-${order._id}`}
              className="fixed w-48 rounded-xl shadow-2xl border"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                zIndex: 1000,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    router.push(`/admin/orders/${order._id}`);
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
                    // TODO: Update status
                    console.log('Update order status:', order._id);
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
                  Update Status
                </button>
                <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '0.25rem 0' }}></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    setOrderToDelete(order);
                    setShowDeleteModal(true);
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
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            if (!deleting) {
              setShowDeleteModal(false);
              setOrderToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <i className="fa-solid fa-trash text-3xl" style={{ color: '#DC2626' }}></i>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-center font-bold mb-2" style={{ color: '#0E1214', fontSize: '1.25rem' }}>
              Delete Order
            </h3>
            <p className="text-center mb-2" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Are you sure you want to delete order <span className="font-semibold" style={{ color: '#E11D48' }}>#{orderToDelete.orderNumber}</span>?
            </p>
            <p className="text-center mb-6" style={{ color: '#DC2626', fontSize: '0.75rem' }}>
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 border"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  borderColor: '#E5E7EB',
                  fontSize: '0.875rem',
                  opacity: deleting ? 0.5 : 1,
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: deleting ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#B91C1C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }
                }}
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i>
                    Delete Order
                  </>
                )}
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
                    Delete All Orders
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
                    WARNING: You are about to delete ALL orders!
                  </p>
                  <p className="text-sm mb-2" style={{ color: '#0E1214' }}>
                    This will permanently delete <strong>{orders.length} orders</strong> from the database.
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
                    Yes, Delete All {orders.length} Orders
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

