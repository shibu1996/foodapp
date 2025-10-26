'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AddNewPlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    maxSkipDays: '',
    maxExtendedDays: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.duration || !formData.maxSkipDays || !formData.maxExtendedDays) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/food/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          duration: parseInt(formData.duration),
          maxSkipDays: parseInt(formData.maxSkipDays),
          maxExtendedDays: parseInt(formData.maxExtendedDays),
          price: 0, // Price is per product, not per plan
          isActive: true,
          category: 'meal',
          features: []
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create plan');
      }

      showToast(`Plan "${formData.name}" created successfully!`, 'success');
      setTimeout(() => {
        router.push('/admin/subscriptions/plans');
      }, 1500);
    } catch (error: any) {
      console.error('Create plan error:', error);
      showToast(error.message || 'Failed to create plan', 'error');
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200"
            style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E11D48';
              e.currentTarget.style.color = '#E11D48';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="font-bold flex items-center gap-3" style={{ color: '#0E1214', fontSize: '1.875rem' }}>
            <i className="fa-solid fa-plus-circle" style={{ color: '#E11D48' }}></i>
            Add New Plan
          </h1>
        </div>
        <p className="ml-16" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Create a new subscription plan with pricing and features
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
              <i className="fa-solid fa-info-circle" style={{ color: '#E11D48' }}></i>
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Plan Name <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 30 Days Plan"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                  style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Description <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the plan..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none"
                  style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Card */}
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#0E1214', fontSize: '1.125rem' }}>
              <i className="fa-solid fa-calendar-days" style={{ color: '#E11D48' }}></i>
              Duration
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Duration (Days) */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Plan Duration (Days) <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 30"
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                  style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Total days for subscription
                </p>
              </div>

              {/* Max Skip Days */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Skip Days Allowed <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxSkipDays}
                  onChange={(e) => setFormData({ ...formData, maxSkipDays: e.target.value })}
                  placeholder="e.g., 6"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                  style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  <i className="fa-solid fa-ban mr-1"></i>
                  Days user can skip delivery
                </p>
              </div>

              {/* Max Extended Days */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0E1214' }}>
                  Max Extended Days <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxExtendedDays}
                  onChange={(e) => setFormData({ ...formData, maxExtendedDays: e.target.value })}
                  placeholder="e.g., 6"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                  style={{ borderColor: '#E5E7EB', fontSize: '0.875rem' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  <i className="fa-solid fa-calendar-plus mr-1"></i>
                  Maximum days subscription can extend
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 border"
              style={{ borderColor: '#E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF', fontSize: '0.875rem' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BE123C'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E11D48'}
            >
              <i className="fa-solid fa-check"></i>
              Create Plan
            </button>
          </div>
        </div>
      </form>

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
            className="flex-1 font-medium text-sm"
            style={{ 
              color: toast.type === 'success' ? '#065F46' : toast.type === 'error' ? '#991B1B' : '#1E40AF'
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

