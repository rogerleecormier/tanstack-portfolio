// Centralized logging utility for the entire site
// Only shows logs in development or on localhost

interface LogLevel {
  debug: boolean;
  info: boolean;
  warn: boolean;
  error: boolean;
}

class Logger {
  private isDevelopment: boolean;
  private isLocalhost: boolean;
  private logLevels: LogLevel;
  private forceDebug: boolean = true;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('localhost'));

    // In production, only show warnings and errors
    // In development/localhost, show all logs
    this.logLevels = {
      debug: this.isDevelopment || this.isLocalhost,
      info: this.isDevelopment || this.isLocalhost,
      warn: true, // Always show warnings
      error: true, // Always show errors
    };
  }

  // Toggle debug mode for production troubleshooting
  toggleDebug(): void {
    this.forceDebug = !this.forceDebug;
    if (this.forceDebug) {
      console.log('🔧 Debug mode enabled - all logs will be shown');
    } else {
      console.log('🔧 Debug mode disabled');
    }
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return this.logLevels[level] || this.forceDebug;
  }

  // Debug logging - only in dev/localhost
  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('🐛', ...args);
    }
  }

  // Info logging - only in dev/localhost
  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('ℹ️', ...args);
    }
  }

  // Success logging - only in dev/localhost
  success(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log('✅', ...args);
    }
  }

  // Warning logging - always shown
  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('⚠️', ...args);
    }
  }

  // Error logging - always shown
  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('❌', ...args);
    }
  }

  // Discovery logging - only in dev/localhost
  discovered(item: string): void {
    if (this.shouldLog('info')) {
      console.log(`✓ Discovered: ${item}`);
    }
  }

  // Not found logging - only in dev/localhost
  notFound(item: string): void {
    if (this.shouldLog('info')) {
      console.log(`✗ Not found: ${item}`);
    }
  }

  // Content discovery summary - only in dev/localhost
  contentSummary(portfolio: number, blog: number, projects: number): void {
    if (this.shouldLog('info')) {
      console.log(`📚 Content Discovery Summary:`);
      console.log(`  Portfolio: ${portfolio} files`);
      console.log(`  Blog: ${blog} files`);
      console.log(`  Projects: ${projects} files`);
    }
  }

  // AI worker logging - only in dev/localhost
  aiWorker(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🤖 ${message}`, ...args);
    }
  }

  // Portfolio loading logging - only in dev/localhost
  portfolioLoading(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`📁 ${message}`, ...args);
    }
  }

  // Test logging - only in dev/localhost
  test(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🧪 ${message}`, ...args);
    }
  }

  // Network logging - only in dev/localhost
  network(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🌐 ${message}`, ...args);
    }
  }

  // Security logging - only in dev/localhost
  security(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🔒 ${message}`, ...args);
    }
  }

  // Location logging - only in dev/localhost
  location(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`📍 ${message}`, ...args);
    }
  }

  // Data logging - only in dev/localhost
  data(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`📤 ${message}`, ...args);
    }
  }

  // Response logging - only in dev/localhost
  response(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`📡 ${message}`, ...args);
    }
  }

  // Asset loading logging - only in dev/localhost
  assetLoading(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`📦 ${message}`, ...args);
    }
  }

  // MIME type logging - only in dev/localhost
  mimeType(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🔧 ${message}`, ...args);
    }
  }

  // Validation logging - only in dev/localhost
  validation(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  // Get current environment info
  getEnvironmentInfo(): {
    isDevelopment: boolean;
    isLocalhost: boolean;
    shouldLog: boolean;
  } {
    return {
      isDevelopment: this.isDevelopment,
      isLocalhost: this.isLocalhost,
      shouldLog: this.isDevelopment || this.isLocalhost,
    };
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export individual methods for convenience (bound to avoid this scoping issues)
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const success = logger.success.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const discovered = logger.discovered.bind(logger);
export const notFound = logger.notFound.bind(logger);
export const contentSummary = logger.contentSummary.bind(logger);
export const aiWorker = logger.aiWorker.bind(logger);
export const portfolioLoading = logger.portfolioLoading.bind(logger);
export const test = logger.test.bind(logger);
export const network = logger.network.bind(logger);
export const security = logger.security.bind(logger);
export const location = logger.location.bind(logger);
export const data = logger.data.bind(logger);
export const response = logger.response.bind(logger);
export const assetLoading = logger.assetLoading.bind(logger);
export const mimeType = logger.mimeType.bind(logger);
export const validation = logger.validation.bind(logger);
export const getEnvironmentInfo = logger.getEnvironmentInfo.bind(logger);
export const toggleDebug = logger.toggleDebug.bind(logger);

// Default export
export default logger;
