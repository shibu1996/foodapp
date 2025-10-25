'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DailyMeal {
  date: string;
  mealId: string;
  isSkipped: boolean;
}

export interface Address {
  id?: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  label?: string;
}

interface SubscriptionState {
  productId: string;
  productName: string;
  productImage: string;
  productDescription: string;
  basePrice: number;
  duration: number;
  isCustomDuration: boolean;
  deliverySlot: string;
  startDate: string;
  endDate: string;
  skipEnabled: boolean;
  maxSkips: number;
  addons: string[];
  addonPrice: number;
  dailyMeals: DailyMeal[];
  skipDates: string[];
  couponCode: string;
  discount: number;
  finalPrice: number;
  selectedAddress: Address | null;
  savedAddresses: Address[];
}

interface SubscriptionContextType {
  state: SubscriptionState;
  updateState: (updates: Partial<SubscriptionState>) => void;
  resetState: () => void;
  calculatePrice: () => number;
}

const initialState: SubscriptionState = {
  productId: '',
  productName: '',
  productImage: '',
  productDescription: '',
  basePrice: 0,
  duration: 7,
  isCustomDuration: false,
  deliverySlot: '',
  startDate: '',
  endDate: '',
  skipEnabled: false,
  maxSkips: 0,
  addons: [],
  addonPrice: 0,
  dailyMeals: [],
  skipDates: [],
  couponCode: '',
  discount: 0,
  finalPrice: 0,
  selectedAddress: null,
  savedAddresses: [],
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // Always start with initialState to prevent hydration errors
  const [state, setState] = useState<SubscriptionState>(initialState);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('subscriptionState');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        console.log('📂 Loading from localStorage after mount:', {
          productId: parsedState.productId,
          productName: parsedState.productName,
          hasImage: !!parsedState.productImage,
          hasDescription: !!parsedState.productDescription,
          basePrice: parsedState.basePrice,
          duration: parsedState.duration
        });
        setState(parsedState);
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    } else {
      console.log('📂 No saved subscription state in localStorage');
    }
    setMounted(true);
  }, []);

  // Save to localStorage on state change (only after mounted)
  useEffect(() => {
    if (mounted) {
      // Don't save if we're in the middle of loading edit data
      const editingData = localStorage.getItem('editingSubscription');
      if (editingData) {
        console.log('⏸️ Skipping localStorage save - edit data is being loaded');
        return;
      }
      
      console.log('💾 Saving to localStorage:', {
        productId: state.productId,
        productName: state.productName,
        hasImage: !!state.productImage,
        hasDescription: !!state.productDescription,
        basePrice: state.basePrice,
        duration: state.duration
      });
      localStorage.setItem('subscriptionState', JSON.stringify(state));
    }
  }, [state, mounted]);

  const updateState = (updates: Partial<SubscriptionState>) => {
    console.log('🔄 Subscription Context - Updating state:', updates);
    setState((prev) => {
      const newState = { ...prev, ...updates };
      console.log('✅ New state after update:', {
        productId: newState.productId,
        productName: newState.productName,
        hasImage: !!newState.productImage,
        hasDescription: !!newState.productDescription,
        basePrice: newState.basePrice,
        duration: newState.duration
      });
      return newState;
    });
  };

  const resetState = () => {
    setState(initialState);
    localStorage.removeItem('subscriptionState');
  };

  const calculatePrice = () => {
    // User pays for 'duration' days of delivery (skip days extend the subscription but don't reduce charges)
    const activeDays = state.duration;
    const baseTotal = state.basePrice * activeDays;
    const addonTotal = state.addonPrice * activeDays;
    const subtotal = baseTotal + addonTotal;
    
    // No plan discount - basePrice (subscriptionPrice) is already discounted
    // Only apply coupon discount if any
    const total = subtotal - state.discount;
    
    return Math.max(0, total);
  };

  return (
    <SubscriptionContext.Provider value={{ state, updateState, resetState, calculatePrice }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

