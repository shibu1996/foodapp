import Plan from '../models/Plan.js';

// Get all plans
export const getAllPlans = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const plans = await Plan.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get plans',
    });
  }
};

// Get single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get plan',
    });
  }
};

// Create new plan
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      duration,
      price,
      discountPrice,
      features,
      isActive,
      category,
      maxSkipDays,
      maxExtendedDays,
    } = req.body;

    // Validate discount price
    if (discountPrice && discountPrice >= price) {
      return res.status(400).json({
        success: false,
        error: 'Discount price must be less than regular price',
      });
    }

    const plan = await Plan.create({
      name,
      description,
      duration,
      price,
      discountPrice,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
      category,
      maxSkipDays: maxSkipDays || 0,
      maxExtendedDays: maxExtendedDays || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(err => err.message).join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create plan',
    });
  }
};

// Update plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration,
      price,
      discountPrice,
      features,
      isActive,
      category,
      maxSkipDays,
      maxExtendedDays,
    } = req.body;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    // Validate discount price
    const newPrice = price !== undefined ? price : plan.price;
    if (discountPrice && discountPrice >= newPrice) {
      return res.status(400).json({
        success: false,
        error: 'Discount price must be less than regular price',
      });
    }

    // Update fields
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (duration !== undefined) plan.duration = duration;
    if (price !== undefined) plan.price = price;
    if (discountPrice !== undefined) plan.discountPrice = discountPrice;
    if (features !== undefined) plan.features = features;
    if (isActive !== undefined) plan.isActive = isActive;
    if (category !== undefined) plan.category = category;
    if (maxSkipDays !== undefined) plan.maxSkipDays = maxSkipDays;
    if (maxExtendedDays !== undefined) plan.maxExtendedDays = maxExtendedDays;

    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(err => err.message).join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update plan',
    });
  }
};

// Delete plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete plan',
    });
  }
};

// Get active plans by category (for customers)
export const getActivePlansByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const plans = await Plan.find({ 
      category, 
      isActive: true 
    }).sort({ price: 1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get plans',
    });
  }
};

