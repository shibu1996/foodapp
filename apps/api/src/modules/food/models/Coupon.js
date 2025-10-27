import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validTill: {
    type: Date,
    required: true
  },
  applicableFor: {
    type: String,
    enum: ['all', 'firstOrder', 'subscription', 'onetime'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Track which users have used this coupon
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    discountGiven: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTill: 1 });
couponSchema.index({ applicableFor: 1 });

// Virtual to check if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTill >= now &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
});

// Method to check if user has already used this coupon
couponSchema.methods.hasUserUsed = function(userId) {
  return this.usedBy.some(usage => usage.userId.toString() === userId.toString());
};

// Method to increment usage count
couponSchema.methods.incrementUsage = function(userId, orderId, discountGiven) {
  this.usageCount += 1;
  this.usedBy.push({
    userId,
    orderId,
    discountGiven,
    usedAt: new Date()
  });
  return this.save();
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;

