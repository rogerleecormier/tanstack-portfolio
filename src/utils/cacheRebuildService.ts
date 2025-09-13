/**
 * Cache Rebuild Service
 * Provides utilities for triggering cache rebuilds from the frontend
 */

interface CacheRebuildResponse {
  success: boolean;
  message: string;
  trigger: string;
  stats?: {
    total: number;
    portfolio: number;
    blog: number;
    projects: number;
  };
  timestamp: string;
  error?: string;
}

interface CachedContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  contentType: string;
  url: string;
}

interface CacheData {
  portfolio: CachedContentItem[];
  blog: CachedContentItem[];
  projects: CachedContentItem[];
  all: CachedContentItem[];
  metadata: {
    portfolioCount: number;
    blogCount: number;
    projectCount: number;
    lastUpdated: string;
    version: string;
    trigger: string;
  };
}

interface CacheStatus {
  status: string;
  timestamp: string;
  cache: {
    lastUpdated: string;
    totalItems: number;
    version: string;
    trigger: string;
  } | null;
}

function isCacheRebuildResponse(obj: unknown): obj is CacheRebuildResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;
  return (
    typeof o.success === 'boolean' &&
    typeof o.message === 'string' &&
    typeof o.trigger === 'string' &&
    typeof o.timestamp === 'string'
  );
}

function isCacheStatus(obj: unknown): obj is CacheStatus {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;
  return (
    typeof o.status === 'string' &&
    typeof o.timestamp === 'string' &&
    'cache' in o
  );
}

function isCacheData(obj: unknown): obj is CacheData {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;
  if (
    !Array.isArray(o.portfolio) ||
    !Array.isArray(o.blog) ||
    !Array.isArray(o.projects) ||
    !Array.isArray(o.all) ||
    typeof o.metadata !== 'object' ||
    o.metadata === null
  )
    return false;

  const m = o.metadata as Record<string, unknown>;
  return (
    typeof m.portfolioCount === 'number' &&
    typeof m.blogCount === 'number' &&
    typeof m.projectCount === 'number' &&
    typeof m.lastUpdated === 'string' &&
    typeof m.version === 'string' &&
    typeof m.trigger === 'string'
  );
}

// Determine worker URL based on environment
function getWorkerBaseUrl(): string {
  // Always use production worker for consistency across all environments
  return 'https://cache-rebuild-worker.rcormier.workers.dev';
}

const WORKER_BASE_URL = getWorkerBaseUrl();

// KV Cache Get Worker URL for direct cache access
const KV_WORKER_URL = 'https://kv-cache-get.rcormier.workers.dev';

/**
 * Trigger cache rebuild from content creation studio
 */
export async function triggerContentStudioRebuild(): Promise<CacheRebuildResponse> {
  try {
    const apiKey = import.meta.env.VITE_REBUILD_API_KEY as string | undefined;
    const response = await fetch(`${WORKER_BASE_URL}/rebuild/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if available in environment
        ...(apiKey && {
          'X-API-Key': apiKey,
        }),
      },
      body: JSON.stringify({
        trigger: 'content-studio',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    if (isCacheRebuildResponse(data)) {
      return data;
    } else {
      throw new Error('Invalid response format from cache rebuild worker');
    }
  } catch (error) {
    console.error('Cache rebuild failed:', error);
    return {
      success: false,
      message: 'Failed to rebuild cache',
      trigger: 'content-studio',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger manual cache rebuild
 */
export async function triggerManualRebuild(): Promise<CacheRebuildResponse> {
  try {
    const apiKey = import.meta.env.VITE_REBUILD_API_KEY as string | undefined;
    console.log('🔄 Triggering manual cache rebuild...');
    console.log('Worker URL:', WORKER_BASE_URL);
    console.log('API Key available:', !!apiKey);

    const response = await fetch(`${WORKER_BASE_URL}/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && {
          'X-API-Key': apiKey,
        }),
      },
      body: JSON.stringify({
        trigger: 'manual',
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    if (isCacheRebuildResponse(data)) {
      return data;
    } else {
      throw new Error('Invalid response format from cache rebuild worker');
    }
  } catch (error) {
    console.error('Manual cache rebuild failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return {
      success: false,
      message: 'Failed to rebuild cache',
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
}

/**
 * Get cache status
 */
export async function getCacheStatus(): Promise<CacheStatus | null> {
  try {
    const response = await fetch(`${WORKER_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get cache status:', response.status);
      return null;
    }

    const data = (await response.json()) as unknown;
    if (isCacheStatus(data)) {
      return data;
    } else {
      console.error('Invalid cache status response format');
      return null;
    }
  } catch (error) {
    console.error('Error getting cache status:', error);
    return null;
  }
}

/**
 * Check if cache rebuild is available
 */
export async function isCacheRebuildAvailable(): Promise<boolean> {
  try {
    const status = await getCacheStatus();
    return status?.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Get current cache data from KV worker
 */
export async function getCurrentCacheData(): Promise<CacheData | null> {
  try {
    const response = await fetch(KV_WORKER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as unknown;
    if (isCacheData(data)) {
      return data;
    } else {
      throw new Error('Invalid cache data format from KV worker');
    }
  } catch (error) {
    console.error('Error getting current cache data:', error);
    return null;
  }
}

/**
 * Get cache status with current data from KV worker
 */
export async function getEnhancedCacheStatus(): Promise<CacheStatus | null> {
  try {
    // First try to get status from cache rebuild worker
    const statusResponse = await getCacheStatus();

    // Also get current data from KV worker
    const currentData = await getCurrentCacheData();

    if (statusResponse && currentData) {
      // Combine data from both sources
      return {
        ...statusResponse,
        cache: {
          lastUpdated:
            currentData.metadata?.lastUpdated ??
            statusResponse.cache?.lastUpdated ??
            new Date().toISOString(),
          totalItems:
            currentData.all?.length ?? statusResponse.cache?.totalItems ?? 0,
          version:
            currentData.metadata?.version ??
            statusResponse.cache?.version ??
            '1.0.0',
          trigger: statusResponse.cache?.trigger ?? 'unknown',
        },
      };
    } else if (currentData) {
      // Fallback to KV data only
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
          lastUpdated:
            currentData.metadata?.lastUpdated || new Date().toISOString(),
          totalItems: currentData.all?.length || 0,
          version: currentData.metadata?.version || '1.0.0',
          trigger: 'kv-direct',
        },
      };
    }

    return statusResponse;
  } catch (error) {
    console.error('Error getting enhanced cache status:', error);
    return null;
  }
}

/**
 * Force populate cache for preview environments
 */
export async function forcePopulatePreviewCache(): Promise<CacheRebuildResponse> {
  try {
    console.log('🔄 Force populating cache for preview environment...');

    const response = await fetch(`${WORKER_BASE_URL}/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'preview-force',
        timestamp: new Date().toISOString(),
        force: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    if (isCacheRebuildResponse(data)) {
      console.log('✅ Preview cache force population completed:', data);
      return data;
    } else {
      throw new Error('Invalid response format from cache rebuild worker');
    }
  } catch (error) {
    console.error('❌ Preview cache force population failed:', error);
    return {
      success: false,
      message: 'Failed to force populate preview cache',
      trigger: 'preview-force',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
