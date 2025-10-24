import axios, { AxiosInstance } from 'axios';
import {
  SendOTPResponse,
  VerifyOTPResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  AuthResponse,
} from './types';

export class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async sendOTP(phone: string): Promise<SendOTPResponse> {
    const response = await this.client.post<SendOTPResponse>('/api/auth/send-otp', { phone });
    return response.data;
  }

  async verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await this.client.post<VerifyOTPResponse>('/api/auth/verify-otp', { phone, otp });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async completeRegistration(data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    const response = await this.client.post<CompleteRegistrationResponse>('/api/auth/complete-registration', data);
    return response.data;
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await this.client.get<AuthResponse>('/api/auth/me');
    return response.data;
  }

  // Subscription Cart Methods
  async addToSubscriptionCart(data: any): Promise<any> {
    const response = await this.client.post('/api/subscription-cart/add', data);
    return response.data;
  }

  async getSubscriptionCart(): Promise<any> {
    const response = await this.client.get('/api/subscription-cart');
    return response.data;
  }

  async removeFromSubscriptionCart(itemId: string): Promise<any> {
    const response = await this.client.delete(`/api/subscription-cart/${itemId}`);
    return response.data;
  }

  async updateSubscriptionCartItem(itemId: string, data: any): Promise<any> {
    const response = await this.client.put(`/api/subscription-cart/${itemId}`, data);
    return response.data;
  }

  async clearSubscriptionCart(): Promise<any> {
    const response = await this.client.delete('/api/subscription-cart/clear/all');
    return response.data;
  }

  async checkoutSubscriptionCart(paymentMethod?: string): Promise<any> {
    const response = await this.client.post('/api/subscription-cart/checkout', { paymentMethod });
    return response.data;
  }
}

export const apiClient = new APIClient();

