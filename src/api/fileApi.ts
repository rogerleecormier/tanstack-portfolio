/**
 * File API endpoints for content management
 * This provides a simple interface for file operations
 */

export interface FileApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FileSaveRequest {
  filePath: string
  content: string
  contentType: 'blog' | 'portfolio' | 'project'
  overwrite?: boolean
}

export interface FileReadRequest {
  filePath: string
}

export interface FileListRequest {
  directory: string
}

/**
 * File API client for making requests to the backend
 */
class FileApiClient {
  private baseUrl: string

  constructor() {
    // In development, this would point to your local API server
    // In production, this would point to your deployed API
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3001/api/files' 
      : '/api/files'
  }

  /**
   * Save a file to the filesystem
   */
  async saveFile(request: FileSaveRequest): Promise<FileApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save file'
      }
    }
  }

  /**
   * Read a file from the filesystem
   */
  async readFile(request: FileReadRequest): Promise<FileApiResponse<{ content: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file'
      }
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(request: FileListRequest): Promise<FileApiResponse<Array<{
    name: string
    path: string
    type: 'file' | 'directory'
    size?: number
    modified?: Date
  }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files'
      }
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<FileApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check file existence'
      }
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<FileApiResponse<{ size: number; modified: Date }>> {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info'
      }
    }
  }
}

// Export a singleton instance
export const fileApi = new FileApiClient()

// Export the class for testing or custom instances
export default FileApiClient
