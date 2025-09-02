/**
 * @fileoverview Enhanced HealthBridge API Service
 * @description TypeScript interfaces and API functions for HealthBridge v2 endpoints
 * @author Roger Lee Cormier
 * @version 2.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals
 * - Advanced health metrics tracking
 * - Goal setting and progress tracking
 * - Trend analysis and analytics
 * - Comprehensive TypeScript interfaces
 */

// import { environment } from '../config/environment';

// Enhanced API base URL
const API_BASE_URL = 'https://healthbridge-enhanced.rcormier.workers.dev';

// TypeScript interfaces for enhanced data structures
export interface WeightMeasurement {
  id: number;
  weight: number;
  weight_lb: string;
  body_fat_percentage?: number;
  muscle_mass?: number;
  water_percentage?: number;
  timestamp: string;
  source: string;
}

export interface WeightProjection {
  date: string;
  projected_weight: number;
  confidence: number;
  daily_rate: number;
  days_from_now: number;
}

export interface WeightProjectionsResponse {
  current_weight: number;
  daily_rate: number;
  confidence: number;
  projections: WeightProjection[];
  algorithm: string;
}

export interface WeightTrends {
  period_days: number;
  moving_averages: {
    '7_day': number[] | null;
    '14_day': number[] | null;
    '30_day': number[] | null;
  };
  plateaus: Plateau[];
  overall_trend: 'gaining' | 'losing' | 'stable' | 'insufficient_data' | 'no_change';
  data_points: number;
  analysis_date: string;
}

export interface Plateau {
  start_date: string;
  end_date: string;
  duration_days: number;
  weight_change: number;
}

export interface WeightGoal {
  id: number;
  target_weight: number;
  start_weight: number;
  start_date: string;
  target_date?: string;
  weekly_goal?: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  goal_id: number;
  start_weight: number;
  target_weight: number;
  current_weight: number;
  weight_lost: number;
  weight_remaining: number;
  progress_percentage: number;
  days_since_start: number;
  projected_completion?: string;
  weekly_goal?: number;
  is_on_track: boolean;
}

export interface AnalyticsMetrics {
  total_measurements: number;
  period_days: string;
  current_weight: number;
  starting_weight: number;
  total_change: number;
  average_weight: number;
  min_weight: number;
  max_weight: number;
}

export interface AnalyticsTrends {
  overall_trend: string;
  weekly_average: number[] | null;
  consistency_score: number;
}

export interface AnalyticsDashboard {
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  projections: WeightProjectionsResponse;
  generated_at: string;
}

export interface ComparativeAnalytics {
  period1: { days: string; analytics: AnalyticsDashboard };
  period2: { days: string; analytics: AnalyticsDashboard };
  comparison: {
    weight_change: number;
    weight_change_percentage: number;
    improvement: boolean;
    trend_comparison: boolean;
    consistency_improvement: boolean;
  };
}

export interface CreateWeightMeasurementRequest {
  weight: number;
  unit: 'lb' | 'kg';
  timestamp: string;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  source?: string;
}

export interface SetGoalRequest {
  target_weight: number;
  start_weight: number;
  start_date: string;
  target_date?: string;
  weekly_goal?: number;
}

// Enhanced API service class
export class HealthBridgeEnhancedAPI {
  private static readonly API_TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 3;

  /**
   * Create a new weight measurement with enhanced data
   */
  static async createWeightMeasurement(data: CreateWeightMeasurementRequest): Promise<{ success: boolean; id: number; message: string }> {
    const response = await this.makeRequest('/api/v2/weight/measurement', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create weight measurement: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get weight measurements with enhanced filtering
   */
  static async getWeightMeasurements(options: {
    limit?: number;
    days?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<WeightMeasurement[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.days) params.append('days', options.days.toString());
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);

    const response = await this.makeRequest(`/api/v2/weight/measurement?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weight measurements: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get weight loss projections with confidence intervals
   */
  static async getWeightProjections(days: number = 30): Promise<WeightProjectionsResponse> {
    const response = await this.makeRequest(`/api/v2/weight/projections?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weight projections: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get weight trends and analysis
   */
  static async getWeightTrends(period: number = 30): Promise<WeightTrends> {
    const response = await this.makeRequest(`/api/v2/weight/trends?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weight trends: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get goal progress and achievements
   */
  static async getGoalProgress(): Promise<GoalProgress | { message: string }> {
    const response = await this.makeRequest('/api/v2/goals/progress');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch goal progress: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set or update weight loss goals
   */
  static async setGoal(data: SetGoalRequest): Promise<{ success: boolean; goal_id: number; message: string }> {
    const response = await this.makeRequest('/api/v2/goals/set', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to set goal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all goals (active and inactive)
   */
  static async getGoals(): Promise<WeightGoal[]> {
    const response = await this.makeRequest('/api/v2/goals/set');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get analytics dashboard data
   */
  static async getAnalyticsDashboard(period: number = 30): Promise<AnalyticsDashboard> {
    const response = await this.makeRequest(`/api/v2/analytics/dashboard?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get comparative analytics between different periods
   */
  static async getComparativeAnalytics(period1: number = 30, period2: number = 60): Promise<ComparativeAnalytics> {
    const response = await this.makeRequest(`/api/v2/analytics/comparative?period1=${period1}&period2=${period2}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comparative analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Make request with retry logic
   */
  static async makeRequestWithRetry(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = this.MAX_RETRIES
  ): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.makeRequest(endpoint, options);
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
}

// Utility functions for data processing
export class HealthDataUtils {
  /**
   * Calculate BMI from weight and height
   */
  static calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  static calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
  }

  /**
   * Calculate TDEE based on activity level
   */
  static calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'): number {
    const multipliers = {
      sedentary: 1.2,      // Little or no exercise
      light: 1.375,         // Light exercise 1-3 days/week
      moderate: 1.55,       // Moderate exercise 3-5 days/week
      active: 1.725,        // Heavy exercise 6-7 days/week
      very_active: 1.9      // Very heavy exercise, physical job
    };
    
    return bmr * multipliers[activityLevel];
  }

  /**
   * Calculate weight loss rate in kg/week
   */
  static calculateWeightLossRate(startWeight: number, currentWeight: number, daysElapsed: number): number {
    const weightLost = startWeight - currentWeight;
    const weeksElapsed = daysElapsed / 7;
    return weightLost / weeksElapsed;
  }

  /**
   * Calculate projected weight loss date
   */
  static calculateProjectedDate(currentWeight: number, targetWeight: number, weeklyRate: number): Date {
    const weightToLose = currentWeight - targetWeight;
    const weeksToGoal = weightToLose / weeklyRate;
    const daysToGoal = weeksToGoal * 7;
    
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);
    
    return projectedDate;
  }

  /**
   * Format weight for display
   */
  static formatWeight(weightKg: number, unit: 'kg' | 'lb' = 'lb'): string {
    if (unit === 'lb') {
      const weightLb = weightKg * 2.20462;
      return `${weightLb.toFixed(1)} lb`;
    }
    return `${weightKg.toFixed(1)} kg`;
  }

  /**
   * Calculate percentage change
   */
  static calculatePercentageChange(original: number, current: number): number {
    return ((current - original) / original) * 100;
  }

  /**
   * Get trend direction from percentage change
   */
  static getTrendDirection(percentageChange: number): 'increasing' | 'decreasing' | 'stable' {
    if (percentageChange > 1) return 'increasing';
    if (percentageChange < -1) return 'decreasing';
    return 'stable';
  }
}

// Export default instance for easy use
export default HealthBridgeEnhancedAPI;
