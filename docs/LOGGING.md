# Centralized Logging Utility

This utility provides centralized logging across the entire site that automatically handles development vs production environments.

## Features

- **Environment-aware**: Only shows logs in development or on localhost
- **Production-safe**: In production, only warnings and errors are shown
- **Categorized logging**: Different log types for different purposes
- **Emoji support**: Visual indicators for different log types

## Usage

### Basic Import

```typescript
import { logger } from './utils/logger';
// or import specific methods
import { info, error, warn } from './utils/logger';
```

### Log Levels

```typescript
// Debug - only in dev/localhost
logger.debug('Debug information');

// Info - only in dev/localhost
logger.info('General information');

// Success - only in dev/localhost
logger.success('Operation completed successfully');

// Warning - always shown
logger.warn('Something to be aware of');

// Error - always shown
logger.error('Something went wrong');
```

### Specialized Logging Methods

```typescript
// Content discovery
logger.discovered('portfolio.md');
logger.notFound('missing-file.md');
logger.contentSummary(14, 10, 1);

// AI Worker
logger.aiWorker('Processing request...');
logger.portfolioLoading('Loading portfolio items...');

// Testing
logger.test('Running test...');

// Network & Security
logger.network('API call to...');
logger.security('Authentication check...');
logger.location('Worker URL:', url);

// Data & Response
logger.data('Sending data:', data);
logger.response('Response received:', response);

// Validation
logger.validation('Validating input:', input);
```

### Environment Detection

```typescript
const env = logger.getEnvironmentInfo();
console.log(env);
// Output: { isDevelopment: true, isLocalhost: true, shouldLog: true }
```

## Migration from console.log

### Before

```typescript
console.log('🔍 Attempting AI analysis...');
console.log('✅ Success!');
console.error('❌ Error occurred');
```

### After

```typescript
logger.aiWorker('Attempting AI analysis...');
logger.success('Success!');
logger.error('Error occurred');
```

## Benefits

1. **Clean production logs**: No debug info cluttering production console
2. **Consistent formatting**: All logs use the same style and emojis
3. **Easy to disable**: Can easily turn off all logging by modifying the logger
4. **Performance**: No unnecessary console operations in production
5. **Maintainability**: Centralized logging logic

## Configuration

The logger automatically detects:

- `import.meta.env.DEV` for development mode
- `window.location.hostname` for localhost detection

No manual configuration needed!
