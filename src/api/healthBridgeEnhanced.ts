/**
 * @fileoverview Enhanced HealthBridge API Service
 * @description TypeScript interfaces and API functions for HealthBridge v2 endpoints (pounds only)
 * @author Roger Lee Cormier
 * @version 3.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals (pounds only)
 * - Advanced health metrics tracking
 * - Trend analysis and analytics
 * - Comprehensive TypeScript interfaces
 * - Goals are managed in Settings page only
 */

// import { environment } from '../config/environment';

// Use healthbridge-enhanced worker
const API_BASE_URL = 'https://healthbridge-enhanced.rcormier.workers.dev';

// TypeScript interfaces for enhanced data structures
export interface WeightMeasurement {
  id: number;
  weight: number; // Primary weight in pounds
  weight_lb: string; // Formatted pounds
  weight_kg: string; // Converted to kg for display
  timestamp: string;
  source: string;
}

export interface WeightProjection {
  date: string;
  projected_weight: number; // Weight in pounds
  confidence: number;
  daily_rate: number; // Rate in pounds per day
  days_from_now: number;
}

export interface WeightProjectionsResponse {
  current_weight: number; // Weight in pounds
  daily_rate: number; // Rate in pounds per day
  confidence: number;
  projections: WeightProjection[];
  algorithm: string;
  activity_level?: string;
  activity_multiplier?: number;
  medication_scenarios?: {
    no_medication: {
      daily_rate: number;
      projections: WeightProjection[];
    };
    with_medication: {
      daily_rate: number;
      multiplier: number;
      projections: WeightProjection[];
    };
  };
  user_medications?: Array<{
    name: string;
    dosage_mg?: number;
    frequency?: string;
    efficacy_multiplier?: number;
  }>;
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
  weight_change: number; // Weight change in pounds
}

export interface AnalyticsMetrics {
  total_measurements: number;
  period_days: string;
  current_weight: number; // Weight in pounds
  starting_weight: number; // Weight in pounds
  total_change: number; // Weight change in pounds
  average_weight: number; // Weight in pounds
  min_weight: number; // Weight in pounds
  max_weight: number; // Weight in pounds
}

export interface AnalyticsTrends {
  overall_trend: string;
  weekly_average: number[] | null; // Weights in pounds
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
    weight_change: number; // Weight change in pounds
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
  source?: string;
}

// Enhanced API service class
export class HealthBridgeEnhancedAPI {
  private static readonly API_TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 3;

