export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiClient {
  private baseUrl: string;
  private accessJwt?: string;

  constructor(baseUrl = '/api', accessJwt?: string) {
    this.baseUrl = baseUrl;
    this.accessJwt = accessJwt;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessJwt) {
      headers['CF-Access-Jwt-Assertion'] = this.accessJwt;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || `HTTP ${response.status}`,
            details: errorData,
          },
        };
      }

      const data = await response.json() as T;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  async listContent(prefix?: string, cursor?: string, limit?: number) {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (cursor) params.set('cursor', cursor);
    if (limit) params.set('limit', limit.toString());

    return this.request<{ objects: Array<{ key: string; size: number; uploaded: string; etag: string }>; cursor?: string }>(
      `/content/list?${params}`
    );
  }

  async readContent(key: string) {
    return this.request<string>(`/content/read?key=${encodeURIComponent(key)}`);
  }

  async writeContent(key: string, content: string, etag?: string) {
    return this.request<{ etag: string }>(`/content/write`, {
      method: 'POST',
      body: JSON.stringify({ key, content, etag }),
    });
  }

  async validateFrontmatter(yaml: string) {
    return this.request<{ ok: boolean; normalized?: Record<string, unknown>; errors?: string[] }>(
      `/validate/frontmatter`,
      {
        method: 'POST',
        body: JSON.stringify({ yaml }),
      }
    );
  }

  async generateFrontmatter(markdown: string) {
    return this.request<{ frontmatter: Record<string, unknown> }>(
      '/generate',
      {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      }
    );
  }

  async health() {
    return this.request<{ ok: boolean }>('/health');
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Function to update the JWT token
export const setAccessJwt = (jwt: string) => {
  apiClient['accessJwt'] = jwt;
};
