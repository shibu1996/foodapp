import {
  orderQueue,
  emailQueue,
  smsQueue,
  subscriptionQueue,
  cleanupQueue,
  paymentQueue,
} from './queueConfig.js';
import processOrderJob from './jobs/orderJob.js';
import processEmailJob from './jobs/emailJob.js';
import processSMSJob from './jobs/smsJob.js';
import processSubscriptionJob from './jobs/subscriptionJob.js';
import processCleanupJob from './jobs/cleanupJob.js';

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
  console.log('✅ Order queue worker started (concurrency)');

  // Email notification worker
  emailQueue.process('*', 10, processEmailJob); // Process 10 emails concurrently
  console.log('✅ Email queue worker started (concurrency)');

  // SMS notification worker
  smsQueue.process('*', 5, processSMSJob); // Process 5 SMS concurrently
  console.log('✅ SMS queue worker started (concurrency)');

  // Subscription processing worker
  subscriptionQueue.process('*', 3, processSubscriptionJob); // Process 3 concurrently
  console.log('✅ Subscription queue worker started (concurrency)');

  // Cleanup worker (low priority, single instance)
  cleanupQueue.process('*', 1, processCleanupJob);
  console.log('✅ Cleanup queue worker started (concurrency)');

  // Payment processing worker
  paymentQueue.process('*', 5, async (job) => {
    console.log(`💳 Processing payment job: ${job.id}`);
    // TODO payment processing
    return { success };
  });
  console.log('✅ Payment queue worker started (concurrency)');

  console.log('🎉 All queue workers started successfully!\n');
};

/**
 * Get worker status
 */
export const getWorkersStatus = () => {
  return {
    orderQueue: {
      name: 'Order Processing',
      concurrency,
      running,
    },
    emailQueue: {
      name: 'Email Notifications',
      concurrency,
      running,
    },
    smsQueue: {
      name: 'SMS Notifications',
      concurrency,
      running,
    },
    subscriptionQueue: {
      name: 'Subscription Processing',
      concurrency,
      running,
    },
    cleanupQueue: {
      name: 'Database Cleanup',
      concurrency,
      running,
    },
    paymentQueue: {
      name: 'Payment Processing',
      concurrency,
      running,
    },
  };
};

export default {
  startQueueWorkers,
  getWorkersStatus,
};


