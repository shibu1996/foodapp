import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { calculateOneTimeDeliveryFee, calculateSubscriptionDeliveryFee } from '../../../shared/utils/distanceCalculator.js';

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

      // Use subscription price if available
      const price = product.subscriptionPrice || product.price;
      const itemTotal = price * (item.quantity || 1);
      subscriptionSubtotal += itemTotal;

      processedSubscriptionItems.push({
        productId: product._id,
        productName: product.name,
        price: price,
        quantity: item.quantity || 1,
        total: itemTotal,
        isSubscription: true,
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
      specialInstructions,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
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
      .populate('userId', 'name phoneNumber email')
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
