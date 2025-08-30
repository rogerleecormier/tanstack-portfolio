/**
 * File Management API Service
 * Handles file operations for the content creation system
 */

import { logger } from './logger'

export interface FileSaveRequest {
  filePath: string
  content: string
  contentType: 'blog' | 'portfolio' | 'project'
  overwrite?: boolean
}

export interface FileSaveResponse {
  success: boolean
  filePath?: string
  message?: string
  error?: string
}

export interface FileReadRequest {
  filePath: string
}

export interface FileReadResponse {
  success: boolean
  content?: string
  error?: string
}

export interface FileListRequest {
  directory: string
}

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  content?: string
}

export interface FileListResponse {
  success: boolean
  files?: FileItem[]
  error?: string
}

export interface FileOperation {
  type: 'read' | 'write' | 'create' | 'delete'
  path: string
  content?: string
  success: boolean
  error?: string
}

class FileManagementService {
  private static instance: FileManagementService
  private baseUrl: string

  private constructor() {
    // In development, use the Vite dev server
    // In production, this would be your actual API endpoint
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:5173/api/files' 
      : '/api/files'
  }

  static getInstance(): FileManagementService {
    if (!FileManagementService.instance) {
      FileManagementService.instance = new FileManagementService()
    }
    return FileManagementService.instance
  }

  /**
   * Save a markdown file
   */
  async saveFile(request: FileSaveRequest): Promise<FileSaveResponse> {
    try {
      // Try to use the GitHub file manager worker first
      try {
        const workerUrl = import.meta.env.DEV 
          ? 'http://localhost:8787' 
          : 'https://github-file-manager.rcormier.workers.dev'
        
        // The worker expects relative paths, so strip the 'src/content/' prefix
        const relativePath = request.filePath.replace(/^src\/content\//, '')
        const saveRequest = { ...request, filePath: relativePath }
        
        const response = await fetch(`${workerUrl}/api/files/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveRequest)
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            return {
              success: true,
              filePath: result.filePath,
              message: result.message || 'File saved to GitHub successfully!'
            }
          } else {
            return {
              success: false,
              error: result.error || 'Failed to save file to GitHub'
            }
          }
        } else {
          const error = await response.json()
          return {
            success: false,
            error: error.error || `GitHub API error: ${response.status}`
          }
        }
      } catch {
        // Fall back to development mode if worker is not available
        console.log('GitHub file manager worker not available, falling back to development mode')
      }
      
      if (import.meta.env.DEV) {
        // In development, create a downloadable file
        return this.createDownloadableFile(request)
      } else {
        // In production, make actual API call
        return this.makeApiCall('/save', request)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Read a markdown file
   */
  async readFile(request: FileReadRequest): Promise<FileReadResponse> {
    logger.debug('📖 readFile called with request:', request)
    
    // In production, try to use the GitHub worker
    if (import.meta.env.PROD) {
      try {
        const workerUrl = 'https://github-file-manager.rcormier.workers.dev'
        const fullUrl = `${workerUrl}/api/files/read`
        
        // The worker expects relative paths (e.g., 'projects/project-analysis.md')
        // but we're receiving full paths (e.g., 'src/content/projects/project-analysis.md')
        // So we need to strip the 'src/content/' prefix
        const relativePath = request.filePath.replace(/^src\/content\//, '')
        
        logger.network('🔗 Calling GitHub worker at:', fullUrl)
        logger.network('🔗 Full request details:', {
          url: fullUrl,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          originalPath: request.filePath,
          relativePath: relativePath,
          body: { filePath: relativePath }
        })

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filePath: relativePath })
        })

        logger.response('📡 Worker response status:', response.status)
        logger.response('📡 Worker response ok:', response.ok)
        logger.response('📡 Worker response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const result = await response.json()
          logger.response('✅ Worker response success:', result)
          
          if (result.success) {
            return {
              success: true,
              content: result.content
            }
          } else {
            logger.error('❌ Worker returned error:', result.error)
            return {
              success: false,
              error: result.error
            }
          }
        } else {
          const error = await response.text()
          logger.error('❌ Worker HTTP error:', response.status, error)
          return {
            success: false,
            error: `Worker error: ${response.status}`
          }
        }
      } catch (workerError) {
        logger.warn('⚠️ GitHub file manager worker not available, falling back to development mode:', workerError)
        
        // Fall back to development mode
        logger.debug('🔄 Falling back to development mode')
        return this.readLocalFile()
      }
    }

    // In development, use local simulation
    logger.debug('🔄 Falling back to production API call')
    return this.readLocalFile()
  }

  /**
   * List files in a directory
   */
  async listFiles(request: FileListRequest): Promise<FileListResponse> {
    try {
      // Try to use the GitHub file manager worker first
      try {
        const workerUrl = import.meta.env.DEV 
          ? 'http://localhost:8787' 
          : 'https://github-file-manager.rcormier.workers.dev'
        
        // The worker expects relative paths, so strip the 'src/content/' prefix
        const relativeDirectory = request.directory.replace(/^src\/content\//, '')
        
        const response = await fetch(`${workerUrl}/api/files/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ directory: relativeDirectory })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            return {
              success: true,
              files: result.files || []
            }
          } else {
            return {
              success: false,
              error: result.error || 'Failed to list files from GitHub'
            }
          }
        } else {
          const error = await response.json()
          return {
            success: false,
            error: error.error || `GitHub API error: ${response.status}`
          }
        }
      } catch {
        // Fall back to development mode if worker is not available
        console.log('GitHub file manager worker not available, falling back to development mode')
      }
      
