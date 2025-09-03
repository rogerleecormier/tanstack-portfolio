import { addMinutes } from "date-fns";

// User Profiles API Service
// Handles CRUD operations for user profiles and weight goals

export interface UserProfile {
  id: string;
  name: string;
  age: number; // Keep age for backward compatibility
  birthdate?: string; // ISO date string (YYYY-MM-DD) - optional for now
  gender: 'male' | 'female' | 'other';
  height_ft: number;
  height_in: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  timezone: string; // Add timezone field
  created_at: string;
  updated_at: string;
}

export interface WeightGoal {
  id: number;
  user_id: string;
  target_weight_lbs: number;
  start_weight_lbs: number;
  start_date: string;
  target_date?: string;
  weekly_goal_lbs: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationType {
  id: number;
  name: string;
  generic_name: string;
  weekly_efficacy_multiplier: number;
  max_weight_loss_percentage: number;
  typical_duration_weeks: number;
  description: string;
}

export interface UserMedication {
  id: string;
  user_id: string;
  medication_type_id: number;
  start_date: string;
  end_date?: string;
  dosage_mg?: number;
  frequency: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  medication_type?: MedicationType;
}

export interface MedicationProjection {
  natural_weekly_loss: number;
  medication_weekly_loss: number;
  natural_timeline_weeks: number;
  medication_timeline_weeks: number;
  medication_impact_percentage: number;
  projected_completion_date: string;
}

export interface CreateUserProfileRequest {
  name: string;
  birthdate?: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  height_ft: number;
  height_in: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  timezone?: string;
}

export interface UpdateUserProfileRequest extends Partial<CreateUserProfileRequest> {
  id: string;
}

export interface CreateWeightGoalRequest {
  user_id: string;
  target_weight_lbs: number;
  start_weight_lbs: number;
  start_date: string;
  target_date?: string;
  weekly_goal_lbs: number;
}

export interface UpdateWeightGoalRequest extends Partial<CreateWeightGoalRequest> {
  id: number;
}

// Utility functions for unit conversions
export const convertLbsToKg = (lbs: number): number => {
  return lbs * 0.453592;
};

export const convertKgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const convertFtInToCm = (ft: number, inches: number): number => {
  return (ft * 12 + inches) * 2.54;
};

export const convertCmToFtIn = (cm: number): { ft: number; inches: number } => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
};

// Timezone utilities
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: '-09:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: '-10:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
  { value: 'Europe/London', label: 'British Time (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: '+10:00' }
];

export const getCurrentTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York'; // Fallback to ET
  }
};

// Calculate age from birthdate
export const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate BMR using Mifflin-St Jeor Equation
export const calculateBMR = (profile: UserProfile): number => {
  const age = profile.birthdate ? calculateAge(profile.birthdate) : profile.age;
  const heightCm = convertFtInToCm(profile.height_ft, profile.height_in);
  const weightKg = 70; // Default weight for BMR calculation (will be updated when we have current weight)
  
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
};

// Calculate TDEE based on activity level
export const calculateTDEE = (profile: UserProfile): number => {
  const bmr = calculateBMR(profile);
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[profile.activity_level]);
};

// Medication-related calculations
export const calculateMedicationProjection = (
  startWeight: number,
  targetWeight: number,
  naturalWeeklyLoss: number,
  medicationMultiplier: number
): MedicationProjection => {
  const totalWeightToLose = startWeight - targetWeight;
  
  // Natural timeline (without medication)
  const naturalTimelineWeeks = Math.ceil(totalWeightToLose / naturalWeeklyLoss);
  
  // Medication-enhanced timeline
  const medicationWeeklyLoss = naturalWeeklyLoss * medicationMultiplier;
  const medicationTimelineWeeks = Math.ceil(totalWeightToLose / medicationWeeklyLoss);
  
  // Calculate impact percentage
  const medicationImpactPercentage = ((naturalTimelineWeeks - medicationTimelineWeeks) / naturalTimelineWeeks) * 100;
  
  // Projected completion date
  const projectedCompletionDate = new Date();
  projectedCompletionDate.setDate(projectedCompletionDate.getDate() + (medicationTimelineWeeks * 7));
  
  return {
    natural_weekly_loss: naturalWeeklyLoss,
    medication_weekly_loss: medicationWeeklyLoss,
    natural_timeline_weeks: naturalTimelineWeeks,
    medication_timeline_weeks: medicationTimelineWeeks,
    medication_impact_percentage: Math.round(medicationImpactPercentage * 10) / 10,
    projected_completion_date: projectedCompletionDate.toISOString().split('T')[0]
  };
};

