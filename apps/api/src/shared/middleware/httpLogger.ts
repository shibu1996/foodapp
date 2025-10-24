import { Request, Response, NextFunction } from 'express';
import { logHttpRequest } from '../utils/logger';

/**
 * HTTP Request Logger Middleware
 * Logs all HTTP requests with response time
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to log after response
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    const responseTime = Date.now() - startTime;

    // Log the request
    logHttpRequest(req, res, responseTime);

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

export default httpLogger;


