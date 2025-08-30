/**
 * GitHub File Manager Cloudflare Worker
 * Handles file operations for the content creation system
 */

interface Env {
  GITHUB_TOKEN: string
  GITHUB_REPO: string
  GITHUB_BRANCH: string
  CONTENT_PATH: string
  GITHUB_API_BASE: string
  COMMIT_AUTHOR_NAME: string
  COMMIT_AUTHOR_EMAIL: string
  GITHUB_WEBHOOK_SECRET?: string
}

interface FileSaveRequest {
  filePath: string
  content: string
  contentType: 'blog' | 'portfolio' | 'project'
  overwrite?: boolean
  commitMessage?: string
}

interface FileReadRequest {
  filePath: string
}

interface FileListRequest {
  directory: string
}

interface FileExistsRequest {
  filePath: string
}

interface GitHubFileResponse {
  content: string
  encoding: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  _links: {
    self: string
    git: string
    html: string
  }
}

interface GitHubTreeResponse {
  sha: string
  url: string
  tree: Array<{
    path: string
    mode: string
    type: string
    sha: string
    size?: number
    url: string
  }>
}

class GitHubFileManager {
  private env: Env
  private baseUrl: string
  private headers: HeadersInit

  constructor(env: Env) {
    this.env = env
    this.baseUrl = `${env.GITHUB_API_BASE}/repos/${env.GITHUB_REPO}`
    this.headers = {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Worker-GitHub-File-Manager'
    }
  }

