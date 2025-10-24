import Queue from 'bull';
import { getRedisClient } from '../config/redis';

/**
 * Queue Configuration for Background Job Processing
 * Uses Bull with Redis backend for distributed job processing
 */

// Redis connection options for Bull
const getRedisConnection = () => {
  const redis = getRedisClient();
  
  if (redis && redis.status === 'ready') {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    };
  }
  
  // Fallback to default connection
  return {
    host: 'localhost',
    port: 6379,
  };
};

// Default queue options
const defaultQueueOptions = {
  redis: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs for debugging
  },
};

/**
 * Order Processing Queue
 * Handles async order creation and processing
 */
export const orderQueue = new Queue('order-processing', {
  ...defaultQueueOptions,
  limiter: {
    max: 100, // Process max 100 jobs
    duration: 1000, // per second
  },
});

/**
 * Email Notification Queue
 * Handles sending emails asynchronously
 */
export const emailQueue = new Queue('email-notifications', {
  ...defaultQueueOptions,
  limiter: {
    max: 50, // Max 50 emails
    duration: 1000, // per second
  },
});

/**
 * SMS Notification Queue
 * Handles sending SMS asynchronously
 */
export const smsQueue = new Queue('sms-notifications', {
  ...defaultQueueOptions,
  limiter: {
    max: 30, // Max 30 SMS
    duration: 1000, // per second (rate limit for provider)
  },
});

/**
 * Subscription Processing Queue
 * Handles subscription renewals and updates
 */
export const subscriptionQueue = new Queue('subscription-processing', {
  ...defaultQueueOptions,
  limiter: {
    max: 50,
    duration: 1000,
  },
});

/**
 * Database Cleanup Queue
 * Handles periodic cleanup tasks
 */
export const cleanupQueue = new Queue('database-cleanup', {
  ...defaultQueueOptions,
  limiter: {
    max: 10,
    duration: 60000, // 10 jobs per minute
  },
});

/**
 * Payment Processing Queue
 * Handles payment verification and processing
 */
export const paymentQueue = new Queue('payment-processing', {
  ...defaultQueueOptions,
  limiter: {
    max: 100,
    duration: 1000,
  },
});

// Event handlers for all queues with proper logging
const setupQueueEvents = (queue: Queue.Queue, queueName: string) => {
  queue.on('completed', (job) => {
    console.log(`✅ [${queueName}] Job ${job.id} completed`);
    // TODO: Add logger.info when logger is initialized
  });

  queue.on('failed', (job, err) => {
    // Silently handle connection errors (including AggregateErrors)
    const isConnectionError = 
      err.message?.includes('ECONNREFUSED') || 
      err.message?.includes('connect') ||
      (err as any).code === 'ECONNREFUSED' ||
      (err as any).errors?.some((e: any) => e.code === 'ECONNREFUSED');
    
    // Only log non-connection errors
    if (!isConnectionError) {
      console.error(`❌ [${queueName}] Job ${job?.id} failed:`, err.message);
    }
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️ [${queueName}] Job ${job.id} stalled`);
    // TODO: Add logger.warn when logger is initialized
  });

  queue.on('error', (error) => {
    // Silently handle queue errors when Redis is not available
    // Check for connection errors in both regular errors and AggregateErrors
    const isConnectionError = 
      error.message?.includes('ECONNREFUSED') || 
      error.message?.includes('connect') ||
      error.code === 'ECONNREFUSED' ||
      (error as any).errors?.some((e: any) => e.code === 'ECONNREFUSED');
    
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
    { name: 'order', queue: orderQueue },
    { name: 'email', queue: emailQueue },
    { name: 'sms', queue: smsQueue },
    { name: 'subscription', queue: subscriptionQueue },
    { name: 'cleanup', queue: cleanupQueue },
    { name: 'payment', queue: paymentQueue },
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
        total: waiting + active + completed + failed + delayed,
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

