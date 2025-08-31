/**
 * File Management API Service
 * Handles file operations for the content creation system
 */

import { logger } from './logger'
import { getPortfolioItem, getBlogItem, getProjectItem } from '@/utils/r2PortfolioLoader'

export interface FileSaveRequest {
  filePath: string
  content: string
  contentType: 'blog' | 'portfolio' | 'project' | 'about'
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
  filePath?: string
  error?: string
}

export interface FileListRequest {
  directory: string
}

export interface FileListResponse {
  success: boolean
  files?: unknown[]
  error?: string
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete'
  path: string
  content?: string
  success: boolean
  error?: string
}

/**
 * Service for managing markdown files from R2 storage
 * Note: R2 is read-only for content delivery, so file operations are limited
 */
export class FileManagementService {
  /**
   * Save a markdown file
   */
  async saveFile(): Promise<FileSaveResponse> {
    try {
      // Since we're now using R2 for content delivery, file saving is not supported
      // R2 is read-only for content serving
      logger.warn('⚠️ File saving not supported - R2 is read-only for content delivery')
      
      return {
        success: false,
        error: 'File saving not supported - R2 is read-only for content delivery. Use your local development environment for editing files.'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Read a markdown file from R2 storage
   */
  async readFile(request: FileReadRequest): Promise<FileReadResponse> {
    logger.debug('📖 readFile called with request:', request)
    
    try {
      // Extract the file path and determine content type
      const filePath = request.filePath
      const fileName = filePath.split('/').pop()?.replace('.md', '') || ''
      
      // Determine content type based on path
      let content: string | null = null
      
      if (filePath.includes('/portfolio/')) {
        const item = await getPortfolioItem(fileName)
        content = item?.content || null
      } else if (filePath.includes('/blog/')) {
        const item = await getBlogItem(fileName)
        content = item?.content || null
      } else if (filePath.includes('/projects/')) {
        const item = await getProjectItem(fileName)
        content = item?.content || null
      }
      
      if (content) {
        logger.info(`✅ Successfully read file from R2: ${fileName}`)
        return {
          success: true,
          content,
          filePath: request.filePath
        }
      } else {
        logger.error(`❌ File not found in R2: ${fileName}`)
        return {
          success: false,
          error: `File not found: ${fileName}`
        }
      }
    } catch (error) {
      logger.error('❌ Error reading file from R2:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * List files in a directory from R2 storage
   */
  async listFiles(request: FileListRequest): Promise<FileListResponse> {
    try {
      logger.debug('📁 listFiles called with request:', request)

      // Since we're now using R2 for content delivery, we'll return a mock response
      // R2 doesn't have a native directory listing API like GitHub
      logger.warn('⚠️ Directory listing not supported - R2 is read-only for content delivery')

      return {
        success: false,
        error: 'Directory listing not supported - R2 is read-only for content delivery'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Check if a file exists in R2 storage
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      logger.debug('🔍 fileExists called with filePath:', filePath)

      // Try to read the file from R2 to check if it exists
      const response = await this.readFile({ filePath })
      return response.success
    } catch (error) {
      logger.error('❌ Error checking file existence from R2:', error)
      return false
    }
  }

  /**
   * Get file information (size and modification date)
   */
  async getFileInfo(filePath: string): Promise<{ size: number; modified: Date } | null> {
    try {
      logger.debug('📊 getFileInfo called with filePath:', filePath)

      // Since R2 is read-only for content delivery, we'll return mock info
      // In a real implementation, you might want to store metadata separately
      logger.warn('⚠️ File info not available - R2 is read-only for content delivery')

      return {
        size: 1024, // Mock size
        modified: new Date() // Mock modification date
      }
    } catch (error) {
      logger.error('❌ Error getting file info from R2:', error)
      return null
    }
  }

  /**
   * Create a new file or directory
   */
  async createItem(path: string, _type: 'file' | 'directory', content?: string): Promise<FileOperation> {
    try {
      // Since R2 is read-only for content delivery, file creation is not supported
      logger.warn('⚠️ File creation not supported - R2 is read-only for content delivery')

      return {
        type: 'create',
        path,
        content,
        success: false,
        error: 'File creation not supported - R2 is read-only for content delivery'
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
   * Update an existing file
   */
  async updateFile(path: string, content: string): Promise<FileOperation> {
    try {
      // Since R2 is read-only for content delivery, file updates are not supported
      logger.warn('⚠️ File updates not supported - R2 is read-only for content delivery')

      return {
        type: 'update',
        path,
        content,
        success: false,
        error: 'File updates not supported - R2 is read-only for content delivery'
      }
    } catch (error) {
      return {
        type: 'update',
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
      // Since R2 is read-only for content delivery, file deletion is not supported
      logger.warn('⚠️ File deletion not supported - R2 is read-only for content delivery')

      return {
        type: 'delete',
        path,
        success: false,
        error: 'File deletion not supported - R2 is read-only for content delivery'
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

