/**
 * Custom error classes and error handling utilities
 */

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Transaction Error class for handling transaction-specific errors
 */
export class TransactionError extends Error {
  txHash?: string;
  
  constructor(message: string, txHash?: string) {
    super(message);
    this.name = 'TransactionError';
    this.txHash = txHash;
  }
}

/**
 * Authentication Error class for handling auth-specific errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Format error for API response
 * 
 * @param error - The error to format
 * @returns Formatted error object with status code
 */
export function formatApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }
  
  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }
  
  return {
    error: 'An unknown error occurred',
    statusCode: 500,
  };
}

/**
 * Log error to console with additional context
 * 
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  if (error instanceof Error) {
    console.error(`[${error.name}] ${error.message}`, {
      stack: error.stack,
      ...context,
    });
  } else {
    console.error('Unknown error:', error, context);
  }
}

