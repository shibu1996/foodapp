'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

const ADDONS = [
  { id: 'salad', name: 'Fresh Salad', price: 10 },
  { id: 'curd', name: 'Curd (Dahi)', price: 15 },
  { id: 'sweet', name: 'Sweet Dish', price: 20 },
];

export default function SummaryPage() {
  const router = useRouter();
  const { state, updateState, calculatePrice } = useSubscription();
  const [couponCode, setCouponCode] = useState(state.couponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState(false);

  const activeDays = state.duration - state.skipDates.length;
  const baseTotal = state.basePrice * activeDays;
  const addonTotal = state.addonPrice * activeDays;
  const subtotal = baseTotal + addonTotal;
  
  // Calculate discount
  let discountPercent = 0;
  if (state.duration >= 30) discountPercent = 15;
  else if (state.duration >= 15) discountPercent = 10;
  else if (state.duration >= 7) discountPercent = 5;
  
  const autoDiscount = (subtotal * discountPercent) / 100;
  const couponDiscount = state.discount || 0;
  const totalDiscount = autoDiscount + couponDiscount;
  const finalTotal = subtotal - totalDiscount;

  const applyCoupon = () => {
    if (couponCode === 'FIRST50') {
      updateState({ couponCode, discount: 50 });
      setAppliedCoupon(true);
      alert('Coupon applied! Rs. 50 discount added.');
    } else if (couponCode === 'SAVE100') {
      updateState({ couponCode, discount: 100 });
      setAppliedCoupon(true);
      alert('Coupon applied! Rs. 100 discount added.');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleProceed = () => {
    updateState({ finalPrice: finalTotal });
    router.push('/subscribe/address');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 6 of 9</span>
            <span className="text-sm text-gray-500">Summary</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '66.6%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Your Subscription</h1>
          <p className="text-gray-600">Please review all details before proceeding to payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-4">
            {/* Duration Card */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Subscription Duration</h3>
                  <p className="text-2xl font-bold text-primary">{state.duration} Days</p>
                </div>
                <button
                  onClick={() => router.push('/subscribe/duration')}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{formatDate(state.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-medium">{formatDate(state.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Time</span>
                  <span className="font-medium">{state.deliverySlot}</span>
                </div>
              </div>
            </div>

            {/* Skip Days Card */}
            {state.skipEnabled && (
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Skip Days</h3>
                    <p className="text-sm text-gray-600">
                      {state.skipDates.length > 0 
                        ? `${state.skipDates.length} day(s) will be skipped`
                        : 'Skip option enabled'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/subscribe/skip-rules')}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {state.skipDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {state.skipDates.slice(0, 3).map(date => (
                      <span key={date} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {formatDate(date)}
                      </span>
                    ))}
                    {state.skipDates.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{state.skipDates.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add-ons Card */}
            {state.addons.length > 0 && (
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-800">Add-ons</h3>
                  <button
                    onClick={() => router.push('/subscribe/addons')}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2">
                  {state.addons.map(addonId => {
                    const addon = ADDONS.find(a => a.id === addonId);
                    return addon ? (
                      <div key={addon.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{addon.name}</span>
                        <span className="font-medium">Rs. {addon.price}/day</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}


            {/* Coupon Code */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Have a Coupon Code?</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={appliedCoupon}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100"
                />
                <button
                  onClick={applyCoupon}
                  disabled={appliedCoupon || !couponCode}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {appliedCoupon ? 'Applied' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <p className="mt-2 text-sm text-green-600">Coupon applied successfully!</p>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Try: FIRST50 or SAVE100
              </p>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 border-2 border-primary sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Price Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">Rs. {state.basePrice} × {activeDays}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"></span>
                  <span className="font-bold">Rs. {baseTotal}</span>
                </div>

                {state.addons.length > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium">Rs. {state.addonPrice} × {activeDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600"></span>
                      <span className="font-bold">Rs. {addonTotal}</span>
                    </div>
                  </>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">Rs. {subtotal}</span>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">- Rs. {autoDiscount}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span className="font-bold">- Rs. {couponDiscount}</span>
                  </div>
                )}

                {state.skipDates.length > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700">
                      {state.skipDates.length} day(s) skipped - charges adjusted
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">Rs. {Math.round(finalTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition"
              >
                Next: Add Delivery Address
              </button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-2">✓</span>
                  <span>Free delivery on all days</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-2">✓</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="mr-2">✓</span>
                  <span>100% secure payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

