import { Response } from 'express';

// ─── Types ───────────────────────────────────────────────────
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
  errors?: Record<string, string>;
  requestId?: string;
  [key: string]: unknown; // Allow extra fields (e.g., status, valid, unreadCount)
}

// ─── Response Helpers ───────────────────────────────────────

/**
 * Send a success response.
 *
 * Handles both:
 *   sendSuccess(res, data)                    → { success: true, data }
 *   sendSuccess(res, data, 'Created')         → { success: true, data, message: 'Created' }
 *   sendSuccess(res, null, 'Deleted')         → { success: true, message: 'Deleted' }
 *   sendSuccess(res, { products, total })     → { success: true, products, total }   (spread)
 *
 * @param res    - Express response object
 * @param data   - Response payload. If an object (not null/undefined), its keys are spread
 *                 into the response body. If null/undefined, only `success` and `message` are sent.
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default 200)
 */
export function sendSuccess<T = unknown>(
  res: Response,
  data: T | null | undefined,
  message?: string,
  statusCode: number = 200
): void {
  const body: ApiResponseBody<T> = { success: true };

  if (message) {
    body.message = message;
  }

  if (data !== null && data !== undefined) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Spread object keys into the response body (e.g., { products, total })
      Object.assign(body, data);
    } else {
      // Wrap arrays and primitives in a `data` key
      body.data = data;
    }
  }

  res.status(statusCode).json(body);
}

/**
 * Send a 201 Created response.
 * Shorthand for sendSuccess(res, data, 'Created', 201).
 */
export function sendCreated<T = unknown>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a 200 Deleted response.
 * Shorthand for sendSuccess(res, null, 'Deleted successfully').
 */
export function sendDeleted(res: Response, message: string = 'Deleted successfully'): void {
  sendSuccess(res, null, message, 200);
}

/**
 * Send a paginated list response.
 *
 * @param res        - Express response object
 * @param data       - Array of items for the current page
 * @param pagination - Pagination metadata
 * @param message    - Optional success message
 */
export function sendPaginated<T = unknown>(
  res: Response,
  data: T[],
  pagination: PaginationInfo,
  message?: string
): void {
  const body: ApiResponseBody<T[]> = {
    success: true,
    data,
    pagination,
  };

  if (message) {
    body.message = message;
  }

  res.status(200).json(body);
}

/**
 * Send an error response.
 *
 * @param res        - Express response object
 * @param message    - Human-readable error description
 * @param statusCode - HTTP status code (default 500)
 * @param errors     - Optional field-level validation errors
 * @param extras     - Optional extra fields merged into response body
 *                     (e.g., `{ requestId, stack }` for debugging)
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string>,
  extras?: Record<string, unknown>
): void {
  const body: ApiResponseBody = {
    success: false,
    message,
  };

  if (errors && Object.keys(errors).length > 0) {
    body.errors = errors;
  }

  if (extras) {
    Object.assign(body, extras);
  }

  res.status(statusCode).json(body);
}
