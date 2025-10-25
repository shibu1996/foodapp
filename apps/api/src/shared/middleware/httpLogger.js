import { logHttpRequest } from '../utils/logger.js';

/**
 * HTTP Request Logger Middleware
 * Logs all HTTP requests with response time
 */
export const httpLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to log after response
  res.end = function (chunk, encoding, callback) {
    const responseTime = Date.now() - startTime;

    // Log the request
    logHttpRequest(req, res, responseTime);

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

export default httpLogger;

