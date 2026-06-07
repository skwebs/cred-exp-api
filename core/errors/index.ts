import { ZodError } from 'zod';
import { ApiResponse } from '../responses';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return ApiResponse.error(error.message, error.statusCode, error.errors);
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.flatten().fieldErrors as Record<string, string[]>;
    return ApiResponse.validationError(formattedErrors);
  }

  if (error instanceof Error) {
    return ApiResponse.error(error.message, 500);
  }

  return ApiResponse.error('Internal Server Error', 500);
}
