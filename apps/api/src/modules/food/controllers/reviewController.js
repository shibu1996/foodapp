import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { productId, rating, isVerified, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (productId) query.productId = productId;
    if (rating) query.rating = parseInt(rating);
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('userId', 'name email phone')
      .populate('productId', 'name image')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Get reviews for a specific product (Public)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, limit = 10, page = 1 } = req.query;

    const query = { 
      productId,
      isVerified: true 
    };
    
    if (rating) query.rating = parseInt(rating);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments(query);

    // Get product rating stats
    const stats = await Review.getProductRating(productId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews',
      error: error.message
    });
  }
};

// Check if user can review an order
export const checkReviewEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to review this order'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ orderId, userId });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
        review: existingReview
      });
    }

    res.status(200).json({
      success: true,
      message: 'Eligible to review',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message
    });
  }
};

// Submit review (User)
export const createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      orderId,
      productId,
      rating,
      comment,
      images = [],
      deliveryBoyRating,
      deliveryBoyComment
    } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to review this order'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders'
      });
    }

    // Check if product exists in order
    const productInOrder = order.items.find(
      item => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check if already reviewed
    const hasReviewed = await Review.hasUserReviewed(orderId, userId, productId);
    
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product for this order'
      });
    }

    // Create review
    const review = await Review.create({
      orderId,
      userId,
      productId,
      rating,
      comment,
      images,
      deliveryBoyRating,
      deliveryBoyComment,
      isVerified: true // Auto-verify since it's from a real order
    });

    // Populate user and product details
    await review.populate('userId', 'name email');
    await review.populate('productId', 'name image');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

// Update review (User - only their own review)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this review'
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Respond to review (Admin)
export const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const adminId = req.user._id;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.response = response;
    review.respondedBy = adminId;
    review.respondedAt = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to review',
      error: error.message
    });
  }
};

// Toggle verify status (Admin)
export const toggleVerifyReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isVerified = !review.isVerified;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${review.isVerified ? 'verified' : 'unverified'} successfully`,
      data: review
    });
  } catch (error) {
    console.error('Error toggling review verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle review verification',
      error: error.message
    });
  }
};

// Delete review (Admin)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isHelpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Marked as helpful',
      data: review
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Report review
export const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isReported = true;
    review.reportReason = reason;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully',
      data: review
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review',
      error: error.message
    });
  }
};

