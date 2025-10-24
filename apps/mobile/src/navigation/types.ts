/**
 * Navigation types and route params
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { Product, Order, Subscription } from '../types';

// Root stack (main app navigator)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth stack (before login)
export type AuthStackParamList = {
  Login: undefined;
  Register: {
    phone: string;
    token: string;
  };
};

// Main stack (after login)
export type MainStackParamList = {
  Home: undefined;
  ProductDetail: {
    productId: string;
    product?: Product;
  };
  Cart: undefined;
  Checkout: undefined;
  AddressSelection: undefined;
  AddAddress: undefined;
  Payment: {
    totalAmount: number;
    items: any[];
  };
  OrderSuccess: {
    orderId: string;
  };
  Orders: undefined;
  OrderTracking: {
    orderId: string;
    order?: Order;
  };
  Subscriptions: undefined;
  SubscriptionDetail: {
    subscriptionId: string;
    subscription?: Subscription;
  };
  SubscribeDuration: {
    product: Product;
  };
  SubscribeTimeslot: undefined;
  SubscribeStartDate: undefined;
  SubscribeSummary: undefined;
  SubscriptionCart: undefined;
  SubscribeAddress: undefined;
  SubscribePayment: undefined;
  SubscribeSuccess: {
    subscriptionId: string;
  };
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

