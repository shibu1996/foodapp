import Outlet from '../models/Outlet.js';

// @desc    Get all outlets
// @route   GET /api/food/outlets
// @access  Public
export const getAllOutlets = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const outlets = await Outlet.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: outlets.length,
      data: outlets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get outlets',
    });
  }
};

// @desc    Get active outlets only
// @route   GET /api/food/outlets/active
// @access  Public
export const getActiveOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.find({ isActive: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: outlets.length,
      data: outlets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active outlets',
    });
  }
};

// @desc    Get single outlet by ID
// @route   GET /api/food/outlets/:id
// @access  Public
export const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findById(id);

    if (!outlet) {
      return res.status(404).json({
        success: false,
        error: 'Outlet not found',
      });
    }

    res.json({
      success: true,
      data: outlet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get outlet',
    });
  }
};

// @desc    Get nearest outlet to a location
// @route   GET /api/food/outlets/nearest?lat=:lat&lng=:lng
// @access  Public
export const getNearestOutlet = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const outlets = await Outlet.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { isActive: true }
        }
      },
      {
        $limit: 1
      }
    ]);

    if (outlets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No outlet found nearby',
      });
    }

    res.json({
      success: true,
      data: {
        outlet: outlets[0],
        distanceInKm: (outlets[0].distance / 1000).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find nearest outlet',
    });
  }
};

// @desc    Create new outlet
// @route   POST /api/food/outlets
// @access  Admin
export const createOutlet = async (req, res) => {
  try {
    const {
      name,
      tagline,
      location,
      address,
      owner,
      operatingHours
    } = req.body;

    // Validation
    if (!name || !location || !owner) {
      return res.status(400).json({
        success: false,
        error: 'Please provide outlet name, location, and owner details',
      });
    }

    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location coordinates. Please provide [longitude, latitude]',
      });
    }

    if (!owner.name || !owner.phone || !owner.email) {
      return res.status(400).json({
        success: false,
        error: 'Owner name, phone, and email are required',
      });
    }

    const outlet = await Outlet.create({
      name,
      tagline,
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      address,
      owner,
      operatingHours,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Outlet registered successfully',
      data: outlet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create outlet',
    });
  }
};

// @desc    Update outlet
// @route   PUT /api/food/outlets/:id
// @access  Admin
export const updateOutlet = async (req, res) => {
  try {
    let outlet = await Outlet.findById(req.params.id);

    if (!outlet) {
      return res.status(404).json({
        success: false,
        error: 'Outlet not found',
      });
    }

    const {
      name,
      tagline,
      location,
      address,
      owner,
      operatingHours
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (location && location.coordinates && location.coordinates.length === 2) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }
    if (address) updateData.address = address;
    if (owner) updateData.owner = owner;
    if (operatingHours) updateData.operatingHours = operatingHours;

    outlet = await Outlet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Outlet updated successfully',
      data: outlet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update outlet',
    });
  }
};

// @desc    Toggle outlet status
// @route   PATCH /api/food/outlets/:id/toggle-status
// @access  Admin
export const toggleOutletStatus = async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);

    if (!outlet) {
      return res.status(404).json({
        success: false,
        error: 'Outlet not found',
      });
    }

    outlet.isActive = !outlet.isActive;
    await outlet.save();

    res.json({
      success: true,
      message: `Outlet ${outlet.isActive ? 'activated' : 'deactivated'} successfully`,
      data: outlet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle outlet status',
    });
  }
};

// @desc    Delete outlet
// @route   DELETE /api/food/outlets/:id
// @access  Admin
export const deleteOutlet = async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);

    if (!outlet) {
      return res.status(404).json({
        success: false,
        error: 'Outlet not found',
      });
    }

    await outlet.deleteOne();

    res.json({
      success: true,
      message: 'Outlet deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete outlet',
    });
  }
};

// @desc    Calculate distance between two points
// @route   POST /api/food/outlets/calculate-distance
// @access  Public
export const calculateDistance = async (req, res) => {
  try {
    const { from, to } = req.body; // from and to should be { lat, lng }

    if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
      return res.status(400).json({
        success: false,
        error: 'Both from and to locations with lat and lng are required',
      });
    }

    // Haversine formula to calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * (Math.PI / 180);
    const dLng = (to.lng - from.lng) * (Math.PI / 180);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    res.json({
      success: true,
      data: {
        distanceInKm: distance.toFixed(2),
        distanceInMeters: Math.round(distance * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate distance',
    });
  }
};


