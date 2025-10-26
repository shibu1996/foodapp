import mongoose from 'mongoose';

const outletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    fullAddress: String
  },
  owner: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    open: String,
    close: String
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
outletSchema.index({ location: '2dsphere' });

// Index for faster queries
outletSchema.index({ isActive: 1 });
outletSchema.index({ 'owner.email': 1 });

const Outlet = mongoose.model('Outlet', outletSchema);

export default Outlet;


