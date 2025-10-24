'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';

export default function SuccessPage() {
  const router = useRouter();
  const { state, resetState } = useSubscription();

  const subscriptionId = 'SUB' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewSubscriptions = () => {
    resetState(); // Clear the subscription state
    router.push('/food/subscriptions'); // Go to My Subscriptions page
  };

  const handleOrderMore = () => {
    resetState();
    router.push('/food/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 rounded-full p-6 mb-6 animate-bounce">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">You're Subscribed!</h1>
          <p className="text-lg text-gray-600">
            Your subscription has been confirmed successfully
          </p>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Subscription ID</p>
                <p className="text-2xl font-bold text-primary">{subscriptionId}</p>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <p className="text-sm font-semibold text-green-700">Active</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation has been sent to your registered phone number
            </p>
          </div>

          {/* Subscription Summary */}
          <div className="space-y-4 mb-6">
            {/* Product Name */}
            {state.productName && (
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Subscribed To</p>
                <p className="text-xl font-bold text-primary">{state.productName}</p>
                <p className="text-sm text-gray-600">Rs. {state.basePrice}/day</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-bold text-gray-800">{state.duration} Days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                <p className="font-bold text-primary text-xl">Rs. {Math.round(state.finalPrice || 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="font-medium text-gray-800">{state.startDate ? formatDate(state.startDate).split(',')[0] : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">End Date</p>
                <p className="font-medium text-gray-800">{state.endDate ? formatDate(state.endDate).split(',')[0] : 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Time</p>
                <p className="font-medium text-gray-800">{state.deliverySlot || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Days</p>
                <p className="font-medium text-gray-800">{state.duration - state.skipDates.length} days</p>
              </div>
            </div>

            {/* Add-ons */}
            {state.addons.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Add-ons Included</p>
                <div className="flex flex-wrap gap-2">
                  {state.addons.map((addon, index) => (
                    <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                      {addon === 'salad' && 'Fresh Salad'}
                      {addon === 'curd' && 'Curd (Dahi)'}
                      {addon === 'sweet' && 'Sweet Dish'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coupon Applied */}
            {state.couponCode && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Coupon Applied</p>
                    <p className="font-bold text-green-800">{state.couponCode}</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">-Rs. {state.discount}</p>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {state.selectedAddress && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Delivery Address</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-800 mb-1">
                    {state.selectedAddress.label || 'Home'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {state.selectedAddress.houseNo}, {state.selectedAddress.street}, {state.selectedAddress.area}
                  </p>
                  <p className="text-sm text-gray-600">
                    {state.selectedAddress.city}, {state.selectedAddress.state} - {state.selectedAddress.pincode}
                  </p>
                  {state.selectedAddress.landmark && (
                    <p className="text-sm text-gray-500 mt-1">
                      Landmark: {state.selectedAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Next Delivery */}
          <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-xl p-6 border-2 border-primary">
            <p className="text-sm font-semibold text-teal-700 mb-2">Your First Delivery</p>
            <p className="text-xl font-bold text-gray-800 mb-1">{state.startDate ? formatDate(state.startDate) : 'N/A'}</p>
            <p className="text-sm text-gray-600 mb-3">at {state.deliverySlot || 'N/A'}</p>
            
            {state.selectedAddress && (
              <div className="bg-white/60 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Delivering To:</p>
                <p className="text-sm text-gray-800">
                  {state.selectedAddress.houseNo}, {state.selectedAddress.area}, {state.selectedAddress.city}
                </p>
              </div>
            )}
            
            <div className="pt-3 border-t border-orange-200">
              <p className="text-xs text-gray-600">
                You'll receive a notification 30 minutes before delivery
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-800">Track Your Subscription</p>
                <p className="text-sm text-gray-600">View and manage your subscription anytime</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-800">Skip Days</p>
                <p className="text-sm text-gray-600">
                  {state.skipEnabled 
                    ? `You can skip up to ${state.maxSkips} days during your subscription`
                    : 'Skipping is not enabled for this subscription'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-800">Pause or Cancel</p>
                <p className="text-sm text-gray-600">Manage your subscription with full flexibility</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-800">Change Meals</p>
                <p className="text-sm text-gray-600">Update your daily meals 24 hours in advance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleViewSubscriptions}
            className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition"
          >
            View My Subscriptions
          </button>
          <button
            onClick={handleOrderMore}
            className="flex-1 bg-white text-primary border-2 border-primary py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition"
          >
            Order More
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? <a href="#" className="text-primary hover:underline font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

