import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const SkipDaySchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  reason: String,
});

const DailyMealSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
});

const DeliveryAddressSchema = new Schema({
  houseNo: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/,
  },
  landmark: String,
  latitude: Number,
  longitude: Number,
});

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    deliverySlot: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: DeliveryAddressSchema,
      required: true,
    },
    addons: {
      type: [AddonSchema],
      default: [],
    },
    skipDays: {
      type: [SkipDaySchema],
      default: [],
    },
    dailyMeals: {
      type: [DailyMealSchema],
      default: [],
    },
    maxSkipDays: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'completed', 'expired'],
      default: 'active',
      index: true,
    },
    pausedAt: Date,
    pauseReason: String,
    resumedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    completedAt: Date,
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    addonsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: String,
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    deliveryCount: {
      type: Number,
      required: true,
      min: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialInstructions: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Generate subscription number before saving
SubscriptionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Subscription').countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.subscriptionNumber = `SUB${timestamp}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Calculate max skip days based on duration
SubscriptionSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('duration')) {
    // Allow skip days based on duration
    if (this.duration === 7) {
      this.maxSkipDays = 2;
    } else if (this.duration === 15) {
      this.maxSkipDays = 3;
    } else if (this.duration === 30) {
      this.maxSkipDays = 5;
    } else {
      // Custom duration: 15% of duration
      this.maxSkipDays = Math.floor(this.duration * 0.15);
    }
  }
  next();
});

// Update pending amount before saving
SubscriptionSchema.pre('save', function (next) {
  this.pendingAmount = this.totalAmount - this.paidAmount;
  next();
});

// Comprehensive indexes for high-performance subscription queries (1L+ users)
// User-specific queries
SubscriptionSchema.index({ userId: 1, status: 1 }); // User's subscriptions by status
SubscriptionSchema.index({ userId: 1, createdAt: -1 }); // User's subscriptions by date
SubscriptionSchema.index({ userId: 1, status: 1, startDate: 1 }); // User's active subs schedule

// Operational queries
SubscriptionSchema.index({ status: 1, endDate: 1 }); // Subscriptions ending soon
SubscriptionSchema.index({ status: 1, startDate: 1 }); // Subscriptions starting soon
SubscriptionSchema.index({ startDate: 1, status: 1 }); // Daily delivery schedule
SubscriptionSchema.index({ endDate: 1, status: 1 }); // Expiring subscriptions

// Delivery tracking
SubscriptionSchema.index({ deliverySlot: 1, status: 1 }); // Slot-wise delivery planning
SubscriptionSchema.index({ 'deliveryAddress.pincode': 1, startDate: 1 }); // Area-based routing

// Payment and billing
SubscriptionSchema.index({ paymentStatus: 1, status: 1 }); // Payment tracking
SubscriptionSchema.index({ autoRenewal: 1, endDate: 1 }); // Auto-renewal processing

// Analytics
SubscriptionSchema.index({ createdAt: -1 }); // Recent subscriptions
SubscriptionSchema.index({ productId: 1, status: 1 }); // Product popularity
SubscriptionSchema.index({ duration: 1, status: 1 }); // Duration analysis

// Skip days management
SubscriptionSchema.index({ skipDays: 1 }, { sparse: true }); // Track skip patterns

export default mongoose.model('Subscription', SubscriptionSchema);
