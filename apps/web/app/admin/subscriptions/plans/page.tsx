'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Plan {
  _id: string;
  name: string;
  description: string;
  duration: number; // in days
  maxSkipDays: number;
  maxExtendedDays: number;
  isActive: boolean;
  category: 'meal' | 'dairy' | 'grocery' | 'laundry';
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('meal'); // Default to meal
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; planId: string | null; planName: string }>({
    show: false,
    planId: null,
    planName: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = async (showRefreshingState = false, isBackgroundRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isFetching) return;

    try {
      setIsFetching(true);
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

      const response = await fetch(`${API_BASE_URL}/food/plans`, {
        headers,
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPlans(data.data || []);
        if (error) setError('');
      } else {
        throw new Error(data.error || 'Failed to load plans');
      }
    } catch (err: any) {
      console.error('Fetch plans error:', err);
      if (!isBackgroundRefresh) {
        setError(err.message || 'Failed to load plans');
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

  const handleToggleDropdown = (planId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    if (openDropdown === planId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      setOpenDropdown(planId);
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right
      });
    }
  };

  const handleEdit = (planId: string) => {
    router.push(`/admin/subscriptions/plans/${planId}/edit`);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (planId: string, planName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ show: true, planId, planName });
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (deleteModal.planId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/food/plans/${deleteModal.planId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to delete plan');
        }

        showToast('Plan deleted successfully!', 'success');
        await fetchPlans();
      } catch (error: any) {
        console.error('Delete error:', error);
        showToast(error.message || 'Failed to delete plan', 'error');
      }
    }
    setDeleteModal({ show: false, planId: null, planName: '' });
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, planId: null, planName: '' });
  };

  const handleToggleStatus = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const plan = plans.find(p => p._id === planId);
    const newStatus = !plan?.isActive;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/food/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update plan status');
      }

      showToast(`Plan ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      await fetchPlans();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      showToast(error.message || 'Failed to update plan status', 'error');
    }
  };

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    // Category filter
    if (categoryFilter !== 'all' && plan.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !plan.name?.toLowerCase().includes(searchLower) &&
        !plan.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'active' && !plan.isActive) {
      return false;
    }
    if (statusFilter === 'inactive' && plan.isActive) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.75rem', fontWeight: '700' }}>
            <i className="fa-solid fa-calendar-check" style={{ color: '#E11D48', fontSize: '1.5rem' }}></i>
            Subscription Plans
          </h1>
          <p className="mt-2" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '400' }}>
            Manage subscription plans for all products (Meal, Dairy, Grocery, etc.)
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/subscriptions/plans/new')}
          className="px-6 py-3 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
          style={{ backgroundColor: '#E11D48', fontSize: '0.875rem', fontWeight: '600' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
        >
          <i className="fa-solid fa-plus"></i>
          Add New Plan
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280', fontSize: '0.875rem' }}></i>
            <input
              type="text"
              placeholder="Search by plan name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200"
              style={{ 
                borderColor: '#E5E7EB',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div>
          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>STATUS</label>
            <div className="flex gap-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 capitalize"
                  style={{ 
                    backgroundColor: statusFilter === status ? '#E11D48' : '#F9FAFB',
                    color: statusFilter === status ? '#FFFFFF' : '#6B7280'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: '#FEF2F2', borderColor: '#E11D48' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <i className="fa-solid fa-exclamation-circle" style={{ color: '#E11D48', fontSize: '1.25rem' }}></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1" style={{ color: '#E11D48', fontSize: '0.875rem' }}>Error Loading Plans</h3>
              <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{error}</p>
              <p className="mt-2 text-xs" style={{ color: '#991B1B' }}>
                <i className="fa-solid fa-lightbulb mr-1"></i>
                Troubleshooting: Check if backend server is running on port 5000
              </p>
            </div>
            <button
              onClick={() => fetchPlans(true, false)}
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
          <p className="mt-4" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Loading plans...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="rounded-xl shadow-sm p-12 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <i className="fa-solid fa-box-open" style={{ color: '#E11D48', fontSize: '2rem' }}></i>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Plans Found</h3>
          <p className="mb-6" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No plans match your filters'
              : 'Get started by creating your first subscription plan'}
          </p>
          <button
            onClick={() => router.push('/admin/subscriptions/plans/new')}
            className="px-6 py-3 text-white rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: '#E11D48' }}
            onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
            onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Add New Plan
          </button>
        </div>
      ) : (
        <>
          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-4 max-w-4xl">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white rounded-xl border p-6 transition-all duration-200"
                style={{ borderColor: '#E5E7EB' }}
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="inline-block px-2 py-1 rounded uppercase"
                        style={{ 
                          backgroundColor: plan.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: plan.isActive ? '#059669' : '#DC2626',
                          fontSize: '0.625rem',
                          fontWeight: '700'
                        }}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {/* Toggle Status Button */}
                      <button
                        onClick={(e) => handleToggleStatus(plan._id, e)}
                        className="px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                        style={{ 
                          backgroundColor: plan.isActive ? '#FEE2E2' : '#D1FAE5',
                          color: plan.isActive ? '#DC2626' : '#059669',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                        title={plan.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <i className={`fa-solid ${plan.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    <h3 className="font-bold" style={{ color: '#0E1214', fontSize: '1.125rem', fontWeight: '600' }}>{plan.name}</h3>
                    <p className="mt-1 capitalize" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: '400' }}>
                      <i className="fa-solid fa-tag mr-1"></i>
                      {plan.category}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => handleToggleDropdown(plan._id, e)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" style={{ color: '#6B7280' }}></i>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdown === plan._id && dropdownPosition && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div
                          className="bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[180px]"
                          style={{
                            position: 'fixed',
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                            borderColor: '#E5E7EB'
                          }}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(plan._id, e); setOpenDropdown(null); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            style={{ color: plan.isActive ? '#DC2626' : '#059669', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            <i className={`fa-solid ${plan.isActive ? 'fa-toggle-off' : 'fa-toggle-on'}`}></i>
                            {plan.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(plan._id); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            style={{ color: '#0E1214', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            <i className="fa-solid fa-edit" style={{ color: '#3B82F6' }}></i>
                            Edit Plan
                          </button>
                          <button
                            onClick={(e) => { handleDeleteClick(plan._id, plan.name, e); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 line-clamp-2" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '400' }}>
                  {plan.description}
                </p>

                {/* Duration Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-calendar-days" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
                      <span style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Plan Duration</span>
                    </div>
                    <div style={{ color: '#E11D48', fontSize: '1.25rem', fontWeight: '700' }}>
                      {plan.duration} Days
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-ban" style={{ color: '#E11D48', fontSize: '1.125rem' }}></i>
                      <span style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Skip Days Allowed</span>
                    </div>
                    <div style={{ color: '#E11D48', fontSize: '1.25rem', fontWeight: '700' }}>
                      {plan.maxSkipDays} Days
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FFF7ED' }}>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-calendar-plus" style={{ color: '#EA580C', fontSize: '1.125rem' }}></i>
                      <span style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Max Extended Days</span>
                    </div>
                    <div style={{ color: '#EA580C', fontSize: '1.25rem', fontWeight: '700' }}>
                      {plan.maxExtendedDays} Days
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: '#E5E7EB', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: '400' }}>
                  <span>
                    <i className="fa-solid fa-calendar mr-1"></i>
                    Total: {plan.duration + plan.maxExtendedDays} days
                  </span>
                  <span>Created {formatDate(plan.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={cancelDelete}
          >
            {/* Modal */}
            <div 
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <i className="fa-solid fa-trash-can" style={{ color: '#DC2626', fontSize: '1.5rem' }}></i>
              </div>
              
              {/* Title */}
              <h3 className="text-center mb-2" style={{ color: '#0E1214', fontSize: '1.25rem', fontWeight: '700' }}>
                Delete Plan?
              </h3>
              
              {/* Message */}
              <p className="text-center mb-6" style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '400' }}>
                Are you sure you want to delete <span style={{ color: '#E11D48', fontWeight: '600' }}>"{deleteModal.planName}"</span>? This action cannot be undone.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 rounded-xl transition-all duration-200 border"
                  style={{ borderColor: '#E5E7EB', color: '#6B7280', fontSize: '0.875rem', fontWeight: '600' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '600' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up"
          style={{ 
            backgroundColor: toast.type === 'success' ? '#D1FAE5' : toast.type === 'error' ? '#FEE2E2' : '#DBEAFE',
            borderLeft: `4px solid ${toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#3B82F6'}`,
            minWidth: '300px',
            maxWidth: '500px'
          }}
        >
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#3B82F6'
            }}
          >
            <i 
              className={`fa-solid ${toast.type === 'success' ? 'fa-check' : toast.type === 'error' ? 'fa-times' : 'fa-info'}`}
              style={{ color: '#FFFFFF', fontSize: '0.875rem' }}
            ></i>
          </div>
          <p 
            className="flex-1"
            style={{ 
              color: toast.type === 'success' ? '#065F46' : toast.type === 'error' ? '#991B1B' : '#1E40AF',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-5"
          >
            <i className="fa-solid fa-times" style={{ color: '#6B7280', fontSize: '0.75rem' }}></i>
          </button>
        </div>
      )}
    </div>
  );
}

