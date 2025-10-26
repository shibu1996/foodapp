'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Sample plans data (same as list page)
const samplePlans = [
  {
    _id: '1',
    name: '7 Days Plan',
    description: 'Weekly meal subscription - Perfect for trying out',
    duration: 7,
    maxSkipDays: 0,
    maxExtendedDays: 0,
  },
  {
    _id: '2',
    name: '15 Days Plan',
    description: 'Fortnightly meal subscription - Most Popular',
    duration: 15,
    maxSkipDays: 3,
    maxExtendedDays: 3,
  },
  {
    _id: '3',
    name: '30 Days Plan',
    description: 'Monthly meal subscription - Best Value',
    duration: 30,
    maxSkipDays: 6,
    maxExtendedDays: 6,
  },
];

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPlan();
  }, [params?.id]);

  const fetchPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/food/plans/${params?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const plan = data.data;
        setFormData({
          name: plan.name,
          description: plan.description,
          duration: plan.duration.toString(),
          maxSkipDays: plan.maxSkipDays.toString(),
          maxExtendedDays: plan.maxExtendedDays?.toString() || '0',
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      showToast('Failed to load plan', 'error');
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(`${API_BASE_URL}/food/plans/${params?.id}`, {
        method: 'PUT',
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
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update plan');
      }

      showToast(`Plan "${formData.name}" updated successfully!`, 'success');
      setTimeout(() => {
        router.push('/admin/subscriptions/plans');
      }, 1500);
    } catch (error: any) {
      console.error('Update plan error:', error);
      showToast(error.message || 'Failed to update plan', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#E11D48' }}></i>
          <p className="mt-4" style={{ color: '#6B7280' }}>Loading plan...</p>
        </div>
      </div>
    );
  }

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
            <i className="fa-solid fa-edit" style={{ color: '#E11D48' }}></i>
            Edit Plan
          </h1>
        </div>
        <p className="ml-16" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Update subscription plan details
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
              <i className="fa-solid fa-save"></i>
              Update Plan
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

