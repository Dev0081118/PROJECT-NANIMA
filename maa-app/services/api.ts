/**
 * API Client — authenticated HTTP client with automatic token refresh.
 * API keys NEVER leave the backend. This client only handles user auth tokens.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

class APIClient {
  private accessToken: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    retryOnAuth = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && retryOnAuth) {
      // Try token refresh
      if (!this.refreshing) {
        this.refreshing = this.attemptTokenRefresh();
      }
      const refreshed = await this.refreshing;
      this.refreshing = null;

      if (refreshed) {
        return this.request<T>(method, path, body, false);
      } else {
        // Trigger logout via store (avoid circular import by dispatching event)
        throw new AuthError('Session expired. Please sign in again.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new APIError(error.error || 'Request failed', response.status);
    }

    return response.json() as Promise<T>;
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      // Import dynamically to avoid circular dependency
      const { useAuthStore } = await import('../stores/auth');
      return await useAuthStore.getState().refreshToken();
    } catch {
      return false;
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const apiClient = new APIClient();
