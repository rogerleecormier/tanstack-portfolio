import { environment } from '../config/environment';

export type WeightRow = {
  date: string
  kg: number
}

// Security utilities for API calls
class APISecurity {
  // Validate API response data
  static validateWeightData(data: unknown): WeightRow[] {
    if (!Array.isArray(data)) {
      throw new Error('Invalid API response format');
    }
    
    return data.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Invalid item at index ${index}`);
      }
      
      const weightItem = item as Record<string, unknown>;
      
      if (typeof weightItem.date !== 'string' || typeof weightItem.kg !== 'number') {
        throw new Error(`Invalid item structure at index ${index}`);
      }
      
      // Validate date format (basic check)
      if (!/^\d{4}-\d{2}-\d{2}/.test(weightItem.date)) {
        throw new Error(`Invalid date format at index ${index}`);
      }
      
      // Validate weight range (reasonable bounds)
      if (weightItem.kg < 0 || weightItem.kg > 1000) {
        throw new Error(`Weight out of reasonable range at index ${index}`);
      }
      
      return {
        date: weightItem.date,
        kg: weightItem.kg
      };
    });
  }
  
  // Rate limiting for API calls
  private static apiAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private static readonly MAX_API_ATTEMPTS = 10;
  private static readonly API_WINDOW_MS = 60000; // 1 minute
  
  static isAPICallAllowed(endpoint: string): boolean {
    const now = Date.now();
    const record = this.apiAttempts.get(endpoint);
    
    if (!record) {
      this.apiAttempts.set(endpoint, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - record.lastAttempt > this.API_WINDOW_MS) {
      record.count = 1;
      record.lastAttempt = now;
      return true;
    }
    
    // Increment attempt count
    record.count++;
    record.lastAttempt = now;
    
    return record.count <= this.MAX_API_ATTEMPTS;
  }
}

export async function fetchWeights(): Promise<WeightRow[]> {
  // Rate limiting check
  if (!APISecurity.isAPICallAllowed('health-bridge-weights')) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), environment.api.timeout);
    
    const res = await fetch("https://health-bridge-api.rcormier.workers.dev/api/health/weight?limit=100000", {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Portfolio-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Validate and sanitize the response data
    const validatedData = APISecurity.validateWeightData(data);
    
    return validatedData;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('API request timed out');
      }
      throw error;
    }
    throw new Error('Failed to fetch weights: Unknown error');
  }
}

// Additional secure API functions
export async function fetchWeightsWithRetry(retries: number = environment.api.retryAttempts): Promise<WeightRow[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchWeights();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All retry attempts failed');
}