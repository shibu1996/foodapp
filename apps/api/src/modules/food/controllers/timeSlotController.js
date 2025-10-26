import TimeSlot from '../models/TimeSlot.js';

// @desc    Get all time slots
// @route   GET /api/food/time-slots
// @access  Public
export const getAllTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find().sort({ order: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: timeSlots.length,
      data: timeSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get time slots'
    });
  }
};

// @desc    Get active time slots only
// @route   GET /api/food/time-slots/active
// @access  Public
export const getActiveTimeSlots = async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find({ isActive: true }).sort({ order: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: timeSlots.length,
      data: timeSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active time slots'
    });
  }
};

// @desc    Get single time slot by ID
// @route   GET /api/food/time-slots/:id
// @access  Public
export const getTimeSlotById = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get time slot'
    });
  }
};

// @desc    Create new time slot
// @route   POST /api/food/time-slots
// @access  Admin
export const createTimeSlot = async (req, res) => {
  try {
    const { label, startTime, endTime, durationHours, order } = req.body;
    
    // Validation
    if (!startTime || !endTime || !durationHours) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Check for overlapping time slots
    const existingSlots = await TimeSlot.find({
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });
    
    if (existingSlots.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Time slot overlaps with existing slot'
      });
    }
    
    const timeSlot = await TimeSlot.create({
      label: label || `${startTime} - ${endTime}`,
      startTime,
      endTime,
      durationHours,
      order: order || 0,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create time slot'
    });
  }
};

// @desc    Update time slot
// @route   PUT /api/food/time-slots/:id
// @access  Admin
export const updateTimeSlot = async (req, res) => {
  try {
    let timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }
    
    const { label, startTime, endTime, durationHours, order } = req.body;
    
    // Check for overlapping time slots (excluding current slot)
    if (startTime || endTime) {
      const existingSlots = await TimeSlot.find({
        _id: { $ne: req.params.id },
        $or: [
          { startTime: { $lte: startTime || timeSlot.startTime }, endTime: { $gt: startTime || timeSlot.startTime } },
          { startTime: { $lt: endTime || timeSlot.endTime }, endTime: { $gte: endTime || timeSlot.endTime } },
          { startTime: { $gte: startTime || timeSlot.startTime }, endTime: { $lte: endTime || timeSlot.endTime } }
        ]
      });
      
      if (existingSlots.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Time slot overlaps with existing slot'
        });
      }
    }
    
    timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { label, startTime, endTime, durationHours, order },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Time slot updated successfully',
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update time slot'
    });
  }
};

// @desc    Toggle time slot status
// @route   PATCH /api/food/time-slots/:id/toggle-status
// @access  Admin
export const toggleTimeSlotStatus = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }
    
    timeSlot.isActive = !timeSlot.isActive;
    await timeSlot.save();
    
    res.status(200).json({
      success: true,
      message: `Time slot ${timeSlot.isActive ? 'activated' : 'deactivated'} successfully`,
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle time slot status'
    });
  }
};

// @desc    Delete time slot
// @route   DELETE /api/food/time-slots/:id
// @access  Admin
export const deleteTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }
    
    await timeSlot.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete time slot'
    });
  }
};
