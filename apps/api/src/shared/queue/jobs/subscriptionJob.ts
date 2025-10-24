import { Job } from 'bull';
import Subscription from '../../../modules/food/models/Subscription';
import { emailQueue, smsQueue } from '../queueConfig';

/**
 * Subscription Processing Job
 * Handles subscription renewals, reminders, and updates
 */

export interface SubscriptionJobData {
  subscriptionId: string;
  action: 'renew' | 'remind' | 'expire' | 'pause' | 'resume';
  data?: any;
}

/**
 * Process subscription job
 */
export const processSubscriptionJob = async (job: Job<SubscriptionJobData>) => {
  const { subscriptionId, action, data } = job.data;
  
  console.log(`🔄 Processing subscription job: ${action} for ${subscriptionId}`);

  try {
    switch (action) {
      case 'renew':
        await handleSubscriptionRenewal(subscriptionId);
        break;
      
      case 'remind':
        await handleSubscriptionReminder(subscriptionId, data);
        break;
      
      case 'expire':
        await handleSubscriptionExpiry(subscriptionId);
        break;
      
      case 'pause':
        await handleSubscriptionPause(subscriptionId, data);
        break;
      
      case 'resume':
        await handleSubscriptionResume(subscriptionId);
        break;
      
      default:
        throw new Error(`Unknown subscription action: ${action}`);
    }

    console.log(`✅ Subscription job completed: ${action} for ${subscriptionId}`);
  } catch (error: any) {
    console.error(`❌ Subscription job failed: ${action} for ${subscriptionId}`, error);
    throw error;
  }
};

/**
 * Handle subscription renewal
 */
const handleSubscriptionRenewal = async (subscriptionId: string) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription || !subscription.autoRenewal) return;

  // Check if subscription is ending soon
  const daysUntilEnd = Math.ceil(
    (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEnd <= 3 && subscription.status === 'active') {
    console.log(`🔄 Auto-renewing subscription ${subscriptionId}`);
    
    // TODO: Process payment for renewal
    // TODO: Extend subscription dates
    
    // Send renewal confirmation
    await emailQueue.add('subscription-renewed', {
      userId: subscription.userId,
      subscriptionId,
      subscriptionNumber: subscription.subscriptionNumber,
      newEndDate: subscription.endDate,
    });
  }
};

/**
 * Handle subscription reminder (before expiry)
 */
const handleSubscriptionReminder = async (subscriptionId: string, data: any) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return;

  const { daysRemaining } = data;

  // Send reminder email
  await emailQueue.add('subscription-reminder', {
    userId: subscription.userId,
    subscriptionId,
    subscriptionNumber: subscription.subscriptionNumber,
    endDate: subscription.endDate,
    daysRemaining,
  });

  // Send SMS for critical reminders (1-3 days)
  if (daysRemaining <= 3) {
    await smsQueue.add('subscription-reminder', {
      phone: subscription.userId.toString(), // TODO: Get user phone
      message: `Your subscription ${subscription.subscriptionNumber} expires in ${daysRemaining} days. Renew now!`,
    });
  }

  console.log(`📧 Reminder sent for subscription ${subscriptionId} (${daysRemaining} days left)`);
};

/**
 * Handle subscription expiry
 */
const handleSubscriptionExpiry = async (subscriptionId: string) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return;

  // Update subscription status
  subscription.status = 'expired';
  subscription.completedAt = new Date();
  await subscription.save();

  // Send expiry notification
  await emailQueue.add('subscription-expired', {
    userId: subscription.userId,
    subscriptionId,
    subscriptionNumber: subscription.subscriptionNumber,
    endDate: subscription.endDate,
  });

  console.log(`⏰ Subscription ${subscriptionId} expired`);
};

/**
 * Handle subscription pause
 */
const handleSubscriptionPause = async (subscriptionId: string, data: any) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return;

  const { reason } = data;

  // Send pause confirmation
  await emailQueue.add('subscription-paused', {
    userId: subscription.userId,
    subscriptionId,
    subscriptionNumber: subscription.subscriptionNumber,
    reason,
  });

  console.log(`⏸️ Subscription ${subscriptionId} paused`);
};

/**
 * Handle subscription resume
 */
const handleSubscriptionResume = async (subscriptionId: string) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return;

  // Send resume confirmation
  await emailQueue.add('subscription-resumed', {
    userId: subscription.userId,
    subscriptionId,
    subscriptionNumber: subscription.subscriptionNumber,
  });

  console.log(`▶️ Subscription ${subscriptionId} resumed`);
};

/**
 * Schedule subscription reminders
 * Call this daily via cron job
 */
export const scheduleSubscriptionReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find subscriptions ending in 1, 3, and 7 days
  const reminderDays = [1, 3, 7];

  for (const days of reminderDays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 59, 999);

    const subscriptions = await Subscription.find({
      status: 'active',
      endDate: {
        $gte: targetDate,
        $lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions ending in ${days} days`);

    // Queue reminders
    for (const sub of subscriptions) {
      await processSubscriptionJob({
        id: `reminder-${sub._id}-${days}`,
        data: {
          subscriptionId: sub._id.toString(),
          action: 'remind',
          data: { daysRemaining: days },
        },
      } as Job<SubscriptionJobData>);
    }
  }
};

export default processSubscriptionJob;


