import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';

/**
 * Rate limiting middleware for API protection (1L+ users)
 * Prevents API abuse and DDoS attacks
 */

// Check if Redis is available for distributed rate limiting
const getStore = () => {
  const redis = getRedisClient();
  if (redis && redis.status === 'ready') {
    return new RedisStore({
      client: redis,
      prefix: 'rl:', // Rate limit prefix in Redis
    });
  }
  return undefined; // Falls back to memory store
};

/**
 * General API rate limiter (public endpoints)
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  store: getStore(),
  // Skip rate limiting for health checks
  skip: (req) => req.path.startsWith('/health'),
});

/**
 * Strict rate limiter for auth endpoints
 * Prevents brute force attacks
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 login attempts
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Moderate rate limiter for authenticated users
 * 300 requests per 15 minutes
 */
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Higher limit for authenticated users
  message: {
    success: false,
    error: 'Request limit exceeded. Please slow down.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  // Use user ID as key if available
  keyGenerator: (req) => {
    const user = req.userId || req.user?._id;
    return user ? `user:${user}` : req.ip || 'unknown';
  },
});

/**
 * Very strict rate limiter for write operations (POST/PUT/DELETE)
 * 30 requests per 15 minutes
 */
export const writeOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limited write operations
  message: {
    success: false,
    error: 'Too many write operations. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  // Only apply to POST, PUT, PATCH, DELETE
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
});

/**
 * Admin-specific rate limiter
 * More lenient for admin operations
 * 500 requests per 15 minutes
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for admins
  message: {
    success: false,
    error: 'Admin request limit exceeded.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  keyGenerator: (req) => {
    const user = req.userId || req.user?._id;
    return user ? `admin:${user}` : req.ip || 'unknown';
  },
});

/**
 * Extreme rate limiter for expensive operations
 * Like sending OTP, payment processing
 * 3 requests per 5 minutes
 */
export const expensiveOperationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Very limited
  message: {
    success: false,
    error: 'Too many requests for this operation. Please wait 5 minutes.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
});

/**
 * Search rate limiter
 * Prevents search API abuse
 * 50 searches per 15 minutes
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    error: 'Too many search requests. Please slow down.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
});

// Export all limiters
export default {
  api: apiLimiter,
  auth: authLimiter,
  authenticated: authenticatedLimiter,
  writeOperation: writeOperationLimiter,
  admin: adminLimiter,
  expensiveOperation: expensiveOperationLimiter,
  search: searchLimiter,
};

