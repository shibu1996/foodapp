import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  subscriptionPrice: number;
  discount: number;
  rating: number;
  isVeg: boolean;
  isBestSeller: boolean;
  isPopular: boolean;
  image: string;
  tags: string[];
  isActive: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Dal & Curry', 'Rice Dishes', 'Breads', 'Thalis', 'Snacks', 'Beverages'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    subscriptionPrice: {
      type: Number,
      required: [true, 'Subscription price is required'],
      min: [1, 'Subscription price must be at least 1'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, 'Stock cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Comprehensive indexes for high-performance queries (1L+ users)
// Single field indexes
ProductSchema.index({ isActive: 1 }); // Filter by active products
ProductSchema.index({ category: 1 }); // Category filtering
ProductSchema.index({ createdAt: -1 }); // Sort by newest
ProductSchema.index({ price: 1 }); // Price range queries
ProductSchema.index({ rating: -1 }); // Sort by rating

// Compound indexes for common query patterns
ProductSchema.index({ category: 1, isActive: 1, price: 1 }); // Category + active + price filter
ProductSchema.index({ isActive: 1, isBestSeller: 1 }); // Active best sellers
ProductSchema.index({ isActive: 1, isPopular: 1 }); // Active popular items
ProductSchema.index({ isActive: 1, createdAt: -1 }); // Active + newest first
ProductSchema.index({ category: 1, rating: -1 }); // Category + best rated

// Text search index for name and description
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Partial index for in-stock items only (reduces index size)
ProductSchema.index(
  { stock: 1 }, 
  { partialFilterExpression: { stock: { $gt: 0 } } }
);

export default mongoose.model<IProduct>('Product', ProductSchema);


