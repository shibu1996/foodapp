'use client';

import { useState, useEffect } from 'react';

type TabType = 'delivery' | 'platform' | 'tax' | 'packaging';

interface Charge {
  id: string;
  _id?: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  chargeType?: 'delivery' | 'platform' | 'tax' | 'packaging';
  isActive: boolean;
  description: string;
  applicableFor: 'onetime' | 'subscription' | 'both';
  minOrderValue?: number;
  maxDistance?: number;
}

export default function ChargesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('delivery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCharge, setDeletingCharge] = useState<Charge | null>(null);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'fixed' as 'fixed' | 'percentage',
    description: '',
    applicableFor: 'both' as 'onetime' | 'subscription' | 'both',
    minOrderValue: 0,
    maxDistance: 0
  });

  const [deliveryCharges, setDeliveryCharges] = useState<Charge[]>([]);
  const [platformFees, setPlatformFees] = useState<Charge[]>([]);
  const [taxes, setTaxes] = useState<Charge[]>([]);
  const [packagingCharges, setPackagingCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';

  // Load charges from API
  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/food/charges`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Group charges by chargeType
          const grouped = data.data.reduce((acc: any, charge: any) => {
            const chargeWithId = {
              ...charge,
              id: charge._id || charge.id
            };
            if (charge.chargeType === 'delivery') {
              acc.delivery.push(chargeWithId);
            } else if (charge.chargeType === 'platform') {
              acc.platform.push(chargeWithId);
            } else if (charge.chargeType === 'tax') {
              acc.tax.push(chargeWithId);
            } else if (charge.chargeType === 'packaging') {
              acc.packaging.push(chargeWithId);
            }
            return acc;
          }, { delivery: [], platform: [], tax: [], packaging: [] });

          setDeliveryCharges(grouped.delivery);
          setPlatformFees(grouped.platform);
          setTaxes(grouped.tax);
          setPackagingCharges(grouped.packaging);
        }
      }
    } catch (error) {
      console.error('Error loading charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'delivery' as TabType, label: 'Delivery Management', icon: 'fa-truck', color: '#E11D48' },
    { id: 'platform' as TabType, label: 'Platform Fee', icon: 'fa-building', color: '#3B82F6' },
    { id: 'tax' as TabType, label: 'Tax', icon: 'fa-receipt', color: '#F59E0B' },
    { id: 'packaging' as TabType, label: 'Packaging Charge', icon: 'fa-box', color: '#10B981' }
  ];

  const getCurrentCharges = () => {
    switch (activeTab) {
      case 'delivery': return deliveryCharges;
      case 'platform': return platformFees;
      case 'tax': return taxes;
      case 'packaging': return packagingCharges;
    }
  };

  const getCurrentSetter = () => {
    switch (activeTab) {
      case 'delivery': return setDeliveryCharges;
      case 'platform': return setPlatformFees;
      case 'tax': return setTaxes;
      case 'packaging': return setPackagingCharges;
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/charges/${id}/toggle`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        // Reload charges from API to get updated data
        await loadCharges();
      } else {
        console.error('Failed to toggle charge status');
      }
    } catch (error) {
      console.error('Error toggling charge status:', error);
    }
  };

  const handleEdit = (charge: Charge) => {
    setEditingCharge(charge);
    setFormData({
      name: charge.name,
      amount: charge.amount,
      type: charge.type,
      description: charge.description,
      applicableFor: charge.applicableFor,
      minOrderValue: charge.minOrderValue || 0,
      maxDistance: charge.maxDistance || 0
    });
    setShowAddModal(true);
  };

  const handleDelete = (charge: Charge) => {
    setDeletingCharge(charge);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingCharge) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/food/charges/${deletingCharge.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Reload charges from API
          await loadCharges();
        } else {
          console.error('Failed to delete charge');
        }
      } catch (error) {
        console.error('Error deleting charge:', error);
      } finally {
        setShowDeleteModal(false);
        setDeletingCharge(null);
      }
    }
  };

  const handleAddCharge = async () => {
    try {
      const chargeData = {
        name: formData.name,
        amount: formData.amount,
        type: formData.type,
        chargeType: activeTab,
        description: formData.description,
        applicableFor: formData.applicableFor,
        minOrderValue: activeTab === 'delivery' ? formData.minOrderValue : undefined,
        maxDistance: activeTab === 'delivery' ? formData.maxDistance : undefined
      };

      if (editingCharge) {
        // Update existing charge
        const response = await fetch(`${API_BASE_URL}/api/food/charges/${editingCharge.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chargeData)
        });

        if (response.ok) {
          await loadCharges();
        } else {
          console.error('Failed to update charge');
        }
      } else {
        // Add new charge
        const response = await fetch(`${API_BASE_URL}/api/food/charges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chargeData)
        });

        if (response.ok) {
          await loadCharges();
        } else {
          console.error('Failed to create charge');
        }
      }
      
      setShowAddModal(false);
      setEditingCharge(null);
      resetForm();
    } catch (error) {
      console.error('Error saving charge:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      type: 'fixed',
      description: '',
      applicableFor: 'both',
      minOrderValue: 0,
      maxDistance: 0
    });
    setEditingCharge(null);
  };

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  const renderChargeCard = (charge: Charge) => (
    <div 
      key={charge.id} 
      className="bg-white rounded-xl border p-4 transition-all duration-200"
      style={{ borderColor: '#E5E7EB' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = activeTabData.color;
        e.currentTarget.style.boxShadow = `0 4px 12px ${activeTabData.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
              background: `${activeTabData.color}15`
            }}>
              <i className={`fa ${activeTabData.icon}`} style={{ color: activeTabData.color, fontSize: '14px' }}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold" style={{ color: '#0E1214', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
                  {charge.name}
                </h3>
                <span 
                  className="px-2 py-0.5 rounded font-semibold"
                  style={{ 
                    background: charge.isActive ? '#F0FDF4' : '#FEF2F2',
                    color: charge.isActive ? '#10B981' : '#EF4444',
                    fontSize: '10px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {charge.isActive ? 'Active' : 'Inactive'}
                </span>
                <span 
                  className="px-2 py-0.5 rounded font-semibold"
                  style={{ 
                    background: charge.applicableFor === 'onetime' ? '#EEF2FF' : charge.applicableFor === 'subscription' ? '#FEF3C7' : '#F0FDF4',
                    color: charge.applicableFor === 'onetime' ? '#6366F1' : charge.applicableFor === 'subscription' ? '#F59E0B' : '#10B981',
                    fontSize: '10px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {charge.applicableFor === 'onetime' ? 'One-Time' : charge.applicableFor === 'subscription' ? 'Subscription' : 'Both'}
                </span>
              </div>
              <p className="mt-0.5" style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                {charge.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-12">
            <div className="flex items-center gap-1.5">
              <i className="fa fa-tag" style={{ color: '#6B7280', fontSize: '11px' }}></i>
              <span style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                Type: <span className="font-semibold" style={{ color: activeTabData.color }}>
                  {charge.type === 'fixed' ? 'Fixed' : 'Percentage'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa fa-money-bill" style={{ color: '#6B7280', fontSize: '11px' }}></i>
              <span style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                Amount: <span className="font-bold" style={{ color: activeTabData.color, fontSize: '14px' }}>
                  {charge.type === 'fixed' ? '₹' : ''}{charge.amount}{charge.type === 'percentage' ? '%' : ''}
                </span>
              </span>
            </div>
            {charge.minOrderValue !== undefined && (
              <div className="flex items-center gap-1.5">
                <i className="fa fa-shopping-cart" style={{ color: '#6B7280', fontSize: '11px' }}></i>
                <span style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                  Min Order: <span className="font-semibold" style={{ color: '#0E1214' }}>₹{charge.minOrderValue}</span>
                </span>
              </div>
            )}
            {charge.maxDistance !== undefined && (
              <div className="flex items-center gap-1.5">
                <i className="fa fa-location-dot" style={{ color: '#6B7280', fontSize: '11px' }}></i>
                <span style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                  Max Distance: <span className="font-semibold" style={{ color: '#0E1214' }}>{charge.maxDistance} km</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStatus(charge.id)}
            className="px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            style={{ 
              background: charge.isActive ? '#FEF2F2' : '#F0FDF4',
              color: charge.isActive ? '#EF4444' : '#10B981',
              border: `1px solid ${charge.isActive ? '#FEE2E2' : '#BBF7D0'}`,
              fontSize: '11px',
              fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i className={`fa ${charge.isActive ? 'fa-ban' : 'fa-check'} mr-1.5`} style={{ fontSize: '10px' }}></i>
            {charge.isActive ? 'Deactivate' : 'Activate'}
          </button>

          <button
            onClick={() => handleEdit(charge)}
            className="px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            style={{ 
              background: `${activeTabData.color}15`,
              color: activeTabData.color,
              border: `1px solid ${activeTabData.color}40`,
              fontSize: '11px',
              fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = activeTabData.color;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${activeTabData.color}15`;
              e.currentTarget.style.color = activeTabData.color;
            }}
          >
            <i className="fa fa-edit mr-1.5" style={{ fontSize: '10px' }}></i>
            Edit
          </button>

          <button
            onClick={() => handleDelete(charge)}
            className="px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            style={{ 
              background: '#FEF2F2',
              color: '#EF4444',
              border: '1px solid #FEE2E2',
              fontSize: '11px',
              fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EF4444';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.color = '#EF4444';
            }}
          >
            <i className="fa fa-trash mr-1.5" style={{ fontSize: '10px' }}></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                <i className="fa fa-dollar-sign mr-2" style={{ color: '#E11D48', fontSize: '16px' }}></i>
                Charges Management
              </h1>
              <p className="text-xs mt-1" style={{ color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                Manage all delivery, platform, tax, and packaging charges
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 font-semibold transition-all duration-200 whitespace-nowrap border-b-2"
                style={{
                  color: activeTab === tab.id ? tab.color : '#6B7280',
                  borderBottomColor: activeTab === tab.id ? tab.color : 'transparent',
                  background: activeTab === tab.id ? `${tab.color}08` : 'transparent',
                  fontSize: '13px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <i className={`fa ${tab.icon} mr-2`} style={{ fontSize: '12px' }}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Tab Header with Stats */}
        <div className="mb-4 p-4 rounded-xl border" style={{ 
          background: `linear-gradient(135deg, ${activeTabData.color}08 0%, #FFFFFF 100%)`,
          borderColor: activeTabData.color
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                background: activeTabData.color
              }}>
                <i className={`fa ${activeTabData.icon} text-white`} style={{ fontSize: '18px' }}></i>
              </div>
              <div>
                <h2 className="font-bold mb-0.5" style={{ color: '#0E1214', fontSize: '15px', fontFamily: 'Poppins, sans-serif' }}>
                  {activeTabData.label}
                </h2>
                <p style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                  Manage {activeTabData.label.toLowerCase()} charges and settings
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: activeTabData.color, fontFamily: 'Poppins, sans-serif' }}>
                  {getCurrentCharges().length}
                </p>
                <p style={{ color: '#6B7280', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#10B981', fontFamily: 'Poppins, sans-serif' }}>
                  {getCurrentCharges().filter(c => c.isActive).length}
                </p>
                <p style={{ color: '#6B7280', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charges List */}
        <div className="grid gap-3">
          {getCurrentCharges().map((charge) => (
            renderChargeCard(charge)
          ))}
        </div>

        {/* Add New Button */}
        <div className="mt-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            style={{ 
              background: activeTabData.color,
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: `0 2px 8px ${activeTabData.color}30`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${activeTabData.color}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${activeTabData.color}30`;
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <i className="fa fa-plus" style={{ fontSize: '10px' }}></i>
            </div>
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Add Charge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl w-full max-w-lg" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${activeTabData.color}15` }}>
                  <i className={`fa ${activeTabData.icon}`} style={{ color: activeTabData.color, fontSize: '16px' }}></i>
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#0E1214', fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>
                    {editingCharge ? 'Edit' : 'Add New'} {activeTabData.label} Charge
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                    {editingCharge ? 'Update the details below' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Charge Name */}
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  Charge Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Express Delivery 0-3 km"
                  className="w-full px-3 py-2.5 rounded-lg border"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  Charge Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'percentage' })}
                  className="w-full px-3 py-2.5 rounded-lg border"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.type === 'fixed' ? 'e.g., 30' : 'e.g., 5'}
                  className="w-full px-3 py-2.5 rounded-lg border"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                />
                <p className="mt-1" style={{ color: '#6B7280', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>
                  {formData.type === 'fixed' ? 'Enter amount in rupees' : 'Enter percentage value (0-100)'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this charge"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              {/* Applicable For */}
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  Applicable For *
                </label>
                <select
                  value={formData.applicableFor}
                  onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value as 'onetime' | 'subscription' | 'both' })}
                  className="w-full px-3 py-2.5 rounded-lg border"
                  style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                >
                  <option value="onetime">One-Time Orders Only</option>
                  <option value="subscription">Subscription Orders Only</option>
                  <option value="both">Both (One-Time & Subscription)</option>
                </select>
                <p className="mt-1" style={{ color: '#6B7280', fontSize: '10px', fontFamily: 'Poppins, sans-serif' }}>
                  Select which type of orders this charge applies to
                </p>
              </div>

              {/* Delivery-specific fields */}
              {activeTab === 'delivery' && (
                <>
                  <div>
                    <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                      Min Order Value (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 0"
                      className="w-full px-3 py-2.5 rounded-lg border"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2" style={{ color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                      Max Distance (km) (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDistance}
                      onChange={(e) => setFormData({ ...formData, maxDistance: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 5"
                      className="w-full px-3 py-2.5 rounded-lg border"
                      style={{ borderColor: '#E5E7EB', color: '#0E1214', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200"
                style={{ 
                  background: '#F3F4F6',
                  color: '#6B7280',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCharge}
                disabled={!formData.name || !formData.description}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200"
                style={{ 
                  background: formData.name && formData.description ? activeTabData.color : '#9CA3AF',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: formData.name && formData.description ? 'pointer' : 'not-allowed',
                  opacity: formData.name && formData.description ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (formData.name && formData.description) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.name && formData.description) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                <i className={`fa ${editingCharge ? 'fa-check' : 'fa-plus'} mr-2`} style={{ fontSize: '11px' }}></i>
                {editingCharge ? 'Update Charge' : 'Add Charge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                  <i className="fa fa-exclamation-triangle" style={{ color: '#EF4444', fontSize: '16px' }}></i>
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#0E1214', fontSize: '16px', fontFamily: 'Poppins, sans-serif' }}>
                    Delete Charge?
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="p-4 rounded-lg mb-4" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                <p className="font-semibold mb-1" style={{ color: '#0E1214', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                  {deletingCharge.name}
                </p>
                <p style={{ color: '#6B7280', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                  {deletingCharge.description}
                </p>
                <p className="mt-2 font-bold" style={{ color: '#EF4444', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
                  {deletingCharge.type === 'fixed' ? '₹' : ''}{deletingCharge.amount}{deletingCharge.type === 'percentage' ? '%' : ''}
                </p>
              </div>

              <p style={{ color: '#991B1B', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                Are you sure you want to delete this charge? This action cannot be undone.
              </p>
            </div>

            <div className="p-5 border-t flex gap-3" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCharge(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200"
                style={{ 
                  background: '#F3F4F6',
                  color: '#6B7280',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200"
                style={{ 
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EF4444';
                }}
              >
                <i className="fa fa-trash mr-2" style={{ fontSize: '11px' }}></i>
                Delete Charge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