      if (import.meta.env.DEV) {
        // In development, return mock file list
        return this.getMockFileList(request.directory)
      } else {
        // In production, make actual API call
        return this.makeApiCall('/list', request)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Create a downloadable file in development mode
   */
  private createDownloadableFile(request: FileSaveRequest): FileSaveResponse {
    try {
      // Create a blob with the markdown content
      const blob = new Blob([request.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      
      // Create a temporary download link
      const a = document.createElement('a')
      a.href = url
      a.download = request.filePath.split('/').pop() || 'document.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Clean up the URL
      URL.revokeObjectURL(url)
      
      return {
        success: true,
        filePath: request.filePath,
        message: `File downloaded as ${a.download}. In production, this would be saved to ${request.filePath}`
      }
    } catch {
      return {
        success: false,
        error: 'Failed to create downloadable file'
      }
    }
  }

  /**
   * Read a local file in development mode
   */
  private async readLocalFile(): Promise<FileReadResponse> {
    try {
      // In development mode, we'll just return a mock response
      // since dynamic imports with variable paths aren't supported at build time
      return {
        success: false,
        error: `File reading not supported in development mode. Use the GitHub worker instead.`
      }
    } catch {
      return {
        success: false,
        error: 'Failed to read local file'
      }
    }
  }

  /**
   * Get mock file list in development mode
   */
  private getMockFileList(directory: string): FileListResponse {
    // Return a mock list of files based on the directory
    const mockFiles = {
      'src/content/blog': [
        { name: 'asana-ai-status-reporting.md', path: 'src/content/blog/asana-ai-status-reporting.md', type: 'file' as const, size: 6500, modified: new Date() },
        { name: 'power-automate-workflow-automation.md', path: 'src/content/blog/power-automate-workflow-automation.md', type: 'file' as const, size: 2400, modified: new Date() },
        { name: 'serverless-ai-workflows-azure-functions.md', path: 'src/content/blog/serverless-ai-workflows-azure-functions.md', type: 'file' as const, size: 2500, modified: new Date() }
      ],
      'src/content/portfolio': [
        { name: 'strategy.md', path: 'src/content/portfolio/strategy.md', type: 'file' as const, size: 3200, modified: new Date() },
        { name: 'leadership.md', path: 'src/content/portfolio/leadership.md', type: 'file' as const, size: 2800, modified: new Date() },
        { name: 'culture.md', path: 'src/content/portfolio/culture.md', type: 'file' as const, size: 2400, modified: new Date() }
      ],
      'src/content/projects': [
        { name: 'healthbridge-analysis.md', path: 'src/content/projects/healthbridge-analysis.md', type: 'file' as const, size: 1800, modified: new Date() }
      ]
    }

    const files = mockFiles[directory as keyof typeof mockFiles] || []
    
    return {
      success: true,
      files: [
        ...files,
        { name: directory.split('/').pop() || '', path: directory, type: 'directory' as const, modified: new Date() }
      ]
    }
  }

  /**
   * Make an API call to the backend
   */
  private async makeApiCall(endpoint: string, data: unknown): Promise<FileSaveResponse | FileReadResponse | FileListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      // Try to use the GitHub file manager worker first
      try {
        const workerUrl = import.meta.env.DEV 
          ? 'http://localhost:8787' 
          : 'https://github-file-manager.rcormier.workers.dev'
        
        // The worker expects relative paths, so strip the 'src/content/' prefix
        const relativePath = filePath.replace(/^src\/content\//, '')
        
        const response = await fetch(`${workerUrl}/api/files/exists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: relativePath })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            return result.exists
          }
        }
      } catch {
        // Fall back to development mode if worker is not available
        console.log('GitHub file manager worker not available, falling back to development mode')
      }
      
      // Fallback to reading the file
      const response = await this.readFile({ filePath })
      return response.success
    } catch {
      return false
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<{ size: number; modified: Date } | null> {
    try {
      const response = await this.readFile({ filePath })
      if (response.success && response.content) {
        return {
          size: response.content.length,
          modified: new Date()
        }
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Create a new file or directory
   */
  async createItem(path: string, type: 'file' | 'directory', content?: string): Promise<FileOperation> {
    try {
      if (type === 'file') {
        const saveResponse = await this.saveFile({
          filePath: path,
          content: content || '',
          contentType: 'blog' // Default to blog, can be enhanced later
        })
        
        if (saveResponse.success) {
          return {
            type: 'create',
            path,
            content,
            success: true
          }
        } else {
          return {
            type: 'create',
            path,
            content,
            success: false,
            error: saveResponse.error
          }
        }
      } else {
        // For directories, we'll just return success since GitHub handles this automatically
        return {
          type: 'create',
          path,
          success: true
        }
      }
    } catch (error) {
      return {
        type: 'create',
        path,
        content,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Delete a file or directory
   */
  async deleteItem(path: string): Promise<FileOperation> {
    try {
      // Note: GitHub API doesn't support file deletion through the contents endpoint
      // This would require using the GitHub API's delete endpoint
      // For now, we'll return a not implemented response
      return {
        type: 'delete',
        path,
        success: false,
        error: 'File deletion not implemented yet. Use GitHub interface to delete files.'
      }
    } catch (error) {
      return {
        type: 'delete',
        path,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

export default FileManagementService
