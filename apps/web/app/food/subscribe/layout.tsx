'use client';

import { SubscriptionProvider } from './context/SubscriptionContext';
import { FloatingCart } from '../../components/FloatingCart';

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      {children}
      <FloatingCart />
    </SubscriptionProvider>
  );
}


