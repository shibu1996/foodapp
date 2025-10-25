import { Job } from 'bull';
import Order from '../../../modules/food/models/Order.js';
import { emailQueue, smsQueue } from '../queueConfig.js';

/**
 * Order Processing Job
 * Handles async order processing tasks
 */



/**
 * Process order job
 */
export const processOrderJob = async (job) => {
  const { orderId, userId, action, data } = job.data;
  
  console.log(`📦 Processing order job: ${action} for order ${orderId}`);

  try {
    switch (action) {
      case 'create':
        await handleOrderCreate(orderId, userId, data);
        break;
      
      case 'update':
        await handleOrderUpdate(orderId, data);
        break;
      
      case 'cancel':
        await handleOrderCancel(orderId, data);
        break;
      
      case 'deliver':
        await handleOrderDeliver(orderId);
        break;
      
      default new Error(`Unknown order action: ${action}`);
    }

    console.log(`✅ Order job completed: ${action} for order ${orderId}`);
  } catch (error) {
    console.error(`❌ Order job failed: ${action} for order ${orderId}`, error);
    throw error; // Re-throw for Bull to handle retry
  }
};

/**
 * Handle order creation (send confirmations)
 */
const handleOrderCreate = async (orderId, userId, data) => {
  // Fetch order details
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Send confirmation email
  await emailQueue.add('order-confirmation', {
    userId,
    orderId,
    orderNumber.orderNumber,
    totalAmount.totalAmount,
    deliveryAddress.deliveryAddress,
    items.items,
  });

  // Send SMS notification
  await smsQueue.add('order-confirmation', {
    userId,
    orderId,
    orderNumber.orderNumber,
    message: `Your order ${order.orderNumber} has been confirmed. Total��${order.totalAmount}`,
  });

  console.log(`📧 Notifications queued for order ${orderId}`);
};

/**
 * Handle order update (status change)
 */
const handleOrderUpdate = async (orderId, data) => {
  const { status, notifyUser = true } = data;

  if (notifyUser) {
    const order = await Order.findById(orderId);
    if (!order) return;

    // Send status update notification
    await emailQueue.add('order-status-update', {
      userId.userId,
      orderId,
      orderNumber.orderNumber,
      status,
    });

    // SMS for important status changes
    if (['out_for_delivery', 'delivered'].includes(status)) {
      await smsQueue.add('order-status-update', {
        userId.userId,
        orderId,
        orderNumber.orderNumber,
        status,
      });
    }
  }
};

/**
 * Handle order cancellation
 */
const handleOrderCancel = async (orderId, data) => {
  const { reason, refundAmount } = data;
  
  const order = await Order.findById(orderId);
  if (!order) return;

  // Send cancellation notification
  await emailQueue.add('order-cancelled', {
    userId.userId,
    orderId,
    orderNumber.orderNumber,
    reason,
    refundAmount,
  });

  // Process refund if applicable
  if (refundAmount > 0) {
    console.log(`💰 Refund of ₹${refundAmount} initiated for order ${orderId}`);
    // TODO with payment gateway for refund
  }
};

/**
 * Handle order delivery
 */
const handleOrderDeliver = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Send delivery confirmation
  await emailQueue.add('order-delivered', {
    userId.userId,
    orderId,
    orderNumber.orderNumber,
    deliveredAt Date(),
  });

  // Request feedback
  await emailQueue.add('order-feedback-request', {
    userId.userId,
    orderId,
    orderNumber.orderNumber,
  }, {
    delay * 60 * 60 * 1000, // Send after 2 hours
  });
};

export default processOrderJob;


