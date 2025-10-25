import Product from '../models/Product.js';
import { cacheService, CacheKeys, CacheTTL } from '../../../shared/services/cacheService.js';
import { parsePaginationParams, paginate, parseFieldFilter, applyFieldFilter } from '../../../shared/utils/pagination.js';

// Get all products (with filters) - WITH CACHING & PAGINATION for 1L+ users
export const getProducts = async (req, res) => {
  try {
    const { category, search, isActive = 'true' } = req.query;
    
    // Parse pagination & field filtering
    const paginationParams = parsePaginationParams(req);
    const fields = parseFieldFilter(req);
    
    // Generate cache key (include pagination for accurate caching)
    const cacheKey = `products:${category || 'all'}:${search || 'none'}:${isActive}:p${paginationParams.page}:l${paginationParams.limit}`;
    
    // Try to get from cache first (if no search - search results not cached)
    if (!search) {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          ...cached,
          cached: true,
        });
      }
    }
    
    // Build query
    const query = {};
    
    // Filter by active status
    if (isActive === 'true') {
      query.isActive = true;
    }
    
    // Filter by category
    if (category && category !== 'All Items') {
      query.category = category;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    // Apply pagination
    const result = await paginate(Product, query, paginationParams);
    
    // Apply field filtering if requested
    if (fields) {
      result.data = result.data.map((product) => {
        const filtered = {};
        fields.split(' ').forEach(field => {
          if (product[field] !== undefined) {
            filtered[field] = product[field];
          }
        });
        return filtered;
      });
    }
    
    // Cache results (only if no search query)
    if (!search) {
      await cacheService.set(cacheKey, result, CacheTTL.ONE_HOUR);
    }
    
    res.json({
      success: true,
      ...result,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Get single product by ID - WITH CACHING
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const cacheKey = CacheKeys.productById(productId);
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }
    
    // Fetch from DB with lean() for performance
    const product = await Product.findById(productId).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Cache for 1 hour
    await cacheService.set(cacheKey, product, CacheTTL.ONE_HOUR);
    
    res.json({
      success: true,
      data: product,
      cached: false,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      subscriptionPrice,
      discount,
      rating,
      isVeg,
      isBestSeller,
      isPopular,
      image,
      tags,
      stock,
    } = req.body;
    
    // Calculate discount if not provided
    let calculatedDiscount = discount;
    if (!discount && originalPrice && price) {
      calculatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    
    const product = await Product.create({
      name,
      description,
      category,
      price,
      originalPrice: originalPrice || price,
      subscriptionPrice,
      discount: calculatedDiscount,
      rating: rating || 4.0,
      isVeg: isVeg !== undefined ? isVeg : true,
      isBestSeller: isBestSeller || false,
      isPopular: isPopular || false,
      image,
      tags: tags || [],
      stock: stock || 100,
    });
    
    // Invalidate product list caches
    await cacheService.deletePattern('products:*');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    
    // Calculate discount if price changes
    if (updates.price && updates.originalPrice) {
      updates.discount = Math.round(((updates.originalPrice - updates.price) / updates.originalPrice) * 100);
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Invalidate caches for this product and lists
    await cacheService.delete(CacheKeys.productById(req.params.id));
    await cacheService.deletePattern('products:*');
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Invalidate all product caches
    await cacheService.delete(CacheKeys.productById(req.params.id));
    await cacheService.deletePattern('products:*');
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Toggle product status (Admin only)
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    product.isActive = !product.isActive;
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Get product stats (Admin only)
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const bestSellers = await Product.countDocuments({ isBestSeller: true });
    const popularProducts = await Product.countDocuments({ isPopular: true });
    
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    
    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        bestSellers,
        popularProducts,
        productsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};
