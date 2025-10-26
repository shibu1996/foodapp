'use client';

import { useState, useEffect } from 'react';
import { OutletMapPicker } from './components/OutletMapPicker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Outlet {
  _id: string;
  name: string;
  tagline?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    fullAddress?: string;
  };
  owner: {
    name: string;
    phone: string;
    email: string;
  };
  isActive: boolean;
  operatingHours?: {
    open?: string;
    close?: string;
  };
  createdAt: string;
}

export default function OutletsPage() {

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    location: {
      coordinates: [0, 0] as [number, number]
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      fullAddress: ''
    },
    owner: {
      name: '',
      phone: '',
      email: ''
    },
    operatingHours: {
      open: '09:00',
      close: '21:00'
    }
  });

  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/outlets`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOutlets(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading outlets:', error);
      showToast('Failed to load outlets', 'error');
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
      name: '',
      tagline: '',
      location: {
        coordinates: [0, 0]
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        fullAddress: ''
      },
      owner: {
        name: '',
        phone: '',
        email: ''
      },
      operatingHours: {
        open: '09:00',
        close: '21:00'
      }
    });
    setEditingOutlet(null);
  };

  const handleMapLocationSelect = async (location: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: [location.lng, location.lat]
      }
    }));

    // Fetch address using Google Geocoding API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=AIzaSyAQ3tRqgbbsKDSwC_oGNF6Ocsn01llBRuc`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        let street = '';
        let city = '';
        let state = '';
        let country = '';
        let pincode = '';

        addressComponents.forEach((component: any) => {
          if (component.types.includes('route')) {
            street = component.long_name;
          }
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setFormData(prev => ({
          ...prev,
          address: {
            street,
            city,
            state,
            country,
            pincode,
            fullAddress: data.results[0].formatted_address
          }
        }));
        
        showToast('Location and address fetched successfully!', 'success');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleAddEdit = async () => {
    try {
      // Validation
      if (!formData.name || !formData.owner.name || !formData.owner.phone || !formData.owner.email) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
        showToast('Please fetch outlet location', 'error');
        return;
      }

      const url = editingOutlet
        ? `${API_BASE_URL}/api/food/outlets/${editingOutlet._id}`
        : `${API_BASE_URL}/api/food/outlets`;
      
      const method = editingOutlet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        setShowModal(false);
        resetForm();
        loadOutlets();
      } else {
        showToast(data.error || 'Failed to save outlet', 'error');
      }
    } catch (error) {
      console.error('Error saving outlet:', error);
      showToast('Failed to save outlet', 'error');
    }
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      tagline: outlet.tagline || '',
      location: {
        coordinates: outlet.location.coordinates
      },
      address: outlet.address || {
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        fullAddress: ''
      },
      owner: outlet.owner,
      operatingHours: outlet.operatingHours || {
        open: '09:00',
        close: '21:00'
      }
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/outlets/${id}/toggle-status`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        loadOutlets();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/outlets/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message, 'success');
        setShowDeleteModal(false);
        setDeleteId(null);
        loadOutlets();
      } else {
        showToast(data.error || 'Failed to delete outlet', 'error');
      }
    } catch (error) {
      console.error('Error deleting outlet:', error);
      showToast('Failed to delete outlet', 'error');
    }
  };

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
            Manage your restaurant outlets and locations
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
          <span>Add Outlet</span>
        </button>
      </div>

      {/* Outlets List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#E11D48' }}></div>
        </div>
      ) : outlets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>No Outlets Found</h3>
          <p className="mb-6 text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
            Get started by registering your first outlet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outlets.map((outlet) => (
            <div
              key={outlet._id}
              className="bg-white rounded-lg border p-5 transition-all hover:shadow-md"
              style={{ borderColor: '#E5E7EB' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                      {outlet.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: outlet.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: outlet.isActive ? '#065F46' : '#991B1B',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {outlet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {outlet.tagline && (
                    <p className="text-xs italic" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                      "{outlet.tagline}"
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-3 pb-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                      {outlet.address.fullAddress || `${outlet.address.city}, ${outlet.address.state}`}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
                      📍 {outlet.location.coordinates[1].toFixed(6)}, {outlet.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="mb-3 pb-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>Owner Details</p>
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                    👤 {outlet.owner.name}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                    📞 {outlet.owner.phone}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                    📧 {outlet.owner.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(outlet._id)}
                  className="flex-1 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                  style={{
                    backgroundColor: outlet.isActive ? '#FEF3C7' : '#D1FAE5',
                    color: outlet.isActive ? '#92400E' : '#065F46',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {outlet.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleEdit(outlet)}
                  className="flex-1 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                  style={{
                    backgroundColor: '#DBEAFE',
                    color: '#1E40AF',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setDeleteId(outlet._id);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                {editingOutlet ? 'Edit Outlet' : 'Register New Outlet'}
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

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Location Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold mb-3" style={{ color: '#1E40AF', fontFamily: 'Poppins, sans-serif' }}>
                  📍 Outlet Location *
                </h3>
                
                <OutletMapPicker
                  onLocationSelect={handleMapLocationSelect}
                  initialCenter={
                    formData.location.coordinates && 
                    formData.location.coordinates[0] && 
                    formData.location.coordinates[1] &&
                    !isNaN(formData.location.coordinates[0]) && 
                    !isNaN(formData.location.coordinates[1]) &&
                    formData.location.coordinates[0] !== 0 && 
                    formData.location.coordinates[1] !== 0
                      ? { 
                          lat: Number(formData.location.coordinates[1]), 
                          lng: Number(formData.location.coordinates[0]) 
                        }
                      : undefined
                  }
                />
              </div>

              {/* Outlet Details */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Outlet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Main Branch, Downtown Outlet"
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

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="E.g., Fresh Food, Fast Delivery"
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

              {/* Address (Auto-filled from location) */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Full Address
                </label>
                <textarea
                  value={formData.address.fullAddress}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, fullAddress: e.target.value }
                  })}
                  placeholder="Auto-filled when you fetch location"
                  rows={2}
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

              {/* Owner Details */}
              <div className="border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Owner Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={formData.owner.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        owner: { ...formData.owner, name: e.target.value }
                      })}
                      placeholder="Enter owner name"
                      className="w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.owner.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          owner: { ...formData.owner, phone: e.target.value }
                        })}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm"
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

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.owner.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          owner: { ...formData.owner, email: e.target.value }
                        })}
                        placeholder="owner@example.com"
                        className="w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm"
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
                </div>
              </div>

              {/* Operating Hours */}
              <div className="border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Operating Hours
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.open}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        operatingHours: { ...formData.operatingHours, open: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm"
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

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.close}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        operatingHours: { ...formData.operatingHours, close: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm"
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
                {editingOutlet ? 'Update Outlet' : 'Register Outlet'}
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
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>Delete Outlet?</h3>
              <p className="text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                This action cannot be undone. The outlet will be permanently removed.
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
