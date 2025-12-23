/**
 * Shared type definitions for admin feature.
 */

// Connectivity test result
export interface ConnectivityTestResult {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  latency?: number;
  timestamp: string;
}

// Admin section type
export type AdminSection =
  | 'ai-workers'
  | 'email'
  | 'newsletter'
  | 'content-search'
  | 'healthbridge'
  | 'recommendations'
  | 'r2-bucket'
  | 'cloudflare-access';
