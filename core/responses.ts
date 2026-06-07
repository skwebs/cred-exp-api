import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export class ApiResponse {
  static success(data: any, message = 'Operation successful', status = 200) {
    return NextResponse.json({
      success: true,
      message,
      data,
    }, { status });
  }

  static validationError(errors: Record<string, string[]>, message = 'Validation failed') {
    return NextResponse.json({
      success: false,
      message,
      errors,
    }, { status: 400 });
  }

  static error(message: string, status = 500, errors?: any) {
    return NextResponse.json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    }, { status });
  }

  static list(data: any[], pagination: PaginationMeta, message = 'Operation successful') {
    return NextResponse.json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}