  /**
   * Save a file to GitHub
   */
  async saveFile(request: FileSaveRequest): Promise<Response> {
    try {
      const { filePath, content, contentType, overwrite = false, commitMessage } = request
      
      // Validate input
      if (!filePath || !content) {
        return this.errorResponse('File path and content are required', 400)
      }

      // Ensure file path is within content directory
      const fullPath = `${this.env.CONTENT_PATH}/${filePath}`
      if (!fullPath.startsWith(this.env.CONTENT_PATH)) {
        return this.errorResponse('Invalid file path', 400)
      }

      // Check if file exists
      const existingFile = await this.getFile(fullPath)
      const fileExists = existingFile !== null

      if (fileExists && !overwrite) {
        return this.errorResponse('File already exists. Set overwrite=true to overwrite.', 409)
      }

      // Create commit message
      const message = commitMessage || this.generateCommitMessage(filePath, contentType, overwrite)

      // Prepare the file content (base64 encoded)
      const contentEncoded = btoa(unescape(encodeURIComponent(content)))

      // Create the file
      const createResponse = await fetch(`${this.baseUrl}/contents/${fullPath}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          message,
          content: contentEncoded,
          sha: fileExists ? existingFile!.sha : undefined,
          branch: this.env.GITHUB_BRANCH
        })
      })

      if (!createResponse.ok) {
        const error = await createResponse.json() as { message?: string }
        return this.errorResponse(`GitHub API error: ${error.message || 'Unknown error'}`, createResponse.status)
      }

      const result = await createResponse.json() as {
        content: { sha: string; html_url: string }
        commit: { sha: string }
      }
      
      return this.jsonResponse({
        success: true,
        filePath: fullPath,
        message: `File ${overwrite ? 'updated' : 'created'} successfully`,
        sha: result.content.sha,
        commitSha: result.commit.sha,
        htmlUrl: result.content.html_url
      })

    } catch (error) {
      console.error('Error saving file:', error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  /**
   * Read a file from GitHub
   */
  async readFile(request: FileReadRequest): Promise<Response> {
    try {
      const { filePath } = request
      
      if (!filePath) {
        return this.errorResponse('File path is required', 400)
      }

      const fullPath = `${this.env.CONTENT_PATH}/${filePath}`
      const file = await this.getFile(fullPath)

      if (!file) {
        return this.errorResponse('File not found', 404)
      }

      // Decode content from base64
      const content = decodeURIComponent(escape(atob(file.content)))

      return this.jsonResponse({
        success: true,
        content,
        sha: file.sha,
        size: file.size,
        htmlUrl: file.html_url
      })

    } catch (error) {
      console.error('Error reading file:', error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(request: FileListRequest): Promise<Response> {
    try {
      const { directory } = request
      
      if (!directory) {
        return this.errorResponse('Directory path is required', 400)
      }

      // Handle directory path correctly - if it already starts with CONTENT_PATH, don't prepend it
      let fullPath = directory
      if (!directory.startsWith(this.env.CONTENT_PATH)) {
        fullPath = `${this.env.CONTENT_PATH}/${directory}`
      }
      
      // Get the tree for the current branch
      const treeResponse = await fetch(`${this.baseUrl}/git/trees/${this.env.GITHUB_BRANCH}?recursive=1`, {
        headers: this.headers
      })

      if (!treeResponse.ok) {
        const error = await treeResponse.json() as { message?: string }
        return this.errorResponse(`GitHub API error: ${error.message || 'Unknown error'}`, treeResponse.status)
      }

      const tree: GitHubTreeResponse = await treeResponse.json()
      
      // Filter files in the requested directory
      const files = tree.tree
        .filter(item => item.path.startsWith(fullPath))
        .map(item => ({
          name: item.path.split('/').pop() || '',
          path: item.path.replace(this.env.CONTENT_PATH + '/', ''),
          type: item.type as 'file' | 'directory',
          size: item.size || 0,
          sha: item.sha
        }))

      return this.jsonResponse({
        success: true,
        files,
        directory: directory // Return the original directory path, not the fullPath
      })

    } catch (error) {
      console.error('Error listing files:', error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(request: FileExistsRequest): Promise<Response> {
    try {
      const { filePath } = request
      
      if (!filePath) {
        return this.errorResponse('File path is required', 400)
      }

      const fullPath = `${this.env.CONTENT_PATH}/${filePath}`
      const file = await this.getFile(fullPath)

      return this.jsonResponse({
        success: true,
        exists: file !== null,
        sha: file?.sha,
        size: file?.size
      })

    } catch (error) {
      console.error('Error checking file existence:', error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  /**
   * Get file information from GitHub
   */
  private async getFile(filePath: string): Promise<GitHubFileResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/${filePath}?ref=${this.env.GITHUB_BRANCH}`, {
        headers: this.headers
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting file:', error)
      return null
    }
  }

  /**
   * Generate a meaningful commit message
   */
  private generateCommitMessage(filePath: string, contentType: string, overwrite: boolean): string {
    const action = overwrite ? 'Update' : 'Create'
    const fileName = filePath.split('/').pop() || 'file'
    const type = contentType.charAt(0).toUpperCase() + contentType.slice(1)
    
    return `${action} ${type}: ${fileName}`
  }

  /**
   * Create a JSON response
   */
  private jsonResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  /**
   * Create an error response
   */
  private errorResponse(message: string, status: number = 400): Response {
    return this.jsonResponse({
      success: false,
      error: message
    }, status)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Validate GitHub token
    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: 'GitHub token not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const fileManager = new GitHubFileManager(env)
    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Route requests to appropriate handlers
      if (path === '/api/files/save' && request.method === 'POST') {
        const body: FileSaveRequest = await request.json()
        return await fileManager.saveFile(body)
      }
      
      if (path === '/api/files/read' && request.method === 'POST') {
        const body: FileReadRequest = await request.json()
        return await fileManager.readFile(body)
      }
      
      if (path === '/api/files/list' && request.method === 'POST') {
        const body: FileListRequest = await request.json()
        return await fileManager.listFiles(body)
      }
      
      if (path === '/api/files/exists' && request.method === 'POST') {
        const body: FileExistsRequest = await request.json()
        return await fileManager.fileExists(body)
      }

      // Default response for unknown endpoints
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
