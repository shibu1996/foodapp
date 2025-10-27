import mongoose from 'mongoose';

const StockHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['added', 'removed', 'sold', 'damaged', 'returned', 'adjusted'],
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
StockHistorySchema.index({ productId: 1, createdAt: -1 });
StockHistorySchema.index({ type: 1 });

const StockHistory = mongoose.model('StockHistory', StockHistorySchema);

export default StockHistory;

