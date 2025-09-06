import '@testing-library/jest-dom';

// Simple mock function
const mockFn = () => {};

// Mock TinyMCE for testing environment
Object.defineProperty(window, 'tinymce', {
  value: {
    init: mockFn,
    get: mockFn,
    remove: mockFn,
    Resource: {
      add: mockFn,
      get: mockFn,
    },
    util: {
      Tools: {
        resolve: mockFn,
      },
    },
  },
  writable: true,
});

// Mock document for server-side rendering
if (typeof document === 'undefined') {
  global.document = {
    createElement: mockFn,
    querySelector: mockFn,
    querySelectorAll: mockFn,
    addEventListener: mockFn,
    removeEventListener: mockFn,
  } as unknown as Document;
}

// Mock Worker for testing environment
if (typeof Worker === 'undefined') {
  global.Worker = class MockWorker {
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
  } as unknown as typeof Worker;
}
