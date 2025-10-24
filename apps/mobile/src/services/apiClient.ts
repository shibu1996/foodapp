/**
 * API Client
 * Handles all API requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from '../config/api';
import { storage } from '../utils/storage';
import {
  User,
  Product,
  Category,
  Order,
  Subscription,
  Address,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          await storage.clearAll();
          // You can emit an event here to redirect to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // ============= Auth APIs =============

  async sendOTP(phone: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      API_ENDPOINTS.SEND_OTP,
      { phone }
    );
    return response.data;
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      API_ENDPOINTS.VERIFY_OTP,
      { phone, otp }
    );
    return response.data;
  }

  async register(data: {
    name: string;
    phone: string;
    email?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.client.post<ApiResponse<User>>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  }

  // ============= Product APIs =============

  async getProducts(params?: {
    category?: string;
    search?: string;
    type?: 'one-time' | 'subscription';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS,
      { params }
    );
    return response.data;
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  // ============= Category APIs =============

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.client.get<ApiResponse<Category[]>>(
      API_ENDPOINTS.CATEGORIES
    );
    return response.data;
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const response = await this.client.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY_BY_ID(id)
    );
    return response.data;
  }

  // ============= Order APIs =============

  async createOrder(data: {
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
    deliveryAddress: Address;
    paymentMethod: 'cod' | 'online' | 'upi';
    deliveryDate?: string;
    deliverySlot?: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await this.client.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS,
      data
    );
    return response.data;
  }

  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.MY_ORDERS,
      { params }
    );
    return response.data;
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER_BY_ID(id)
    );
    return response.data;
  }

  // ============= Subscription APIs =============

  async createSubscription(data: {
    product: string;
    duration: 7 | 15 | 30;
    deliverySlot: 'morning' | 'evening';
    startDate: string;
    deliveryAddress: Address;
    skipDates?: string[];
    paymentMethod: 'cod' | 'online' | 'upi';
  }): Promise<ApiResponse<Subscription>> {
    const response = await this.client.post<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTIONS,
      data
    );
    return response.data;
  }

  async getMySubscriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Subscription>> {
    const response = await this.client.get<PaginatedResponse<Subscription>>(
      API_ENDPOINTS.MY_SUBSCRIPTIONS,
      { params }
    );
    return response.data;
  }

  async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
    const response = await this.client.get<ApiResponse<Subscription>>(
      API_ENDPOINTS.SUBSCRIPTION_BY_ID(id)
    );
    return response.data;
  }

  async pauseSubscription(id: string): Promise<ApiResponse<Subscription>> {
    const response = await this.client.patch<ApiResponse<Subscription>>(
      API_ENDPOINTS.PAUSE_SUBSCRIPTION(id)
    );
    return response.data;
  }

  async resumeSubscription(id: string): Promise<ApiResponse<Subscription>> {
    const response = await this.client.patch<ApiResponse<Subscription>>(
      API_ENDPOINTS.RESUME_SUBSCRIPTION(id)
    );
    return response.data;
  }

  async cancelSubscription(id: string): Promise<ApiResponse<Subscription>> {
    const response = await this.client.patch<ApiResponse<Subscription>>(
      API_ENDPOINTS.CANCEL_SUBSCRIPTION(id)
    );
    return response.data;
  }

  // Subscription Cart Methods
  async addToSubscriptionCart(data: any): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>(
      '/api/subscription-cart/add',
      data
    );
    return response.data;
  }

  async getSubscriptionCart(): Promise<ApiResponse<any>> {
    const response = await this.client.get<ApiResponse<any>>(
      '/api/subscription-cart'
    );
    return response.data;
  }

  async removeFromSubscriptionCart(itemId: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete<ApiResponse<any>>(
      `/api/subscription-cart/${itemId}`
    );
    return response.data;
  }

  async checkoutSubscriptionCart(paymentMethod: string = 'cod'): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>(
      '/api/subscription-cart/checkout',
      { paymentMethod }
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

