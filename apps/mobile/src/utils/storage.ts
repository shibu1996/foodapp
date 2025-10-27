/**
 * AsyncStorage wrapper for easier data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const STORAGE_KEYS = {
  TOKEN: '@restaurant_app:token',
  USER: '@restaurant_app:user',
  LOCATION: '@restaurant_app:location',
  CART: '@restaurant_app:cart',
};

class Storage {
  // Token management
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // User management
  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  // Location management
  async setLocation(location: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, location);
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  }

  async getLocation(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Cart management
  async setCart(cart: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  }

  async getCart(): Promise<any[]> {
    try {
      const cartStr = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return cartStr ? JSON.parse(cartStr) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Clear all data (logout)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.CART,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const storage = new Storage();
export { STORAGE_KEYS };






