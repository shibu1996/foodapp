import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  images: [{
    type: String
  }],
  deliveryBoyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryBoyComment: {
    type: String,
    trim: true,
    maxlength: 200
  },
  response: {
    type: String,
    trim: true,
    maxlength: 500
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
reviewSchema.index({ productId: 1, rating: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index to ensure one review per user per product per order
reviewSchema.index({ orderId: 1, userId: 1, productId: 1 }, { unique: true });

// Virtual for checking if user has already reviewed this product in this order
reviewSchema.statics.hasUserReviewed = async function(orderId, userId, productId) {
  const review = await this.findOne({ orderId, userId, productId });
  return !!review;
};

// Calculate average rating for a product
reviewSchema.statics.getProductRating = async function(productId) {
  const result = await this.aggregate([
    { 
      $match: { 
        productId: new mongoose.Types.ObjectId(productId),
        isVerified: true 
      } 
    },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  // Count rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result[0].ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingDistribution: distribution
  };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;

