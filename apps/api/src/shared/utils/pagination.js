/**
 * Pagination Utility for Large Datasets
 * Supports cursor-based and offset-based pagination
 */

/**
 * Parse pagination parameters from request
 */
export const parsePaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20)); // Default 20, max 100
  const cursor = req.query.cursor;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    cursor,
    sortBy,
    sortOrder,
  };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (data, page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Offset-based pagination helper
 */
export const getOffsetPagination = (page, limit) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

/**
 * Cursor-based pagination helper
 * More efficient for large datasets
 */
export const getCursorPagination = (cursor, limit) => {
  if (!cursor) {
    return { query: {}, limit };
  }

  try {
    // Decode cursor (base64 encoded ID)
    const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
    return {
      query: { _id: { $gt: decodedCursor } },
      limit,
    };
  } catch (error) {
    return { query: {}, limit };
  }
};

/**
 * Generate next cursor from last item
 */
export const generateNextCursor = (lastItem) => {
  if (!lastItem || !lastItem._id) return undefined;
  return Buffer.from(lastItem._id.toString()).toString('base64');
};

/**
 * Generate previous cursor from first item
 */
export const generatePrevCursor = (firstItem) => {
  if (!firstItem || !firstItem._id) return undefined;
  return Buffer.from(firstItem._id.toString()).toString('base64');
};

/**
 * Complete pagination helper for Mongoose
 */
export const paginate = async (model, query, params) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  // Get total count (cached for performance)
  const totalItems = await model.countDocuments(query);

  // Get offset
  const { skip, limit: pageLimit } = getOffsetPagination(page, limit);

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const data = await model
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  // Build metadata
  const pagination = buildPaginationMeta(data, page, limit, totalItems);

  return {
    data,
    pagination,
  };
};

/**
 * Cursor-based pagination for large datasets
 */
export const paginateWithCursor = async (model, query, params) => {
  const { cursor, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  // Get cursor query
  const { query: cursorQuery, limit: pageLimit } = getCursorPagination(cursor, limit);

  // Merge queries
  const finalQuery = { ...query, ...cursorQuery };

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Fetch one extra item to check if there's a next page
  const data = await model
    .find(finalQuery)
    .sort(sort)
    .limit(pageLimit + 1)
    .lean();

  // Check if there's a next page
  const hasNextPage = data.length > pageLimit;
  if (hasNextPage) {
    data.pop(); // Remove the extra item
  }

  // Generate cursors
  const nextCursor = hasNextPage ? generateNextCursor(data[data.length - 1]) : undefined;
  const prevCursor = cursor ? generatePrevCursor(data[0]) : undefined;

  return {
    data,
    pagination: {
      page: 1, // Cursor-based doesn't use page numbers
      limit: pageLimit,
      totalPages: 0, // Not applicable for cursor-based
      totalItems: 0, // Not calculated for performance
      hasNextPage,
      hasPrevPage: !!cursor,
      nextCursor,
      prevCursor,
    },
  };
};

/**
 * Field filtering helper
 * Extract only requested fields from response
 */
export const parseFieldFilter = (req) => {
  const fields = req.query.fields;
  
  if (!fields) return undefined;

  // Convert comma-separated list to space-separated for Mongoose
  // e.g., "name,price,category" -> "name price category"
  return fields.split(',').map(f => f.trim()).join(' ');
};

/**
 * Apply field filtering to query
 */
export const applyFieldFilter = (query, fields) => {
  if (fields) {
    return query.select(fields);
  }
  return query;
};

export default {
  parsePaginationParams,
  buildPaginationMeta,
  getOffsetPagination,
  getCursorPagination,
  generateNextCursor,
  generatePrevCursor,
  paginate,
  paginateWithCursor,
  parseFieldFilter,
  applyFieldFilter,
};

