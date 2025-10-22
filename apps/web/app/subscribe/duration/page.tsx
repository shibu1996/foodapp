'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const PRESET_DURATIONS = [
  { days: 7, label: '7 Days', badge: '' },
  { days: 15, label: '15 Days', badge: 'Popular' },
  { days: 30, label: '30 Days', badge: 'Best Value' },
];

export default function DurationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [isCustom, setIsCustom] = useState(false);
  const [customDays, setCustomDays] = useState<string>('');

  useEffect(() => {
    const productId = searchParams.get('product');
    const productName = searchParams.get('name');
    const price = searchParams.get('price');
    
    if (productId && productName && price) {
      updateState({
        productId,
        productName,
        basePrice: parseInt(price),
      });
    }
  }, [searchParams]);

  const getDiscountPercent = (days: number) => {
    if (days >= 30) return 15;
    if (days >= 15) return 10;
    if (days >= 7) return 5;
    return 0;
  };

  const getSkipAllowance = (days: number) => {
    return Math.floor(days / 7);
  };

  const calculateTotal = (days: number) => {
    const subtotal = state.basePrice * days;
    const discount = (subtotal * getDiscountPercent(days)) / 100;
    return subtotal - discount;
  };

  const handleDurationSelect = (days: number) => {
    setSelectedDuration(days);
    setIsCustom(false);
    setCustomDays('');
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setCustomDays('');
  };

  const handleNext = () => {
    const finalDuration = isCustom ? parseInt(customDays) : selectedDuration;
    
    if (isCustom && (isNaN(finalDuration) || finalDuration < 3 || finalDuration > 90)) {
      alert('Please enter a valid number of days (3-90)');
      return;
    }

    updateState({
      duration: finalDuration,
      isCustomDuration: isCustom,
      maxSkips: getSkipAllowance(finalDuration),
    });

    router.push('/subscribe/timeslot');
  };

  const activeDuration = isCustom ? (customDays ? parseInt(customDays) : 0) : selectedDuration;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 1 of 9</span>
            <span className="text-sm text-gray-500">Duration</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '11.1%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Plan Duration</h1>
          <p className="text-gray-600">Choose how long you want to subscribe</p>
        </div>

        {/* Product Info */}
        {state.productName && (
          <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
            <p className="text-sm text-gray-500">Subscribing to:</p>
            <p className="font-bold text-lg text-gray-800">{state.productName}</p>
            <p className="text-primary font-semibold">Rs. {state.basePrice}/day</p>
          </div>
        )}

        {/* Duration Options */}
        <div className="space-y-4 mb-6">
          {PRESET_DURATIONS.map((option) => (
            <button
              key={option.days}
              onClick={() => handleDurationSelect(option.days)}
              className={`w-full p-6 rounded-xl border-2 transition text-left ${
                selectedDuration === option.days && !isCustom
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedDuration === option.days && !isCustom
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedDuration === option.days && !isCustom && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{option.label}</h3>
                    {option.badge && (
                      <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-9">
                    <p className="text-sm text-gray-600 mb-2">
                      Rs. {state.basePrice}/day × {option.days} days
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Skip allowance: {getSkipAllowance(option.days)} day(s)
                    </p>
                    {getDiscountPercent(option.days) > 0 && (
                      <p className="text-sm font-semibold text-green-600">
                        Save {getDiscountPercent(option.days)}%
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 line-through">
                    Rs. {state.basePrice * option.days}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    Rs. {calculateTotal(option.days)}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* Custom Duration Option */}
          <button
            onClick={handleCustomSelect}
            className={`w-full p-6 rounded-xl border-2 transition text-left ${
              isCustom
                ? 'border-primary bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isCustom ? 'border-primary bg-primary' : 'border-gray-300'
              }`}>
                {isCustom && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Custom Days</h3>
                <p className="text-sm text-gray-600">Choose your own duration (3-90 days)</p>
              </div>
            </div>

            {isCustom && (
              <div className="ml-9">
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Enter number of days"
                  min="3"
                  max="90"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary mb-3"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {customDays && parseInt(customDays) >= 3 && parseInt(customDays) <= 90 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Rs. {state.basePrice}/day × {customDays} days
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Skip allowance: {getSkipAllowance(parseInt(customDays))} day(s)
                    </p>
                    {getDiscountPercent(parseInt(customDays)) > 0 && (
                      <p className="text-sm font-semibold text-green-600 mb-2">
                        Save {getDiscountPercent(parseInt(customDays))}%
                      </p>
                    )}
                    <p className="text-xl font-bold text-gray-800">
                      Total: Rs. {calculateTotal(parseInt(customDays))}
                    </p>
                  </div>
                )}
                
                {customDays && (parseInt(customDays) < 3 || parseInt(customDays) > 90) && (
                  <p className="text-sm text-red-600">Please enter between 3 and 90 days</p>
                )}
              </div>
            )}
          </button>
        </div>

        {/* Benefits */}
        {activeDuration > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Your Benefits:</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                {getDiscountPercent(activeDuration)}% discount on total price
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Skip up to {getSkipAllowance(activeDuration)} day(s) during subscription
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Free delivery on all days
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Pause or cancel anytime
              </li>
            </ul>
          </div>
        )}

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
            disabled={!activeDuration || activeDuration < 3 || activeDuration > 90}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Choose Time Slot
          </button>
        </div>
      </div>
    </div>
  );
}

