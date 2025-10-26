import { User } from '../models/User.js';
import { generateOTP, storeOTP, verifyOTP as verifyOTPUtil } from '../utils/otp.js';
import { generateToken } from '../utils/jwt.js';

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const isValid = verifyOTPUtil(phone, otp);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ phone, isRegistered: false });
      
      const token = generateToken(user._id.toString());
      
      return res.json({
        success: true,
        needsRegistration: true,
        token,
        message: 'OTP verified. Please complete registration.',
      });
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        isRegistered: user.isRegistered,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      needsRegistration: !user.isRegistered,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, isRegistered: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        isRegistered: user.isRegistered,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'Registration completed successfully',
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete registration' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        isRegistered: user.isRegistered,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { limit = '50', page = '1', search = '' } = req.query;

    const query = { isRegistered: true }; // Only get registered users

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('_id name email phone isRegistered createdAt updatedAt');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get users',
      error: error.message 
    });
  }
};

