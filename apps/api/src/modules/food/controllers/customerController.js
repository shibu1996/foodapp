import { User } from '../../../shared/models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

// Get all customers with pagination and filters
export const getAllCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { role: 'user' }; // Only get users, not admins

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const customers = await User.find(query)
      .select('-password -refreshToken')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    // Get order and subscription counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ userId: customer._id });
        const subscriptionCount = await Subscription.countDocuments({ userId: customer._id });
        
        const orders = await Order.find({ userId: customer._id })
          .select('totalAmount')
          .sort({ createdAt: -1 });
        
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        return {
          ...customer.toObject(),
          stats: {
            totalOrders: orderCount,
            totalSubscriptions: subscriptionCount,
            totalSpent: totalSpent,
            lastOrderDate: orders[0]?.createdAt || null
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: customersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get customer by ID with detailed info
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id).select('-password -refreshToken');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get orders
    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get subscriptions
    const subscriptions = await Subscription.find({ userId: id })
      .populate('productId', 'name image')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const allOrders = await Order.find({ userId: id });
    const totalSpent = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = allOrders.filter(order => order.status === 'delivered').length;

    res.status(200).json({
      success: true,
      data: {
        customer: customer.toObject(),
        recentOrders: orders,
        recentSubscriptions: subscriptions,
        stats: {
          totalOrders: allOrders.length,
          completedOrders,
          activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
          totalSubscriptions: subscriptions.length,
          totalSpent,
          averageOrderValue: allOrders.length > 0 ? totalSpent / allOrders.length : 0,
          joinedDate: customer.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details',
      error: error.message
    });
  }
};

// Get customer order history with pagination
export const getCustomerOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: id };
    if (status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message
    });
  }
};

// Block/Unblock user
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block/unblock admin users'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'blocked'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};

// Export customer data to CSV
export const exportCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' })
      .select('name email phone createdAt isActive')
      .sort({ createdAt: -1 });

    // Get stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ userId: customer._id });
        const orders = await Order.find({ userId: customer._id }).select('totalAmount');
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        return {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          joinedDate: customer.createdAt.toLocaleDateString('en-IN'),
          status: customer.isActive ? 'Active' : 'Blocked',
          totalOrders: orderCount,
          totalSpent: totalSpent.toFixed(2)
        };
      })
    );

    // Create CSV
    const csvHeader = 'Name,Email,Phone,Joined Date,Status,Total Orders,Total Spent\n';
    const csvRows = customersWithStats.map(c => 
      `"${c.name}","${c.email}","${c.phone}","${c.joinedDate}","${c.status}",${c.totalOrders},${c.totalSpent}`
    ).join('\n');
    
    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=customers-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export customers',
      error: error.message
    });
  }
};

// Get customer statistics summary
export const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const activeCustomers = await User.countDocuments({ role: 'user', isActive: true });
    const blockedCustomers = await User.countDocuments({ role: 'user', isActive: false });

    // Get new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalCustomers,
        active: activeCustomers,
        blocked: blockedCustomers,
        newThisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer stats',
      error: error.message
    });
  }
};

