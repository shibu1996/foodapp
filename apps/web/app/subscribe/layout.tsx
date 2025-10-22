import { SubscriptionProvider } from './context/SubscriptionContext';

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}

