import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import { calculateOneTimeDeliveryFee, calculateSubscriptionDeliveryFee } from '../../../shared/utils/distanceCalculator.js';
import { applyCouponToOrder } from './couponController.js';

// Place new order (User)
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      oneTimeItems = [],
      subscriptionItems = [],
      deliveryAddress, // Legacy support
      oneTimeDeliveryAddress,
      subscriptionDeliveryAddress,
      useSameAddress = true,
      deliveryType = 'normal', // 'normal' or 'premium'
      deliveryDistance = 0,
      deliverySlot,
      deliveryDate,
      paymentMethod,
      couponCode,
      couponId,
      couponDiscount = 0,
      specialInstructions,
    } = req.body;

    // Validate items
    const allItems = [...oneTimeItems, ...subscriptionItems];
    if (allItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must have at least one item',
      });
    }

    // Validate addresses
    if (useSameAddress) {
      if (!deliveryAddress && !oneTimeDeliveryAddress) {
        return res.status(400).json({
          success: false,
          error: 'Delivery address is required',
        });
      }
    } else {
      if (oneTimeItems.length > 0 && !oneTimeDeliveryAddress) {
        return res.status(400).json({
          success: false,
          error: 'One-time delivery address is required',
        });
      }
      if (subscriptionItems.length > 0 && !subscriptionDeliveryAddress) {
        return res.status(400).json({
          success: false,
          error: 'Subscription delivery address is required',
        });
      }
    }

    // Process one-time items
    let oneTimeSubtotal = 0;
    const processedOneTimeItems = [];
    
    for (const item of oneTimeItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product is not available: ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      oneTimeSubtotal += itemTotal;

      processedOneTimeItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        isSubscription: false,
      });
    }

    // Process subscription items
    let subscriptionSubtotal = 0;
    const processedSubscriptionItems = [];
    
    for (const item of subscriptionItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product is not available: ${product.name}`,
        });
      }

      // Use subscription price if available (daily price)
      const dailyPrice = product.subscriptionPrice || product.price;
      
      // Calculate total subscription price based on duration
      const duration = item.duration || 30;
      const itemTotal = item.total || (dailyPrice * duration);
      subscriptionSubtotal += itemTotal;

      processedSubscriptionItems.push({
        productId: product._id,
        productName: item.productName || product.name,
        price: dailyPrice,
        quantity: item.quantity || 1,
        total: itemTotal,
        isSubscription: true,
        duration: duration,
        startDate: item.startDate,
        endDate: item.endDate,
      });
    }

    // Combine all items
    const orderItems = [...processedOneTimeItems, ...processedSubscriptionItems];
    const subtotal = oneTimeSubtotal + subscriptionSubtotal;

    // Calculate tax (5% GST)
    const tax = Math.round(subtotal * 0.05);

    // Calculate delivery fees
    const oneTimeDeliveryFee = calculateOneTimeDeliveryFee(deliveryType, deliveryDistance);
    const subscriptionDeliveryFee = calculateSubscriptionDeliveryFee(); // Always 0
    const deliveryFee = oneTimeDeliveryFee + subscriptionDeliveryFee;

    // Apply discount if coupon provided
    let discount = 0;
    if (couponCode) {
      // Mock coupon logic (in real app, validate against Coupon model)
      if (couponCode === 'FIRST10') {
        discount = Math.round(subtotal * 0.1);
      } else if (couponCode === 'SAVE50') {
        discount = 50;
      }
    }

    const totalAmount = subtotal + tax + deliveryFee - discount;

    // Prepare delivery addresses
    const finalOneTimeAddress = useSameAddress ? (oneTimeDeliveryAddress || deliveryAddress) : oneTimeDeliveryAddress;
    const finalSubscriptionAddress = useSameAddress ? (oneTimeDeliveryAddress || deliveryAddress) : subscriptionDeliveryAddress;

    // Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      oneTimeDeliveryFee,
      subscriptionDeliveryFee,
      discount,
      totalAmount,
      deliveryAddress: useSameAddress ? (oneTimeDeliveryAddress || deliveryAddress) : null, // Legacy
      oneTimeDeliveryAddress: finalOneTimeAddress,
      subscriptionDeliveryAddress: finalSubscriptionAddress,
      useSameAddress,
      deliveryType,
      deliveryDistance,
      deliverySlot,
      deliveryDate,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      couponCode,
      couponId,
      couponDiscount,
      specialInstructions,
    });

    // Create Subscription documents for subscription items
    console.log(`\n🔍 DEBUG: Processing ${subscriptionItems.length} subscription items`);
    console.log('Subscription items data:', JSON.stringify(subscriptionItems, null, 2));
    
    const createdSubscriptions = [];
    for (const subItem of subscriptionItems) {
      try {
        console.log(`\n📦 Processing subscription item for product: ${subItem.productId}`);
        // Use dates from frontend, or calculate if not provided
        const startDate = subItem.startDate ? new Date(subItem.startDate) : new Date();
        const endDate = subItem.endDate ? new Date(subItem.endDate) : (() => {
          const calculatedEndDate = new Date(startDate);
          calculatedEndDate.setDate(calculatedEndDate.getDate() + (subItem.duration || 30));
          return calculatedEndDate;
        })();

        // Calculate subscription pricing
        const duration = subItem.duration || 30;
        const basePrice = subItem.price || 0;
        const subtotal = basePrice * duration;
        const addonsTotal = subItem.addonPrice || 0;
        const discount = subItem.discount || 0;
        const totalAmount = subItem.total || (subtotal + addonsTotal - discount);

        // Format skip dates (field name is skipDays in schema)
        const formattedSkipDays = (subItem.skipDates || []).map(dateStr => ({
          date: new Date(dateStr),
          reason: 'User selected'
        }));

        // Calculate max skip days based on duration
        let maxSkipDays = 0;
        if (duration === 7) {
          maxSkipDays = 2;
        } else if (duration === 15) {
          maxSkipDays = 3;
        } else if (duration === 30) {
          maxSkipDays = 5;
        } else {
          maxSkipDays = Math.floor(duration * 0.15); // 15% of duration
        }

        // Format addons - convert string array to object array
        const formattedAddons = (subItem.addons || []).map(addon => {
          if (typeof addon === 'string') {
            // Convert string to object with name and price
            const addonPrice = subItem.addonPrice || 0;
            const pricePerAddon = (subItem.addons || []).length > 0 ? addonPrice / (subItem.addons || []).length : 0;
            return {
              name: addon,
              price: pricePerAddon
            };
          }
          return addon; // If already an object, return as is
        });

        const subscription = await Subscription.create({
          userId,
          productId: subItem.productId,
          productName: subItem.productName || 'Subscription',
          basePrice,
          duration,
          startDate,
          endDate,
          deliverySlot: subItem.deliverySlot || deliverySlot || '8:00 AM - 10:00 AM',
          deliveryAddress: finalSubscriptionAddress,
          addons: formattedAddons, // Use formatted addons with name and price
          skipDays: formattedSkipDays, // Correct field name is skipDays
          dailyMeals: subItem.dailyMeals || [],
          maxSkipDays, // Maximum skip days allowed based on duration
          subtotal,
          addonsTotal,
          discount,
          totalAmount,
          paidAmount: paymentMethod === 'cod' ? 0 : totalAmount,
          status: 'active',
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          deliveryCount: duration, // Total number of deliveries = duration
          completedDeliveries: 0, // Initially no deliveries completed
          orderId: order._id,
        });
        
        createdSubscriptions.push(subscription);
        console.log(`✅ Created subscription ${subscription.subscriptionNumber} for product ${subItem.productName}`);
      } catch (subError) {
        console.error(`❌ Failed to create subscription for product ${subItem.productId}:`, subError.message);
        console.error('Subscription error details:', subError);
      }
    }

    // Track coupon usage if coupon was applied
    if (couponId && couponDiscount > 0) {
      try {
        await applyCouponToOrder(couponId, userId, order._id, couponDiscount);
        console.log(`✅ Coupon usage tracked: ${couponCode}`);
      } catch (couponError) {
        console.error('❌ Failed to track coupon usage:', couponError);
        // Don't fail the order if coupon tracking fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        subscriptions: createdSubscriptions,
      },
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to place order',
    });
  }
};

// Get user's orders (User)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = '10', page = '1' } = req.query;

    const query = { userId };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('items.productId', 'name image category');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get orders',
    });
  }
};

// Get single order (User)
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId })
      .populate('items.productId', 'name image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get order',
    });
  }
};

// Cancel order (User)
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Can only cancel if not delivered or already cancelled
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel delivered order',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order is already cancelled',
      });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();

    // Refund if payment was online
    if (order.paymentStatus === 'paid' && order.paymentMethod === 'online') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel order',
    });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, limit = '20', page = '1' } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name phone email')
      .populate('items.productId', 'name image');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get orders',
    });
  }
};

// Get single order by ID (Admin)
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name phone email')
      .populate('items.productId', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get order',
    });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Update status and timestamps
    order.status = status;

    if (status === 'confirmed') {
      order.confirmedAt = new Date();
    } else if (status === 'preparing') {
      order.preparedAt = new Date();
    } else if (status === 'out_for_delivery') {
      order.outForDeliveryAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update order status',
    });
  }
};

// Delete order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete order',
    });
  }
};

// Get order statistics (Admin)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });
    const outForDeliveryOrders = await Order.countDocuments({ status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue stats
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0] : { totalRevenue: 0, averageOrderValue: 0 };

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Math.round(revenue.totalRevenue),
        averageOrderValue: Math.round(revenue.averageOrderValue),
        ordersByStatus,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get order stats',
    });
  }
};

// Get today's orders (Admin)
export const getTodaysOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      deliveryDate: { $gte: today, $lt: tomorrow },
    })
      .sort({ deliverySlot: 1 })
      .populate('userId', 'name phoneNumber')
      .populate('items.productId', 'name');

    const groupedBySlot = orders.reduce((acc, order) => {
      const slot = order.deliverySlot;
      if (!acc[slot]) {
        acc[slot] = [];
      }
      acc[slot].push(order);
      return acc;
    }, {});

    res.json({
      success: true,
      count: orders.length,
      data: {
        orders,
        groupedBySlot,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get today\'s orders',
    });
  }
};
