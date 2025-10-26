'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TimeSlot {
  _id: string;
  label: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  isActive: boolean;
  order: number;
}

export default function TimeSlotsPage() {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    label: '',
    startTime: '07:00',
    endTime: '08:00',
    durationHours: 1,
    order: 0
  });

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/time-slots`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTimeSlots(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      showToast('Failed to load time slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      startTime: '07:00',
      endTime: '08:00',
      durationHours: 1,
      order: 0
    });
    setEditingSlot(null);
  };

  const handleAddEdit = async () => {
    try {
      // Auto-generate label if empty
      const label = formData.label || `${formData.startTime} - ${formData.endTime}`;
      
      const payload = {
        label,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationHours: formData.durationHours,
        order: formData.order
      };

      const url = editingSlot
        ? `${API_BASE_URL}/api/food/time-slots/${editingSlot._id}`
        : `${API_BASE_URL}/api/food/time-slots`;
      
      const method = editingSlot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        setShowModal(false);
        resetForm();
        loadTimeSlots();
      } else {
        showToast(data.message || 'Failed to save time slot', 'error');
      }
    } catch (error) {
      console.error('Error saving time slot:', error);
      showToast('Failed to save time slot', 'error');
    }
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      label: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationHours: slot.durationHours,
      order: slot.order
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/time-slots/${id}/toggle-status`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        loadTimeSlots();
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/time-slots/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        setShowDeleteModal(false);
        setDeleteId(null);
        loadTimeSlots();
      } else {
        showToast(data.message || 'Failed to delete time slot', 'error');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      showToast('Failed to delete time slot', 'error');
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const duration = calculateDuration(formData.startTime, formData.endTime);
      setFormData(prev => ({ ...prev, durationHours: duration }));
    }
  }, [formData.startTime, formData.endTime]);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all"
          style={{
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: '#FFFFFF'
          }}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
            Manage delivery time slots for subscriptions
          </p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
          style={{
            backgroundColor: '#E11D48',
            color: '#FFFFFF',
            fontFamily: 'Poppins, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#BE123C';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(225, 29, 72, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#E11D48';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Time Slots List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#E11D48' }}></div>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>No Time Slots Found</h3>
          <p className="mb-6 text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
            Get started by creating your first time slot
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeSlots.map((slot) => (
            <div
              key={slot._id}
              className="bg-white rounded-lg border p-4 transition-all hover:shadow-md"
              style={{ borderColor: '#E5E7EB' }}
            >
              <div className="flex items-center justify-between">
                {/* Slot Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                      {slot.label}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: slot.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: slot.isActive ? '#065F46' : '#991B1B',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {slot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{slot.durationHours} {slot.durationHours === 1 ? 'hour' : 'hours'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(slot._id)}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: slot.isActive ? '#FEF3C7' : '#D1FAE5',
                      color: slot.isActive ? '#92400E' : '#065F46'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title={slot.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleEdit(slot)}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: '#DBEAFE',
                      color: '#1E40AF'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(slot._id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg transition-all"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="E.g., Morning Slot, Evening Slot"
                  className="w-full px-4 py-2 rounded-lg border outline-none transition-all text-sm"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border outline-none transition-all text-sm"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border outline-none transition-all text-sm"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Duration (Auto-calculated) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold" style={{ color: '#1E40AF', fontFamily: 'Poppins, sans-serif' }}>
                  Duration: {formData.durationHours} {formData.durationHours === 1 ? 'hour' : 'hours'}
                </p>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border outline-none transition-all text-sm"
                  style={{
                    borderColor: '#D1D5DB',
                    color: '#0E1214',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(225, 29, 72, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border"
                style={{
                  borderColor: '#D1D5DB',
                  color: '#6B7280',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEdit}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md"
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#BE123C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(225, 29, 72, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E11D48';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                {editingSlot ? 'Update' : 'Add'} Time Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>Delete Time Slot?</h3>
              <p className="text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                This action cannot be undone. The time slot will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border"
                style={{
                  borderColor: '#D1D5DB',
                  color: '#6B7280',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md"
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#B91C1C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
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
