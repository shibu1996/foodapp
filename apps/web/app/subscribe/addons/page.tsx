'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const ADDONS = [
  { id: 'salad', name: 'Fresh Salad', price: 10, description: 'Mixed greens with dressing' },
  { id: 'curd', name: 'Curd (Dahi)', price: 15, description: 'Fresh homemade yogurt' },
  { id: 'sweet', name: 'Sweet Dish', price: 20, description: 'Daily dessert variety' },
];

export default function AddonsPage() {
  const router = useRouter();
  const { state, updateState } = useSubscription();
  const [selectedAddons, setSelectedAddons] = useState<string[]>(state.addons || []);

  const toggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const calculateAddonPrice = () => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
  };

  const handleSkipAll = () => {
    setSelectedAddons([]);
  };

  const handleNext = () => {
    const addonPrice = calculateAddonPrice();
    updateState({ 
      addons: selectedAddons,
      addonPrice: addonPrice
    });
    router.push('/subscribe/summary');
  };

  const totalAddonPrice = calculateAddonPrice();
  const activeDays = state.duration - state.skipDates.length;
  const dailyTotal = state.basePrice + totalAddonPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 5 of 9</span>
            <span className="text-sm text-gray-500">Add-ons</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '55.5%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Would You Like to Add These?</h1>
              <p className="text-gray-600">Enhance your meal with delicious add-ons</p>
            </div>
            {selectedAddons.length > 0 && (
              <button
                onClick={handleSkipAll}
                className="text-sm text-primary hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Current Price Display */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Base Price</p>
              <p className="font-bold text-gray-800">Rs. {state.basePrice}/day</p>
            </div>
            {totalAddonPrice > 0 && (
              <>
                <div className="text-2xl text-gray-400">+</div>
                <div>
                  <p className="text-sm text-gray-500">Add-ons</p>
                  <p className="font-bold text-primary">Rs. {totalAddonPrice}/day</p>
                </div>
                <div className="text-2xl text-gray-400">=</div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-500">Daily Total</p>
              <p className="text-xl font-bold text-gray-800">Rs. {dailyTotal}/day</p>
            </div>
          </div>
        </div>

        {/* Add-ons Selection */}
        <div className="space-y-4 mb-6">
          {ADDONS.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`w-full p-6 rounded-xl border-2 transition text-left ${
                  isSelected
                    ? 'border-primary bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">
                      {addon.id === 'salad' && '🥗'}
                      {addon.id === 'curd' && '🥛'}
                      {addon.id === 'sweet' && '🍮'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{addon.name}</h3>
                    <p className="text-sm text-gray-600">{addon.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">+Rs. {addon.price}</p>
                    <p className="text-xs text-gray-500">per day</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Total Calculation */}
        {selectedAddons.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-6 border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-3">Add-ons Summary</h4>
            <div className="space-y-2">
              {selectedAddons.map(addonId => {
                const addon = ADDONS.find(a => a.id === addonId);
                return addon ? (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-teal-800">{addon.name}</span>
                    <span className="font-semibold text-teal-900">Rs. {addon.price}/day</span>
                  </div>
                ) : null;
              })}
              <div className="pt-3 border-t border-teal-200">
                <div className="flex justify-between font-bold">
                  <span className="text-teal-900">Total Add-ons</span>
                  <span className="text-teal-900">Rs. {totalAddonPrice}/day</span>
                </div>
                <p className="text-xs text-teal-600 mt-2">
                  For {state.duration} days: Rs. {totalAddonPrice * state.duration}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Good to Know</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Add-ons are included daily with your meal</li>
            <li>• Fresh preparation every day</li>
            <li>• You can modify add-ons after subscription (subject to availability)</li>
            <li>• No charges on skipped days</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
          >
            Next: Review Summary
          </button>
        </div>
      </div>
    </div>
  );
}

