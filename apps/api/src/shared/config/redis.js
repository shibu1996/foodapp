import Redis from 'ioredis';

// Redis configuration for high-performance caching (1L+ users)
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  
  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Performance optimizations
  lazyConnect: false,
  keepAlive: 30000,
  connectTimeout: 10000,
  
  // Retry strategy - stop after 3 attempts to avoid spam
  retryStrategy: (times) => {
    if (times > 3) {
      console.log('💡 Redis not available - App will work without caching (this is OK!)');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Reconnect on error
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect if Redis is in readonly mode
    }
    return false;
  },
};

// Create Redis client instance
let redisClient = null;

/**
 * Initialize Redis connection
 */
export const connectRedis = async () => {
  try {
    if (redisClient && redisClient.status === 'ready') {
      return redisClient;
    }

    redisClient = new Redis(redisOptions);

    // Event handlers
    redisClient.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected successfully');
      console.log(`📊 Redis host: ${redisOptions.host}:${redisOptions.port}`);
    });

    redisClient.on('error', (err) => {
      // Only log once to avoid spam
      if (!redisClient || redisClient.status === 'connecting') {
        // Silently handle - app works without Redis
      }
    });

    redisClient.on('close', () => {
      // Silently handle close
    });

    redisClient.on('reconnecting', () => {
      // Silently handle reconnection attempts
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.quit();
        console.log('🔌 Redis connection closed through app termination');
      }
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
  return redisClient;
};

/**
 * Check Redis connection status
 */
export const getRedisStatus = () => {
  if (!redisClient) {
    return {
      isConnected: false,
      status: 'not_initialized',
    };
  }

  return {
    isConnected: redisClient.status === 'ready',
    status: redisClient.status,
  };
};

/**
 * Ping Redis to check connectivity
 */
export const pingRedis = async () => {
  try {
    if (!redisClient) return false;
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
};

export default redisClient;