  /**
   * Create a new weight measurement with enhanced data
   */
  static async createWeightMeasurement(data: CreateWeightMeasurementRequest): Promise<{ success: boolean; id: number; message: string }> {
    try {
      // TODO: Replace with actual API call once enhanced worker is deployed
      // For now, return mock success for development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Return mock success response
        return {
          success: true,
          id: Math.floor(Math.random() * 10000) + 1,
          message: 'Weight measurement created successfully (mock)'
        };
      }
      
      const response = await this.makeRequest('/api/v2/weight/measurement', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create weight measurement: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating weight measurement:', error);
      throw error;
    }
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
   * Get weight loss projections with confidence intervals (pounds only)
   */
  static async getWeightProjections(days: number = 30, userId?: string): Promise<WeightProjectionsResponse> {
    try {
      // TODO: Replace with actual API call once enhanced worker is deployed
      // For now, return mock data for development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Return mock projections data in pounds
        const mockProjections = [];
        const currentWeight = 168.7; // 168.7 lbs
        const dailyRate = -0.26; // -0.26 lbs per day
        
        for (let i = 1; i <= days; i++) {
          const projectedWeight = currentWeight + (dailyRate * i);
          mockProjections.push({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            projected_weight: Math.max(projectedWeight, 154.0), // Don't go below 154 lbs
            confidence: Math.max(0.95 - (i * 0.01), 0.7), // Confidence decreases over time
            daily_rate: dailyRate,
            days_from_now: i
          });
        }
        
        return {
          current_weight: currentWeight,
          daily_rate: dailyRate,
          confidence: 0.95,
          algorithm: 'linear_regression_v4_activity_medication_scenarios',
          activity_level: 'moderate',
          activity_multiplier: 1.0,
          projections: mockProjections,
          medication_scenarios: {
            no_medication: {
              daily_rate: dailyRate,
              projections: mockProjections
            },
            with_medication: {
              daily_rate: dailyRate * 1.4, // Assume 40% improvement with medication
              multiplier: 0.4,
              projections: mockProjections.map(p => ({
                ...p,
                weight: Math.max(p.projected_weight * 0.9, 154.0) // 10% better with medication
              }))
            }
          },
          user_medications: []
        };
      }
      
      const params = new URLSearchParams();
      params.append('days', days.toString());
      if (userId) params.append('userId', userId);
      
      const response = await this.makeRequest(`/api/v2/weight/projections?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch weight projections: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching weight projections:', error);
      throw error;
    }
  }

  /**
   * Get weight measurements (alias for getWeightMeasurements for backward compatibility)
   */
  static async getWeights(): Promise<WeightMeasurement[]> {
    return this.getWeightMeasurements({ limit: 100, days: 365 }); // Get last year of data
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
   * Get analytics dashboard data (pounds only)
   */
  static async getAnalyticsDashboard(period: number = 30, userId?: string): Promise<AnalyticsDashboard> {
    try {
      // TODO: Replace with actual API call once enhanced worker is deployed
      // For now, return mock data for development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Return mock analytics data in pounds
        return {
          generated_at: new Date().toISOString(),
          metrics: {
            total_measurements: 42,
            period_days: '30',
            current_weight: 168.7, // 168.7 lbs
            starting_weight: 187.4, // 187.4 lbs
            total_change: -18.7, // -18.7 lbs
            average_weight: 176.8, // 176.8 lbs
            min_weight: 167.6, // 167.6 lbs
            max_weight: 187.4 // 187.4 lbs
          },
          trends: {
            overall_trend: 'losing',
            weekly_average: [1.8, 1.7, 1.9, 1.6], // Weekly averages in lbs
            consistency_score: 78.5
          },
          projections: {
            current_weight: 168.7,
            daily_rate: -0.26,
            confidence: 0.95,
            algorithm: 'Linear Regression v2 (Pounds)',
            projections: []
          }
        };
      }
      
      const params = new URLSearchParams();
      params.append('period', period.toString());
      if (userId) params.append('userId', userId);
      
      const response = await this.makeRequest(`/api/v2/analytics/dashboard?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics dashboard: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      throw error;
    }
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

// Utility functions for data processing (pounds-focused)
export class HealthDataUtils {
  /**
   * Calculate BMI from weight and height
   */
  static calculateBMI(weightLbs: number, heightInches: number): number {
    const weightKg = weightLbs / 2.20462;
    const heightCm = heightInches * 2.54;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  static calculateBMR(weightLbs: number, heightInches: number, age: number, gender: 'male' | 'female'): number {
    const weightKg = weightLbs / 2.20462;
    const heightCm = heightInches * 2.54;
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
   * Calculate weight loss rate in lbs/week
   */
  static calculateWeightLossRate(startWeightLbs: number, currentWeightLbs: number, daysElapsed: number): number {
    const weightLost = startWeightLbs - currentWeightLbs;
    const weeksElapsed = daysElapsed / 7;
    return weightLost / weeksElapsed;
  }

  /**
   * Calculate projected weight loss date
   */
  static calculateProjectedDate(currentWeightLbs: number, targetWeightLbs: number, weeklyRateLbs: number): Date {
    const weightToLose = currentWeightLbs - targetWeightLbs;
    const weeksToGoal = weightToLose / weeklyRateLbs;
    const daysToGoal = weeksToGoal * 7;
    
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);
    
    return projectedDate;
  }

  /**
   * Format weight for display
   */
  static formatWeight(weightLbs: number, unit: 'kg' | 'lb' = 'lb'): string {
    if (unit === 'kg') {
      const weightKg = weightLbs / 2.20462;
      return `${weightKg.toFixed(1)} kg`;
    }
    return `${weightLbs.toFixed(1)} lbs`;
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
