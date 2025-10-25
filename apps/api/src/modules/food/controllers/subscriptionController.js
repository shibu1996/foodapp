
import Subscription from '../models/Subscription.js';
import Product from '../models/Product.js';

// Create new subscription (User)
export const createSubscription = async (req, res) => {
  try {
    const userId = (req).user._id;
    const {
      productId,
      duration,
      startDate,
      deliverySlot,
      deliveryAddress,
      addons,
      dailyMeals,
      paymentMethod,
      couponCode,
      specialInstructions,
      autoRenewal,
    } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not available',
      });
    }

    // Calculate dates
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration - 1);

    // Calculate pricing
    const basePrice = product.subscriptionPrice || product.price;
    const subtotal = basePrice * duration;

    // Calculate addons total
    let addonsTotal = 0;
    if (addons && addons.length > 0) {
      addonsTotal = addons.reduce((sum, addon) => {
        return sum + (addon.price * duration);
      }, 0);
    }

    // Apply discount based on duration
    let discount = 0;
    if (duration === 7) {
      discount = Math.round((subtotal + addonsTotal) * 0.05); // 5% off
    } else if (duration === 15) {
      discount = Math.round((subtotal + addonsTotal) * 0.10); // 10% off
    } else if (duration === 30) {
      discount = Math.round((subtotal + addonsTotal) * 0.15); // 15% off
    }

    // Apply coupon if provided
    if (couponCode) {
      if (couponCode === 'SUB20') {
        discount += Math.round((subtotal + addonsTotal) * 0.20);
      } else if (couponCode === 'SAVE100') {
        discount += 100;
      }
    }

    const totalAmount = subtotal + addonsTotal - discount;
    const deliveryCount = duration;

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      productId,
      productName: product.name,
      basePrice,
      duration,
      startDate: start,
      endDate: end,
      deliverySlot,
      deliveryAddress,
      addons: addons || [],
      dailyMeals: dailyMeals || [],
      subtotal,
      addonsTotal,
      discount,
      totalAmount,
      paidAmount: paymentMethod === 'online' ? totalAmount : 0,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      couponCode,
      specialInstructions,
      autoRenewal: autoRenewal || false,
      deliveryCount,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create subscription',
    });
  }
};

// Get user's subscriptions (User)
export const getMySubscriptions = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { status, limit = '10', page = '1' } = req.query;

    const query = { userId };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('productId', 'name image category');

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      count: subscriptions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get subscriptions',
    });
  }
};

// Get single subscription (User)
export const getSubscriptionById = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;

    const subscription = await Subscription.findOne({ _id: id, userId })
      .populate('productId', 'name image category description');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get subscription',
    });
  }
};

// Pause subscription (User)
export const pauseSubscription = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: `Cannot pause ${subscription.status} subscription`,
      });
    }

    subscription.status = 'paused.js';
    subscription.pausedAt = new Date();
    subscription.pauseReason = reason || 'Paused by user.js';

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription paused successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to pause subscription',
    });
  }
};

// Resume subscription (User)
export const resumeSubscription = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is not paused',
      });
    }

    // Check if subscription has expired
    if (new Date() > subscription.endDate) {
      subscription.status = 'expired.js';
      await subscription.save();
      return res.status(400).json({
        success: false,
        error: 'Subscription has expired',
      });
    }

    subscription.status = 'active.js';
    subscription.resumedAt = new Date();

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription resumed successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resume subscription',
    });
  }
};

// Cancel subscription (User)
export const cancelSubscription = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is already cancelled',
      });
    }

    if (subscription.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed subscription',
      });
    }

    subscription.status = 'cancelled.js';
    subscription.cancelledAt = new Date();
    subscription.cancelReason = reason || 'Cancelled by user.js';

    // Calculate refund for remaining days
    const today = new Date();
    const remainingDays = Math.max(0, Math.ceil((subscription.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (remainingDays > 0 && subscription.paymentMethod === 'online' && subscription.paymentStatus === 'paid') {
      const refundAmount = Math.round((subscription.totalAmount / subscription.duration) * remainingDays);
      subscription.paidAmount -= refundAmount;
      subscription.paymentStatus = 'refunded.js';
    }

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription',
    });
  }
};

