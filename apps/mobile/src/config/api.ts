/**
 * API Configuration
 */

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.4:5000'  // Physical device (your computer's IP)
  : 'https://api.restaurantapp.com';

export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  REGISTER: '/api/auth/register',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
  
  // Orders
  ORDERS: '/api/orders',
  MY_ORDERS: '/api/orders/my-orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  
  // Subscriptions
  SUBSCRIPTIONS: '/api/subscriptions',
  MY_SUBSCRIPTIONS: '/api/subscriptions/my-subscriptions',
  SUBSCRIPTION_BY_ID: (id: string) => `/api/subscriptions/${id}`,
  PAUSE_SUBSCRIPTION: (id: string) => `/api/subscriptions/${id}/pause`,
  RESUME_SUBSCRIPTION: (id: string) => `/api/subscriptions/${id}/resume`,
  CANCEL_SUBSCRIPTION: (id: string) => `/api/subscriptions/${id}/cancel`,
};

export const API_TIMEOUT = 30000; // 30 seconds



