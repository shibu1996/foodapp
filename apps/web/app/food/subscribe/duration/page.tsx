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
  
  const [selectedDuration, setSelectedDuration] = useState<number>(state.duration || 7);
  const [isCustom, setIsCustom] = useState(state.isCustomDuration || false);
  const [customDays, setCustomDays] = useState<string>('');

  // Get data from URL params as fallback for initial render
  const urlPrice = searchParams ? parseInt(searchParams.get('price') || '0') : 0;
  const urlProductName = searchParams ? searchParams.get('name') || '' : '';
  
  const currentPrice = state.basePrice || urlPrice;
  const currentProductName = state.productName || urlProductName;

  // Track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!searchParams) {
      console.log('⚠️ No search params available');
      return;
    }
    
    const productId = searchParams.get('product');
    const productName = searchParams.get('name');
    const price = searchParams.get('price');
    const description = searchParams.get('description');
    const image = searchParams.get('image');
    
    console.log('📥 Duration Page - URL Params:', {
      productId,
      productName,
      price,
      hasDescription: !!description,
      hasImage: !!image,
      descriptionLength: description?.length || 0,
      imageLength: image?.length || 0
    });
    
    // Update product details from URL params
    if (productId && productName && price) {
      const updates: any = {
        productId,
        productName,
        basePrice: parseInt(price),
      };
      
      // Always update description and image if provided in URL
      if (description && description !== 'undefined' && description !== '') {
        const decodedDesc = decodeURIComponent(description);
        updates.productDescription = decodedDesc;
        console.log('📝 Setting description:', decodedDesc.substring(0, 50) + '...');
      }
      
      if (image && image !== 'undefined' && image !== '') {
        const decodedImage = decodeURIComponent(image);
        updates.productImage = decodedImage;
        console.log('🖼️ Setting image:', decodedImage.substring(0, 50) + '...');
      }
      
      console.log('💾 Updating subscription state with:', {
        productId: updates.productId,
        productName: updates.productName,
        basePrice: updates.basePrice,
        hasDescription: !!updates.productDescription,
        hasImage: !!updates.productImage
      });
      
      updateState(updates);
      setDataLoaded(true); // Mark data as loaded
    } else {
      console.warn('⚠️ Missing required params:', { productId, productName, price });
      alert('Invalid subscription link. Redirecting to home page...');
      router.push('/food/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setCustomDays('');
  };

  const handleNext = () => {
    const finalDuration = isCustom ? parseInt(customDays) : selectedDuration;
    
    console.log('🚀 handleNext called', { isCustom, customDays, selectedDuration, finalDuration, dataLoaded });
    
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
    
    // Update state with all necessary data (ensuring nothing is lost)
    updateState({
      duration: finalDuration,
      isCustomDuration: isCustom,
      maxSkips: getSkipAllowance(finalDuration),
      basePrice: currentPrice,
      // Use data from URL as primary source, state as fallback
      productId: productId,
      productName: productName,
      productImage: productImage,
      productDescription: productDescription,
    });

    console.log('🎯 Navigating to timeslot with complete data');
    router.push('/food/subscribe/timeslot');
  };

  const activeDuration = isCustom ? (customDays ? parseInt(customDays) : 0) : selectedDuration;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Progress Bar */}
      <div className="bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Step 1 of 9</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Duration</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
            <div className="h-1.5 rounded-full" style={{ width: '11.1%', backgroundColor: '#E11D48' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0E1214' }}>Select Plan Duration</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Choose how long you want to subscribe</p>
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
          {PRESET_DURATIONS.map((option) => {
            const isSelected = selectedDuration === option.days && !isCustom;
            return (
            <button
              key={option.days}
              onClick={() => handleDurationSelect(option.days)}
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
                    <h3 className="text-base font-bold" style={{ color: '#0E1214' }}>{option.label}</h3>
                    {option.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>
                        {option.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-7">
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      ₹{currentPrice}/day × {option.days} days
                    </p>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                      Skip allowance: {getSkipAllowance(option.days)} day(s)
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Price</p>
                  <p className="text-lg font-bold" style={{ color: '#E11D48' }}>
                    ₹{calculateTotal(option.days)}
                  </p>
                </div>
              </div>
            </button>
          );
          })}

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
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all"
            style={{ borderColor: '#E5E7EB', color: '#374151', backgroundColor: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Back
          </button>
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
            Next: Choose Time Slot
          </button>
        </div>
      </div>
    </div>
  );
}

