import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '../../types/api';

export abstract class BaseApiService {
  protected readonly http: AxiosInstance;
  protected readonly basePath: string;

  constructor(http: AxiosInstance, basePath: string) {
    this.http = http;
    this.basePath = basePath;
  }

  protected async get<T>(path = '', config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<ApiResponse<T>>(`${this.basePath}${path}`, config);
    return response.data.data;
  }

  protected async getPaginated<T>(
    path = '',
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.http.get<ApiResponse<T[]>>(`${this.basePath}${path}`, {
      ...config,
      params: { ...params, ...config?.params },
    });

    return {
      items: response.data.data,
      meta: response.data.meta || {
        page: 1,
        limit: 10,
        totalItems: response.data.data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  protected async post<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<ApiResponse<T>>(`${this.basePath}${path}`, data, config);
    return response.data.data;
  }

  protected async put<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<ApiResponse<T>>(`${this.basePath}${path}`, data, config);
    return response.data.data;
  }

  protected async patch<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.patch<ApiResponse<T>>(`${this.basePath}${path}`, data, config);
    return response.data.data;
  }

  protected async delete<T>(path = '', config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<ApiResponse<T>>(`${this.basePath}${path}`, config);
    return response.data.data;
  }
}
