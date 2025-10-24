import { Request, Response, NextFunction } from 'express';

/**
 * Performance monitoring middleware
 * Tracks API response times, slow queries, and performance metrics
 */

interface PerformanceMetrics {
  totalRequests: number;
  slowRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Map<string, number>;
  slowEndpoints: Map<string, number[]>;
}

const metrics: PerformanceMetrics = {
  totalRequests: 0,
  slowRequests: 0,
  averageResponseTime: 0,
  requestsByEndpoint: new Map(),
  slowEndpoints: new Map(),
};

// Threshold for slow requests (in milliseconds)
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const WARNING_THRESHOLD = 500; // 500ms

/**
 * Main performance monitoring middleware
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.path}`;

  // Track request count
  metrics.totalRequests++;
  metrics.requestsByEndpoint.set(
    endpoint,
    (metrics.requestsByEndpoint.get(endpoint) || 0) + 1
  );

  // Override res.json to measure response time
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    // Update average response time
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + duration) /
      metrics.totalRequests;

    // Log performance
    logPerformance(req, res, duration);

    // Track slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      metrics.slowRequests++;
      trackSlowEndpoint(endpoint, duration);
      console.warn(
        `🐌 SLOW REQUEST: ${endpoint} took ${duration}ms | IP: ${req.ip} | User: ${(req as any).userId || 'anonymous'}`
      );
    } else if (duration > WARNING_THRESHOLD) {
      console.warn(`⚠️ SLOW: ${endpoint} took ${duration}ms`);
    }

    return originalJson(data);
  };

  next();
};

/**
 * Log request performance
 */
const logPerformance = (req: Request, res: Response, duration: number) => {
  const logLevel = duration > SLOW_REQUEST_THRESHOLD ? '🔴' : duration > WARNING_THRESHOLD ? '🟡' : '🟢';
  
  const log = {
    level: logLevel,
    method: req.method,
    path: req.path,
    duration: `${duration}ms`,
    status: res.statusCode,
    ip: req.ip,
    userAgent: req.get('user-agent')?.substring(0, 50),
    userId: (req as any).userId || 'anonymous',
    timestamp: new Date().toISOString(),
  };

  // Only log in development or for slow requests
  if (process.env.NODE_ENV === 'development' || duration > WARNING_THRESHOLD) {
    console.log(`${logLevel} ${log.method} ${log.path} - ${log.duration} [${log.status}]`);
  }
};

/**
 * Track slow endpoints
 */
const trackSlowEndpoint = (endpoint: string, duration: number) => {
  if (!metrics.slowEndpoints.has(endpoint)) {
    metrics.slowEndpoints.set(endpoint, []);
  }
  
  const durations = metrics.slowEndpoints.get(endpoint)!;
  durations.push(duration);
  
  // Keep only last 100 slow requests per endpoint
  if (durations.length > 100) {
    durations.shift();
  }
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = () => {
  const slowEndpointsArray = Array.from(metrics.slowEndpoints.entries())
    .map(([endpoint, durations]) => ({
      endpoint,
      count: durations.length,
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      maxDuration: Math.max(...durations),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 slow endpoints

  const topEndpoints = Array.from(metrics.requestsByEndpoint.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 most requested endpoints

  return {
    totalRequests: metrics.totalRequests,
    slowRequests: metrics.slowRequests,
    slowRequestPercentage: ((metrics.slowRequests / metrics.totalRequests) * 100).toFixed(2) + '%',
    averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
    topEndpoints,
    slowEndpoints: slowEndpointsArray,
    memoryUsage: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    },
    uptime: Math.round(process.uptime()) + ' seconds',
  };
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = () => {
  metrics.totalRequests = 0;
  metrics.slowRequests = 0;
  metrics.averageResponseTime = 0;
  metrics.requestsByEndpoint.clear();
  metrics.slowEndpoints.clear();
  console.log('📊 Performance metrics reset');
};

/**
 * Middleware to track database query time
 */
export const trackQueryTime = (queryName: string) => {
  const startTime = Date.now();
  
  return () => {
    const duration = Date.now() - startTime;
    
    if (duration > 100) {
      console.warn(`🔍 SLOW QUERY: ${queryName} took ${duration}ms`);
    }
    
    return duration;
  };
};

export default {
  performanceMonitor,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  trackQueryTime,
};