// Skip a day (User)
export const skipDay = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;
    const { date, reason } = req.body;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Can only skip days for active subscriptions',
      });
    }

    // Check if already skipped max days
    if (subscription.skipDays.length >= subscription.maxSkipDays) {
      return res.status(400).json({
        success: false,
        error: `You can only skip ${subscription.maxSkipDays} days in this subscription`,
      });
    }

    const skipDate = new Date(date);

    // Check if date is within subscription period
    if (skipDate < subscription.startDate || skipDate > subscription.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Date must be within subscription period',
      });
    }

    // Check if already skipped
    const alreadySkipped = subscription.skipDays.some(
      (skip) => skip.date.toDateString() === skipDate.toDateString()
    );

    if (alreadySkipped) {
      return res.status(400).json({
        success: false,
        error: 'This day is already skipped',
      });
    }

    subscription.skipDays.push({
      date: skipDate,
      reason: reason || 'Skipped by user',
    });

    // Extend end date by 1 day
    subscription.endDate.setDate(subscription.endDate.getDate() + 1);

    await subscription.save();

    res.json({
      success: true,
      message: 'Day skipped successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to skip day',
    });
  }
};

// Modify subscription (User)
export const modifySubscription = async (req, res) => {
  try {
    const userId = (req).user._id;
    const { id } = req.params;
    const { deliverySlot, deliveryAddress, addons, specialInstructions } = req.body;

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Can only modify active subscriptions',
      });
    }

    // Update allowed fields
    if (deliverySlot) subscription.deliverySlot = deliverySlot;
    if (deliveryAddress) subscription.deliveryAddress = deliveryAddress;
    if (specialInstructions) subscription.specialInstructions = specialInstructions;

    // Update addons if provided
    if (addons) {
      const oldAddonsTotal = subscription.addonsTotal;
      const newAddonsTotal = addons.reduce((sum, addon) => {
        return sum + (addon.price * subscription.duration);
      }, 0);

      subscription.addons = addons;
      subscription.addonsTotal = newAddonsTotal;
      subscription.totalAmount = subscription.totalAmount - oldAddonsTotal + newAddonsTotal;
      subscription.pendingAmount = subscription.totalAmount - subscription.paidAmount;
    }

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription modified successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to modify subscription',
    });
  }
};

// Get all subscriptions (Admin)
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = '20', page = '1' } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name phoneNumber email')
      .populate('productId', 'name image');

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      count: subscriptions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get subscriptions',
    });
  }
};

// Update subscription status (Admin)
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'paused', 'cancelled', 'completed', 'expired'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
    }

    subscription.status = status;

    if (status === 'completed') {
      subscription.completedAt = new Date();
    }

    await subscription.save();

    res.json({
      success: true,
      message: `Subscription status updated to ${status}`,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update subscription status',
    });
  }
};

// Get subscription statistics (Admin)
export const getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const pausedSubscriptions = await Subscription.countDocuments({ status: 'paused' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });
    const completedSubscriptions = await Subscription.countDocuments({ status: 'completed' });

    // Revenue stats
    const revenueResult = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          pendingRevenue: { $sum: '$pendingAmount' },
          averageSubscriptionValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0] : { 
      totalRevenue: 0, 
      pendingRevenue: 0,
      averageSubscriptionValue: 0 
    };

    // Subscriptions by duration
    const subscriptionsByDuration = await Subscription.aggregate([
      {
        $group: {
          _id: '$duration',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$paidAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular products
    const popularProducts = await Subscription.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$productName',
          subscriptionCount: { $sum: 1 },
          totalRevenue: { $sum: '$paidAmount' },
        },
      },
      { $sort: { subscriptionCount: -1 } },
      { $limit: 10 },
    ]);

    // Upcoming renewals (next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const upcomingRenewals = await Subscription.countDocuments({
      status: 'active',
      endDate: { $lte: sevenDaysLater },
      autoRenewal: true,
    });

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        completedSubscriptions,
        totalRevenue: Math.round(revenue.totalRevenue),
        pendingRevenue: Math.round(revenue.pendingRevenue),
        averageSubscriptionValue: Math.round(revenue.averageSubscriptionValue),
        subscriptionsByDuration,
        popularProducts,
        upcomingRenewals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get subscription stats',
    });
  }
};

// Get today's deliveries (Admin)
export const getTodaysDeliveries = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.find({
      status: 'active',
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .populate('userId', 'name phoneNumber')
      .populate('productId', 'name');

    // Filter out skipped days
    const activeDeliveries = subscriptions.filter((sub) => {
      const isSkipped = sub.skipDays.some(
        (skip) => skip.date.toDateString() === today.toDateString()
      );
      return !isSkipped;
    });

    // Group by delivery slot
    const groupedBySlot = activeDeliveries.reduce((acc, sub) => {
      const slot = sub.deliverySlot;
      if (!acc[slot]) {
        acc[slot] = [];
      }
      acc[slot].push(sub);
      return acc;
    }, {});

    res.json({
      success: true,
      count: activeDeliveries.length,
      data: {
        subscriptions: activeDeliveries,
        groupedBySlot,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get today\'s deliveries',
    });
  }
};



