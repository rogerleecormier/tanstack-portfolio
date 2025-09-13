# Centralized Logging Utility

A comprehensive logging system that provides centralized, environment-aware logging across the entire site with specialized methods for different types of operations.

## Features

- **Environment-aware**: Automatically detects development vs production environments
- **Production-safe**: Only shows warnings and errors in production by default
- **Debug Toggle**: Optional debug mode for production troubleshooting
- **Categorized logging**: 15+ specialized logging methods for different purposes
- **Emoji indicators**: Visual indicators for easy log identification
- **Singleton pattern**: Single instance shared across the entire application
- **Performance optimized**: No unnecessary console operations in production

## Usage

### Basic Import

```typescript
// Import the logger instance
import { logger } from '@/utils/logger';

// Or import specific methods for convenience
import {
  debug,
  info,
  success,
  warn,
  error,
  aiWorker,
  network,
  validation,
} from '@/utils/logger';

// Or use default export
import logger from '@/utils/logger';
```

### Core Log Levels

```typescript
// Debug - only in dev/localhost (🐛)
logger.debug('Debug information', additionalData);

// Info - only in dev/localhost (ℹ️)
logger.info('General information', context);

// Success - only in dev/localhost (✅)
logger.success('Operation completed successfully');

// Warning - always shown (⚠️)
logger.warn('Something to be aware of');

// Error - always shown (❌)
logger.error('Something went wrong', errorDetails);
```

### Specialized Logging Methods

The logger provides 15+ specialized methods for different types of operations:

#### Content Discovery & Management

```typescript
// File discovery (✓)
logger.discovered('portfolio.md');

// Missing files (✗)
logger.notFound('missing-file.md');

// Content summary with counts (📚)
logger.contentSummary(14, 10, 1); // portfolio, blog, projects
```

#### AI & Worker Operations

```typescript
// AI worker operations (🤖)
logger.aiWorker('Processing request...', requestData);

// Portfolio loading operations (📁)
logger.portfolioLoading('Loading portfolio items...', count);
```

#### Network & API Operations

```typescript
// Network requests (🌐)
logger.network('API call to:', endpoint);

// Data transmission (📤)
logger.data('Sending data:', payload);

// Response handling (📡)
logger.response('Response received:', responseData);

// Worker URL operations (📍)
logger.location('Worker URL:', url);
```

#### Security & Authentication

```typescript
// Security operations (🔒)
logger.security('Authentication check...', user);
```

#### Asset & File Operations

```typescript
// Asset loading (📦)
logger.assetLoading('Loading asset:', assetPath);

// MIME type operations (🔧)
logger.mimeType('Detected MIME type:', mimeType);
```

#### Validation & Testing

```typescript
// Input validation (🔍)
logger.validation('Validating input:', inputData);

// Testing operations (🧪)
logger.test('Running test...', testName);
```

### Environment Detection & Debug Control

```typescript
// Get current environment information
const env = logger.getEnvironmentInfo();
console.log(env);
// Output: { isDevelopment: true, isLocalhost: true, shouldLog: true }

// Toggle debug mode for production troubleshooting
logger.toggleDebug(); // Enables/disables all logging in production
// Console output: "🔧 Debug mode enabled - all logs will be shown"
```

### Environment Behavior

The logger automatically detects the environment using:

- **Development Detection**: `import.meta.env.DEV` (Vite environment variable)
- **Localhost Detection**: Checks `window.location.hostname` for:
  - `localhost`
  - `127.0.0.1`
  - Any hostname containing `localhost`

**Log Visibility Rules:**

- **Development/Localhost**: All logs are shown (debug, info, success, warn, error)
- **Production**: Only warnings and errors are shown by default
- **Debug Toggle**: When enabled, all logs are shown regardless of environment

## Migration from console.log

### Before (Direct console usage)

```typescript
console.log('🔍 Attempting AI analysis...');
console.log('✅ Success!');
console.error('❌ Error occurred');
console.log('📁 Loading portfolio items...');
console.log('🌐 API call to:', endpoint);
```

### After (Using logger)

```typescript
logger.aiWorker('Attempting AI analysis...');
logger.success('Success!');
logger.error('Error occurred');
logger.portfolioLoading('Loading portfolio items...');
logger.network('API call to:', endpoint);
```

### Benefits of Migration

1. **Consistent Formatting**: All logs use standardized emoji indicators
2. **Environment Control**: Automatic production/development behavior
3. **Performance**: No unnecessary console operations in production
4. **Maintainability**: Centralized logging configuration
5. **Debug Control**: Easy to enable/disable logging for troubleshooting

## Advanced Features

### Debug Toggle for Production

The logger includes a `toggleDebug()` method that allows enabling all logging in production for troubleshooting:

```typescript
// In production, call this in browser console to enable all logging
logger.toggleDebug();

// Console output: "🔧 Debug mode enabled - all logs will be shown"
// All subsequent logs will be displayed regardless of environment
```

### Singleton Pattern

The logger uses a singleton pattern, ensuring a single instance across the entire application:

```typescript
// All these imports reference the same instance
import { logger } from '@/utils/logger';
import { debug, info } from '@/utils/logger';
import loggerDefault from '@/utils/logger';

// logger === loggerDefault === same instance
```

### Performance Optimization

The logger is designed for optimal performance:

- **Conditional Execution**: Log methods check environment before executing
- **No String Interpolation**: Avoids unnecessary string processing in production
- **Minimal Overhead**: Only essential operations are performed
- **Early Returns**: Methods return immediately if logging is disabled

## Configuration

The logger requires no manual configuration. It automatically detects:

- **Development Mode**: `import.meta.env.DEV` (Vite environment variable)
- **Localhost Detection**: `window.location.hostname` matching patterns
- **Browser Environment**: Checks for `window` object availability

## Best Practices

### Do's

- Use specialized methods when available (`aiWorker`, `network`, etc.)
- Include relevant context data with log messages
- Use appropriate log levels for the situation
- Leverage debug toggle for production troubleshooting

### Don'ts

- Don't use `console.log` directly (use logger instead)
- Don't log sensitive information (passwords, tokens, etc.)
- Don't over-log in production-critical paths
- Don't rely on logs for critical application logic

## Troubleshooting

### Logs Not Appearing in Development

1. Check if you're importing the logger correctly
2. Verify environment detection: `logger.getEnvironmentInfo()`
3. Ensure you're using the correct log level for your environment

### Need Logs in Production

1. Open browser console
2. Call `logger.toggleDebug()` to enable all logging
3. Reproduce the issue to see detailed logs
4. Remember to disable debug mode when done

### Performance Issues

1. Ensure you're not calling logger methods in tight loops
2. Use appropriate log levels to avoid unnecessary processing
3. Consider using conditional logging for expensive operations
