import {
  orderQueue,
  emailQueue,
  smsQueue,
  subscriptionQueue,
  cleanupQueue,
  paymentQueue,
} from './queueConfig';
import processOrderJob from './jobs/orderJob';
import processEmailJob from './jobs/emailJob';
import processSMSJob from './jobs/smsJob';
import processSubscriptionJob from './jobs/subscriptionJob';
import processCleanupJob from './jobs/cleanupJob';

/**
 * Queue Workers
 * Registers all job processors
 */

/**
 * Start all queue workers
 */
export const startQueueWorkers = () => {
  console.log('🔄 Starting queue workers...');

  // Order processing worker
  orderQueue.process('*', 5, processOrderJob); // Process 5 jobs concurrently
  console.log('✅ Order queue worker started (concurrency: 5)');

  // Email notification worker
  emailQueue.process('*', 10, processEmailJob); // Process 10 emails concurrently
  console.log('✅ Email queue worker started (concurrency: 10)');

  // SMS notification worker
  smsQueue.process('*', 5, processSMSJob); // Process 5 SMS concurrently
  console.log('✅ SMS queue worker started (concurrency: 5)');

  // Subscription processing worker
  subscriptionQueue.process('*', 3, processSubscriptionJob); // Process 3 concurrently
  console.log('✅ Subscription queue worker started (concurrency: 3)');

  // Cleanup worker (low priority, single instance)
  cleanupQueue.process('*', 1, processCleanupJob);
  console.log('✅ Cleanup queue worker started (concurrency: 1)');

  // Payment processing worker
  paymentQueue.process('*', 5, async (job) => {
    console.log(`💳 Processing payment job: ${job.id}`);
    // TODO: Implement payment processing
    return { success: true };
  });
  console.log('✅ Payment queue worker started (concurrency: 5)');

  console.log('🎉 All queue workers started successfully!\n');
};

/**
 * Get worker status
 */
export const getWorkersStatus = () => {
  return {
    orderQueue: {
      name: 'Order Processing',
      concurrency: 5,
      running: true,
    },
    emailQueue: {
      name: 'Email Notifications',
      concurrency: 10,
      running: true,
    },
    smsQueue: {
      name: 'SMS Notifications',
      concurrency: 5,
      running: true,
    },
    subscriptionQueue: {
      name: 'Subscription Processing',
      concurrency: 3,
      running: true,
    },
    cleanupQueue: {
      name: 'Database Cleanup',
      concurrency: 1,
      running: true,
    },
    paymentQueue: {
      name: 'Payment Processing',
      concurrency: 5,
      running: true,
    },
  };
};

export default {
  startQueueWorkers,
  getWorkersStatus,
};


