'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string;
  validTill: string;
  applicableFor: 'all' | 'firstOrder' | 'subscription' | 'onetime';
  isActive: boolean;
  usedBy: any[];
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: null as number | null,
    validFrom: new Date().toISOString().split('T')[0],
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicableFor: 'all' as 'all' | 'firstOrder' | 'subscription' | 'onetime'
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coupons, filterStatus, filterType]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/coupons`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCoupons(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...coupons];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => 
        filterStatus === 'active' ? c.isActive : !c.isActive
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.discountType === filterType);
    }

    setFilteredCoupons(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountAmount: 0,
      usageLimit: null,
      validFrom: new Date().toISOString().split('T')[0],
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableFor: 'all'
    });
    setEditingCoupon(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validTill: new Date(coupon.validTill).toISOString().split('T')[0],
      applicableFor: coupon.applicableFor
    });
    setShowAddModal(true);
  };

  const handleDelete = (coupon: Coupon) => {
    setDeletingCoupon(coupon);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingCoupon) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/food/coupons/${deletingCoupon._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          showToast('Coupon deleted successfully', 'success');
          await loadCoupons();
        } else {
          showToast('Failed to delete coupon', 'error');
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
        showToast('Failed to delete coupon', 'error');
      }
    }
    setShowDeleteModal(false);
    setDeletingCoupon(null);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/coupons/${id}/toggle`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        showToast('Coupon status updated', 'success');
        await loadCoupons();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCoupon 
        ? `${API_BASE_URL}/api/food/coupons/${editingCoupon._id}`
        : `${API_BASE_URL}/api/food/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully', 'success');
        setShowAddModal(false);
        resetForm();
        await loadCoupons();
      } else {
        showToast(data.message || 'Failed to save coupon', 'error');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      showToast('Failed to save coupon', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (validTill: string) => {
    return new Date(validTill) < new Date();
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in"
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
            Coupon Management
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Create and manage discount coupons for your customers
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
          onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
          onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#6B7280' }}>Discount Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
              style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" 
            style={{ borderColor: '#E11D48', borderTopColor: 'transparent' }}></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center" style={{ borderColor: '#E5E7EB' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
            <svg className="w-10 h-10" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Coupons Found</h3>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            {filterStatus !== 'all' || filterType !== 'all' 
              ? 'No coupons match your filters' 
              : 'Get started by creating your first coupon'}
          </p>
          {(filterStatus === 'all' && filterType === 'all') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            >
              Create Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl border p-4 transition-all hover:shadow-md"
              style={{ borderColor: coupon.isActive ? '#E5E7EB' : '#FCA5A5' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="px-3 py-1 rounded-lg font-bold text-sm"
                      style={{
                        backgroundColor: coupon.isActive ? '#FEE2E2' : '#F3F4F6',
                        color: coupon.isActive ? '#E11D48' : '#6B7280'
                      }}
                    >
                      {coupon.code}
                    </div>
                    <div
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: coupon.discountType === 'percentage' ? '#DBEAFE' : '#D1FAE5',
                        color: coupon.discountType === 'percentage' ? '#1E40AF' : '#047857'
                      }}
                    >
                      {getDiscountDisplay(coupon)}
                    </div>
                    {isExpired(coupon.validTill) && (
                      <div
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                      >
                        Expired
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
                    {coupon.description}
                  </p>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Valid Period</p>
                      <p className="text-xs" style={{ color: '#0E1214' }}>
                        {formatDate(coupon.validFrom)} - {formatDate(coupon.validTill)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Min Order</p>
                      <p className="text-xs" style={{ color: '#0E1214' }}>₹{coupon.minOrderValue}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Usage</p>
                      <p className="text-xs" style={{ color: '#0E1214' }}>
                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Applicable For</p>
                      <p className="text-xs capitalize" style={{ color: '#0E1214' }}>
                        {coupon.applicableFor === 'firstOrder' ? 'First Order' : coupon.applicableFor}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(coupon._id)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title={coupon.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <svg className="w-5 h-5" style={{ color: coupon.isActive ? '#059669' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(coupon)}
                    className="p-2 rounded-lg transition-all hover:bg-gray-100"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-xl font-bold" style={{ color: '#0E1214' }}>
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
              >
                <svg className="w-5 h-5" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    placeholder="e.g., SAVE50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                  placeholder="e.g., Get 50% off on your first order"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Min Order Value
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    min="0"
                  />
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                      style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Valid Till *
                  </label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                    Applicable For *
                  </label>
                  <select
                    value={formData.applicableFor}
                    onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    style={{ borderColor: '#D1D5DB', color: '#0E1214' }}
                  >
                    <option value="all">All Orders</option>
                    <option value="firstOrder">First Order Only</option>
                    <option value="onetime">One-time Orders</option>
                    <option value="subscription">Subscriptions</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                  style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg className="w-6 h-6" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
              Delete Coupon?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to delete coupon <strong>{deletingCoupon.code}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCoupon(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold text-sm transition-all"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
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
    </div>
  );
}

