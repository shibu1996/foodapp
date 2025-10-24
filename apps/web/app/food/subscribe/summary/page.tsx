'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '@restaurant-app/api-client';

const ADDONS = [
  { id: 'salad', name: 'Fresh Garden Salad', price: 10, emoji: '🥗' },
  { id: 'curd', name: 'Fresh Curd (Dahi)', price: 15, emoji: '🥛' },
  { id: 'sweet', name: 'Sweet Delight', price: 20, emoji: '🍮' },
  { id: 'raita', name: 'Special Raita', price: 12, emoji: '🥙' },
];

const TIME_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', time: '7:00 AM - 9:00 AM', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', time: '12:00 PM - 2:00 PM', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', time: '7:00 PM - 9:00 PM', emoji: '🌙' },
];

export default function SummaryPage() {
  const router = useRouter();
  const { state, updateState, calculatePrice } = useSubscription();
  const [couponCode, setCouponCode] = useState(state.couponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState(!!state.couponCode);

  const skipDaysCount = state.skipDates?.length || 0;
  const duration = state.duration || 0;
  // Active days = Duration (because skip days extend the subscription)
  // User pays for 'duration' days of delivery, subscription runs for duration + skipDaysCount days
  const activeDays = duration;
  const basePrice = state.basePrice || 0;
  const addonPrice = state.addonPrice || 0;
  
  const baseTotal = basePrice * activeDays;
  const addonTotal = addonPrice * activeDays;
  const subtotal = baseTotal + addonTotal;
  
  // No plan discount - subscriptionPrice is already discounted
  // Only apply coupon discount if any
  const couponDiscount = state.discount || 0;
  const totalDiscount = couponDiscount;
  const finalTotal = Math.round(subtotal - totalDiscount);

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

  const [addingToCart, setAddingToCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Prepare complete subscription data with type marker
      const subscriptionItem = {
        _id: `sub_${Date.now()}`, // Temporary ID
        type: 'subscription', // Mark as subscription
        productId: state.productId,
        productName: state.productName,
        name: state.productName, // For consistency with one-time items
        productImage: state.productImage,
        image: state.productImage, // For consistency
        productDescription: state.productDescription,
        basePrice: state.basePrice,
        price: finalTotal, // Total price for display
        duration: state.duration,
        deliverySlot: state.deliverySlot,
        startDate: state.startDate,
        endDate: state.endDate,
        skipDates: state.skipDates || [],
        addons: state.addons || [],
        addonPrice: state.addonPrice || 0,
        couponCode: state.couponCode || '',
        discount: state.discount || 0,
        subtotal: subtotal,
        totalAmount: finalTotal,
        quantity: 1, // For consistency with one-time items
        addedAt: new Date().toISOString(),
      };

      // Get existing unified cart from localStorage (same cart for one-time & subscriptions)
      const existingCart = localStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      // Add new subscription to the unified cart
      cart.push(subscriptionItem);

      // Save updated unified cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Dispatch event to update FloatingCart
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success state
      setAddedToCart(true);
      
      // Log success
      console.log('✅ Subscription added to unified cart successfully!', subscriptionItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    // Navigate directly to checkout
    router.push('/food/subscribe/checkout');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSlot = (slotId: string) => {
    return TIME_SLOTS.find(slot => slot.id === slotId) || TIME_SLOTS[1];
  };

  const selectedTimeSlot = getTimeSlot(state.deliverySlot || 'lunch');

  // Debug log to check if product details are set
  useEffect(() => {
    // Check localStorage directly
    const savedState = localStorage.getItem('subscriptionState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      console.log('💾 localStorage Check:', {
        productId: parsed.productId,
        productName: parsed.productName,
        hasImage: !!parsed.productImage,
        hasDescription: !!parsed.productDescription,
        basePrice: parsed.basePrice
      });
    }
    
    console.log('📋 Summary Page - State from Context:', {
      productId: state.productId,
      productName: state.productName,
      productImage: state.productImage ? state.productImage.substring(0, 50) + '...' : 'MISSING',
      productDescription: state.productDescription ? state.productDescription.substring(0, 50) + '...' : 'MISSING',
      basePrice: state.basePrice,
      duration: state.duration
    });
    
    // If essential data is missing, redirect to home page
    if (!state.productName || !state.basePrice) {
      console.warn('⚠️ Missing product data! Redirecting to home page...');
      // Small delay to allow user to see the warning
      const timer = setTimeout(() => {
        router.push('/food/home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.productId, state.productName, state.productImage, state.productDescription, state.basePrice, state.duration, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 6 of 9</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Review Summary</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ background: '#E5E7EB', height: '6px' }}>
            <div style={{ width: '66.6%', background: '#E11D48', height: '6px' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
            Review Your Subscription
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Please review all details carefully before proceeding to cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Product Info Card */}
            <div className="p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#0E1214' }}>
                    Product Details
                  </h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Your selected subscription plan
                  </p>
                </div>
                <button
                  onClick={() => router.push('/food/subscribe/duration')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ 
                    color: '#E11D48',
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                >
                  Edit Plan
                </button>
              </div>

              {/* Product Image and Name */}
              {(!state.productName || !state.productImage || !state.productDescription) && (
                <div className="mb-3 p-4 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#E11D48' }}>
                    ⚠️ Product details missing
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    Redirecting to home page in 2 seconds... Please start the subscription flow from a product page.
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 mb-4 p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden" style={{ background: '#F3F4F6' }}>
                  {state.productImage ? (
                    <img 
                      src={state.productImage} 
                      alt={state.productName || 'Product'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', state.productImage);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl">🍱</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍱
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold mb-1" style={{ color: state.productName ? '#0E1214' : '#9CA3AF' }}>
                    {state.productName || '⚠️ Product name not available'}
                  </h4>
                  <p className="text-xs mb-2" style={{ color: state.productDescription ? '#6B7280' : '#9CA3AF' }}>
                    {state.productDescription || '⚠️ Description not available'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: '#E11D48' }}>
                      ₹{basePrice || 0}
                    </span>
                    <span className="text-xs" style={{ color: '#6B7280' }}>per day</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Plan Duration</p>
                  <p className="text-sm font-semibold" style={{ color: '#0E1214' }}>
                    {duration} Days
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Price</p>
                  <p className="text-sm font-semibold" style={{ color: '#E11D48' }}>
                    ₹{baseTotal}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Delivery Days</p>
                  <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                    {activeDays} days
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Skip Days</p>
                  <p className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
                    {skipDaysCount} days
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Schedule Card */}
            <div className="p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#0E1214' }}>
                    Delivery Schedule
                  </h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    When you'll receive your meals
                  </p>
                </div>
                <button
                  onClick={() => router.push('/food/subscribe/start-date')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ 
                    color: '#E11D48',
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                    <span className="text-xl">📅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-0.5" style={{ color: '#166534' }}>Start Date</p>
                    <p className="text-sm font-bold" style={{ color: '#15803D' }}>
                      {formatDate(state.startDate || '')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E11D48' }}>
                    <span className="text-xl">🏁</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-0.5" style={{ color: '#991B1B' }}>End Date</p>
                    <p className="text-sm font-bold" style={{ color: '#BE123C' }}>
                      {formatDate(state.endDate || '')}
                    </p>
                    {skipDaysCount > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                        ✨ Extended by {skipDaysCount} day{skipDaysCount > 1 ? 's' : ''} for skip days
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#3B82F6' }}>
                    <span className="text-lg">{selectedTimeSlot.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-0.5" style={{ color: '#1E40AF' }}>Delivery Time</p>
                    <p className="text-sm font-bold" style={{ color: '#1E3A8A' }}>
                      {selectedTimeSlot.label}
                    </p>
                    <p className="text-xs" style={{ color: '#60A5FA' }}>
                      {selectedTimeSlot.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skip Days Card */}
            <div className="p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#0E1214' }}>
                    Skip Days
                  </h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {skipDaysCount > 0 
                      ? `${skipDaysCount} day${skipDaysCount > 1 ? 's' : ''} will be skipped`
                      : 'No skip days selected'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/food/subscribe/skip-rules')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ 
                    color: '#E11D48',
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                  >
                    Edit
                  </button>
                </div>
              
              {skipDaysCount > 0 ? (
                <div>
                  <div className="p-3 rounded-lg mb-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎉</span>
                      <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                        Subscription Auto-Extended
                      </p>
                    </div>
                    <p className="text-xs mb-2" style={{ color: '#166534' }}>
                      Since you're skipping {skipDaysCount} day{skipDaysCount > 1 ? 's' : ''}, your subscription is extended by {skipDaysCount} day{skipDaysCount > 1 ? 's' : ''} - you still get {duration} full deliveries!
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>Total Duration</p>
                        <p className="text-sm font-bold" style={{ color: '#10B981' }}>{duration + skipDaysCount} days</p>
                      </div>
                      <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>Active Days</p>
                        <p className="text-sm font-bold" style={{ color: '#0E1214' }}>{activeDays} days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Selected Skip Days:</p>
                  <div className="flex flex-wrap gap-2">
                      {(state.skipDates || []).map((date: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FEE2E2' }}
                        >
                          {formatDateShort(date)}
                      </span>
                    ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs" style={{ color: '#166534' }}>
                    ✓ You'll receive meals on all {duration} days
                  </p>
                  </div>
                )}
              </div>

            {/* Add-ons Card */}
            <div className="p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#0E1214' }}>
                    Add-ons
                  </h3>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {(state.addons || []).length > 0 
                      ? `${(state.addons || []).length} add-on${(state.addons || []).length > 1 ? 's' : ''} selected`
                      : 'No add-ons selected'
                    }
                  </p>
                </div>
                  <button
                    onClick={() => router.push('/food/subscribe/addons')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{ 
                    color: '#E11D48',
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                  >
                    Edit
                  </button>
                </div>

              {(state.addons || []).length > 0 ? (
                <div className="space-y-2">
                  {(state.addons || []).map(addonId => {
                    const addon = ADDONS.find(a => a.id === addonId);
                    return addon ? (
                      <div 
                        key={addon.id} 
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: '#F9FAFB' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{addon.emoji}</span>
                          <span className="text-xs font-semibold" style={{ color: '#0E1214' }}>
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#E11D48' }}>
                          +₹{addon.price}/day
                        </span>
                      </div>
                    ) : null;
                  })}
                  
                  <div className="mt-3 p-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: '#166534' }}>Total Add-ons (per day)</span>
                      <span className="font-bold" style={{ color: '#15803D' }}>₹{addonPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span style={{ color: '#16A34A' }}>For {activeDays} active days</span>
                      <span className="font-bold" style={{ color: '#16A34A' }}>₹{addonTotal}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg text-center" style={{ background: '#F3F4F6' }}>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    No add-ons selected for this subscription
                  </p>
              </div>
            )}
            </div>


            {/* Coupon Code */}
            <div className="p-5 rounded-xl border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>
                Have a Coupon Code?
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  disabled={appliedCoupon}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#E5E7EB',
                    color: '#0E1214'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D48';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                />
                <button
                  onClick={applyCoupon}
                  disabled={appliedCoupon || !couponCode}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: appliedCoupon ? '#10B981' : '#E11D48',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    if (!appliedCoupon && couponCode) {
                      e.currentTarget.style.background = '#BE123C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!appliedCoupon) {
                      e.currentTarget.style.background = '#E11D48';
                    }
                  }}
                >
                  {appliedCoupon ? '✓ Applied' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-3 p-2 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                    ✓ Coupon "{couponCode}" applied successfully!
                  </p>
                </div>
              )}
              <div className="mt-3 p-2 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                <p className="text-xs" style={{ color: '#1E40AF' }}>
                  💡 Try: <span className="font-semibold">FIRST50</span> or <span className="font-semibold">SAVE100</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="p-5 rounded-xl border sticky top-4" style={{ background: '#FFFFFF', borderColor: '#E11D48' }}>
              <div className="mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#0E1214' }}>
                  Price Breakdown
                </h3>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  Detailed cost summary
                </p>
              </div>
              
              {/* Base Price Section */}
              <div className="space-y-3 mb-4 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                {/* Info Note */}
                <div className="p-2.5 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs">💰</span>
                    <p className="text-xs" style={{ color: '#1E40AF' }}>
                      <strong>Special Subscription Price!</strong> You're already saving compared to regular one-time orders.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Subscription Price</span>
                    <span className="text-xs font-bold" style={{ color: '#E11D48' }}>₹{basePrice || 0}/day</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: '#9CA3AF' }}>{activeDays || 0} days × ₹{basePrice || 0}</span>
                    <span className="font-bold" style={{ color: '#0E1214' }}>₹{baseTotal || 0}</span>
                  </div>
                  {skipDaysCount > 0 && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        (You'll receive {duration} deliveries over {duration + skipDaysCount} days • {skipDaysCount} skip days selected)
                      </p>
                </div>
                  )}
                </div>

                {/* Add-ons Section */}
                {(state.addons || []).length > 0 && (
                  <div className="p-3 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold" style={{ color: '#92400E' }}>Add-ons Total</span>
                      <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>₹{addonPrice || 0}/day</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span style={{ color: '#B45309' }}>{activeDays || 0} days × ₹{addonPrice || 0}</span>
                      <span className="font-bold" style={{ color: '#92400E' }}>₹{addonTotal || 0}</span>
                    </div>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold" style={{ color: '#6B7280' }}>Subtotal</span>
                  <span className="text-base font-bold" style={{ color: '#0E1214' }}>₹{subtotal || 0}</span>
                  </div>
                </div>

              {/* Discounts Section - Only Coupon */}
              {couponDiscount > 0 && (
                <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#F0FDF4' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎫</span>
                      <span className="text-xs font-semibold" style={{ color: '#166534' }}>
                        Coupon Discount
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#10B981' }}>-₹{couponDiscount || 0}</span>
                  </div>
                  </div>
                )}

              {/* Skip Days Info */}
              {skipDaysCount > 0 && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">✨</span>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#166534' }}>
                        Subscription Auto-Extended by {skipDaysCount} Day{skipDaysCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs" style={{ color: '#15803D' }}>
                        You'll receive {duration} deliveries over {duration + skipDaysCount} total days. No charges for skip days!
                      </p>
                    </div>
                  </div>
                  </div>
                )}

              {/* Total Amount */}
              <div className="mb-5 p-4 rounded-xl" style={{ background: 'linear-gradient(to right, #FEF2F2, #FFFBEB)', border: '2px solid #E11D48' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#991B1B' }}>Total Amount</p>
                    <p className="text-2xl font-bold" style={{ color: '#E11D48' }}>₹{finalTotal || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: '#6B7280' }}>For {activeDays || 0} days</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#10B981' }}>
                      ₹{activeDays > 0 ? Math.round(finalTotal / activeDays) : 0}/day
                    </p>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: '#B45309' }}>✓ Inclusive of all taxes</p>
                {totalDiscount > 0 && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid #FEE2E2' }}>
                    <p className="text-xs" style={{ color: '#15803D' }}>
                      🎉 You saved ₹{totalDiscount} with coupon!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!addedToCart ? (
                <div className="flex gap-2.5 mb-4">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || checkingOut}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={{ 
                      background: (addingToCart || checkingOut) ? '#9CA3AF' : '#FFFFFF',
                      color: (addingToCart || checkingOut) ? '#FFFFFF' : '#E11D48',
                      border: '2px solid #E11D48',
                      cursor: (addingToCart || checkingOut) ? 'not-allowed' : 'pointer',
                      opacity: (addingToCart || checkingOut) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!addingToCart && !checkingOut) {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!addingToCart && !checkingOut) {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {addingToCart ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        🛒 Add to Cart
                      </>
                    )}
                  </button>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={addingToCart || checkingOut}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={{ 
                      background: (addingToCart || checkingOut) ? '#9CA3AF' : '#E11D48',
                      color: '#FFFFFF',
                      cursor: (addingToCart || checkingOut) ? 'not-allowed' : 'pointer',
                      opacity: (addingToCart || checkingOut) ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!addingToCart && !checkingOut) {
                        e.currentTarget.style.background = '#BE123C';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!addingToCart && !checkingOut) {
                        e.currentTarget.style.background = '#E11D48';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {checkingOut ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        ⚡ Checkout Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {/* Success Message */}
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)', border: '1px solid #BBF7D0' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                        <svg className="w-6 h-6" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold" style={{ color: '#166534' }}>
                          ✅ Added to Cart Successfully!
                        </h4>
                      </div>
                    </div>
              </div>

                  {/* Action Button After Adding - Only "Add More Products" */}
                  <button
                    onClick={() => router.push('/food/home')}
                    className="w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 mb-4"
                    style={{ 
                      background: '#E11D48',
                      color: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#BE123C';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#E11D48';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Add More Products
                  </button>
                </>
              )}

              {/* Benefits */}
              <div className="space-y-2 p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                <div className="flex items-start gap-2 text-xs" style={{ color: '#374151' }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Free delivery on all days</span>
                </div>
                <div className="flex items-start gap-2 text-xs" style={{ color: '#374151' }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Modify or cancel anytime</span>
                </div>
                <div className="flex items-start gap-2 text-xs" style={{ color: '#374151' }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>100% fresh & hygienic meals</span>
                </div>
                <div className="flex items-start gap-2 text-xs" style={{ color: '#374151' }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Secure payment gateway</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ 
              background: '#FFFFFF',
              borderColor: '#E5E7EB',
              color: '#374151'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            ← Back to Add-ons
          </button>
        </div>
      </div>
    </div>
  );
}


