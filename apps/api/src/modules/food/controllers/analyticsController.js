import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import { User } from '../../../shared/models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Get sales analytics (daily/weekly/monthly)
export const getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    let groupBy;
    let dateFormat;

    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        groupBy = { $week: "$createdAt" };
        dateFormat = 'Week';
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateFormat = 'YYYY-MM';
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter }
      : {};

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: salesData,
      period,
      dateFormat
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: error.message
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter, status: 'delivered' }
      : { status: 'delivered' };

    // Total revenue from orders
    const orderRevenue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue breakdown by payment method
    const paymentMethodBreakdown = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentMethod",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by delivery type
    const deliveryTypeBreakdown = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$deliveryType",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Subscription revenue
    const subscriptionRevenue = await Subscription.aggregate([
      { 
        $match: { 
          status: { $in: ['active', 'completed'] }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: orderRevenue[0]?.total || 0,
        totalOrders: orderRevenue[0]?.count || 0,
        subscriptionRevenue: subscriptionRevenue[0]?.total || 0,
        totalSubscriptions: subscriptionRevenue[0]?.count || 0,
        paymentMethodBreakdown,
        deliveryTypeBreakdown,
        grandTotal: (orderRevenue[0]?.total || 0) + (subscriptionRevenue[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

// Get popular products
export const getPopularProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get most ordered products
    const popularProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          image: "$product.image",
          category: "$product.category",
          totalOrders: 1,
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: popularProducts
    });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular products',
      error: error.message
    });
  }
};

// Get customer insights
export const getCustomerInsights = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const activeCustomers = await User.countDocuments({ role: 'user', isActive: true });

    // New customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Customer lifetime value (top 10)
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          totalOrders: 1,
          averageOrderValue: { $divide: ["$totalSpent", "$totalOrders"] }
        }
      }
    ]);

    // Customer retention (repeat customers)
    const repeatCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: {
          orderCount: { $gt: 1 }
        }
      },
      {
        $count: "total"
      }
    ]);

    const repeatCustomerCount = repeatCustomers[0]?.total || 0;
    const retentionRate = totalCustomers > 0 
      ? ((repeatCustomerCount / totalCustomers) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        repeatCustomers: repeatCustomerCount,
        retentionRate: parseFloat(retentionRate),
        topCustomers
      }
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer insights',
      error: error.message
    });
  }
};

// Get delivery performance
export const getDeliveryPerformance = async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Average delivery time (for delivered orders)
    const deliveryTimes = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          deliveredAt: { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ["$deliveredAt", "$createdAt"] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDeliveryTime: { $avg: "$deliveryTime" },
          minDeliveryTime: { $min: "$deliveryTime" },
          maxDeliveryTime: { $max: "$deliveryTime" }
        }
      }
    ]);

    // Orders by delivery type
    const ordersByDeliveryType = await Order.aggregate([
      {
        $group: {
          _id: "$deliveryType",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Success rate
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const successRate = totalOrders > 0 
      ? ((deliveredOrders / totalOrders) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ordersByStatus,
        ordersByDeliveryType,
        averageDeliveryTime: deliveryTimes[0]?.averageDeliveryTime?.toFixed(2) || 0,
        minDeliveryTime: deliveryTimes[0]?.minDeliveryTime?.toFixed(2) || 0,
        maxDeliveryTime: deliveryTimes[0]?.maxDeliveryTime?.toFixed(2) || 0,
        totalOrders,
        deliveredOrders,
        successRate: parseFloat(successRate)
      }
    });
  } catch (error) {
    console.error('Error fetching delivery performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery performance',
      error: error.message
    });
  }
};

// Get dashboard overview
export const getDashboardOverview = async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // This month stats
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    const monthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Last month stats for comparison
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    
    const lastMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Total stats
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Pending orders
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing', 'out-for-delivery'] }
    });

    // Calculate growth percentages
    const orderGrowth = lastMonthOrders > 0 
      ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(2)
      : 0;
    
    const revenueGrowth = (lastMonthRevenue[0]?.total || 0) > 0 
      ? ((((monthRevenue[0]?.total || 0) - (lastMonthRevenue[0]?.total || 0)) / (lastMonthRevenue[0]?.total || 0)) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0
        },
        thisMonth: {
          orders: monthOrders,
          revenue: monthRevenue[0]?.total || 0,
          orderGrowth: parseFloat(orderGrowth),
          revenueGrowth: parseFloat(revenueGrowth)
        },
        overall: {
          totalCustomers,
          totalProducts,
          activeSubscriptions,
          pendingOrders
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
};

// Get product performance
export const getProductPerformance = async (req, res) => {
  try {
    // Top rated products
    const topRated = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      },
      { $match: { totalReviews: { $gte: 3 } } }, // At least 3 reviews
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          image: "$product.image",
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1
        }
      }
    ]);

    // Low stock products (if stock tracking is implemented)
    const allProducts = await Product.find().select('name category');
    
    res.status(200).json({
      success: true,
      data: {
        topRated,
        totalProducts: allProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching product performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product performance',
      error: error.message
    });
  }
};

