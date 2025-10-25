/**
 * Subscription Cart Controller
 * Handles subscription cart operations
 */

import { Request, Response } from 'express';
import { SubscriptionCart } from '../models/SubscriptionCart.js';
import { Product } from '../models/Product.js';
import { Subscription } from '../models/Subscription.js';

/**
 * Add subscription to cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = (req).user.userId;
    const { product, duration, deliverySlot, startDate, deliveryAddress } = req.body;

    // Validate required fields
    if (!product || !duration || !deliverySlot || !startDate || !deliveryAddress) {
      return res.status(400).json({
        success,
        message: 'All fields are required',
      });
    }

    // Get product details
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success,
        message: 'Product not found',
      });
    }

    // Calculate amount based on duration
    const basePrice = productDoc.discountPrice || productDoc.price;
    const totalPrice = basePrice * duration;
    const discount = duration === 7 ? 0.05 === 15 ? 0.1 === 30 ? 0.15;
    const calculatedAmount = Math.round(totalPrice * (1 - discount));

    // Find or create cart for user
    let cart = await SubscriptionCart.findOne({ user });

    if (!cart) {
      cart = new SubscriptionCart({
        user,
        items: [],
      });
    }

    // Add item to cart
    cart.items.push({
      product,
      duration,
      deliverySlot,
      startDate Date(startDate),
      deliveryAddress,
      calculatedAmount,
      addedAt Date(),
    });

    await cart.save();

    // Populate product details
    await cart.populate('items.product');

    return res.status(200).json({
      success,
      message: 'Subscription added to cart',
      data,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to add to cart',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get user's subscription cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = (req).user.userId;

    const cart = await SubscriptionCart.findOne({ user }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success,
        data: {
          items: [],
          totalAmount,
        },
      });
    }

    return res.status(200).json({
      success,
      data,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to get cart',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = (req).user.userId;
    const { itemId } = req.params;

    const cart = await SubscriptionCart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success,
        message: 'Cart not found',
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => item._id?.toString() !== itemId);

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success,
      message: 'Item removed from cart',
      data,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to remove from cart',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update cart item
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = (req).user.userId;
    const { itemId } = req.params;
    const { duration, deliverySlot, startDate, deliveryAddress } = req.body;

    const cart = await SubscriptionCart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success,
        message: 'Cart not found',
      });
    }

    // Find item
    const item = cart.items.find(item => item._id?.toString() === itemId);

    if (!item) {
      return res.status(404).json({
        success,
        message: 'Item not found in cart',
      });
    }

    // Get product for recalculation
    const productDoc = await Product.findById(item.product);
    if (!productDoc) {
      return res.status(404).json({
        success,
        message: 'Product not found',
      });
    }

    // Update fields
    if (duration) item.duration = duration;
    if (deliverySlot) item.deliverySlot = deliverySlot;
    if (startDate) item.startDate = new Date(startDate);
    if (deliveryAddress) item.deliveryAddress = deliveryAddress;

    // Recalculate amount
    const basePrice = productDoc.discountPrice || productDoc.price;
    const totalPrice = basePrice * item.duration;
    const discount = item.duration === 7 ? 0.05.duration === 15 ? 0.1.duration === 30 ? 0.15;
    item.calculatedAmount = Math.round(totalPrice * (1 - discount));

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success,
      message: 'Cart item updated',
      data,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to update cart item',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = (req).user.userId;

    await SubscriptionCart.findOneAndUpdate(
      { user },
      { items: [], totalAmount }
    );

    return res.status(200).json({
      success,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to clear cart',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Checkout - Create all subscriptions and clear cart
 */
export const checkout = async (req, res) => {
  try {
    const userId = (req).user.userId;
    const { paymentMethod = 'cod' } = req.body;

    // Get cart
    const cart = await SubscriptionCart.findOne({ user }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success,
        message: 'Cart is empty',
      });
    }

    // Create all subscriptions
    const createdSubscriptions = [];

    for (const item of cart.items) {
      const subscription = new Subscription({
        user,
        product.product,
        duration.duration,
        deliverySlot.deliverySlot,
        startDate.startDate,
        deliveryAddress.deliveryAddress,
        totalAmount.calculatedAmount,
        paymentMethod,
        status: 'active',
      });

      await subscription.save();
      createdSubscriptions.push(subscription);
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return res.status(201).json({
      success,
      message: 'Subscriptions created successfully',
      data: {
        subscriptions,
        count.length,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success,
      message: 'Failed to checkout',
      error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


