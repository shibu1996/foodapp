'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { FoodHeader } from '@/app/components/FoodHeader';
import { FloatingCart } from '@/app/components/FloatingCart';
import { AddressForm } from '@/app/components/AddressForm';

interface Address {
  _id: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  label: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  recipientName?: string;
  recipientPhone?: string;
}

export default function SavedAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [outletLocation, setOutletLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Load user and cart
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    loadAddresses();
    loadOutletLocation();
  }, []);

  const loadOutletLocation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/food/outlets/active');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const outlet = data.data[0]; // Get first active outlet
        if (outlet.location && outlet.location.coordinates) {
          setOutletLocation({
            lng: outlet.location.coordinates[0],
            lat: outlet.location.coordinates[1]
          });
        }
      }
    } catch (error) {
      console.error('Error loading outlet:', error);
    }
  };

  const loadAddresses = () => {
    try {
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } else {
        // Set sample addresses for testing
        setSampleAddresses();
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setSampleAddresses();
    } finally {
      setLoading(false);
    }
  };

  const setSampleAddresses = () => {
    const samples: Address[] = [
      {
        _id: '1',
        houseNo: '123',
        street: 'MG Road',
        area: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        landmark: 'Near Metro Station',
        label: 'Home',
        latitude: 12.9352,
        longitude: 77.6245,
        isDefault: true,
        recipientName: 'John Doe',
        recipientPhone: '9876543210'
      },
      {
        _id: '2',
        houseNo: '456',
        street: 'Brigade Road',
        area: 'Shantinagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560027',
        landmark: 'Opposite Park',
        label: 'Office',
        latitude: 12.9716,
        longitude: 77.5946,
        isDefault: false,
        recipientName: 'Jane Smith',
        recipientPhone: '9876543211'
      }
    ];

    setAddresses(samples);
    localStorage.setItem('savedAddresses', JSON.stringify(samples));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/food/home');
  };

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address._id);
    setShowAddForm(true);
  };

  const handleSaveAddress = (addressData: any) => {
    try {
      const savedAddresses = localStorage.getItem('savedAddresses');
      let addressesList: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];

      if (editingAddressId) {
        // Update existing address
        addressesList = addressesList.map(addr => 
          addr._id === editingAddressId ? { ...addr, ...addressData } : addr
        );
        setSuccessMessage('Address updated successfully!');
      } else {
        // Add new address
        const newAddress: Address = {
          _id: Date.now().toString(),
          ...addressData,
          isDefault: addressesList.length === 0 // First address is default
        };
        addressesList.push(newAddress);
        setSuccessMessage('Address added successfully!');
      }

      localStorage.setItem('savedAddresses', JSON.stringify(addressesList));
      setAddresses(addressesList);
      setShowAddForm(false);
      setEditingAddressId(null);
      setShowSuccessModal(true);
      
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!addressToDelete) return;

    try {
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (!savedAddresses) return;

      let addressesList: Address[] = JSON.parse(savedAddresses);
      addressesList = addressesList.filter(addr => addr._id !== addressToDelete._id);

      // If deleted address was default and there are remaining addresses, set first one as default
      if (addressToDelete.isDefault && addressesList.length > 0) {
        addressesList[0].isDefault = true;
      }

      localStorage.setItem('savedAddresses', JSON.stringify(addressesList));
      setAddresses(addressesList);
      setShowDeleteModal(false);
      setAddressToDelete(null);
      setSuccessMessage('Address deleted successfully!');
      setShowSuccessModal(true);
      
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = (addressId: string) => {
    try {
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (!savedAddresses) return;

      let addressesList: Address[] = JSON.parse(savedAddresses);
      addressesList = addressesList.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));

      localStorage.setItem('savedAddresses', JSON.stringify(addressesList));
      setAddresses(addressesList);
      setSuccessMessage('Default address updated!');
      setShowSuccessModal(true);
      
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
          <FoodHeader 
            user={user}
            showLocation={false}
            showSearch={false}
            showCart={true}
            cartCount={cart.length}
            onCartClick={() => setShowCartModal(true)}
            onLogout={handleLogout}
            centerTitle="Saved Addresses"
          />
          <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl p-6 animate-pulse border" style={{ borderColor: '#E5E7EB' }}>
                  <div className="h-4 rounded w-1/4 mb-4" style={{ backgroundColor: '#F3F4F6' }}></div>
                  <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: '#F3F4F6' }}></div>
                  <div className="h-4 rounded w-1/2" style={{ backgroundColor: '#F3F4F6' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (showAddForm) {
    const editingAddress = editingAddressId 
      ? addresses.find(addr => addr._id === editingAddressId) 
      : undefined;

    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
          <FoodHeader 
            user={user}
            showLocation={false}
            showSearch={false}
            showCart={true}
            cartCount={cart.length}
            onCartClick={() => setShowCartModal(true)}
            onLogout={handleLogout}
            centerTitle={editingAddressId ? "Edit Address" : "Add New Address"}
          />
          <div className="max-w-4xl mx-auto px-8 md:px-12 py-8">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddressId(null);
              }}
              className="flex items-center gap-2 mb-6 text-sm font-semibold transition-all"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e: any) => e.currentTarget.style.color = '#E11D48'}
              onMouseLeave={(e: any) => e.currentTarget.style.color = '#6B7280'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Addresses
            </button>
            <AddressForm
              initialAddress={editingAddress}
              user={user}
              showOrderFor={true}
              onSave={handleSaveAddress}
              onCancel={() => {
                setShowAddForm(false);
                setEditingAddressId(null);
              }}
            />
          </div>
          <FloatingCart 
            externalShowModal={showCartModal}
            onModalClose={() => setShowCartModal(false)}
            onFloatingButtonClick={() => setShowCartModal(true)}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
        {/* Header */}
        <FoodHeader 
          user={user}
          showLocation={false}
          showSearch={false}
          showCart={true}
          cartCount={cart.length}
          onCartClick={() => setShowCartModal(true)}
          onLogout={handleLogout}
          centerTitle="Saved Addresses"
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: '#0E1214' }}>
                My Addresses
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
              </p>
            </div>
            <div className="flex items-center gap-3">
              {addresses.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('⚠️ Delete ALL addresses? This cannot be undone!')) {
                      localStorage.removeItem('savedAddresses');
                      setAddresses([]);
                      setSuccessMessage('All addresses deleted!');
                      setShowSuccessModal(true);
                      setTimeout(() => setShowSuccessModal(false), 2000);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#DC2626', borderColor: '#DC2626' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
              <button
                onClick={handleAddAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Address
              </button>
            </div>
          </div>

          {/* Addresses Grid */}
          {addresses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <svg className="w-10 h-10" style={{ color: '#E11D48' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0E1214' }}>No Saved Addresses</h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Add your first address to get started</p>
              <button
                onClick={handleAddAddress}
                className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
                onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#BE123C'}
                onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#E11D48'}
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="bg-white rounded-xl border p-6 transition-all hover:shadow-lg"
                  style={{ 
                    borderColor: address.isDefault ? '#E11D48' : '#E5E7EB',
                    backgroundColor: address.isDefault ? '#FEF2F2' : '#FFFFFF'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: address.isDefault ? '#FEE2E2' : '#F3F4F6' }}>
                        <svg 
                          className="w-5 h-5" 
                          style={{ color: address.isDefault ? '#E11D48' : '#6B7280' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {address.label === 'Home' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          )}
                          {address.label === 'Office' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          )}
                          {address.label !== 'Home' && address.label !== 'Office' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>
                          {address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded inline-block mt-1" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                            ⭐ Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.backgroundColor = '#DBEAFE';
                          e.currentTarget.style.color = '#2563EB';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.backgroundColor = '#F3F4F6';
                          e.currentTarget.style.color = '#6B7280';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(address)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.backgroundColor = '#FEE2E2';
                          e.currentTarget.style.color = '#DC2626';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.backgroundColor = '#F3F4F6';
                          e.currentTarget.style.color = '#6B7280';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                      {address.houseNo}, {address.street}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {address.area}, {address.city}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {address.state} - {address.pincode}
                    </p>
                    {address.landmark && (
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        Landmark: {address.landmark}
                      </p>
                    )}
                    
                    {/* Distance from Outlet */}
                    {outletLocation && address.latitude && address.longitude && (
                      <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: address.isDefault ? '#FFFFFF' : '#E0F2FE' }}>
                        <svg className="w-4 h-4" style={{ color: '#0284C7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold" style={{ color: '#0284C7' }}>
                          {calculateDistance(
                            outletLocation.lat,
                            outletLocation.lng,
                            address.latitude,
                            address.longitude
                          ).toFixed(2)} km from outlet
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recipient Info */}
                  {address.recipientName && (
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: address.isDefault ? '#FFFFFF' : '#F9FAFB' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>{address.recipientName}</span>
                      </div>
                      {address.recipientPhone && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" style={{ color: '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-xs" style={{ color: '#6B7280' }}>{address.recipientPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Set as Default Button */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className="w-full py-2 rounded-lg font-semibold text-xs transition-all border"
                      style={{ backgroundColor: '#FFFFFF', color: '#E11D48', borderColor: '#E11D48' }}
                      onMouseEnter={(e: any) => {
                        e.currentTarget.style.backgroundColor = '#E11D48';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#E11D48';
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowDeleteModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                <svg className="w-8 h-8" style={{ color: '#DC2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#0E1214' }}>
                Delete Address?
              </h3>
              <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all border"
                  style={{ backgroundColor: '#FFFFFF', color: '#6B7280', borderColor: '#E5E7EB' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e: any) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
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

        {/* Success Modal */}
        {showSuccessModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-8 h-8" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-bold text-center" style={{ color: '#0E1214' }}>
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Floating Cart */}
        <FloatingCart 
          externalShowModal={showCartModal}
          onModalClose={() => setShowCartModal(false)}
          onFloatingButtonClick={() => setShowCartModal(true)}
        />
      </div>
    </ProtectedRoute>
  );
}

