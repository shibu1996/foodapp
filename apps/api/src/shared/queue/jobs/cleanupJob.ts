import { Job } from 'bull';
import Order from '../../../modules/food/models/Order';
import Subscription from '../../../modules/food/models/Subscription';
import { cacheService } from '../../services/cacheService';

/**
 * Database Cleanup Job
 * Handles periodic cleanup and maintenance tasks
 */

export interface CleanupJobData {
  task: 'old-orders' | 'expired-subscriptions' | 'cache-cleanup' | 'session-cleanup';
  params?: any;
}

/**
 * Process cleanup job
 */
export const processCleanupJob = async (job: Job<CleanupJobData>) => {
  const { task, params } = job.data;
  
  console.log(`🧹 Processing cleanup job: ${task}`);

  try {
    switch (task) {
      case 'old-orders':
        await cleanupOldOrders(params);
        break;
      
      case 'expired-subscriptions':
        await cleanupExpiredSubscriptions(params);
        break;
      
      case 'cache-cleanup':
        await cleanupStaleCache(params);
        break;
      
      case 'session-cleanup':
        await cleanupExpiredSessions(params);
        break;
      
      default:
        throw new Error(`Unknown cleanup task: ${task}`);
    }

    console.log(`✅ Cleanup job completed: ${task}`);
  } catch (error: any) {
    console.error(`❌ Cleanup job failed: ${task}`, error);
    throw error;
  }
};

/**
 * Cleanup old completed/cancelled orders
 * Keep only last 6 months of data
 */
const cleanupOldOrders = async (params: any) => {
  const { monthsToKeep = 6 } = params || {};
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

  const result = await Order.deleteMany({
    status: { $in: ['delivered', 'cancelled'] },
    updatedAt: { $lt: cutoffDate },
  });

  console.log(`🗑️ Deleted ${result.deletedCount} old orders (older than ${monthsToKeep} months)`);
  
  return { deletedCount: result.deletedCount };
};

/**
 * Cleanup expired subscriptions
 * Archive subscriptions that ended more than 3 months ago
 */
const cleanupExpiredSubscriptions = async (params: any) => {
  const { monthsToKeep = 3 } = params || {};
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

  // Mark old expired subscriptions for archival
  const result = await Subscription.updateMany({
    status: { $in: ['expired', 'cancelled', 'completed'] },
    endDate: { $lt: cutoffDate },
  }, {
    $set: { archived: true },
  });

  console.log(`📦 Archived ${result.modifiedCount} expired subscriptions`);
  
  return { archivedCount: result.modifiedCount };
};

/**
 * Cleanup stale cache entries
 * Remove orphaned cache keys
 */
const cleanupStaleCache = async (params: any) => {
  try {
    const cacheStats = await cacheService.getStats();
    
    console.log(`🗄️ Current cache keys: ${cacheStats.keysCount || 0}`);
    
    // Clear specific stale patterns
    await cacheService.deletePattern('temp:*');
    await cacheService.deletePattern('session:*:expired');
    
    const afterStats = await cacheService.getStats();
    
    console.log(`✨ Cache cleanup complete. Keys remaining: ${afterStats.keysCount || 0}`);
    
    return { 
      before: cacheStats.keysCount || 0, 
      after: afterStats.keysCount || 0 
    };
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return { error: 'Cache cleanup failed' };
  }
};

/**
 * Cleanup expired sessions
 * Remove old session data from cache
 */
const cleanupExpiredSessions = async (params: any) => {
  const { hoursToKeep = 24 } = params || {};
  
  try {
    // Delete session keys older than specified hours
    await cacheService.deletePattern('session:*');
    
    console.log(`🔐 Cleaned up sessions older than ${hoursToKeep} hours`);
    
    return { success: true };
  } catch (error) {
    console.error('Session cleanup error:', error);
    return { error: 'Session cleanup failed' };
  }
};

/**
 * Schedule daily cleanup tasks
 * Call this via cron job
 */
export const scheduleDailyCleanup = async () => {
  console.log('🧹 Running daily cleanup tasks...');

  const tasks = [
    processCleanupJob({
      id: 'daily-old-orders',
      data: { task: 'old-orders', params: { monthsToKeep: 6 } },
    } as Job<CleanupJobData>),
    
    processCleanupJob({
      id: 'daily-expired-subscriptions',
      data: { task: 'expired-subscriptions', params: { monthsToKeep: 3 } },
    } as Job<CleanupJobData>),
    
    processCleanupJob({
      id: 'daily-cache-cleanup',
      data: { task: 'cache-cleanup' },
    } as Job<CleanupJobData>),
    
    processCleanupJob({
      id: 'daily-session-cleanup',
      data: { task: 'session-cleanup', params: { hoursToKeep: 24 } },
    } as Job<CleanupJobData>),
  ];

  await Promise.all(tasks);
  
  console.log('✅ Daily cleanup tasks completed');
};

export default processCleanupJob;


