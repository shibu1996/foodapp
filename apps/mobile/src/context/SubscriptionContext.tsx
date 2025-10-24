/**
 * Subscription Context
 * State management for subscription flow
 */

import React, { createContext, useContext, useState } from 'react';
import { Product, Address } from '../types';

interface SubscriptionData {
  product: Product | null;
  duration: 7 | 15 | 30 | null;
  deliverySlot: 'morning' | 'evening' | null;
  startDate: string | null;
  deliveryAddress: Address | null;
  skipDates: string[];
}

interface SubscriptionContextType {
  subscriptionData: SubscriptionData;
  setProduct: (product: Product) => void;
  setDuration: (duration: 7 | 15 | 30) => void;
  setDeliverySlot: (slot: 'morning' | 'evening') => void;
  setStartDate: (date: string) => void;
  setDeliveryAddress: (address: Address) => void;
  setSkipDates: (dates: string[]) => void;
  resetSubscription: () => void;
}

const initialData: SubscriptionData = {
  product: null,
  duration: null,
  deliverySlot: null,
  startDate: null,
  deliveryAddress: null,
  skipDates: [],
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(
    initialData
  );

  const setProduct = (product: Product) => {
    setSubscriptionData(prev => ({ ...prev, product }));
  };

  const setDuration = (duration: 7 | 15 | 30) => {
    setSubscriptionData(prev => ({ ...prev, duration }));
  };

  const setDeliverySlot = (slot: 'morning' | 'evening') => {
    setSubscriptionData(prev => ({ ...prev, deliverySlot: slot }));
  };

  const setStartDate = (date: string) => {
    setSubscriptionData(prev => ({ ...prev, startDate: date }));
  };

  const setDeliveryAddress = (address: Address) => {
    setSubscriptionData(prev => ({ ...prev, deliveryAddress: address }));
  };

  const setSkipDates = (dates: string[]) => {
    setSubscriptionData(prev => ({ ...prev, skipDates: dates }));
  };

  const resetSubscription = () => {
    setSubscriptionData(initialData);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionData,
        setProduct,
        setDuration,
        setDeliverySlot,
        setStartDate,
        setDeliveryAddress,
        setSkipDates,
        resetSubscription,
      }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};


