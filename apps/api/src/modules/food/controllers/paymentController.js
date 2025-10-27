import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { getPaymentSettings } from './settingsController.js';

// Get Razorpay instance with current settings
const getRazorpayInstance = async () => {
  const settings = await getPaymentSettings();
  return new Razorpay({
    key_id: settings.razorpayKeyId,
    key_secret: settings.razorpayKeySecret
  });
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, userId } = req.body;

    if (!amount || !orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, orderId, and userId are required'
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get payment settings and Razorpay instance
    const settings = await getPaymentSettings();
    const razorpay = await getRazorpayInstance();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        userId
      }
    });

    // Save payment record
    const payment = await Payment.create({
      orderId,
      userId,
      amount,
      currency,
      paymentGateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      status: 'pending',
      metadata: {
        razorpayOrder
      }
    });

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        paymentId: payment._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: settings.razorpayKeyId
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment signature
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Get payment settings
    const settings = await getPaymentSettings();

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', settings.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Invalid signature
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: 'failed',
          failureReason: 'Invalid payment signature'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Signature is valid - update payment status
    const payment = await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      {
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        status: 'completed',
        $set: {
          'metadata.verifiedAt': new Date()
        }
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update order status to confirmed
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paidAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        orderId: payment.orderId,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Handle Razorpay webhook
export const handleWebhook = async (req, res) => {
  try {
    // Get payment settings
    const settings = await getPaymentSettings();
    const webhookSecret = settings.razorpayWebhookSecret;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    const event = req.body.event;
    const payloadData = req.body.payload.payment.entity;

    switch (event) {
      case 'payment.captured':
        await Payment.findOneAndUpdate(
          { gatewayPaymentId: payloadData.id },
          {
            status: 'completed',
            paymentMethod: payloadData.method,
            $set: {
              'metadata.capturedAt': new Date(),
              'metadata.webhookData': payloadData
            }
          }
        );
        break;

      case 'payment.failed':
        await Payment.findOneAndUpdate(
          { gatewayOrderId: payloadData.order_id },
          {
            status: 'failed',
            failureReason: payloadData.error_description,
            $set: {
              'metadata.failedAt': new Date(),
              'metadata.webhookData': payloadData
            }
          }
        );
        break;

      case 'refund.created':
        await Payment.findOneAndUpdate(
          { gatewayPaymentId: payloadData.payment_id },
          {
            status: 'refunded',
            refundAmount: payloadData.amount / 100,
            refundId: payloadData.id,
            refundedAt: new Date(),
            $set: {
              'metadata.refundData': payloadData
            }
          }
        );
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    // Check if already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    // Calculate refund amount (full refund if not specified)
    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Get Razorpay instance and process refund
    const razorpay = await getRazorpayInstance();
    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      amount: Math.round(refundAmount * 100), // Convert to paise
      notes: {
        reason: reason || 'Customer requested refund'
      }
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    payment.metadata.refundData = refund;
    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'refunded',
      status: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate('orderId', 'orderNumber totalAmount status')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Get user payments
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber totalAmount status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentGateway,
      startDate,
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentGateway && paymentGateway !== 'all') {
      query.paymentGateway = paymentGateway;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

