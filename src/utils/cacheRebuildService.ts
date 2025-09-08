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

const WORKER_BASE_URL = 'https://cache-rebuild-worker.rcormier.workers.dev'

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
