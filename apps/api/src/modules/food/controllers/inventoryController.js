import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';

// Get all products with stock information
export const getAllInventory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      stockFilter = 'all', // all, low, out
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (stockFilter === 'low') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    } else if (stockFilter === 'out') {
      query.isOutOfStock = true;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    // Get stock statistics
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    const outOfStockCount = await Product.countDocuments({ isOutOfStock: true });

    res.status(200).json({
      success: true,
      data: products,
      stats: {
        lowStock: lowStockCount,
        outOfStock: outOfStockCount
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isOutOfStock: false
    }).sort({ stock: 1 });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message
    });
  }
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type = 'adjusted', reason, notes, performedBy } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock + parseInt(quantity);

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Update stock
    product.stock = newStock;
    product.isOutOfStock = newStock === 0;
    await product.save();

    // Log stock history
    await StockHistory.create({
      productId: id,
      previousStock,
      newStock,
      quantity: parseInt(quantity),
      type,
      reason,
      notes,
      performedBy
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        productName: product.name,
        previousStock,
        newStock,
        quantity
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Set stock quantity (absolute value)
export const setStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, reason, notes, performedBy } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: 'Stock value is required'
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stock;
    const newStock = parseInt(stock);
    const quantity = newStock - previousStock;

    // Update stock
    product.stock = newStock;
    product.isOutOfStock = newStock === 0;
    await product.save();

    // Log stock history
    await StockHistory.create({
      productId: id,
      previousStock,
      newStock,
      quantity,
      type: 'adjusted',
      reason,
      notes,
      performedBy
    });

    res.status(200).json({
      success: true,
      message: 'Stock set successfully',
      data: {
        productId: product._id,
        productName: product.name,
        previousStock,
        newStock
      }
    });
  } catch (error) {
    console.error('Error setting stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set stock',
      error: error.message
    });
  }
};

// Get stock history for a product
export const getStockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { productId: id };
    if (type && type !== 'all') {
      query.type = type;
    }

    const history = await StockHistory.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await StockHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock history',
      error: error.message
    });
  }
};

// Update low stock threshold
export const updateLowStockThreshold = async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold } = req.body;

    if (threshold === undefined || threshold === null) {
      return res.status(400).json({
        success: false,
        message: 'Threshold value is required'
      });
    }

    if (threshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Threshold cannot be negative'
      });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.lowStockThreshold = parseInt(threshold);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Low stock threshold updated successfully',
      data: {
        productId: product._id,
        productName: product.name,
        lowStockThreshold: product.lowStockThreshold
      }
    });
  } catch (error) {
    console.error('Error updating threshold:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update threshold',
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });
    const outOfStockProducts = await Product.countDocuments({ isOutOfStock: true });
    
    // Total stock value
    const products = await Product.find().select('stock price');
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    // Recent stock movements
    const recentMovements = await StockHistory.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        inStockProducts: totalProducts - outOfStockProducts,
        totalStockValue: Math.round(totalStockValue),
        recentMovements
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory stats',
      error: error.message
    });
  }
};

// Bulk stock update
export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates, performedBy } = req.body; // updates: [{ productId, quantity, type, reason }]

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const product = await Product.findById(update.productId);
        
        if (!product) {
          errors.push({ productId: update.productId, error: 'Product not found' });
          continue;
        }

        const previousStock = product.stock;
        const newStock = previousStock + parseInt(update.quantity);

        if (newStock < 0) {
          errors.push({ productId: update.productId, error: 'Stock cannot be negative' });
          continue;
        }

        product.stock = newStock;
        product.isOutOfStock = newStock === 0;
        await product.save();

        await StockHistory.create({
          productId: update.productId,
          previousStock,
          newStock,
          quantity: parseInt(update.quantity),
          type: update.type || 'adjusted',
          reason: update.reason,
          performedBy
        });

        results.push({
          productId: product._id,
          productName: product.name,
          previousStock,
          newStock
        });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} products updated successfully`,
      data: {
        successful: results,
        failed: errors
      }
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update',
      error: error.message
    });
  }
};

