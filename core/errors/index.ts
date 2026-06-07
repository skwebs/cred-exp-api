import { ZodError } from 'zod';

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
    return Response.json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.flatten().fieldErrors;
    return Response.json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    }, { status: 400 });
  }

  if (error instanceof Error) {
    return Response.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }

  return Response.json({
    success: false,
    message: 'Internal Server Error',
  }, { status: 500 });
}
