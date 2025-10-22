import { Request, Response } from 'express';
import Product from '../models/Product';

// Get all products (with filters)
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, isActive = 'true' } = req.query;
    
    // Build query
    const query: any = {};
    
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
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
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
export const createProduct = async (req: Request, res: Response) => {
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
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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
export const updateProduct = async (req: Request, res: Response) => {
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
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
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
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Toggle product status (Admin only)
export const toggleProductStatus = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Get product stats (Admin only)
export const getProductStats = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

