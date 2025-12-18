import { API_CONFIG, STORAGE_KEYS } from "../config/api.config";
import type { ApiResponse } from "../types";

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Build request headers
   */
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      ...API_CONFIG.HEADERS,
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || "An error occurred",
          errors: data.errors,
        };
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: response.statusText || "An error occurred",
      };
    }
    
    return {
      status: "success",
      data: null as any,
    };
  }

  /**
   * Generic GET request
   */
  async get<T>(
    endpoint: string,
    requiresAuth: boolean = false,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseUrl}${endpoint}`;
      
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        url += `?${searchParams.toString()}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(requiresAuth),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(requiresAuth),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(requiresAuth),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(
    endpoint: string,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(requiresAuth),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any) {
    if (error.name === "AbortError") {
      return {
        status: "error",
        message: "Request timeout",
      };
    }

    if (error.status) {
      return error;
    }

    return {
      status: "error",
      message: error.message || "Network error occurred",
    };
  }
}

export const apiService = new ApiService();

