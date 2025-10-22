import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon {
  name: string;
  price: number;
}

export interface ISkipDay {
  date: Date;
  reason?: string;
}

export interface IDailyMeal {
  date: Date;
  productId: mongoose.Types.ObjectId;
  productName: string;
}

export interface IDeliveryAddress {
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionNumber: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  basePrice: number;
  duration: number; // in days
  startDate: Date;
  endDate: Date;
  deliverySlot: string;
  deliveryAddress: IDeliveryAddress;
  addons: IAddon[];
  skipDays: ISkipDay[];
  dailyMeals: IDailyMeal[];
  maxSkipDays: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed' | 'expired';
  pausedAt?: Date;
  pauseReason?: string;
  resumedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
  subtotal: number;
  addonsTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  couponCode?: string;
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentId?: string;
  autoRenewal: boolean;
  deliveryCount: number;
  completedDeliveries: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

const SubscriptionSchema: Schema = new Schema(
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

// Indexes for better query performance (subscriptionNumber already indexed via unique: true)
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ startDate: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

