import Charge from '../models/Charge.js';

// Get all charges
export const getAllCharges = async (req, res) => {
  try {
    const { chargeType, applicableFor, isActive } = req.query;
    
    let filter = {};
    if (chargeType) filter.chargeType = chargeType;
    if (applicableFor) filter.applicableFor = { $in: [applicableFor, 'both'] };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const charges = await Charge.find(filter).sort({ chargeType: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: charges
    });
  } catch (error) {
    console.error('Error fetching charges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charges',
      error: error.message
    });
  }
};

// Get active charges by type and order type
export const getActiveCharges = async (req, res) => {
  try {
    const { orderType } = req.query; // 'onetime' or 'subscription'
    
    const filter = {
      isActive: true
    };
    
    if (orderType) {
      filter.applicableFor = { $in: [orderType, 'both'] };
    }

    const charges = await Charge.find(filter).sort({ chargeType: 1, amount: 1 });
    
    // Group by charge type
    const groupedCharges = {
      delivery: charges.filter(c => c.chargeType === 'delivery'),
      platform: charges.filter(c => c.chargeType === 'platform'),
      tax: charges.filter(c => c.chargeType === 'tax'),
      packaging: charges.filter(c => c.chargeType === 'packaging')
    };
    
    res.status(200).json({
      success: true,
      data: groupedCharges
    });
  } catch (error) {
    console.error('Error fetching active charges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active charges',
      error: error.message
    });
  }
};

// Get single charge by ID
export const getChargeById = async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: charge
    });
  } catch (error) {
    console.error('Error fetching charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charge',
      error: error.message
    });
  }
};

// Create new charge
export const createCharge = async (req, res) => {
  try {
    const charge = new Charge(req.body);
    await charge.save();
    
    res.status(201).json({
      success: true,
      message: 'Charge created successfully',
      data: charge
    });
  } catch (error) {
    console.error('Error creating charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create charge',
      error: error.message
    });
  }
};

// Update charge
export const updateCharge = async (req, res) => {
  try {
    const charge = await Charge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Charge updated successfully',
      data: charge
    });
  } catch (error) {
    console.error('Error updating charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update charge',
      error: error.message
    });
  }
};

// Delete charge
export const deleteCharge = async (req, res) => {
  try {
    const charge = await Charge.findByIdAndDelete(req.params.id);
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Charge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete charge',
      error: error.message
    });
  }
};

// Toggle charge status
export const toggleChargeStatus = async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }
    
    charge.isActive = !charge.isActive;
    await charge.save();
    
    res.status(200).json({
      success: true,
      message: `Charge ${charge.isActive ? 'activated' : 'deactivated'} successfully`,
      data: charge
    });
  } catch (error) {
    console.error('Error toggling charge status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle charge status',
      error: error.message
    });
  }
};

