'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { FoodHeader } from '@/app/components/FoodHeader';

const ADDONS = [
  { 
    id: 'salad', 
    name: 'Fresh Garden Salad', 
    price: 10, 
    description: 'Crispy mixed greens with seasonal vegetables',
    emoji: '🥗',
    benefits: ['Rich in vitamins', 'Low calorie', 'High fiber']
  },
  { 
    id: 'curd', 
    name: 'Fresh Curd (Dahi)', 
    price: 15, 
    description: 'Creamy homemade yogurt for better digestion',
    emoji: '🥛',
    benefits: ['Probiotic rich', 'Aids digestion', 'High protein']
  },
  { 
    id: 'sweet', 
    name: 'Sweet Delight', 
    price: 20, 
    description: 'Daily changing dessert variety to satisfy your sweet tooth',
    emoji: '🍮',
    benefits: ['Traditional recipes', 'Freshly made', 'Variety daily']
  },
  { 
    id: 'raita', 
    name: 'Special Raita', 
    price: 12, 
    description: 'Cooling yogurt-based side dish with fresh ingredients',
    emoji: '🥙',
    benefits: ['Cooling effect', 'Complements meals', 'Healthy']
  },
];

export default function AddonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  const isEditMode = searchParams?.get('editAddons') === 'true'; // Check if editing add-ons
  const [selectedAddons, setSelectedAddons] = useState<string[]>(state.addons || []);
  const [user, setUser] = useState<any>(null);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
    
    if (isEditMode) {
      console.log('🎯 Edit Mode - Navigating back to summary with updated add-ons');
    } else {
      console.log('🎯 Regular Mode - Navigating to summary');
    }
    router.push('/food/subscribe/summary');
  };

  const totalAddonPrice = calculateAddonPrice();
  const skipDaysCount = state.skipDates?.length || 0;
  const activeDays = (state.duration || 0) - skipDaysCount;
  const dailyTotal = (state.basePrice || 0) + totalAddonPrice;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <FoodHeader 
        user={user}
        showLocation={false}
        showSearch={false}
        showCart={false}
        onLogout={() => {
          localStorage.clear();
          router.push('/auth');
        }}
        centerTitle="New Subscription"
      />

      {/* Progress Bar */}
      <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 5 of 6</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Add-ons</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ background: '#E5E7EB', height: '6px' }}>
            <div style={{ width: '83.3%', background: '#E11D48', height: '6px' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#0E1214' }}>
                {isEditMode ? 'Update Your Add-ons' : 'Enhance Your Meal'}
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {isEditMode 
                  ? 'Modify your selected add-ons to customize your subscription'
                  : 'Select delicious add-ons to make your subscription even better'
                }
              </p>
            </div>
            {selectedAddons.length > 0 && (
              <button
                onClick={handleSkipAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200"
                style={{ 
                  color: '#E11D48',
                  borderColor: '#FEE2E2',
                  background: '#FEF2F2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs" style={{ color: '#6B7280' }}>Duration</p>
              <p className="font-bold text-sm mt-1" style={{ color: '#0E1214' }}>{state.duration} Days</p>
            </div>
            {state.startDate && (
              <div>
                <p className="text-xs" style={{ color: '#6B7280' }}>Starts</p>
                <p className="font-semibold text-sm mt-1" style={{ color: '#0E1214' }}>
                  {new Date(state.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            {state.deliverySlot && (
              <div>
                <p className="text-xs" style={{ color: '#6B7280' }}>Time</p>
                <p className="font-semibold text-sm mt-1" style={{ color: '#0E1214' }}>{state.deliverySlot}</p>
              </div>
            )}
            <div>
              <p className="text-xs" style={{ color: '#6B7280' }}>Skip Days</p>
              <p className="font-semibold text-sm mt-1" style={{ color: '#0E1214' }}>
                {(state.skipDates || []).length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Current Price Display */}
        <div className="mb-6 p-4 rounded-xl border" style={{ background: 'linear-gradient(to right, #FEF2F2, #FFFBEB)', borderColor: '#FEE2E2' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Base Price</p>
              <p className="text-base font-bold" style={{ color: '#0E1214' }}>₹{state.basePrice}/day</p>
            </div>
            {totalAddonPrice > 0 && (
              <>
                <div className="text-lg font-bold" style={{ color: '#E11D48' }}>+</div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Add-ons</p>
                  <p className="text-base font-bold" style={{ color: '#E11D48' }}>₹{totalAddonPrice}/day</p>
                </div>
                <div className="text-lg font-bold" style={{ color: '#E11D48' }}>=</div>
              </>
            )}
            <div>
              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Daily Total</p>
              <p className="text-lg font-bold" style={{ color: '#E11D48' }}>₹{dailyTotal}/day</p>
            </div>
          </div>
        </div>

        {/* Add-ons Selection */}
        <div className="mb-6">
          <h3 className="text-base font-bold mb-4" style={{ color: '#0E1214' }}>
            Available Add-ons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADDONS.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                  className="p-4 rounded-xl border transition-all duration-200 text-left"
                  style={{
                    background: isSelected ? '#FEF2F2' : '#FFFFFF',
                    borderColor: isSelected ? '#E11D48' : '#E5E7EB',
                    boxShadow: isSelected ? '0 4px 12px rgba(225, 29, 72, 0.15)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#FEE2E2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                  {/* Checkbox */}
                    <div 
                      className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        borderColor: isSelected ? '#E11D48' : '#D1D5DB',
                        background: isSelected ? '#E11D48' : '#FFFFFF'
                      }}
                    >
                    {isSelected && (
                        <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                    {/* Emoji Icon */}
                    <div 
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: isSelected ? '#FFFFFF' : '#F3F4F6' }}
                    >
                      <span className="text-2xl">{addon.emoji}</span>
                  </div>

                  {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold" style={{ color: '#0E1214' }}>
                          {addon.name}
                        </h3>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-base font-bold" style={{ color: '#E11D48' }}>
                            +₹{addon.price}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>per day</p>
                        </div>
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                        {addon.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {addon.benefits.map((benefit, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              background: isSelected ? '#FFFFFF' : '#F9FAFB',
                              color: '#10B981',
                              border: '1px solid #BBF7D0'
                            }}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        </div>

        {/* Total Calculation */}
        {selectedAddons.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#15803D' }}>
              Your Selected Add-ons
            </h4>
            <div className="space-y-2">
              {selectedAddons.map(addonId => {
                const addon = ADDONS.find(a => a.id === addonId);
                return addon ? (
                  <div key={addon.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span>{addon.emoji}</span>
                      <span style={{ color: '#166534' }}>{addon.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#166534' }}>₹{addon.price}/day</span>
                  </div>
                ) : null;
              })}
              <div className="pt-3 border-t" style={{ borderColor: '#BBF7D0' }}>
                <div className="flex justify-between font-bold text-sm">
                  <span style={{ color: '#15803D' }}>Total Add-ons Cost</span>
                  <span style={{ color: '#15803D' }}>₹{totalAddonPrice}/day</span>
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span style={{ color: '#16A34A' }}>For {activeDays} active days</span>
                  <span className="font-semibold" style={{ color: '#16A34A' }}>
                    ₹{totalAddonPrice * activeDays}
                  </span>
                </div>
                {skipDaysCount > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#16A34A' }}>
                    * No charges on {skipDaysCount} skipped day{skipDaysCount > 1 ? 's' : ''}
                </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 p-4 rounded-xl border" style={{ background: '#EFF6FF', borderColor: '#DBEAFE' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#3B82F6' }}>
              <span className="text-xs" style={{ color: '#FFFFFF' }}>ℹ</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: '#1E40AF' }}>
                Good to Know
              </h4>
              <ul className="space-y-1.5 text-xs" style={{ color: '#1E3A8A' }}>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>Add-ons are included daily with your meal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>Freshly prepared every single day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>You can modify add-ons after subscription (subject to availability)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>No charges applied on skipped days</span>
                </li>
          </ul>
            </div>
          </div>
        </div>

        {/* Skip Add-ons Option */}
        {selectedAddons.length === 0 && (
          <div className="mb-6 p-4 rounded-xl border text-center" style={{ background: '#FFFBEB', borderColor: '#FEF3C7' }}>
            <p className="text-sm" style={{ color: '#92400E' }}>
              You can skip add-ons for now and continue with just the base meal. You can always add them later!
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {!isEditMode && (
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
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ 
              background: '#E11D48',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E11D48';
            }}
          >
            {isEditMode 
              ? 'Update Add-ons'
              : selectedAddons.length > 0 
                ? 'Continue with Add-ons' 
                : 'Skip Add-ons'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

