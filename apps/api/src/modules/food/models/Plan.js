import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
  },
  features: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['meal', 'dairy', 'grocery', 'laundry'],
    required: [true, 'Category is required'],
  },
  maxSkipDays: {
    type: Number,
    default: 0,
    min: [0, 'Max skip days cannot be negative'],
  },
  maxExtendedDays: {
    type: Number,
    default: 0,
    min: [0, 'Max extended days cannot be negative'],
  },
}, {
  timestamps: true,
});

// Indexes
planSchema.index({ category: 1, isActive: 1 });
planSchema.index({ name: 1 });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;

