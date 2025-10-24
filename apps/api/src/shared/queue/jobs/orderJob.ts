import { Job } from 'bull';
import Order from '../../../modules/food/models/Order';
import { emailQueue, smsQueue } from '../queueConfig';

/**
 * Order Processing Job
 * Handles async order processing tasks
 */

export interface OrderJobData {
  orderId: string;
  userId: string;
  action: 'create' | 'update' | 'cancel' | 'deliver';
  data?: any;
}

/**
 * Process order job
 */
export const processOrderJob = async (job: Job<OrderJobData>) => {
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
      
      default:
        throw new Error(`Unknown order action: ${action}`);
    }

    console.log(`✅ Order job completed: ${action} for order ${orderId}`);
  } catch (error: any) {
    console.error(`❌ Order job failed: ${action} for order ${orderId}`, error);
    throw error; // Re-throw for Bull to handle retry
  }
};

/**
 * Handle order creation (send confirmations)
 */
const handleOrderCreate = async (orderId: string, userId: string, data: any) => {
  // Fetch order details
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Send confirmation email
  await emailQueue.add('order-confirmation', {
    userId,
    orderId,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    deliveryAddress: order.deliveryAddress,
    items: order.items,
  });

  // Send SMS notification
  await smsQueue.add('order-confirmation', {
    userId,
    orderId,
    orderNumber: order.orderNumber,
    message: `Your order ${order.orderNumber} has been confirmed. Total: ₹${order.totalAmount}`,
  });

  console.log(`📧 Notifications queued for order ${orderId}`);
};

/**
 * Handle order update (status change)
 */
const handleOrderUpdate = async (orderId: string, data: any) => {
  const { status, notifyUser = true } = data;

  if (notifyUser) {
    const order = await Order.findById(orderId);
    if (!order) return;

    // Send status update notification
    await emailQueue.add('order-status-update', {
      userId: order.userId,
      orderId,
      orderNumber: order.orderNumber,
      status,
    });

    // SMS for important status changes
    if (['out_for_delivery', 'delivered'].includes(status)) {
      await smsQueue.add('order-status-update', {
        userId: order.userId,
        orderId,
        orderNumber: order.orderNumber,
        status,
      });
    }
  }
};

/**
 * Handle order cancellation
 */
const handleOrderCancel = async (orderId: string, data: any) => {
  const { reason, refundAmount } = data;
  
  const order = await Order.findById(orderId);
  if (!order) return;

  // Send cancellation notification
  await emailQueue.add('order-cancelled', {
    userId: order.userId,
    orderId,
    orderNumber: order.orderNumber,
    reason,
    refundAmount,
  });

  // Process refund if applicable
  if (refundAmount > 0) {
    console.log(`💰 Refund of ₹${refundAmount} initiated for order ${orderId}`);
    // TODO: Integrate with payment gateway for refund
  }
};

/**
 * Handle order delivery
 */
const handleOrderDeliver = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Send delivery confirmation
  await emailQueue.add('order-delivered', {
    userId: order.userId,
    orderId,
    orderNumber: order.orderNumber,
    deliveredAt: new Date(),
  });

  // Request feedback
  await emailQueue.add('order-feedback-request', {
    userId: order.userId,
    orderId,
    orderNumber: order.orderNumber,
  }, {
    delay: 2 * 60 * 60 * 1000, // Send after 2 hours
  });
};

export default processOrderJob;


