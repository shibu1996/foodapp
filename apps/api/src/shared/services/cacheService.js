import { getRedisClient } from '../config/redis.js';

/**
 * High-performance Cache Service for 1L+ users
 * Handles caching with Redis, fallback strategies, and TTL management
 */
class CacheService {
  isRedisAvailable = false;

  /**
   * Initialize cache service and check Redis availability
   */
  async initialize() {
    const redis = getRedisClient();
    this.isRedisAvailable = redis?.status === 'ready';
    if (!this.isRedisAvailable) {
      console.warn('⚠️ Redis not available, caching disabled');
    }
    return this.isRedisAvailable;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (!this.isRedisAvailable) return null;

      const redis = getRedisClient();
      if (!redis) return null;

      const data = await redis.get(key);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (Time To Live in seconds)
   */
  async set(key, value, ttl = 3600) {
    try {
      if (!this.isRedisAvailable) return false;

      const redis = getRedisClient();
      if (!redis) return false;

      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  async delete(key) {
    try {
      if (!this.isRedisAvailable) return false;

      const redis = getRedisClient();
      if (!redis) return false;

      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * Example: deletePattern('products:*') deletes all product caches
   */
  async deletePattern(pattern) {
    try {
      if (!this.isRedisAvailable) return false;

      const redis = getRedisClient();
      if (!redis) return false;

      // Scan and delete keys matching pattern
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');

      return true;
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key) {
    try {
      if (!this.isRedisAvailable) return false;

      const redis = getRedisClient();
      if (!redis) return false;

      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key (in seconds)
   */
  async ttl(key) {
    try {
      if (!this.isRedisAvailable) return -1;

      const redis = getRedisClient();
      if (!redis) return -1;

      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Get or Set pattern - Fetch from cache, or execute function and cache result
   */
  async getOrSet(key, fetchFunction, ttl = 3600) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, execute function
      const data = await fetchFunction();

      // Cache the result
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error(`Cache GET_OR_SET error for key ${key}:`, error);
      // If caching fails, still return the data
      return await fetchFunction();
    }
  }

  /**
   * Flush all cache (use carefully!)
   */
  async flushAll() {
    try {
      if (!this.isRedisAvailable) return false;

      const redis = getRedisClient();
      if (!redis) return false;

      await redis.flushdb();
      console.log('🗑️ Cache flushed successfully');
      return true;
    } catch (error) {
      console.error('Cache FLUSH error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (!this.isRedisAvailable) {
        return { available: false };
      }

      const redis = getRedisClient();
      if (!redis) return { available: false };

      const info = await redis.info('stats');
      const dbSize = await redis.dbsize();

      return {
        available: true,
        keysCount: dbSize,
        info: info,
      };
    } catch (error) {
      console.error('Cache STATS error:', error);
      return { available: false, error };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key generators for consistency
export const CacheKeys = {
  // Product caching
  allProducts: () => 'products:all',
  productById: (id) => `product:${id}`,
  productsByCategory: (category) => `products:category:${category}`,
  
  // Category caching
  allCategories: () => 'categories:all',
  categoryBySlug: (slug) => `category:slug:${slug}`,
  
  // User caching
  userById: (id) => `user:${id}`,
  userSession: (id) => `session:${id}`,
  
  // Order caching
  userOrders: (userId) => `orders:user:${userId}`,
  orderById: (id) => `order:${id}`,
  
  // Subscription caching
  userSubscriptions: (userId) => `subscriptions:user:${userId}`,
  subscriptionById: (id) => `subscription:${id}`,
  
  // Stats caching
  productStats: () => 'stats:products',
  orderStats: () => 'stats:orders',
  subscriptionStats: () => 'stats:subscriptions',
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
};

