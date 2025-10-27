import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  // General Settings
  businessName: {
    type: String,
    default: 'Food Delivery App'
  },
  businessEmail: {
    type: String
  },
  businessPhone: {
    type: String
  },
  
  // Payment Gateway Settings
  razorpayKeyId: {
    type: String,
    default: ''
  },
  razorpayKeySecret: {
    type: String,
    default: ''
  },
  razorpayWebhookSecret: {
    type: String,
    default: ''
  },
  razorpayEnabled: {
    type: Boolean,
    default: false
  },
  
  // Stripe Settings (for future)
  stripePublishableKey: {
    type: String,
    default: ''
  },
  stripeSecretKey: {
    type: String,
    default: ''
  },
  stripeEnabled: {
    type: Boolean,
    default: false
  },
  
  // Business Hours
  operatingHours: {
    type: Object,
    default: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '22:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '09:00', close: '22:00', isOpen: true }
    }
  },
  
  // Order Settings
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDeliveryRadius: {
    type: Number,
    default: 10 // in km
  },
  
  // Email Settings (for future)
  smtpHost: {
    type: String,
    default: ''
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpUser: {
    type: String,
    default: ''
  },
  smtpPassword: {
    type: String,
    default: ''
  },
  emailEnabled: {
    type: Boolean,
    default: false
  },
  
  // SMS Settings (for future)
  smsApiKey: {
    type: String,
    default: ''
  },
  smsEnabled: {
    type: Boolean,
    default: false
  },
  
  // There should only be one settings document
  singleton: {
    type: Boolean,
    default: true,
    unique: true
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;

