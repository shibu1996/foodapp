import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase, getConnectionStatus } from './shared/config/database.js';
import { connectRedis, getRedisStatus } from './shared/config/redis.js';
import { cacheService } from './shared/services/cacheService.js';
import authRoutes from './shared/routes/authRoutes.js';
import productRoutes from './modules/food/routes/productRoutes.js';
import categoryRoutes from './modules/food/routes/categoryRoutes.js';
import orderRoutes from './modules/food/routes/orderRoutes.js';
import subscriptionRoutes from './modules/food/routes/subscriptionRoutes.js';
import planRoutes from './modules/food/routes/planRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware (protects against common vulnerabilities)
app.use(helmet());

// CORS middleware
app.use(cors());

// Compression middleware (reduces response size by ~70%)
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request logging (Winston)
import httpLogger from './shared/middleware/httpLogger.js';
app.use(httpLogger);

// Performance monitoring (track response times & slow queries)
import { performanceMonitor, getPerformanceMetrics } from './shared/middleware/performanceMonitor.js';
app.use(performanceMonitor);

// Input validation and sanitization (prevents injection attacks)
import { sanitizeBody, sanitizeQuery, antiInjection } from './shared/middleware/validation.js';
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(antiInjection);

// Global rate limiting (apply to all routes except health checks)
import { apiLimiter } from './shared/middleware/rateLimit.js';
app.use(apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/food/products', productRoutes);
app.use('/api/food/categories', categoryRoutes);
app.use('/api/food/orders', orderRoutes);
app.use('/api/food/subscriptions', subscriptionRoutes);
app.use('/api/food/plans', planRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API is running' });
});

// Detailed health check (for load balancers & monitoring)
app.get('/health/detailed', async (req, res) => {
  const dbStatus = getConnectionStatus();
  const redisStatus = getRedisStatus();
  const cacheStats = await cacheService.getStats();
  const perfMetrics = getPerformanceMetrics();

  const isHealthy = dbStatus.isConnected && redisStatus.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        connected: dbStatus.isConnected,
        poolSize: dbStatus.poolSize,
        currentConnections: dbStatus.currentConnections,
      },
      redis: {
        connected: redisStatus.isConnected,
        status: redisStatus.status,
      },
      cache: {
        available: cacheStats.available,
        keysCount: cacheStats.keysCount || 0,
      },
    },
    performance: {
      totalRequests: perfMetrics.totalRequests,
      averageResponseTime: perfMetrics.averageResponseTime,
      slowRequests: perfMetrics.slowRequests,
      slowRequestPercentage: perfMetrics.slowRequestPercentage,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
  });
});

// Performance metrics endpoint (admin only in production)
app.get('/health/performance', (req, res) => {
  res.json(getPerformanceMetrics());
});

// Queue health check endpoint
app.get('/health/queues', async (req, res) => {
  try {
    const { getQueuesHealth } = await import('./shared/queue/queueConfig.js');
    const { getWorkersStatus } = await import('./shared/queue/workers.js');
    
    const queuesHealth = await getQueuesHealth();
    const workersStatus = getWorkersStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queues: queuesHealth,
      workers: workersStatus,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: 'Queue system not initialized',
      message: error.message,
    });
  }
});

const startServer = async () => {
  // Initialize Logger once at the start
  const logger = (await import('./shared/utils/logger.js')).default;
  
  try {
    logger.info('🚀 Starting server...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize Database
    await connectDatabase();
    
    // Initialize Redis (non-blocking - app works without Redis)
    let redisAvailable = false;
    try {
      await connectRedis();
      await cacheService.initialize();
      redisAvailable = true;
      console.log('✅ Cache system initialized');
    } catch (redisError) {
      console.warn('⚠️ Redis not available - running without cache');
      console.warn('   (App will work fine, but may be slower under high load)');
    }

    // Start Queue Workers ONLY if Redis is available (background job processing)
    if (redisAvailable) {
      try {
        const { startQueueWorkers } = await import('./shared/queue/workers.js');
        startQueueWorkers();
      } catch (queueError) {
        console.warn('⚠️ Queue workers failed to start');
      }
    } else {
      console.warn('⚠️ Queue workers skipped - Redis required for background jobs');
      console.warn('   (Orders, emails, etc. will be processed synchronously)');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health/detailed`);
      console.log(`📊 Queue health: http://localhost:${PORT}/health/queues\n`);
      
      logger.info(`Server started successfully on port ${PORT}`);
      logger.info(`Health endpoint: http://localhost:${PORT}/health/detailed`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

