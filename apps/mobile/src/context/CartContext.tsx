/**
 * Cart Context
 * Global state management for shopping cart
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    storage.setCart(items);
  }, [items]);

  const loadCart = async () => {
    try {
      const savedCart = await storage.getCart();
      if (savedCart && savedCart.length > 0) {
        setItems(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      // Check if product already exists in cart
      const existingIndex = prevItems.findIndex(
        item => item.product._id === product._id
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate total item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};






