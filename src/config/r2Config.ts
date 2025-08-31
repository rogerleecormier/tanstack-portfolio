// R2 Configuration
export const R2_CONFIG = {
  // Custom domain for R2 bucket
  // NOTE: This domain has CORS issues when accessed from rcormier.dev
  // Cloudflare R2 custom domains don't support CORS configuration
  // BASE_URL: 'https://files.rcormier.dev',
  
  // Use the public R2 bucket URL (has rate limits but works with CORS)
  BASE_URL: 'https://pub-d976666cda3244a8a0fa73abc1043959.r2.dev',
  
  BUCKET_NAME: 'tanstack-portfolio-r2',
  
  // Content directories
  DIRECTORIES: {
    PORTFOLIO: 'portfolio',
    BLOG: 'blog',
    PROJECTS: 'projects'
  },
  
  // Cache settings
  CACHE: {
    // Cache duration in seconds
    DURATION: 3600, // 1 hour
    
    // Enable/disable caching
    ENABLED: true
  }
}

// Helper function to build R2 URLs
export function buildR2Url(directory: string, fileName: string): string {
  return `${R2_CONFIG.BASE_URL}/${directory}/${fileName}`
}

// Helper function to get portfolio URL
export function getPortfolioUrl(fileName: string): string {
  return buildR2Url(R2_CONFIG.DIRECTORIES.PORTFOLIO, fileName)
}

// Helper function to get blog URL
export function getBlogUrl(fileName: string): string {
  return buildR2Url(R2_CONFIG.DIRECTORIES.BLOG, fileName)
}

// Helper function to get project URL
export function getProjectUrl(fileName: string): string {
  return buildR2Url(R2_CONFIG.DIRECTORIES.PROJECTS, fileName)
}
