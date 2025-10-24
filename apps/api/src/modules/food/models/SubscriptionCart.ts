/**
 * Subscription Cart Model
 * Stores pending subscriptions before checkout
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionCartItem {
  product: mongoose.Types.ObjectId;
  duration: number;
  deliverySlot: 'morning' | 'evening';
  startDate: Date;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    type: 'home' | 'work' | 'other';
  };
  calculatedAmount: number;
  addedAt: Date;
}

export interface ISubscriptionCart extends Document {
  user: mongoose.Types.ObjectId;
  items: ISubscriptionCartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionCartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    enum: [7, 15, 30],
  },
  deliverySlot: {
    type: String,
    required: true,
    enum: ['morning', 'evening'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  calculatedAmount: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const SubscriptionCartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [SubscriptionCartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
SubscriptionCartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.calculatedAmount, 0);
  next();
});

// Indexes for performance
SubscriptionCartSchema.index({ user: 1 });

export const SubscriptionCart = mongoose.model<ISubscriptionCart>(
  'SubscriptionCart',
  SubscriptionCartSchema
);


