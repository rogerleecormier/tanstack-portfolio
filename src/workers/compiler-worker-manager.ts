/**
 * Compiler Worker Manager
 * Manages communication with the compiler web worker and provides debounced compilation
 */

interface CompileMetrics {
  p50: number;
  p95: number;
  count: number;
  average: number;
}

interface WorkerMessage {
  type: string;
  data?: string;
  id?: string;
  result?: string;
  metrics?: CompileMetrics;
  message?: string;
}

interface PendingRequest {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class CompilerWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private debounceTimeouts = new Map<string, NodeJS.Timeout>();
  private requestId = 0;
  private metrics: CompileMetrics = {
    p50: 0,
    p95: 0,
    count: 0,
    average: 0,
  };

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      // Create worker from the compiled worker file
      this.worker = new Worker(
        new URL('./compiler.worker.ts', import.meta.url),
        {
          type: 'module',
        }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.rejectAllPendingRequests(new Error('Worker error'));
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      // Fallback to synchronous compilation
    }
  }

  private handleWorkerMessage(message: WorkerMessage) {
    const { type, id, result, metrics, message: errorMessage } = message;

    if (type === 'error') {
      const pendingRequest = this.pendingRequests.get(id || '');
      if (pendingRequest) {
        pendingRequest.reject(
          new Error(errorMessage || 'Unknown worker error')
        );
        this.pendingRequests.delete(id || '');
      }
      return;
    }

    if (type === 'metrics') {
      if (metrics) {
        this.metrics = metrics;
      }
      return;
    }

    const pendingRequest = this.pendingRequests.get(id || '');
    if (pendingRequest) {
      if (result) {
        pendingRequest.resolve(result);
      } else {
        pendingRequest.reject(new Error('No result from worker'));
      }
      this.pendingRequests.delete(id || '');
    }

    // Update metrics if provided
    if (metrics) {
      this.metrics = metrics;
    }
  }

  private generateRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  private rejectAllPendingRequests(error: Error) {
    for (const [, request] of this.pendingRequests) {
      request.reject(error);
    }
    this.pendingRequests.clear();
  }

  private async sendWorkerMessage(type: string, data: string): Promise<string> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const id = this.generateRequestId();

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject, timestamp: Date.now() });

      this.worker!.postMessage({ type, data, id });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Worker request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Debounced markdown to HTML conversion
   */
  async mdToHtml(markdown: string, debounceMs: number = 200): Promise<string> {
    const key = 'mdToHtml';

    // Clear existing timeout
    const existingTimeout = this.debounceTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const result = await this.sendWorkerMessage('mdToHtml', markdown);
          resolve(result);
        } catch (error) {
          reject(error);
        }
        this.debounceTimeouts.delete(key);
      }, debounceMs);

      this.debounceTimeouts.set(key, timeout);
    });
  }

  /**
   * Debounced HTML to markdown conversion
   */
  async htmlToMd(html: string, debounceMs: number = 200): Promise<string> {
    const key = 'htmlToMd';

    // Clear existing timeout
    const existingTimeout = this.debounceTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const result = await this.sendWorkerMessage('htmlToMd', html);
          resolve(result);
        } catch (error) {
          reject(error);
        }
        this.debounceTimeouts.delete(key);
      }, debounceMs);

      this.debounceTimeouts.set(key, timeout);
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): CompileMetrics {
    return { ...this.metrics };
  }

  /**
   * Request updated metrics from worker
   */
  async refreshMetrics(): Promise<CompileMetrics> {
    if (!this.worker) {
      return this.metrics;
    }

    return new Promise((resolve) => {
      const requestId = this.generateRequestId();

      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        if (event.data.type === 'metrics' && event.data.id === requestId) {
          this.worker!.removeEventListener('message', handleMessage);
          if (event.data.metrics) {
            this.metrics = event.data.metrics;
            resolve(event.data.metrics);
          } else {
            resolve(this.metrics);
          }
        }
      };

      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({ type: 'getMetrics', id: requestId });
    });
  }

  /**
   * Check if performance targets are met
   */
  checkPerformanceTargets(): { p50Target: boolean; p95Target: boolean } {
    return {
      p50Target: this.metrics.p50 < 200, // Target: <200ms p50
      p95Target: this.metrics.p95 < 500, // Target: <500ms p95
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Clear all timeouts
    for (const timeout of this.debounceTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.debounceTimeouts.clear();

    // Reject all pending requests
    this.rejectAllPendingRequests(new Error('Worker manager destroyed'));

    // Terminate worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance
let workerManager: CompilerWorkerManager | null = null;

export function getCompilerWorkerManager(): CompilerWorkerManager {
  if (!workerManager) {
    workerManager = new CompilerWorkerManager();
  }
  return workerManager;
}

export function destroyCompilerWorkerManager() {
  if (workerManager) {
    workerManager.destroy();
    workerManager = null;
  }
}
