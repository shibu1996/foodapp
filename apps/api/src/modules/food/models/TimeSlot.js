import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  durationHours: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
timeSlotSchema.index({ isActive: 1, order: 1 });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot;

