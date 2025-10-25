import Queue from 'bull';
import { getRedisClient } from '../config/redis.js';

/**
 * Queue Configuration for Background Job Processing
 * Uses Bull with Redis backend for distributed job processing
 */

// Redis connection options for Bull
const getRedisConnection = () => {
  const redis = getRedisClient();
  
  if (redis && redis.status === 'ready') {
    return {
      host.env.REDIS_HOST || 'localhost',
      port(process.env.REDIS_PORT || '6379'),
      password.env.REDIS_PASSWORD || undefined,
    };
  }
  
  // Fallback to default connection
  return {
    host: 'localhost',
    port,
  };
};

// Default queue options
const defaultQueueOptions = {
  redis(),
  defaultJobOptions: {
    attempts, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay, // Start with 2 seconds delay
    },
    removeOnComplete, // Keep last 100 completed jobs
    removeOnFail, // Keep last 500 failed jobs for debugging
  },
};

/**
 * Order Processing Queue
 * Handles async order creation and processing
 */
export const orderQueue = new Queue('order-processing', {
  ...defaultQueueOptions,
  limiter: {
    max, // Process max 100 jobs
    duration, // per second
  },
});

/**
 * Email Notification Queue
 * Handles sending emails asynchronously
 */
export const emailQueue = new Queue('email-notifications', {
  ...defaultQueueOptions,
  limiter: {
    max, // Max 50 emails
    duration, // per second
  },
});

/**
 * SMS Notification Queue
 * Handles sending SMS asynchronously
 */
export const smsQueue = new Queue('sms-notifications', {
  ...defaultQueueOptions,
  limiter: {
    max, // Max 30 SMS
    duration, // per second (rate limit for provider)
  },
});

/**
 * Subscription Processing Queue
 * Handles subscription renewals and updates
 */
export const subscriptionQueue = new Queue('subscription-processing', {
  ...defaultQueueOptions,
  limiter: {
    max,
    duration,
  },
});

/**
 * Database Cleanup Queue
 * Handles periodic cleanup tasks
 */
export const cleanupQueue = new Queue('database-cleanup', {
  ...defaultQueueOptions,
  limiter: {
    max,
    duration, // 10 jobs per minute
  },
});

/**
 * Payment Processing Queue
 * Handles payment verification and processing
 */
export const paymentQueue = new Queue('payment-processing', {
  ...defaultQueueOptions,
  limiter: {
    max,
    duration,
  },
});

// Event handlers for all queues with proper logging
const setupQueueEvents = (queue.Queue, queueName) => {
  queue.on('completed', (job) => {
    console.log(`✅ [${queueName}] Job ${job.id} completed`);
    // TODO logger.info when logger is initialized
  });

  queue.on('failed', (job, err) => {
    // Silently handle connection errors (including AggregateErrors)
    const isConnectionError = 
      err.message?.includes('ECONNREFUSED') || 
      err.message?.includes('connect') ||
      (err).code === 'ECONNREFUSED' ||
      (err).errors?.some((e) => e.code === 'ECONNREFUSED');
    
    // Only log non-connection errors
    if (!isConnectionError) {
      console.error(`❌ [${queueName}] Job ${job?.id} failed:`, err.message);
    }
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️ [${queueName}] Job ${job.id} stalled`);
    // TODO logger.warn when logger is initialized
  });

  queue.on('error', (error) => {
    // Silently handle queue errors when Redis is not available
    // Check for connection errors in both regular errors and AggregateErrors
    const isConnectionError = 
      error.message?.includes('ECONNREFUSED') || 
      error.message?.includes('connect') ||
      error.code === 'ECONNREFUSED' ||
      (error).errors?.some((e) => e.code === 'ECONNREFUSED');
    
    // Only log non-connection errors
    if (!isConnectionError) {
      console.error(`🔥 [${queueName}] Queue error:`, error.message);
    }
  });

  queue.on('waiting', (jobId) => {
    // Only log in debug mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`⏳ [${queueName}] Job ${jobId} is waiting`);
    }
  });

  queue.on('active', (job) => {
    // Only log in debug mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔄 [${queueName}] Job ${job.id} is active`);
    }
  });
};

// Setup events for all queues
setupQueueEvents(orderQueue, 'Order');
setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(smsQueue, 'SMS');
setupQueueEvents(subscriptionQueue, 'Subscription');
setupQueueEvents(cleanupQueue, 'Cleanup');
setupQueueEvents(paymentQueue, 'Payment');

/**
 * Graceful shutdown for all queues
 */
export const closeAllQueues = async () => {
  console.log('Closing all queues...');
  
  await Promise.all([
    orderQueue.close(),
    emailQueue.close(),
    smsQueue.close(),
    subscriptionQueue.close(),
    cleanupQueue.close(),
    paymentQueue.close(),
  ]);
  
  console.log('✅ All queues closed');
};

// Handle process termination
process.on('SIGTERM', closeAllQueues);
process.on('SIGINT', closeAllQueues);

/**
 * Get queue health status
 */
export const getQueuesHealth = async () => {
  const queues = [
    { name: 'order', queue },
    { name: 'email', queue },
    { name: 'sms', queue },
    { name: 'subscription', queue },
    { name: 'cleanup', queue },
    { name: 'payment', queue },
  ];

  const healthData = await Promise.all(
    queues.map(async ({ name, queue }) => {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      return {
        name,
        waiting,
        active,
        completed,
        failed,
        delayed,
        total + active + completed + failed + delayed,
      };
    })
  );

  return healthData;
};

export default {
  orderQueue,
  emailQueue,
  smsQueue,
  subscriptionQueue,
  cleanupQueue,
  paymentQueue,
  closeAllQueues,
  getQueuesHealth,
};

