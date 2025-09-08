/**
 * Cache Rebuild Service
 * Provides utilities for triggering cache rebuilds from the frontend
 */

interface CacheRebuildResponse {
  success: boolean
  message: string
  trigger: string
  stats?: {
    total: number
    portfolio: number
    blog: number
    projects: number
  }
  timestamp: string
  error?: string
}

interface CacheStatus {
  status: string
  timestamp: string
  cache: {
    lastUpdated: string
    totalItems: number
    version: string
    trigger: string
  } | null
}

// Determine worker URL based on environment
function getWorkerBaseUrl(): string {
  // Always use production worker for consistency across all environments
  return 'https://cache-rebuild-worker.rcormier.workers.dev'
}

const WORKER_BASE_URL = getWorkerBaseUrl()

// KV Cache Get Worker URL for direct cache access
const KV_WORKER_URL = 'https://kv-cache-get.rcormier.workers.dev'

/**
 * Trigger cache rebuild from content creation studio
 */
export async function triggerContentStudioRebuild(): Promise<CacheRebuildResponse> {
  try {
    const response = await fetch(`${WORKER_BASE_URL}/rebuild/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if available in environment
        ...(process.env.VITE_REBUILD_API_KEY && {
          'X-API-Key': process.env.VITE_REBUILD_API_KEY
        })
      },
      body: JSON.stringify({
        trigger: 'content-studio',
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Cache rebuild failed:', error)
    return {
      success: false,
      message: 'Failed to rebuild cache',
      trigger: 'content-studio',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Trigger manual cache rebuild
 */
export async function triggerManualRebuild(): Promise<CacheRebuildResponse> {
  try {
    const response = await fetch(`${WORKER_BASE_URL}/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.VITE_REBUILD_API_KEY && {
          'X-API-Key': process.env.VITE_REBUILD_API_KEY
        })
      },
      body: JSON.stringify({
        trigger: 'manual',
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Manual cache rebuild failed:', error)
    return {
      success: false,
      message: 'Failed to rebuild cache',
      trigger: 'manual',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
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
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Failed to get cache status:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting cache status:', error)
    return null
  }
}

/**
 * Check if cache rebuild is available
 */
export async function isCacheRebuildAvailable(): Promise<boolean> {
  try {
    const status = await getCacheStatus()
    return status?.status === 'healthy'
  } catch {
    return false
  }
}

/**
 * Get current cache data from KV worker
 */
export async function getCurrentCacheData(): Promise<any> {
  try {
    const response = await fetch(KV_WORKER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting current cache data:', error)
    return null
  }
}

/**
 * Get cache status with current data from KV worker
 */
export async function getEnhancedCacheStatus(): Promise<CacheStatus | null> {
  try {
    // First try to get status from cache rebuild worker
    const statusResponse = await getCacheStatus()
    
    // Also get current data from KV worker
    const currentData = await getCurrentCacheData()
    
    if (statusResponse && currentData) {
      // Combine data from both sources
      return {
        ...statusResponse,
        cache: {
          lastUpdated: currentData.metadata?.lastUpdated || statusResponse.cache?.lastUpdated || new Date().toISOString(),
          totalItems: currentData.all?.length || statusResponse.cache?.totalItems || 0,
          version: currentData.metadata?.version || statusResponse.cache?.version || '1.0.0',
          trigger: statusResponse.cache?.trigger || 'unknown'
        }
      }
    } else if (currentData) {
      // Fallback to KV data only
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
          lastUpdated: currentData.metadata?.lastUpdated || new Date().toISOString(),
          totalItems: currentData.all?.length || 0,
          version: currentData.metadata?.version || '1.0.0',
          trigger: 'kv-direct'
        }
      }
    }
    
    return statusResponse
  } catch (error) {
    console.error('Error getting enhanced cache status:', error)
    return null
  }
}

/**
 * Force populate cache for preview environments
 */
export async function forcePopulatePreviewCache(): Promise<CacheRebuildResponse> {
  try {
    console.log('🔄 Force populating cache for preview environment...')

    const response = await fetch(`${WORKER_BASE_URL}/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'preview-force',
        timestamp: new Date().toISOString(),
        force: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Preview cache force population completed:', result)
    return result
  } catch (error) {
    console.error('❌ Preview cache force population failed:', error)
    return {
      success: false,
      message: 'Failed to force populate preview cache',
      trigger: 'preview-force',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
