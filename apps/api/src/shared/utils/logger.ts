import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

/**
 * Winston Logger Configuration
 * Production-grade logging for 1L+ users
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

/**
 * Daily rotation file transport for all logs
 */
const dailyRotateFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Compress old logs
  maxSize: '20m', // Max size per file
  maxFiles: '14d', // Keep logs for 14 days
  format: logFormat,
});

/**
 * Daily rotation file transport for errors only
 */
const errorRotateFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs for 30 days
  level: 'error',
  format: logFormat,
});

/**
 * Daily rotation file transport for HTTP requests
 */
const httpRotateFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'http-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d', // Keep HTTP logs for 7 days
  level: 'http',
  format: logFormat,
});

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs to daily rotation files
    dailyRotateFileTransport,
    errorRotateFileTransport,
    httpRotateFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

/**
 * Log HTTP request
 */
export const logHttpRequest = (req: any, res: any, responseTime: number) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.userId || 'anonymous',
  });
};

/**
 * Log database query
 */
export const logDbQuery = (query: string, duration: number, success: boolean) => {
  const level = duration > 100 ? 'warn' : 'debug';
  
  logger.log(level, 'Database Query', {
    query: query.substring(0, 200), // Limit query length
    duration: `${duration}ms`,
    success,
    slow: duration > 100,
  });
};

/**
 * Log error with context
 */
export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API call to external service
 */
export const logExternalAPI = (service: string, endpoint: string, duration: number, success: boolean) => {
  logger.info('External API Call', {
    service,
    endpoint,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log user action
 */
export const logUserAction = (userId: string, action: string, details?: any) => {
  logger.info('User Action', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log security event
 */
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) => {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  
  logger.log(level, 'Security Event', {
    event,
    severity,
    details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log cache operation
 */
export const logCacheOperation = (operation: 'get' | 'set' | 'delete', key: string, hit: boolean) => {
  logger.debug('Cache Operation', {
    operation,
    key,
    hit,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log queue job
 */
export const logQueueJob = (queue: string, jobId: string, status: 'started' | 'completed' | 'failed', duration?: number) => {
  const level = status === 'failed' ? 'error' : 'info';
  
  logger.log(level, 'Queue Job', {
    queue,
    jobId,
    status,
    duration: duration ? `${duration}ms` : undefined,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log performance metric
 */
export const logPerformanceMetric = (metric: string, value: number, unit: string) => {
  logger.info('Performance Metric', {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString(),
  });
};

// Export logger instance and helper methods
export default logger;

export {
  logger,
  logHttpRequest,
  logDbQuery,
  logError,
  logExternalAPI,
  logUserAction,
  logSecurityEvent,
  logCacheOperation,
  logQueueJob,
  logPerformanceMetric,
};