export const getMedicationTypes = async (): Promise<MedicationType[]> => {
  try {
    const response = await fetch('https://healthbridge-enhanced.rcormier.workers.dev/api/v2/medication-types');
    if (!response.ok) {
      throw new Error(`Failed to fetch medication types: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching medication types:', error);
    // Fallback to hardcoded data if API fails
    return [
      {
        id: 1,
        name: 'Ozempic',
        generic_name: 'Semaglutide',
        weekly_efficacy_multiplier: 1.4,
        max_weight_loss_percentage: 20.0,
        typical_duration_weeks: 68,
        description: 'Weekly injection, GLP-1 receptor agonist, typically results in 15-20% weight loss over 68 weeks'
      },
      {
        id: 2,
        name: 'Zepbound',
        generic_name: 'Tirzepatide',
        weekly_efficacy_multiplier: 1.75,
        max_weight_loss_percentage: 25.0,
        typical_duration_weeks: 72,
        description: 'Weekly injection, dual GIP/GLP-1 receptor agonist, typically results in 20-25% weight loss over 72 weeks'
      },
      {
        id: 3,
        name: 'Wegovy',
        generic_name: 'Semaglutide',
        weekly_efficacy_multiplier: 1.4,
        max_weight_loss_percentage: 20.0,
        typical_duration_weeks: 68,
        description: 'Higher dose semaglutide specifically for weight loss, same efficacy as Ozempic'
      },
      {
        id: 4,
        name: 'Mounjaro',
        generic_name: 'Tirzepatide',
        weekly_efficacy_multiplier: 1.75,
        max_weight_loss_percentage: 25.0,
        typical_duration_weeks: 72,
        description: 'Same medication as Zepbound but marketed for diabetes, same weight loss efficacy'
      }
    ];
  }
};

export const formatDateInTimezone = (dateString: string, timezone: string): string => {
  try {
    // Parse the date string and create a Date object in local timezone
    // This prevents the "day before" issue when converting UTC dates
    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      // Create date at noon local time to avoid timezone conversion issues
      const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      return localDate.toLocaleDateString('en-US', { timeZone: timezone });
    }
    // Fallback to original method if parsing fails
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { timeZone: timezone });
  } catch {
    return new Date(dateString).toLocaleDateString();
  }
};

// Utility to safely convert calendar date to local date string
export const calendarDateToLocalString = (date: Date): string => {
  // Create a new date object in local timezone
  const localDate = new Date();
  localDate.setFullYear(date.getFullYear());
  localDate.setMonth(date.getMonth());
  localDate.setDate(date.getDate());
  localDate.setHours(12, 0, 0, 0); // Set to noon to avoid midnight edge cases
  
  // Format as YYYY-MM-DD
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Timezone adjustment utility using date-fns
export const adjustForTimezone = (date: Date): Date => {
  const offset = date.getTimezoneOffset();
  // getTimezoneOffset() returns negative for timezones ahead of UTC, positive for behind
  // We need to add the offset to get the correct local date
  return addMinutes(date, offset);
};

// Convert calendar date to local date string using browser's locale
export const calendarDateToLocalStringWithTZ = (date: Date): string => {
  try {
    // Use toLocaleString with browser's default locale for reliable timezone handling
    const year = date.toLocaleString('default', { year: 'numeric' });
    const month = date.toLocaleString('default', { month: '2-digit' });
    const day = date.toLocaleString('default', { day: '2-digit' });
    
    // Generate yyyy-mm-dd date string
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('toLocaleString failed, using fallback:', error);
    
    // Fallback to simple date extraction
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
};

// Mock API service (replace with actual API calls when backend is ready)
export class UserProfilesAPI {
  static readonly API_BASE_URL = 'https://healthbridge-enhanced.rcormier.workers.dev/api/v2';
  
  // User Profile CRUD operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/profile?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Profile not found
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const profile = await response.json();
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        const mockProfile: UserProfile = {
          id: userId,
          name: 'Demo User',
          age: 35,
          birthdate: '1989-01-01',
          gender: 'male',
          height_ft: 5,
          height_in: 10,
          activity_level: 'moderate',
          timezone: 'America/New_York',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return mockProfile;
      }
      throw error; // Re-throw in production
    }
  }
  
  static async createUserProfile(data: CreateUserProfileRequest): Promise<UserProfile> {
    // Mock implementation - replace with actual API call
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      ...data,
      age: data.age || (data.birthdate ? calculateAge(data.birthdate) : 25), // Default age if not provided
      birthdate: data.birthdate || undefined,
      timezone: data.timezone || getCurrentTimezone(), // Default timezone if not provided
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newProfile;
  }
  
  static async updateUserProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      console.log('API_BASE_URL:', UserProfilesAPI.API_BASE_URL);
      console.log('Full URL:', `${UserProfilesAPI.API_BASE_URL}/user/profile`);
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Fallback to mock implementation if API fails
      const existingProfile = await UserProfilesAPI.getUserProfile(data.id);
      if (!existingProfile) {
        throw new Error('User profile not found');
      }
      
      const updatedProfile: UserProfile = {
        ...existingProfile,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock API: Profile updated (fallback):', updatedProfile);
      return updatedProfile;
    }
  }
  
  static async deleteUserProfile(userId: string): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log(`Deleting user profile: ${userId}`);
  }
  
  // Weight Goal CRUD operations
  static async getWeightGoal(userId: string): Promise<WeightGoal | null> {
    try {
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/weight-goal?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Goal not found
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const goal = await response.json();
      return goal;
    } catch (error) {
      console.error('Error fetching weight goal:', error);
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        const mockGoal: WeightGoal = {
          id: 1,
          user_id: userId,
          target_weight_lbs: 180.0,
          start_weight_lbs: 200.0,
          start_date: new Date().toISOString().split('T')[0],
          target_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          weekly_goal_lbs: 1.5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return mockGoal;
      }
      throw error; // Re-throw in production
    }
  }
  
  static async createWeightGoal(data: CreateWeightGoalRequest): Promise<WeightGoal> {
    // Mock implementation - replace with actual API call
    const newGoal: WeightGoal = {
      id: Date.now(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newGoal;
  }
  
  static async updateWeightGoal(data: UpdateWeightGoalRequest): Promise<WeightGoal> {
    try {
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/weight-goal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const updatedGoal = await response.json();
      return updatedGoal;
    } catch (error) {
      console.error('Error updating weight goal:', error);
      // Fallback to mock implementation if API fails
      const existingGoal = await UserProfilesAPI.getWeightGoal(data.id?.toString() || '1');
      if (!existingGoal) {
        throw new Error('Weight goal not found');
      }
      
      const updatedGoal = {
        ...existingGoal,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock API: Weight goal updated (fallback):', updatedGoal);
      return updatedGoal;
    }
  }
  
  static async deleteWeightGoal(goalId: number): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log(`Deleting weight goal: ${goalId}`);
  }
  
  // Medication CRUD operations
  static async getUserMedications(userId: string): Promise<UserMedication[]> {
    try {
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/medications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No medications found
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const medications = await response.json();
      
      // If the API doesn't return medication_type data, fetch it separately and join
      if (medications.length > 0 && !medications[0].medication_type) {
        try {
          const medicationTypes = await getMedicationTypes();
          
          // Join medication data with medication type data
          const enrichedMedications = medications.map((med: { medication_type_id: number; [key: string]: unknown }) => {
            const medicationType = medicationTypes.find(type => type.id === med.medication_type_id);
            return {
              ...med,
              medication_type: medicationType || null
            };
          });
          
          return enrichedMedications;
        } catch (typeError) {
          console.error('Error fetching medication types:', typeError);
          // Return medications without type data if that fails
          return medications;
        }
      }
      
      return medications;
    } catch (error) {
      console.error('Error fetching user medications:', error);
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`Mock API: Fetching medications for user: ${userId}`);
        return [];
      }
      throw error; // Re-throw in production
    }
  }
  
  static async createUserMedication(data: Omit<UserMedication, 'id' | 'created_at' | 'updated_at'>): Promise<UserMedication> {
    // Mock implementation - replace with actual API call
    const newMedication: UserMedication = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newMedication;
  }
  
  static async updateUserMedication(data: Partial<UserMedication> & { id: string }): Promise<UserMedication> {
    try {
      console.log('Sending medication update to:', `${UserProfilesAPI.API_BASE_URL}/user/medication`);
      console.log('Data being sent:', data);
      
      const response = await fetch(`${UserProfilesAPI.API_BASE_URL}/user/medication`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const updatedMedication = await response.json();
      console.log('Response data:', updatedMedication);
      return updatedMedication;
    } catch (error) {
      console.error('Error updating medication:', error);
      // Only return mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`Mock API: Updating medication: ${data.id}`);
        const mockMedication: UserMedication = {
          id: data.id,
          user_id: data.user_id || '',
          medication_type_id: data.medication_type_id || 1,
          start_date: data.start_date || new Date().toISOString().split('T')[0],
          end_date: data.end_date,
          dosage_mg: data.dosage_mg,
          frequency: data.frequency || 'weekly',
          is_active: data.is_active ?? true,
          notes: data.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return mockMedication;
      }
      throw error; // Re-throw in production
    }
  }
  
  static async deleteUserMedication(medicationId: string): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log(`Deleting medication: ${medicationId}`);
  }
}
