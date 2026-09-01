import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse, QueryParams } from '../../types/api';

export abstract class BaseApiService {
  protected readonly http: AxiosInstance;
  protected readonly basePath: string;

  constructor(http: AxiosInstance, basePath: string) {
    this.http = http;
    this.basePath = basePath;
  }

  protected async get<T>(path = '', config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<any>(`${this.basePath}${path}`, config);
    return response.data?.data !== undefined ? response.data.data : response.data;
  }

  protected async getPaginated<T>(
    path = '',
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.http.get<any>(`${this.basePath}${path}`, {
      ...config,
      params: { ...params, ...config?.params },
    });

    const rawData = response.data?.data !== undefined ? response.data.data : (Array.isArray(response.data) ? response.data : []);
    const pagination = response.data?.pagination || response.data?.meta || {};

    const items = Array.isArray(rawData) ? rawData : [];

    return {
      items,
      meta: {
        page: Number(pagination.page || 1),
        limit: Number(pagination.limit || 10),
        totalItems: Number(pagination.total || items.length),
        totalPages: Number(pagination.total_pages || Math.ceil(items.length / 10) || 1),
        hasNextPage: Boolean(pagination.has_next),
        hasPrevPage: Boolean(pagination.has_prev),
      },
    };
  }

  protected async post<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<any>(`${this.basePath}${path}`, data, config);
    return response.data?.data !== undefined ? response.data.data : response.data;
  }

  protected async put<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<any>(`${this.basePath}${path}`, data, config);
    return response.data?.data !== undefined ? response.data.data : response.data;
  }

  protected async patch<T, D = unknown>(path = '', data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.patch<any>(`${this.basePath}${path}`, data, config);
    return response.data?.data !== undefined ? response.data.data : response.data;
  }

  protected async delete<T>(path = '', config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<any>(`${this.basePath}${path}`, config);
    return response.data?.data !== undefined ? response.data.data : response.data;
  }
}
