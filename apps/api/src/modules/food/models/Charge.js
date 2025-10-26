import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  chargeType: {
    type: String,
    enum: ['delivery', 'platform', 'tax', 'packaging'],
    required: true
  },
  applicableFor: {
    type: String,
    enum: ['onetime', 'subscription', 'both'],
    required: true,
    default: 'both'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minOrderValue: {
    type: Number,
    min: 0
  },
  maxDistance: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
chargeSchema.index({ chargeType: 1, isActive: 1 });
chargeSchema.index({ applicableFor: 1, isActive: 1 });

const Charge = mongoose.model('Charge', chargeSchema);

export default Charge;

