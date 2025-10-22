'use client';

import { useState, useEffect } from 'react';
import { Address } from '../../subscribe/context/SubscriptionContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationSelect: (location: string) => void;
}

export function LocationModal({ isOpen, onClose, currentLocation, onLocationSelect }: LocationModalProps) {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('savedAddresses');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const handleSelectAddress = (address: Address) => {
    const locationStr = `${address.area}, ${address.city}`;
    onLocationSelect(locationStr);
    localStorage.setItem('currentLocation', locationStr);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect('Current Location');
          localStorage.setItem('currentLocation', 'Current Location');
          onClose();
        },
        (error) => {
          alert('Unable to get your location');
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Select Delivery Location</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Use Current Location */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition mb-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-primary">Use Current Location</p>
              <p className="text-sm text-gray-600">GPS based location</p>
            </div>
          </button>

          {/* Saved Addresses */}
          {savedAddresses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Saved Addresses</h3>
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-orange-50 transition text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {address.label || 'Other'}
                      </span>
                      {address.isDefault && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-800 mb-1">
                      {address.houseNo}, {address.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.area}, {address.city}, {address.state} - {address.pincode}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedAddresses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No saved addresses found</p>
              <p className="text-sm text-gray-400">Add an address during checkout</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

