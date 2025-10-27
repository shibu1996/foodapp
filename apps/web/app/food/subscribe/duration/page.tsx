'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '../context/SubscriptionContext';
import { FoodHeader } from '@/app/components/FoodHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Plan {
  _id: string;
  name: string;
  duration: number;
  maxSkipDays: number;
  maxExtendedDays: number;
  isActive: boolean;
  description: string;
}

export default function DurationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, updateState } = useSubscription();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number>(state.duration || 7);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isCustom, setIsCustom] = useState(state.isCustomDuration || false);
  const [customDays, setCustomDays] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Get data from URL params as fallback for initial render
  const urlPrice = searchParams ? parseInt(searchParams.get('price') || '0') : 0;
  const urlProductName = searchParams ? searchParams.get('name') || '' : '';
  const isEditPlanMode = searchParams?.get('editPlan') === 'true'; // Check if editing plan
  
  const currentPrice = state.basePrice || urlPrice;
  const currentProductName = state.productName || urlProductName;

  // Track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount and state to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Add cache-busting and no-cache headers to always get fresh data
        const response = await fetch(`${API_BASE_URL}/food/plans/active/meal?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const data = await response.json();
        
        if (data.success) {
          const activePlans = data.data || [];
          console.log('📦 Fresh plans fetched:', activePlans.length, 'plans');
          setPlans(activePlans);
          
          // Set selected plan based on current duration
          const currentPlan = activePlans.find((p: Plan) => p.duration === selectedDuration);
          if (currentPlan) {
            console.log('✅ Selected plan:', currentPlan.name, '- maxSkipDays:', currentPlan.maxSkipDays, '- maxExtendedDays:', currentPlan.maxExtendedDays);
            setSelectedPlan(currentPlan);
          }
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      // Wait for component to mount first
      if (!mounted) {
        return;
      }

      if (!searchParams) {
        console.log('⚠️ No search params available');
        // Check if we have data in state
        if (state.productId && state.productName && state.basePrice) {
          console.log('✅ Using existing state data (no URL params needed)');
          setDataLoaded(true);
        }
        return;
      }
      
      const productId = searchParams.get('product');
      const productName = searchParams.get('name');
      const price = searchParams.get('price');
      
      console.log('📥 Duration Page - URL Params:', {
        productId,
        productName,
        price
      });
      
      // Update product details from URL params
      if (productId && productName && price) {
      // Check if this is a NEW subscription (different product)
      const isNewSubscription = state.productId && state.productId !== productId;
      
      if (isNewSubscription) {
        console.log('🆕 New subscription detected! Clearing old state...');
        console.log('Old productId:', state.productId, '→ New productId:', productId);
        
        // Clear ALL localStorage items related to subscription
        localStorage.removeItem('subscriptionState');
        localStorage.removeItem('editingSubscription');
        
        // Reset to fresh state with only new product details
        const updates: any = {
          productId,
          productName,
          basePrice: parseInt(price),
          duration: 7, // Reset to default
          isCustomDuration: false,
          deliverySlot: '', // Clear old slot
          startDate: '', // Clear old date
          endDate: '', // Clear old date
          skipEnabled: false,
          maxSkips: 0,
          maxExtendedDays: 0,
          addons: [], // Clear old addons
          addonPrice: 0,
          skipDates: [], // Clear old skip dates
          couponCode: '',
          discount: 0,
          finalPrice: 0,
        };
        
        // Fetch description and image from API
        try {
          const response = await fetch(`http://localhost:5000/api/food/products/${productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data;
            updates.productDescription = product.description || '';
            updates.productImage = product.image || '';
            console.log('✅ Fetched product details from API');
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
        
        console.log('✨ Setting fresh state for new subscription');
        updateState(updates);
        setSelectedDuration(7);
        setIsCustom(false);
        setCustomDays('');
      } else {
        // Same product or first time - just update product details
        const updates: any = {
          productId,
          productName,
          basePrice: parseInt(price),
        };
        
        // Fetch description and image from API if not in state
        if (!state.productDescription || !state.productImage) {
          try {
            const response = await fetch(`http://localhost:5000/api/food/products/${productId}`);
            if (response.ok) {
              const data = await response.json();
              const product = data.data;
              updates.productDescription = product.description || '';
              updates.productImage = product.image || '';
              console.log('✅ Fetched product details from API');
            }
          } catch (error) {
            console.error('Error fetching product details:', error);
          }
        }
        
        console.log('💾 Updating subscription state with:', {
          productId: updates.productId,
          productName: updates.productName,
          basePrice: updates.basePrice,
          hasDescription: !!updates.productDescription,
          hasImage: !!updates.productImage
        });
        
        updateState(updates);
      }
      
      setDataLoaded(true); // Mark data as loaded
    } else {
      // Check if we already have product data in state (from localStorage)
      if (state.productId && state.productName && state.basePrice) {
        console.log('✅ No URL params but state has product data from localStorage');
        setDataLoaded(true);
      } else {
        console.warn('⚠️ Missing required params and no data in state:', { 
          productId, 
          productName, 
          price,
          stateProductId: state.productId,
          stateProductName: state.productName 
        });
        alert('Invalid subscription link. Redirecting to home page...');
        router.push('/food/home');
      }
      }
    };
    
    loadProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, mounted]);

  const getSkipAllowance = (days: number) => {
    return Math.floor(days / 7);
  };

  const calculateTotal = (days: number) => {
    // No discount - currentPrice is already the subscription price (discounted)
    return currentPrice * days;
  };

  const handleDurationSelect = (days: number) => {
    setSelectedDuration(days);
    setIsCustom(false);
    setCustomDays('');
    
    // Find and set the corresponding plan to get fresh values
    const plan = plans.find((p: Plan) => p.duration === days);
    if (plan) {
      console.log('🎯 Plan selected:', plan.name, '- maxSkipDays:', plan.maxSkipDays, '- maxExtendedDays:', plan.maxExtendedDays);
      setSelectedPlan(plan);
    }
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setCustomDays('');
  };

  const handleNext = () => {
    const finalDuration = isCustom ? parseInt(customDays) : selectedDuration;
    
    console.log('🚀 handleNext called', { isCustom, customDays, selectedDuration, finalDuration, dataLoaded, isEditPlanMode });
    
    if (isCustom && (isNaN(finalDuration) || finalDuration < 3 || finalDuration > 90)) {
      alert('Please enter a valid number of days (3-90)');
      return;
    }

    if (!isCustom && !selectedDuration) {
      alert('Please select a duration');
      return;
    }

    // Get product data from URL params as fallback
    const productId = searchParams?.get('product') || state.productId;
    const productName = searchParams?.get('name') || state.productName;
    const price = searchParams?.get('price') || state.basePrice.toString();
    const description = searchParams?.get('description');
    const image = searchParams?.get('image');

    // Verify essential product data is available (from either state or URL)
    if (!productName || !productId) {
      console.error('❌ Missing product data before navigation!', {
        productId: productId,
        productName: productName,
        stateProductId: state.productId,
        stateProductName: state.productName,
        hasSearchParams: !!searchParams
      });
      alert('Product data missing. Please try again from the product page.');
      router.push('/food/home');
      return;
    }

    const productDescription = description && description !== 'undefined' && description !== '' 
      ? decodeURIComponent(description) 
      : state.productDescription;
    
    const productImage = image && image !== 'undefined' && image !== '' 
      ? decodeURIComponent(image) 
      : state.productImage;

    console.log('✅ Product data verified:', {
      productId,
      productName,
      hasImage: !!productImage,
      hasDescription: !!productDescription,
      basePrice: currentPrice
    });
    
    // Determine maxSkips from selected plan or calculate for custom duration
    const maxSkips = isCustom 
      ? getSkipAllowance(finalDuration) 
      : selectedPlan?.maxSkipDays || getSkipAllowance(finalDuration);
    
    // Determine maxExtendedDays from selected plan or use default
    const maxExtendedDays = isCustom 
      ? getSkipAllowance(finalDuration) 
      : selectedPlan?.maxExtendedDays || 0;
    
    console.log('🎯 Plan limits being set:', {
      duration: finalDuration,
      maxSkips,
      maxExtendedDays,
      source: isCustom ? 'calculated' : 'from plan',
      planName: selectedPlan?.name || 'N/A'
    });
    
    // Update state with all necessary data (ensuring nothing is lost)
    updateState({
      duration: finalDuration,
      isCustomDuration: isCustom,
      maxSkips: maxSkips,
      maxExtendedDays: maxExtendedDays,
      basePrice: currentPrice,
      // Use data from URL as primary source, state as fallback
      productId: productId,
      productName: productName,
      productImage: productImage,
      productDescription: productDescription,
    });

    // Navigate based on mode
    if (isEditPlanMode) {
      console.log('🎯 Edit Plan Mode - Navigating back to summary');
      router.push('/food/subscribe/summary');
    } else {
      console.log('🎯 Regular Mode - Navigating to start-date');
      router.push('/food/subscribe/start-date');
    }
  };

  const activeDuration = isCustom ? (customDays ? parseInt(customDays) : 0) : selectedDuration;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
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
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 1 of 6</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Duration</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
            <div className="h-1.5 rounded-full" style={{ width: '16.7%', backgroundColor: '#E11D48' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>
            {isEditPlanMode ? 'Update Plan Duration' : 'Select Plan Duration'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {isEditPlanMode ? 'Change your subscription duration' : 'Choose how long you want to subscribe'}
          </p>
        </div>

        {/* Product Info */}
        {currentProductName && (
          <div className="bg-white rounded-xl p-4 mb-6 border" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs" style={{ color: '#6B7280' }}>Subscribing to:</p>
            <p className="font-bold text-base mt-1" style={{ color: '#0E1214' }}>{currentProductName}</p>
            <p className="font-semibold text-sm mt-1" style={{ color: '#E11D48' }}>₹{currentPrice}/day</p>
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
              <p className="text-xs" style={{ color: '#10B981' }}>
                💰 Special subscription price (already discounted from regular menu price)
              </p>
            </div>
          </div>
        )}

        {/* Duration Options */}
        <div className="space-y-3 mb-6">
          {loadingPlans ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ 
                border: '3px solid #FEF2F2',
                borderTop: '3px solid #E11D48'
              }}></div>
              <p className="mt-4 text-sm" style={{ color: '#6B7280' }}>Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#6B7280' }}>No plans available</p>
            </div>
          ) : (
            plans.map((plan) => {
              const isSelected = selectedDuration === plan.duration && !isCustom;
              // Determine badge based on plan
              let badge = '';
              if (plan.duration === 15) badge = 'Popular';
              if (plan.duration === 30) badge = 'Best Value';
              
              return (
              <button
                key={plan._id}
                onClick={() => {
                  handleDurationSelect(plan.duration);
                  setSelectedPlan(plan);
                }}
                className="w-full p-4 rounded-xl border-2 transition text-left"
                style={{
                  borderColor: isSelected ? '#E11D48' : '#E5E7EB',
                  backgroundColor: isSelected ? '#FEF2F2' : '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isSelected ? '#E11D48' : '#D1D5DB',
                          backgroundColor: isSelected ? '#E11D48' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>{plan.name}</h3>
                      {badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-7">
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      {plan.description}
                    </p>
                    <p className="text-xs mb-1" style={{ color: '#10B981' }}>
                      ₹{currentPrice}/day × {plan.duration} days
                    </p>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      Skip allowance: {plan.maxSkipDays} day(s)
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Price</p>
                  <p className="text-lg font-bold" style={{ color: '#E11D48' }}>
                    ₹{calculateTotal(plan.duration)}
                  </p>
                </div>
              </div>
            </button>
          );
          })
          )}

          {/* Custom Duration Option */}
          <button
            onClick={handleCustomSelect}
            className="w-full p-4 rounded-xl border-2 transition text-left"
            style={{
              borderColor: isCustom ? '#E11D48' : '#E5E7EB',
              backgroundColor: isCustom ? '#FEF2F2' : '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              if (!isCustom) e.currentTarget.style.borderColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              if (!isCustom) e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isCustom ? '#E11D48' : '#D1D5DB',
                  backgroundColor: isCustom ? '#E11D48' : 'transparent'
                }}
              >
                {isCustom && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-0.5" style={{ color: '#0E1214' }}>Custom Days</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Choose your own duration (3-90 days)</p>
              </div>
            </div>

            {isCustom && (
              <div className="ml-7">
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Enter number of days"
                  min="3"
                  max="90"
                  className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none mb-2 text-sm"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#E11D48'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {customDays && parseInt(customDays) >= 3 && parseInt(customDays) <= 90 && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      ₹{currentPrice}/day × {customDays} days
                    </p>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      Skip allowance: {getSkipAllowance(parseInt(customDays))} day(s)
                    </p>
                    <p className="text-base font-bold" style={{ color: '#E11D48' }}>
                      Total: ₹{calculateTotal(parseInt(customDays))}
                    </p>
                  </div>
                )}
                
                {customDays && (parseInt(customDays) < 3 || parseInt(customDays) > 90) && (
                  <p className="text-xs" style={{ color: '#DC2626' }}>Please enter between 3 and 90 days</p>
                )}
              </div>
            )}
          </button>
        </div>

        {/* Benefits */}
        {activeDuration > 0 && (
          <div className="rounded-xl p-4 mb-6" style={{ background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)' }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: '#0E1214' }}>Your Benefits:</h3>
            <ul className="space-y-1.5">
              <li className="flex items-center text-xs" style={{ color: '#374151' }}>
                <span className="mr-2" style={{ color: '#10B981' }}>✓</span>
                Special subscription pricing (already discounted)
              </li>
              <li className="flex items-center text-xs" style={{ color: '#374151' }}>
                <span className="mr-2" style={{ color: '#10B981' }}>✓</span>
                Skip up to {getSkipAllowance(activeDuration)} day(s) during subscription
              </li>
              <li className="flex items-center text-xs" style={{ color: '#374151' }}>
                <span className="mr-2" style={{ color: '#10B981' }}>✓</span>
                Free delivery on all days
              </li>
              <li className="flex items-center text-xs" style={{ color: '#374151' }}>
                <span className="mr-2" style={{ color: '#10B981' }}>✓</span>
                Pause or cancel anytime
              </li>
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {!isEditPlanMode && (
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all"
              style={{ borderColor: '#E5E7EB', color: '#374151', backgroundColor: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E11D48';
            }}
          >
            {isEditPlanMode ? 'Update Plan' : 'Next: Choose Time Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}

