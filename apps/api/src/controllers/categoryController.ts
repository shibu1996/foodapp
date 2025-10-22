import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

// Get all categories (with product count)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { isActive = 'true' } = req.query;
    
    const query: any = {};
    
    if (isActive === 'true') {
      query.isActive = true;
    }
    
    const categories = await Category.find(query).sort({ displayOrder: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Get single category by slug or ID
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Try to find by slug first, then by ID
    let category = await Category.findOne({ slug });
    
    if (!category) {
      category = await Category.findById(slug);
    }
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Get products in this category
    const products = await Product.find({
      category: category.name,
      isActive: true,
    });
    
    res.json({
      success: true,
      data: {
        category,
        products,
        productCount: products.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Create new category (Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, image, displayOrder } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists',
      });
    }
    
    const category = await Category.create({
      name,
      description,
      icon: icon || '🍛',
      image,
      displayOrder: displayOrder || 0,
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category already exists',
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // If name changed, update all products with old category name
    if (updates.name) {
      const oldCategory = await Category.findById(req.params.id);
      if (oldCategory && oldCategory.name !== updates.name) {
        await Product.updateMany(
          { category: oldCategory.name },
          { category: updates.name }
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
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

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: category.name });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`,
      });
    }
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Toggle category status (Admin only)
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Sync product counts for all categories (Admin only)
export const syncProductCounts = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    
    const updatePromises = categories.map(async (category) => {
      const count = await Product.countDocuments({
        category: category.name,
        isActive: true,
      });
      
      category.productCount = count;
      return category.save();
    });
    
    await Promise.all(updatePromises);
    
    const updatedCategories = await Category.find().sort({ displayOrder: 1 });
    
    res.json({
      success: true,
      message: 'Product counts synced successfully',
      data: updatedCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Reorder categories (Admin only)
export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { categoryIds } = req.body; // Array of category IDs in new order
    
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        error: 'categoryIds must be an array',
      });
    }
    
    const updatePromises = categoryIds.map((id, index) => {
      return Category.findByIdAndUpdate(id, { displayOrder: index });
    });
    
    await Promise.all(updatePromises);
    
    const categories = await Category.find().sort({ displayOrder: 1 });
    
    res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

