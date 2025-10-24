'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription, Address } from '../context/SubscriptionContext';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { MapPicker } from './components/MapPicker';
import { AddressForm } from './components/AddressForm';
import { SavedAddressList } from './components/SavedAddressList';

export default function AddressPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const { isLoaded, loadError } = useGoogleMaps();

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(state.selectedAddress);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(state.savedAddresses);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      const addresses = JSON.parse(saved);
      setSavedAddresses(addresses);
      
      // Auto-select default address if none selected
      if (!selectedAddress) {
        const defaultAddr = addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }
    } else {
      // Initialize with mock data for testing
      const mockAddresses: Address[] = [
        {
          id: '1',
          houseNo: 'A-123',
          street: 'Green Park Society',
          area: 'Sector 18',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          landmark: 'Near Metro Station',
          latitude: 28.5706,
          longitude: 77.3272,
          isDefault: true,
          label: 'Home'
        }
      ];
      setSavedAddresses(mockAddresses);
      setSelectedAddress(mockAddresses[0]);
      localStorage.setItem('savedAddresses', JSON.stringify(mockAddresses));
    }
  }, []);

  const handleLocationSelect = (location: { lat: number; lng: number; address: any }) => {
    setMapLocation({ lat: location.lat, lng: location.lng });
    
    if (location.address) {
      setEditingAddress(prev => ({
        ...prev,
        houseNo: location.address.houseNo || prev?.houseNo || '',
        street: location.address.street || prev?.street || '',
        area: location.address.area || prev?.area || '',
        city: location.address.city || prev?.city || '',
        state: location.address.state || prev?.state || '',
        pincode: location.address.pincode || prev?.pincode || '',
        latitude: location.lat,
        longitude: location.lng,
      }));
    }
  };

  const handleSaveAddress = (address: Address) => {
    const newAddress = {
      ...address,
      id: editingAddress?.id || Date.now().toString(),
    };

    let updatedAddresses = [...savedAddresses];

    if (editingAddress?.id) {
      // Update existing
      updatedAddresses = updatedAddresses.map(a =>
        a.id === editingAddress.id ? newAddress : a
      );
    } else {
      // Add new
      updatedAddresses.push(newAddress);
    }

    // If setting as default, remove default from others
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a =>
        a.id === newAddress.id ? a : { ...a, isDefault: false }
      );
    }

    setSavedAddresses(updatedAddresses);
    setSelectedAddress(newAddress);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    
    setMode('list');
    setEditingAddress(null);
    setMapLocation(null);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setMapLocation({ lat: address.latitude, lng: address.longitude });
    setMode('edit');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
    
    if (selectedAddress?.id === id) {
      setSelectedAddress(null);
    }
  };

  const handleNext = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    updateState({
      selectedAddress,
      savedAddresses,
    });

    router.push('/food/subscribe/payment');
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Maps</h2>
          <p className="text-gray-600">
            Unable to load Google Maps. Please check your internet connection and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 7 of 9</span>
            <span className="text-sm text-gray-500">Delivery Address</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '77.7%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Delivery Address</h1>
          <p className="text-gray-600">
            {mode === 'list'
              ? 'Select or add a delivery address'
              : mode === 'add'
              ? 'Add a new delivery address'
              : 'Edit delivery address'}
          </p>
        </div>

        {/* List Mode */}
        {mode === 'list' && (
          <div>
            <SavedAddressList
              addresses={savedAddresses}
              selectedId={selectedAddress?.id}
              onSelect={setSelectedAddress}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onAddNew={() => {
                setMode('add');
                setEditingAddress({});
                setMapLocation(null);
              }}
            />

            {/* Navigation */}
            {savedAddresses.length > 0 && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAddress}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Payment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Mode */}
        {(mode === 'add' || mode === 'edit') && (
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Select Location on Map</h3>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                initialCenter={mapLocation || undefined}
              />
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Address Details</h3>
              <AddressForm
                initialAddress={editingAddress || {}}
                onSubmit={handleSaveAddress}
                onCancel={() => {
                  setMode('list');
                  setEditingAddress(null);
                  setMapLocation(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

