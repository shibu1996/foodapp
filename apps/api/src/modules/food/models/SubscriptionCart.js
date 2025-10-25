/**
 * Subscription Cart Model
 * Stores pending subscriptions before checkout
 */

import mongoose, { Schema, Document } from 'mongoose';

;
  calculatedAmount;
  addedAt;
}



const SubscriptionCartItemSchema = new Schema({
  product: {
    type.Types.ObjectId,
    ref: 'Product',
    required,
  },
  duration: {
    type,
    required,
    enum: [7, 15, 30],
  },
  deliverySlot: {
    type,
    required,
    enum: ['morning', 'evening'],
  },
  startDate: {
    type,
    required,
  },
  deliveryAddress: {
    street: { type, required },
    city: { type, required },
    state: { type, required },
    pincode: { type, required },
    landmark,
    type: {
      type,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  calculatedAmount: {
    type,
    required,
  },
  addedAt: {
    type,
    default.now,
  },
});

const SubscriptionCartSchema = new Schema(
  {
    user: {
      type.Types.ObjectId,
      ref: 'User',
      required,
      unique, // One cart per user
    },
    items: [SubscriptionCartItemSchema],
    totalAmount: {
      type,
      default,
    },
  },
  {
    timestamps,
  }
);

// Calculate total amount before saving
SubscriptionCartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.calculatedAmount, 0);
  next();
});

// Indexes for performance
SubscriptionCartSchema.index({ user });

export const SubscriptionCart = mongoose.model(
  'SubscriptionCart',
  SubscriptionCartSchema
);


