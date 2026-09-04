/**
 * Global API Error Handler Wrapper
 * Provides consistent error responses across all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface APIErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export interface APISuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

/**
 * Wrap API route handler with global error handling
 */
export function withErrorHandler<T = any>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<APIResponse<T>>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<APIResponse<T>>> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      // Log error (in production, use proper logging service)
      console.error('API Error:', error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          } as APIErrorResponse,
          { status: 400 }
        );
      }

      // Handle known error types
      if (error instanceof Error) {
        // Don't expose internal errors in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        const message = isDevelopment ? error.message : 'An internal error occurred';

        return NextResponse.json(
          {
            success: false,
            error: message,
          } as APIErrorResponse,
          { status: 500 }
        );
      }

      // Unknown error
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred',
        } as APIErrorResponse,
        { status: 500 }
      );
    }
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    } as APIErrorResponse,
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<APISuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    } as APISuccessResponse<T>,
    { status }
  );
}

