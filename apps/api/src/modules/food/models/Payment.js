import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paytm', 'cod'],
    default: 'razorpay'
  },
  gatewayOrderId: {
    type: String,
    index: true
  },
  gatewayPaymentId: {
    type: String,
    index: true
  },
  gatewaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'emi', 'other'],
    default: 'other'
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundId: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  metadata: {
    type: Object,
    default: {}
  },
  failureReason: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ gatewayOrderId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;

