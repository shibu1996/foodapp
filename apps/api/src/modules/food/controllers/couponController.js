import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// Get all coupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const { isActive, applicableFor } = req.query;
    
    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (applicableFor) filter.applicableFor = applicableFor;

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

// Get active coupons for users (only currently valid ones)
export const getActiveCoupons = async (req, res) => {
  try {
    const { applicableFor, userId } = req.query;
    const now = new Date();
    
    let filter = {
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now }
    };
    
    if (applicableFor && applicableFor !== 'all') {
      filter.applicableFor = { $in: [applicableFor, 'all'] };
    }

    let coupons = await Coupon.find(filter).sort({ discountValue: -1 });
    
    // Filter out coupons that have reached usage limit
    coupons = coupons.filter(coupon => 
      coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit
    );
    
    // If userId provided, filter out already used coupons (for one-time coupons)
    if (userId) {
      coupons = coupons.filter(coupon => !coupon.hasUserUsed(userId));
    }
    
    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active coupons',
      error: error.message
    });
  }
};

// Get single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon',
      error: error.message
    });
  }
};

// Validate coupon and calculate discount
export const validateCoupon = async (req, res) => {
  try {
    const { code, userId, orderType, orderAmount } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required'
      });
    }

    // Find coupon by code (case-insensitive)
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: `This coupon is valid from ${coupon.validFrom.toLocaleDateString()}`
      });
    }
    
    if (now > coupon.validTill) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Check if user has already used this coupon
    if (userId && coupon.hasUserUsed(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Check if coupon is applicable for this order type
    if (orderType && coupon.applicableFor !== 'all') {
      if (coupon.applicableFor === 'firstOrder') {
        // Check if user has previous orders
        if (userId) {
          const previousOrders = await Order.countDocuments({ 
            userId, 
            status: { $nin: ['cancelled', 'failed'] } 
          });
          if (previousOrders > 0) {
            return res.status(400).json({
              success: false,
              message: 'This coupon is only valid for first-time orders'
            });
          }
        }
      } else if (coupon.applicableFor !== orderType) {
        return res.status(400).json({
          success: false,
          message: `This coupon is only applicable for ${coupon.applicableFor} orders`
        });
      }
    }

    // Check minimum order value
    if (orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponId: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
};

// Create new coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    
    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: couponData.code.toUpperCase().trim() 
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Ensure code is uppercase
    couponData.code = couponData.code.toUpperCase().trim();

    const coupon = new Coupon(couponData);
    await coupon.save();
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

// Update coupon (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, check for duplicates
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

// Toggle coupon status (Admin)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status',
      error: error.message
    });
  }
};

// Delete coupon (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};

// Apply coupon to order (Called when order is placed)
export const applyCouponToOrder = async (couponId, userId, orderId, discountAmount) => {
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    await coupon.incrementUsage(userId, orderId, discountAmount);
    return true;
  } catch (error) {
    console.error('Error applying coupon to order:', error);
    throw error;
  }
};

