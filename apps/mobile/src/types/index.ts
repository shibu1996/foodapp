/**
 * TypeScript type definitions for the mobile app
 */

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string | Category;
  type: 'one-time' | 'subscription';
  price: number;
  discountPrice?: number;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  unit?: string;
  preparationTime?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: {
    product: string | Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryAddress: Address;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryDate?: string;
  deliverySlot?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  user: string | User;
  product: string | Product;
  duration: 7 | 15 | 30;
  deliverySlot: 'morning' | 'evening';
  startDate: string;
  endDate: string;
  deliveryAddress: Address;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  skipDates?: string[];
  totalAmount: number;
  paymentMethod: 'cod' | 'online' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  needsRegistration?: boolean;
  token?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}


