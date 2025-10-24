/**
 * Subscription Cart Controller
 * Handles subscription cart operations
 */

import { Request, Response } from 'express';
import { SubscriptionCart } from '../models/SubscriptionCart';
import { Product } from '../models/Product';
import { Subscription } from '../models/Subscription';

/**
 * Add subscription to cart
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { product, duration, deliverySlot, startDate, deliveryAddress } = req.body;

    // Validate required fields
    if (!product || !duration || !deliverySlot || !startDate || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Get product details
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Calculate amount based on duration
    const basePrice = productDoc.discountPrice || productDoc.price;
    const totalPrice = basePrice * duration;
    const discount = duration === 7 ? 0.05 : duration === 15 ? 0.1 : duration === 30 ? 0.15 : 0;
    const calculatedAmount = Math.round(totalPrice * (1 - discount));

    // Find or create cart for user
    let cart = await SubscriptionCart.findOne({ user: userId });

    if (!cart) {
      cart = new SubscriptionCart({
        user: userId,
        items: [],
      });
    }

    // Add item to cart
    cart.items.push({
      product,
      duration,
      deliverySlot,
      startDate: new Date(startDate),
      deliveryAddress,
      calculatedAmount,
      addedAt: new Date(),
    });

    await cart.save();

    // Populate product details
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Subscription added to cart',
      data: cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get user's subscription cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const cart = await SubscriptionCart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { itemId } = req.params;

    const cart = await SubscriptionCart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => item._id?.toString() !== itemId);

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove from cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update cart item
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { itemId } = req.params;
    const { duration, deliverySlot, startDate, deliveryAddress } = req.body;

    const cart = await SubscriptionCart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find item
    const item = cart.items.find(item => item._id?.toString() === itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Get product for recalculation
    const productDoc = await Product.findById(item.product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
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
    const discount = item.duration === 7 ? 0.05 : item.duration === 15 ? 0.1 : item.duration === 30 ? 0.15 : 0;
    item.calculatedAmount = Math.round(totalPrice * (1 - discount));

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await SubscriptionCart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 }
    );

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Checkout - Create all subscriptions and clear cart
 */
export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { paymentMethod = 'cod' } = req.body;

    // Get cart
    const cart = await SubscriptionCart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Create all subscriptions
    const createdSubscriptions = [];

    for (const item of cart.items) {
      const subscription = new Subscription({
        user: userId,
        product: item.product,
        duration: item.duration,
        deliverySlot: item.deliverySlot,
        startDate: item.startDate,
        deliveryAddress: item.deliveryAddress,
        totalAmount: item.calculatedAmount,
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
      success: true,
      message: 'Subscriptions created successfully',
      data: {
        subscriptions: createdSubscriptions,
        count: createdSubscriptions.length,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to checkout',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


