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
  const [state, setState] = useState<SubscriptionState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('subscriptionState');
    if (saved) {
      setState(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('subscriptionState', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<SubscriptionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    localStorage.removeItem('subscriptionState');
  };

  const calculatePrice = () => {
    const activeDays = state.duration - state.skipDates.length;
    const baseTotal = state.basePrice * activeDays;
    const addonTotal = state.addonPrice * activeDays;
    const subtotal = baseTotal + addonTotal;
    
    // Calculate discount based on duration
    let discountPercent = 0;
    if (state.duration >= 30) discountPercent = 15;
    else if (state.duration >= 15) discountPercent = 10;
    else if (state.duration >= 7) discountPercent = 5;
    
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount - state.discount;
    
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

