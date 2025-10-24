import { Request, Response, NextFunction } from 'express';

/**
 * Input validation and sanitization middleware
 * Protects against injection attacks and malformed data
 */

/**
 * Sanitize string input - remove potentially harmful characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 1000); // Limit length
};

/**
 * Validate and sanitize phone number (Indian format)
 */
export const validatePhone = (phone: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!phone) {
    return { valid: false, sanitized: '', error: 'Phone number is required' };
  }

  // Remove all non-numeric characters
  const sanitized = phone.replace(/\D/g, '');

  // Check if it's a valid Indian phone number (10 digits, starts with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  
  if (!phoneRegex.test(sanitized)) {
    return { 
      valid: false, 
      sanitized: '', 
      error: 'Invalid phone number. Must be 10 digits starting with 6-9' 
    };
  }

  return { valid: true, sanitized };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!email) {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized: '', error: 'Invalid email format' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Sanitize object - recursively sanitize all string fields
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Validate required fields in request body
 */
export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];

    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate ObjectId parameter
 */
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || !validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

/**
 * Validate price (must be positive number)
 */
export const validatePrice = (price: any): { valid: boolean; error?: string } => {
  const num = parseFloat(price);
  
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }

  return { valid: true };
};

/**
 * Validate quantity (must be positive integer)
 */
export const validateQuantity = (quantity: any): { valid: boolean; error?: string } => {
  const num = parseInt(quantity, 10);
  
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return { valid: false, error: 'Quantity must be a positive integer' };
  }

  return { valid: true };
};

/**
 * Prevent SQL/NoSQL injection by checking for suspicious patterns
 */
export const detectInjection = (input: string): boolean => {
  const suspiciousPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$or|\$and)/i, // MongoDB operators
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL keywords
    /[;'"\\]/g, // Dangerous characters
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Middleware to detect and block injection attempts
 */
export const antiInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkObject = (obj: any, path: string = ''): boolean => {
    if (typeof obj === 'string') {
      if (detectInjection(obj)) {
        console.warn(`🚨 Injection attempt detected in ${path}: ${obj.substring(0, 50)}`);
        return true;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (checkObject(obj[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check body
  if (req.body && checkObject(req.body, 'body')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected. Please check your data.',
    });
  }

  // Check query
  if (req.query && checkObject(req.query, 'query')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters detected.',
    });
  }

  next();
};

export default {
  sanitizeBody,
  sanitizeQuery,
  validateRequired,
  validateIdParam,
  antiInjection,
  sanitizeString,
  validatePhone,
  validateEmail,
  validateObjectId,
  validatePrice,
  validateQuantity,
};


