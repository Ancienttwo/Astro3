'use client';

import { useMutualAidStore } from '@/lib/stores/mutualAidStore';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_TIMEOUT = 30000; // 30 seconds

// Request/Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timeout');
    this.name = 'TimeoutError';
  }
}

// API Client Class
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get current auth token
  private getAuthToken(): string | undefined {
    const state = useMutualAidStore.getState();
    return state.web3.walletAddress; // Use wallet address as auth token
  }

  // Build headers with auth
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const authToken = this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      headers['X-Wallet-Address'] = authToken;
    }

    return headers;
  }

  // Timeout wrapper
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError());
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }

  // Retry wrapper
  private async withRetries<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on 4xx errors (except 408, 429)
        if (error instanceof APIError && error.status) {
          const status = error.status;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw error;
          }
        }

        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  // Core request method
  private async request<T>(
    endpoint: string,
    options: RequestInit & APIRequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      timeout = API_TIMEOUT,
      retries = 3,
      retryDelay = 1000,
      headers: customHeaders,
      signal,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.buildHeaders(customHeaders);

    const executeRequest = async (): Promise<APIResponse<T>> => {
      let response: Response;
      
      try {
        const requestPromise = fetch(url, {
          ...fetchOptions,
          headers,
          signal
        });

        response = await this.withTimeout(requestPromise, timeout);
      } catch (error) {
        if (error instanceof TimeoutError) {
          throw error;
        }
        throw new NetworkError(`Network error: ${error.message}`);
      }

      let responseData: any;
      
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch (error) {
        throw new APIError(`Invalid JSON response: ${error.message}`, response.status);
      }

      if (!response.ok) {
        throw new APIError(
          responseData.error || responseData.message || `HTTP ${response.status}`,
          response.status,
          responseData.code,
          responseData.details
        );
      }

      return {
        success: true,
        ...responseData,
        timestamp: new Date().toISOString()
      };
    };

    return this.withRetries(executeRequest, retries, retryDelay);
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: APIRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: APIRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: APIRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Paginated request
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    options?: APIRequestOptions
  ): Promise<PaginatedResponse<T>> {
    const url = `${endpoint}?page=${page}&limit=${limit}`;
    return this.request<T[]>(url, { ...options, method: 'GET' }) as Promise<PaginatedResponse<T>>;
  }

  // Upload file
  async upload<T>(
    endpoint: string,
    file: File,
    options?: Omit<APIRequestOptions, 'headers'>
  ): Promise<APIResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Don't set Content-Type header for FormData
    const headers = this.buildHeaders();
    delete headers['Content-Type'];

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers
    });
  }

  // Stream handling (for real-time updates)
  async stream(
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
    options?: APIRequestOptions
  ): Promise<() => void> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.buildHeaders();

    let eventSource: EventSource;
    let cleanup: (() => void) | null = null;

    try {
      // For Server-Sent Events
      if (endpoint.includes('/stream/') || endpoint.includes('/sse/')) {
        eventSource = new EventSource(url);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            onError?.(new Error(`Invalid SSE data: ${error.message}`));
          }
        };

        eventSource.onerror = (event) => {
          onError?.(new Error('SSE connection error'));
        };

        cleanup = () => {
          eventSource.close();
        };
      } 
      // For WebSocket connections
      else if (endpoint.includes('/ws/')) {
        const wsUrl = url.replace('http', 'ws');
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            onError?.(new Error(`Invalid WebSocket data: ${error.message}`));
          }
        };

        ws.onerror = (event) => {
          onError?.(new Error('WebSocket connection error'));
        };

        cleanup = () => {
          ws.close();
        };
      } else {
        throw new Error('Invalid stream endpoint');
      }
    } catch (error) {
      onError?.(error as Error);
    }

    return cleanup || (() => {});
  }
}

// Global API client instance
export const apiClient = new APIClient();

// Convenience functions
export const api = {
  // Adversity Analysis
  async analyzeAdversity(data: {
    slipNumber: number;
    userInfo: any;
    situation: string;
  }) {
    return apiClient.post('/mutual-aid/adversity-analysis', data);
  },

  // Mutual Aid Requests
  async submitAidRequest(data: {
    amount: string;
    reason: string;
    severityLevel: number;
    analysisId: string;
  }) {
    return apiClient.post('/mutual-aid/requests', data);
  },

  async getAidRequests(page = 1, limit = 10) {
    return apiClient.getPaginated('/mutual-aid/requests', page, limit);
  },

  async getMyRequests() {
    return apiClient.get('/mutual-aid/requests/my');
  },

  async updateRequestStatus(requestId: string, status: string) {
    return apiClient.patch(`/mutual-aid/requests/${requestId}/status`, { status });
  },

  // Community Validation
  async getPendingValidations(page = 1, limit = 10) {
    return apiClient.getPaginated('/mutual-aid/validations/pending', page, limit);
  },

  async submitValidation(requestId: string, data: {
    vote: 'approve' | 'reject';
    confidence: number;
    reason: string;
  }) {
    return apiClient.post(`/mutual-aid/validations/${requestId}`, data);
  },

  async getValidationHistory() {
    return apiClient.get('/mutual-aid/validations/history');
  },

  // NFT Collection
  async getNFTCollection() {
    return apiClient.get('/mutual-aid/nfts/collection');
  },

  async mintNFT(requestId: string) {
    return apiClient.post('/mutual-aid/nfts/mint', { requestId });
  },

  async transferNFT(tokenId: string, toAddress: string) {
    return apiClient.post('/mutual-aid/nfts/transfer', { tokenId, toAddress });
  },

  // Leaderboard & Stats
  async getLeaderboard(type = 'reputation', page = 1, limit = 10) {
    return apiClient.getPaginated('/mutual-aid/leaderboard', page, limit, {
      headers: { 'X-Leaderboard-Type': type }
    });
  },

  async getMyRank() {
    return apiClient.get('/mutual-aid/leaderboard/my-rank');
  },

  async getUserStats() {
    return apiClient.get('/mutual-aid/stats/user');
  },

  async getSystemStats() {
    return apiClient.get('/mutual-aid/stats/system');
  },

  // Notifications
  async getNotifications(page = 1, limit = 20) {
    return apiClient.getPaginated('/notifications', page, limit);
  },

  async markNotificationRead(notificationId: string) {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Real-time updates
  subscribeToUpdates(
    types: string[], 
    onUpdate: (data: any) => void,
    onError?: (error: Error) => void
  ) {
    const typeQuery = types.join(',');
    return apiClient.stream(
      `/stream/updates?types=${typeQuery}`,
      onUpdate,
      onError
    );
  }
};

export default apiClient;