import { MiniAppAuthService } from './auth.js';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * HTTP Client Wrapper cho Zalo Mini App
 * Tu dong dinh kem JWT Bearer Token va xu ly phien dang nhap
 */
class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = MiniAppAuthService.getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  public async get<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (res.status === 401) {
      // Thu lam moi phien dang nhap neu token het han
      await MiniAppAuthService.initZaloAuth();
      const retryRes = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(retryRes);
    }

    return this.handleResponse<T>(res);
  }

  public async post<T>(url: string, body?: any): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      await MiniAppAuthService.initZaloAuth();
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse<T>(retryRes);
    }

    return this.handleResponse<T>(res);
  }

  public async delete<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errMsg = `Lỗi mạng hoặc máy chủ [${res.status}]`;
      try {
        const errorJson = await res.json();
        if (errorJson?.error?.message) {
          errMsg = errorJson.error.message;
        }
      } catch {
        // Khong parse duoc json
      }
      throw new Error(errMsg);
    }

    const json: ApiResponse<T> = await res.json();
    return json.data as T;
  }
}

export const apiClient = new ApiClient();
