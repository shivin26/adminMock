import type { AxiosError } from 'axios';

export interface AppError {
  message: string;
  statusCode?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  originalError?: unknown;
}

export class ErrorHandler {
  public static handle(error: unknown): AppError {
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'GENERIC_ERROR',
        originalError: error,
      };
    }
    return {
      message: 'An unexpected system error occurred.',
      code: 'UNKNOWN_ERROR',
      originalError: error,
    };
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError)?.isAxiosError === true;
  }

  private static handleAxiosError(error: AxiosError<any>): AppError {
    const status = error.response?.status;
    const data = error.response?.data;

    const baseError: AppError = {
      statusCode: status,
      code: data?.code || `HTTP_${status || 'NETWORK'}`,
      fieldErrors: data?.errors,
      originalError: error,
      message: data?.message || error.message || 'Network request failed',
    };

    switch (status) {
      case 400:
        return { ...baseError, message: data?.message || 'Invalid request inputs.' };
      case 401:
        return { ...baseError, message: 'Authentication required or session expired.' };
      case 403:
        return { ...baseError, message: 'Access forbidden for your permission role.' };
      case 404:
        return { ...baseError, message: 'Requested resource not found.' };
      case 429:
        return { ...baseError, message: 'Rate limit exceeded. Please try again later.' };
      case 500:
      case 502:
      case 503:
        return { ...baseError, message: 'Internal server error. Please try again later.' };
      default:
        return baseError;
    }
  }
}
