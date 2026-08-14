import { AxiosError } from 'axios';
import { ApiError } from '../types/api';

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR', errors?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data as ApiError | undefined;
    const message = data?.message || error.message || 'An unexpected network error occurred.';
    const code = data?.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'API_ERROR');
    const fieldErrors = data?.errors;

    return new AppError(message, status, code, fieldErrors);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, 'UNHANDLED_ERROR');
  }

  return new AppError('An unknown error occurred.', 500, 'UNKNOWN_ERROR');
}

export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}
