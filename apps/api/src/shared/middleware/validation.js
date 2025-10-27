/**
 * Input validation and sanitization middleware
 * Protects against injection attacks and malformed data
 */

/**
 * Sanitize string input - remove potentially harmful characters
 */
export const sanitizeString = (input, isLongText = false) => {
  if (typeof input !== 'string') return '';
  
  // Don't limit length for base64 data or long text fields
  if (isLongText || input.startsWith('data:') || input.length > 1000) {
    return input.trim(); // Just trim, don't replace or limit
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 1000); // Limit length for normal strings
};

/**
 * Validate and sanitize phone number (Indian format)
 */
export const validatePhone = (phone) => {
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
export const validateEmail = (email) => {
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
export const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Sanitize object - recursively sanitize all string fields
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  // Fields that can have long text and should not be truncated
  const longTextFields = ['description', 'image', 'images', 'photo', 'photos', 'url', 'urls', 'avatar', 'content', 'body', 'notes', 'address'];
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Check if this is a long text field
      const isLongText = longTextFields.some(field => key.toLowerCase().includes(field));
      sanitized[key] = sanitizeString(obj[key], isLongText);
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
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Validate required fields in request body
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];

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
export const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
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
export const validatePrice = (price) => {
  const num = parseFloat(price);
  
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }

  return { valid: true };
};

/**
 * Validate quantity (must be positive integer)
 */
export const validateQuantity = (quantity) => {
  const num = parseInt(quantity, 10);
  
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return { valid: false, error: 'Quantity must be a positive integer' };
  }

  return { valid: true };
};

/**
 * Prevent SQL/NoSQL injection by checking for suspicious patterns
 */
export const detectInjection = (input) => {
  const suspiciousPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$or|\$and)/i, // MongoDB operators
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL keywords
    /[;'"\\]/g, // Dangerous characters
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Check if string is base64 encoded data
 */
const isBase64Data = (str) => {
  if (!str || typeof str !== 'string') return false;
  
  // Check if it's a data URL (base64 image/video)
  if (str.startsWith('data:')) {
    return true;
  }
  
  // Check if it looks like base64 (long string with base64 chars)
  if (str.length > 100 && /^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100))) {
    return true;
  }
  
  return false;
};

/**
 * Middleware to detect and block injection attempts
 */
export const antiInjection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    if (typeof obj === 'string') {
      // Skip base64 data and URLs
      if (isBase64Data(obj) || path.includes('image') || path.includes('url') || path.includes('photo') || path.includes('avatar')) {
        return false;
      }
      
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

