import { Request } from 'express';

/**
 * Pagination Utility for Large Datasets
 * Supports cursor-based and offset-based pagination
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

/**
 * Parse pagination parameters from request
 */
export const parsePaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20)); // Default 20, max 100
  const cursor = req.query.cursor as string;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

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
export const buildPaginationMeta = <T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number
) => {
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
export const getOffsetPagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

/**
 * Cursor-based pagination helper
 * More efficient for large datasets
 */
export const getCursorPagination = (cursor: string | undefined, limit: number) => {
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
export const generateNextCursor = (lastItem: any): string | undefined => {
  if (!lastItem || !lastItem._id) return undefined;
  return Buffer.from(lastItem._id.toString()).toString('base64');
};

/**
 * Generate previous cursor from first item
 */
export const generatePrevCursor = (firstItem: any): string | undefined => {
  if (!firstItem || !firstItem._id) return undefined;
  return Buffer.from(firstItem._id.toString()).toString('base64');
};

/**
 * Complete pagination helper for Mongoose
 */
export const paginate = async <T>(
  model: any,
  query: any,
  params: PaginationParams
): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  // Get total count (cached for performance)
  const totalItems = await model.countDocuments(query);

  // Get offset
  const { skip, limit: pageLimit } = getOffsetPagination(page, limit);

  // Build sort object
  const sort: any = {};
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
export const paginateWithCursor = async <T>(
  model: any,
  query: any,
  params: PaginationParams
): Promise<PaginationResult<T>> => {
  const { cursor, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  // Get cursor query
  const { query: cursorQuery, limit: pageLimit } = getCursorPagination(cursor, limit);

  // Merge queries
  const finalQuery = { ...query, ...cursorQuery };

  // Build sort object
  const sort: any = {};
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
export const parseFieldFilter = (req: Request): string | undefined => {
  const fields = req.query.fields as string;
  
  if (!fields) return undefined;

  // Convert comma-separated list to space-separated for Mongoose
  // e.g., "name,price,category" -> "name price category"
  return fields.split(',').map(f => f.trim()).join(' ');
};

/**
 * Apply field filtering to query
 */
export const applyFieldFilter = (query: any, fields?: string) => {
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


