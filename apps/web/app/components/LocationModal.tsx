'use client';

import { useState, useEffect } from 'react';
import { AddressForm } from './AddressForm';

interface Address {
  _id: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  label?: string;
  latitude: number;
  longitude: number;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: Address) => void;
  currentLocation: string;
}

export function LocationModal({ isOpen, onClose, onSelectLocation, currentLocation }: LocationModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load saved addresses and user
  useEffect(() => {
    if (isOpen) {
      const savedAddresses = localStorage.getItem('savedAddresses');
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch (error) {
          console.error('Error loading addresses:', error);
        }
      }
      
      // Load user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }
      
      setShowAddForm(false); // Reset form state when modal opens
    }
  }, [isOpen]);

  const handleSelectAddress = (address: Address) => {
    onSelectLocation(address);
    onClose();
  };

  const handleSaveAddress = (addressData: any) => {
    const newAddr: Address = {
      _id: Date.now().toString(),
      ...addressData
    };

    const updatedAddresses = [...addresses, newAddr];
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
    
    // Select the newly added address
    handleSelectAddress(newAddr);
    setShowAddForm(false);
  };

  const handleSetDefaultAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedAddresses = addresses.map((addr: Address) => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      setAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      console.log('✅ Default address updated');
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-lg font-bold" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
            {showAddForm ? 'Add New Address' : 'Select Delivery Location'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showAddForm ? (
            <>
          {/* Current Location */}
          <div className="mb-4 p-4 rounded-xl border-2" style={{ borderColor: '#E11D48', backgroundColor: '#FEF2F2' }}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#6B7280' }}>Current Location</p>
                <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{currentLocation}</p>
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#0E1214', fontFamily: 'Poppins, sans-serif' }}>
                Saved Addresses
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => handleSelectAddress(address)}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                    style={{ 
                      borderColor: address.isDefault ? '#10B981' : '#E5E7EB',
                      backgroundColor: address.isDefault ? '#F0FDF4' : '#FFFFFF'
                    }}
                    onMouseEnter={(e) => {
                      if (!address.isDefault) {
                        e.currentTarget.style.borderColor = '#E11D48';
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (address.isDefault) {
                        e.currentTarget.style.borderColor = '#10B981';
                        e.currentTarget.style.backgroundColor = '#F0FDF4';
                      } else {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF2F2' }}>
                        <svg className="w-4 h-4" style={{ color: '#E11D48' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#0E1214' }}>
                          {address.houseNo}, {address.street}
                        </p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          {address.area}, {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.isDefault ? (
                          <button
                            onClick={(e) => handleSetDefaultAddress(address._id, e)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold whitespace-nowrap"
                            style={{ background: '#10B981', color: '#FFFFFF' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#059669';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#10B981';
                            }}
                            title="Set as Default Address"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Set Default
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold" style={{ color: '#10B981' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Address Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all border-2 border-dashed"
            style={{ borderColor: '#E11D48', color: '#E11D48', backgroundColor: '#FEF2F2', fontFamily: 'Poppins, sans-serif' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
          >
            + Add New Address
          </button>
          </>
          ) : (
            <AddressForm
              user={user}
              showOrderFor={true}
              onSave={handleSaveAddress}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

