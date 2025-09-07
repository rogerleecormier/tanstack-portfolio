import { generateSmartFrontmatter } from './frontmatterGen';

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

  constructor(accessJwt?: string) {
    // Use remote API for all operations (supports both read and write)
    this.baseUrl = 'https://r2-content-full.rcormier.workers.dev/api';

    // Set the proxy base environment variable for backward compatibility
    if (!import.meta.env.VITE_R2_PROXY_BASE && import.meta.env.DEV) {
      // Note: In production builds, this would typically be set via environment variables
      console.warn('VITE_R2_PROXY_BASE not set, using default for development');
    }

    this.accessJwt = accessJwt;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
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
    params.set('delimiter', '/');

    // If a proxy base is defined, use worker-based listing
    const proxyBase = import.meta.env.VITE_R2_PROXY_BASE;
    if (proxyBase) {
      try {
        const url = `${proxyBase}/_list?${params.toString()}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        return { success: true, data } as ApiResponse<unknown>;
      } catch (e) {
        return { success: false, error: { code: 'NETWORK_ERROR', message: (e as Error).message } };
      }
    }

    return this.request<{ prefixes?: string[]; objects: Array<{ key: string; size: number; uploaded: string; etag: string }>; cursor?: string }>(
      `/content/list?${params}`
    );
  }

  async readContent(key: string) {
    const proxyBase = import.meta.env.VITE_R2_PROXY_BASE;
    if (proxyBase) {
      try {
        const url = `${proxyBase}/${key}?ts=${Date.now()}`;
        const res = await fetch(url, {
          headers: { 'Accept': 'text/markdown' },
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.text();
        const etag = res.headers.get('ETag') || '';
        return { success: true, data: { body, etag } } as ApiResponse<{ body: string; etag: string }>;
      } catch (e) {
        return { success: false, error: { code: 'NETWORK_ERROR', message: (e as Error).message } };
      }
    }
    return this.request<{ body: string; etag: string }>(`/content/read?key=${encodeURIComponent(key)}`);
  }

  async writeContent(key: string, content: string, etag?: string) {
    console.log('API writeContent called with:', {
      key,
      contentLength: content.length,
      etag,
      url: `${this.baseUrl}/content/write`
    });

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
    // Prefer dedicated AI worker if configured
    const aiUrl = import.meta.env.VITE_AI_WORKER_URL;
    if (aiUrl) {
      try {
        const res = await fetch(`${aiUrl.replace(/\/$/, '')}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown })
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, data } as ApiResponse<{ frontmatter: Record<string, unknown> }>;
        }
      } catch {
        // fall through to default request below
      }
    }

    const apiResp = await this.request<{ frontmatter: Record<string, unknown> }>(
      '/generate',
      {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      }
    );

    if (apiResp.success) return apiResp;

    // Fallback: generate smart frontmatter client-side if API is unavailable (e.g., 405/404)
    try {
      console.warn('Frontmatter generate API unavailable, using client-side fallback:', apiResp.error);
      const fm = generateSmartFrontmatter(markdown);
      return { success: true, data: { frontmatter: fm } } as ApiResponse<{ frontmatter: Record<string, unknown> }>;
    } catch {
      return apiResp; // keep original error if fallback fails
    }
  }

  async existsContent(key: string) {
    return this.request<{ exists: boolean; etag?: string }>(`/content/exists?key=${encodeURIComponent(key)}`);
  }

  async deleteContentSoft(key: string) {
    return this.request<{ ok: boolean; trashKey: string }>(`/content/delete`, {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
  }

  async restoreContent(trashKey: string, overwrite?: boolean, targetKey?: string) {
    return this.request<{ ok: boolean; key: string }>(`/content/restore`, {
      method: 'POST',
      body: JSON.stringify({ trashKey, overwrite, targetKey }),
    });
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
// Old basic helpers removed; using generateSmartFrontmatter instead.
