// services/api/client.ts

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from './config';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        // Add timestamp to prevent caching
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.clearToken();
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(this.formatError(error));
        }
        
        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response.data?.message);
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error:', error.message);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: any): ApiError {
    // Response error (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      return {
        message: data?.message || data?.error || this.getErrorMessage(status),
        status,
        code: data?.code,
        details: data?.details,
      };
    }
    
    // Request error (network issue)
    if (error.request) {
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }
    
    // Unknown error
    return {
      message: error.message || 'Unknown Error',
      status: 0,
      code: 'UNKNOWN_ERROR',
    };
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Yêu cầu không hợp lệ';
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return 'Đã xảy ra lỗi';
    }
  }

  // ==================== AUTH METHODS ====================
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ==================== HTTP METHODS ====================
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== PAGINATED REQUESTS ====================
  async getPaginated<T>(
    url: string, 
    params?: { page?: number; limit?: number; [key: string]: any }
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.client.get<PaginatedResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== FILE UPLOAD ====================
  async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== MULTIPLE FILE UPLOAD ====================
  async uploadFiles<T>(
    url: string, 
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== BATCH REQUESTS ====================
  async batch<T>(requests: Promise<any>[]): Promise<T[]> {
    try {
      const results = await Promise.allSettled(requests);
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Batch request ${index} failed:`, result.reason);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      throw error;
    }
  }

  // ==================== RETRY LOGIC ====================
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Wait before retry
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;