/**
 * Custom Error Classes for BaZi Core
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  WORKER_ERROR = 'WORKER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class BaziError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'BaziError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }
}