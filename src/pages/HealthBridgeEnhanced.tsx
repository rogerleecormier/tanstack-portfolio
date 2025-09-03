/**
 * @fileoverview Enhanced HealthBridge Weight Analysis Dashboard
 * @description Advanced weight loss tracking with projections and comprehensive analytics (pounds only)
 * @author Roger Lee Cormier
 * @version 3.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals (pounds only)
 * - Advanced trend analysis and analytics
 * - Enhanced data visualization with shadcn charts
 * - Comprehensive health metrics tracking
 * - Mobile-responsive design with modern UI
 * - Goals are managed in Settings page only
 * 
 * @technologies
 * - React 19 with TypeScript
 * - TanStack React Query for data fetching
 * - shadcn/ui components and charts
 * - Tailwind CSS for styling
 * - Cloudflare Access authentication
 * 
 * @searchKeywords
 * - weight loss projections
 * - health analytics
 * - fitness tracking
 * - weight tracking
 * - health metrics
 * - fitness dashboard
 * - weight loss trends
 * - health data visualization
 * 
 * @searchTags
 * ["health", "fitness", "analytics", "weight-loss", "projections", "tracking", "dashboard", "metrics"]
 * 
 * @searchSection
 * "Health Analysis"
 * 
 * @searchDescription
 * "Advanced weight loss tracking dashboard with projections and comprehensive health analytics. Features weight loss projections, trend analysis, and data visualization in pounds."
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3, Activity, Zap, TableIcon, Scale, Pill } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Dummy data for non-authenticated users
const DUMMY_DATA = {
  weightGoal: {
    target_weight_lbs: 165,
    target_date: "2024-06-15T00:00:00.000Z"
  },
  userMedications: [
    {
      id: "1",
      medication_type: {
        name: "Zepbound",
        generic_name: "Tirzepatide",
        weekly_efficacy_multiplier: 1.75
      },
      dosage_mg: 5,
      frequency: "weekly",
      start_date: "2024-01-01T00:00:00.000Z",
      is_active: true
    }
  ],
  weightData: [
    { weight: 178.5, weight_lb: 178.5, timestamp: "2024-01-15T08:00:00Z" },
    { weight: 179.2, weight_lb: 179.2, timestamp: "2024-01-14T08:00:00Z" },
    { weight: 180.1, weight_lb: 180.1, timestamp: "2024-01-13T08:00:00Z" },
    { weight: 181.3, weight_lb: 181.3, timestamp: "2024-01-12T08:00:00Z" },
    { weight: 182.8, weight_lb: 182.8, timestamp: "2024-01-11T08:00:00Z" },
    { weight: 183.5, weight_lb: 183.5, timestamp: "2024-01-10T08:00:00Z" },
    { weight: 184.2, weight_lb: 184.2, timestamp: "2024-01-09T08:00:00Z" },
    { weight: 185.1, weight_lb: 185.1, timestamp: "2024-01-08T08:00:00Z" },
    { weight: 186.4, weight_lb: 186.4, timestamp: "2024-01-07T08:00:00Z" },
    { weight: 187.6, weight_lb: 187.6, timestamp: "2024-01-06T08:00:00Z" },
    { weight: 188.9, weight_lb: 188.9, timestamp: "2024-01-05T08:00:00Z" },
    { weight: 189.7, weight_lb: 189.7, timestamp: "2024-01-04T08:00:00Z" },
    { weight: 190.3, weight_lb: 190.3, timestamp: "2024-01-03T08:00:00Z" },
    { weight: 191.2, weight_lb: 191.2, timestamp: "2024-01-02T08:00:00Z" },
    { weight: 192.2, weight_lb: 192.2, timestamp: "2024-01-01T08:00:00Z" }
  ],
  projections: {
    daily_rate: -0.15,
    confidence: 0.89,
    algorithm: "Linear Regression"
  },
  analytics: {
    metrics: {
      starting_weight: 192.2,
      current_weight: 178.5,
      average_weight: 185.4,
      min_weight: 178.5,
      max_weight: 192.2
    },
    trends: {
      overall_trend: "losing",
      consistency_score: 87
    },
    generated_at: new Date().toISOString()
  }
};

// Enhanced API imports
import HealthBridgeEnhancedAPI, {
  CreateWeightMeasurementRequest
} from "../api/healthBridgeEnhanced";
import type { AnalyticsDashboard } from "../api/healthBridgeEnhanced";

// User profiles API for weight goals
import { UserProfilesAPI } from "../api/userProfiles";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H1 } from "@/components/ui/typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// shadcn charts and recharts
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

/**
 * Enhanced weight entry component with additional health metrics (pounds only)
 */
function EnhancedWeightEntry() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const mutation = useMutation({
    mutationFn: async (data: CreateWeightMeasurementRequest) => {
      return await HealthBridgeEnhancedAPI.createWeightMeasurement(data);
    },
    onSuccess: () => {
      setSuccess(true);
      setWeight("");
      queryClient.invalidateQueries({ queryKey: ["enhanced-weights"] });
      queryClient.invalidateQueries({ queryKey: ["projections"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const val = Number(weight);
    if (isNaN(val) || val <= 0) {
      setError(`Enter a valid weight in ${unit}`);
      return;
    }
    
    if (!date) {
      setError("Please select a date/time");
      return;
    }

    const data: CreateWeightMeasurementRequest = {
      weight: val,
      unit,
      timestamp: date.toISOString(),
      source: "Manual Entry"
    };

    mutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Add Weight Measurement
        </CardTitle>
        <CardDescription>
          Track your weight to monitor your weight loss progress (all data displayed in pounds)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <Select value={unit} onValueChange={(value: "lb" | "kg") => setUnit(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">Weight measurement added successfully!</div>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? "Adding..." : "Add Measurement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Weight projections component with medication scenarios and target goals (pounds only)
 */
function WeightProjections() {
  const { user, isAuthenticated } = useAuth();
  
  // Always call hooks, but conditionally use their data
  const weightGoalQuery = useQuery({
    queryKey: ["weightGoal", user?.sub],
    queryFn: () => UserProfilesAPI.getWeightGoal(user?.sub || ''),
    enabled: !!user?.sub && isAuthenticated,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userMedicationsQuery = useQuery({
    queryKey: ["userMedications", user?.sub],
    queryFn: () => UserProfilesAPI.getUserMedications(user?.sub || ''),
    enabled: !!user?.sub && isAuthenticated,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const weightDataQuery = useQuery({
    queryKey: ["enhanced-weights"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeights(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const projectionsQuery = useQuery({
    queryKey: ["projections"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(90), // 90 days for better trend analysis
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use dummy data when not authenticated, real data when authenticated
  const weightGoal = isAuthenticated ? weightGoalQuery.data : DUMMY_DATA.weightGoal;
  const userMedications = isAuthenticated ? userMedicationsQuery.data : DUMMY_DATA.userMedications;
  const weightData = isAuthenticated ? weightDataQuery.data : DUMMY_DATA.weightData;
  const projections = isAuthenticated ? projectionsQuery.data : DUMMY_DATA.projections;

  // Set loading states based on authentication
  const isLoadingWeightGoal = isAuthenticated && weightGoalQuery.isLoading;
  const isLoadingMedications = isAuthenticated && userMedicationsQuery.isLoading;
  const isLoadingWeights = isAuthenticated && weightDataQuery.isLoading;
  const projectionsError = isAuthenticated && projectionsQuery.error;

  // State for projection controls
  const [projectionDays, setProjectionDays] = useState(90);
  const [showMedication, setShowMedication] = useState(true);
  const [showNoMedication, setShowNoMedication] = useState(true);

  // Handle projection period change
  const handleProjectionPeriodChange = (value: string) => {
    const newPeriod = Number(value);
    setProjectionDays(newPeriod);
  };

  // Calculate key weight values
  const currentWeight = useMemo(() => {
    if (weightData && weightData.length > 0) {
      const weight = weightData[0].weight_lb || weightData[0].weight;
      return typeof weight === 'string' ? parseFloat(weight) : weight;
    }
    return null;
  }, [weightData]);

  const startingWeight = useMemo(() => {
    if (weightData && weightData.length > 0) {
      // Sort by date to get chronological order
      const sortedWeightData = [...weightData].sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateA.getTime() - dateB.getTime();
      });
      const weight = sortedWeightData[0].weight_lb || sortedWeightData[0].weight;
      return typeof weight === 'string' ? parseFloat(weight) : weight;
    }
    return null;
  }, [weightData]);

  const targetWeight = useMemo(() => {
    return weightGoal?.target_weight_lbs || 150;
  }, [weightGoal]);

  const targetDate = useMemo(() => {
    return weightGoal?.target_date ? new Date(weightGoal.target_date) : null;
  }, [weightGoal]);

  // Calculate medication multiplier based on user's actual medications
  const medicationMultiplier = useMemo(() => {
    if (!userMedications || userMedications.length === 0) {
      return 0; // No active medications
    }

    // Find active medications
    const activeMedications = userMedications.filter(med => med.is_active);
    if (activeMedications.length === 0) {
      return 0; // No active medications
    }

    // Calculate combined multiplier for all active medications
    let totalMultiplier = 0;
    
          activeMedications.forEach(medication => {
        let baseMultiplier = 0;
        let dosageMultiplier = 1;
        
        // Base multiplier from medication type (from database)
        if (medication.medication_type?.weekly_efficacy_multiplier) {
          baseMultiplier = medication.medication_type.weekly_efficacy_multiplier - 1; // Convert to boost percentage
        } else {
          // Fallback multipliers by medication name
          switch (medication.medication_type?.name?.toLowerCase()) {
            case 'ozempic':
            case 'wegovy':
              baseMultiplier = 0.4; // 40% improvement (semaglutide)
              break;
            case 'zepbound':
            case 'mounjaro':
              baseMultiplier = 0.75; // 75% improvement (tirzepatide)
              break;
            default:
              baseMultiplier = 0.2; // 20% default
          }
        }

        // Calculate dosage-based multiplier
        if (medication.dosage_mg) {
          const dosage = medication.dosage_mg;
          
          // Dosage scaling based on medication type
          if (medication.medication_type?.name?.toLowerCase() === 'zepbound' || 
              medication.medication_type?.generic_name?.toLowerCase() === 'tirzepatide') {
            // Zepbound/Tirzepatide dosage scaling (2.5mg to 15mg)
            if (dosage <= 2.5) dosageMultiplier = 0.3;        // 2.5mg = 30% of max efficacy
            else if (dosage <= 5) dosageMultiplier = 0.6;      // 5mg = 60% of max efficacy
            else if (dosage <= 7.5) dosageMultiplier = 0.75;   // 7.5mg = 75% of max efficacy
            else if (dosage <= 10) dosageMultiplier = 0.85;    // 10mg = 85% of max efficacy
            else if (dosage <= 12.5) dosageMultiplier = 0.95;  // 12.5mg = 95% of max efficacy
            else dosageMultiplier = 1.0;                       // 15mg = 100% of max efficacy
          } else if (medication.medication_type?.name?.toLowerCase() === 'ozempic' || 
                     medication.medication_type?.name?.toLowerCase() === 'wegovy' ||
                     medication.medication_type?.generic_name?.toLowerCase() === 'semaglutide') {
            // Ozempic/Wegovy/Semaglutide dosage scaling (0.25mg to 2.4mg)
            if (dosage <= 0.25) dosageMultiplier = 0.2;       // 0.25mg = 20% of max efficacy
            else if (dosage <= 0.5) dosageMultiplier = 0.4;    // 0.5mg = 40% of max efficacy
            else if (dosage <= 1.0) dosageMultiplier = 0.6;    // 1.0mg = 60% of max efficacy
            else if (dosage <= 1.7) dosageMultiplier = 0.8;    // 1.7mg = 80% of max efficacy
            else dosageMultiplier = 1.0;                       // 2.4mg = 100% of max efficacy
          } else {
            // Generic dosage scaling for other medications
            dosageMultiplier = Math.min(dosage / 10, 1.0); // Assume 10mg is 100% efficacy
          }
        }

        // Adjust for dosing frequency
        let frequencyMultiplier = 1;
        switch (medication.frequency?.toLowerCase()) {
          case 'daily':
            frequencyMultiplier = 1.0;
            break;
          case 'weekly':
            frequencyMultiplier = 1.0; // Standard dosing
            break;
          case 'bi-weekly':
          case 'biweekly':
            frequencyMultiplier = 0.7; // Reduced effectiveness
            break;
          case 'monthly':
            frequencyMultiplier = 0.4; // Much reduced effectiveness
            break;
          default:
            frequencyMultiplier = 1.0;
        }

        // Calculate final medication contribution
        const medicationContribution = baseMultiplier * dosageMultiplier * frequencyMultiplier;
        totalMultiplier += medicationContribution;
      });

    // Cap the maximum combined multiplier at 100% improvement
    return Math.min(totalMultiplier, 1.0);
  }, [userMedications]);

  // Calculate projections with proper domain and range
  const projectionData = useMemo(() => {
    if (!currentWeight || !startingWeight || !targetWeight || !projections?.daily_rate) {
      return [];
    }

    const baseDailyRate = projections.daily_rate;
    const medicationDailyRate = baseDailyRate * (1 + medicationMultiplier);
    
    const projectionResults = [];
    const today = new Date();
    const lastWeightDate = weightData && weightData.length > 0 ? new Date(weightData[0].timestamp) : today;
    
    // Always use the selected projection period from the dropdown
    const maxDays = projectionDays;
    
    // Create granular projections based on the selected period
    let stepDays = 1; // Default to daily steps
    
    if (maxDays <= 30) {
      stepDays = 1; // Daily for 30 days or less
    } else if (maxDays <= 90) {
      stepDays = Math.max(1, Math.floor(maxDays / 30)); // ~30 data points for 90 days
    } else if (maxDays <= 365) {
      stepDays = Math.max(1, Math.floor(maxDays / 50)); // ~50 data points for longer periods
    } else {
      stepDays = Math.max(1, Math.floor(maxDays / 100)); // ~100 data points for very long periods
    }
    
    for (let i = 0; i <= maxDays; i += stepDays) {
      const date = new Date(lastWeightDate);
      date.setDate(date.getDate() + i);
      
      const days = i;
      
      // Calculate weights with validation
      const noMedWeight = Math.max(targetWeight, currentWeight + (baseDailyRate * days));
      const medWeight = Math.max(targetWeight, currentWeight + (medicationDailyRate * days));
      
      // Format date based on the projection period
      let dateFormat = "MMM dd";
      if (maxDays > 90) {
        dateFormat = "MMM yy";
      } else if (maxDays > 30) {
        dateFormat = "MMM dd";
      }
      
      projectionResults.push({
        date: format(date, dateFormat),
        day: days,
        noMedication: noMedWeight,
        withMedication: medWeight,
        target: targetWeight,
        currentWeight: i === 0 ? currentWeight : undefined // Mark starting point
      });
    }
    
    return projectionResults;
  }, [currentWeight, startingWeight, targetWeight, projections, medicationMultiplier, projectionDays, weightData]);

  // Calculate key metrics
  const totalWeightToLose = useMemo(() => {
    return startingWeight && currentWeight ? startingWeight - currentWeight : 0;
  }, [startingWeight, currentWeight]);

  const weightLostPercentage = useMemo(() => {
    return startingWeight && totalWeightToLose > 0 ? ((totalWeightToLose / startingWeight) * 100).toFixed(1) : '0.0';
  }, [startingWeight, totalWeightToLose]);

  const weeksToTargetNoMed = useMemo(() => {
    if (!currentWeight || !targetWeight || !projections?.daily_rate) return 0;
    const dailyRate = Math.abs(projections.daily_rate);
    return dailyRate > 0 ? Math.ceil((currentWeight - targetWeight) / (dailyRate * 7)) : 0;
  }, [currentWeight, targetWeight, projections]);

  const weeksToTargetWithMed = useMemo(() => {
    if (!currentWeight || !targetWeight || !projections?.daily_rate || medicationMultiplier <= 0) return weeksToTargetNoMed;
    const dailyRate = Math.abs(projections.daily_rate * (1 + medicationMultiplier));
    return dailyRate > 0 ? Math.ceil((currentWeight - targetWeight) / (dailyRate * 7)) : 0;
  }, [currentWeight, targetWeight, projections, medicationMultiplier, weeksToTargetNoMed]);

  const medicationBenefit = useMemo(() => {
    return Math.max(0, weeksToTargetNoMed - weeksToTargetWithMed);
  }, [weeksToTargetNoMed, weeksToTargetWithMed]);

  // Get active medication names for display
  const activeMedicationNames = useMemo(() => {
    if (!userMedications || userMedications.length === 0) return 'No active medications';
    
    return userMedications
      .filter(med => med.is_active)
      .map(med => {
        // Get medication name from medication_type relationship
        let name = 'Unknown Medication';
        if (med.medication_type?.name) {
          name = med.medication_type.name;
        } else if (med.medication_type?.generic_name) {
          name = med.medication_type.generic_name;
        }
        
        const dosage = med.dosage_mg ? ` ${med.dosage_mg}mg` : '';
        const frequency = med.frequency ? ` (${med.frequency})` : '';
        return `${name}${dosage}${frequency}`;
      })
      .join(', ');
  }, [userMedications]);

  // Loading states
  if (isLoadingWeights || isLoadingWeightGoal || isLoadingMedications) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">Loading weight data and settings...</div>
        </CardContent>
      </Card>
    );
  }

  // Error handling (only for authenticated users)
  if (isAuthenticated && projectionsError) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load required data. Please check your connection and try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have sufficient data
  if (!currentWeight || !startingWeight) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-amber-600">
            No weight data available. Please enter your weight first to see projections.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Current Status & Goals
          </CardTitle>
          <CardDescription>
            Your current weight, target goals, and medication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-2">Current Weight</div>
              <div className="text-3xl font-bold text-blue-700">
                {currentWeight?.toFixed(1) || 'N/A'} lbs
              </div>
              {weightData && weightData.length > 0 && (
                <div className="text-xs text-blue-500 mt-1">
                  {new Date(weightData[0].timestamp || '').toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-2">Target Weight</div>
              <div className="text-3xl font-bold text-green-700">
                {targetWeight?.toFixed(1) || 'N/A'} lbs
              </div>
              {weightGoal && (
                <div className="text-xs text-green-500 mt-1">
                  From settings
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-2">Target Date</div>
              <div className="text-3xl font-bold text-purple-700">
                {targetDate ? targetDate.toLocaleDateString() : 'Not set'}
              </div>
              {targetDate && (
                <div className="text-xs text-purple-500 mt-1">
                  {Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium mb-2">Active Medications</div>
              <div className="text-lg font-bold text-orange-700">
                {userMedications?.filter(med => med.is_active).length || 0}
              </div>
              <div className="text-xs text-orange-500 mt-1">
                {medicationMultiplier > 0 ? `+${(medicationMultiplier * 100).toFixed(0)}% boost` : 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

             {/* Medication Details */}
       {userMedications && userMedications.filter(med => med.is_active).length > 0 && (
         <Card className="w-full">
           <CardHeader>
                       <CardTitle className="flex items-center gap-2">
             <Pill className="h-5 w-5" />
             Current Medications
           </CardTitle>
             <CardDescription>
               Active medications and their impact on weight loss projections
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {userMedications
                 .filter(med => med.is_active)
                 .map((medication) => (
                   <div key={medication.id} className="p-4 bg-muted rounded-lg">
                     <div className="flex justify-between items-start">
                       <div>
                                                  <h4 className="font-semibold text-lg">
                           {medication.medication_type?.name || 'Unknown Medication'}
                         </h4>
                         <p className="text-sm text-muted-foreground">
                           {medication.medication_type?.generic_name || 'Generic name not available'}
                         </p>
                         <div className="flex gap-4 mt-2 text-sm">
                           {medication.dosage_mg && (
                             <span className="text-blue-600">
                               <strong>Dosage:</strong> {medication.dosage_mg}mg
                             </span>
                           )}
                           {medication.frequency && (
                             <span className="text-green-600">
                               <strong>Frequency:</strong> {medication.frequency}
                             </span>
                           )}
                           {medication.start_date && (
                             <span className="text-purple-600">
                               <strong>Started:</strong> {new Date(medication.start_date).toLocaleDateString()}
                             </span>
                           )}
                         </div>
                         
                       </div>
                                               <div className="text-right">
                          {(() => {
                            // Calculate actual efficacy based on dosage and frequency
                            let baseMultiplier = 0;
                            let dosageMultiplier = 1;
                            
                            if (medication.medication_type?.weekly_efficacy_multiplier) {
                              baseMultiplier = medication.medication_type.weekly_efficacy_multiplier - 1;
                            } else {
                              // Fallback calculation
                              switch (medication.medication_type?.name?.toLowerCase()) {
                                case 'ozempic':
                                case 'wegovy':
                                  baseMultiplier = 0.4;
                                  break;
                                case 'zepbound':
                                case 'mounjaro':
                                  baseMultiplier = 0.75;
                                  break;
                                default:
                                  baseMultiplier = 0.2;
                              }
                            }
                            
                            // Calculate dosage multiplier
                            if (medication.dosage_mg) {
                              const dosage = medication.dosage_mg;
                              if (medication.medication_type?.name?.toLowerCase() === 'zepbound' || 
                                  medication.medication_type?.generic_name?.toLowerCase() === 'tirzepatide') {
                                if (dosage <= 2.5) dosageMultiplier = 0.3;
                                else if (dosage <= 5) dosageMultiplier = 0.6;
                                else if (dosage <= 7.5) dosageMultiplier = 0.75;
                                else if (dosage <= 10) dosageMultiplier = 0.85;
                                else if (dosage <= 12.5) dosageMultiplier = 0.95;
                                else dosageMultiplier = 1.0;
                              } else if (medication.medication_type?.name?.toLowerCase() === 'ozempic' || 
                                         medication.medication_type?.name?.toLowerCase() === 'wegovy' ||
                                         medication.medication_type?.generic_name?.toLowerCase() === 'semaglutide') {
                                if (dosage <= 0.25) dosageMultiplier = 0.2;
                                else if (dosage <= 0.5) dosageMultiplier = 0.4;
                                else if (dosage <= 1.0) dosageMultiplier = 0.6;
                                else if (dosage <= 1.7) dosageMultiplier = 0.8;
                                else dosageMultiplier = 1.0;
                              } else {
                                dosageMultiplier = Math.min(dosage / 10, 1.0);
                              }
                            }
                            
                            // Calculate frequency multiplier
                            let frequencyMultiplier = 1;
                            switch (medication.frequency?.toLowerCase()) {
                              case 'daily': frequencyMultiplier = 1.0; break;
                              case 'weekly': frequencyMultiplier = 1.0; break;
                              case 'bi-weekly':
                              case 'biweekly': frequencyMultiplier = 0.7; break;
                              case 'monthly': frequencyMultiplier = 0.4; break;
                              default: frequencyMultiplier = 1.0;
                            }
                            
                            const actualEfficacy = baseMultiplier * dosageMultiplier * frequencyMultiplier;
                            return (
                              <div className="text-lg font-bold text-green-600">
                                +{(actualEfficacy * 100).toFixed(0)}%
                              </div>
                            );
                          })()}
                          <div className="text-xs text-muted-foreground">Calculated Efficacy</div>
                        </div>
                     </div>
                   </div>
                 ))}
             </div>
           </CardContent>
         </Card>
       )}

      {/* Projection Controls */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projection Settings
          </CardTitle>
          <CardDescription>
            Configure your weight loss projection analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectionDays">Projection Period</Label>
                             <Select value={projectionDays.toString()} onValueChange={handleProjectionPeriodChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="7">7 days (1 week)</SelectItem>
                   <SelectItem value="14">14 days (2 weeks)</SelectItem>
                   <SelectItem value="30">30 days (1 month)</SelectItem>
                   <SelectItem value="60">60 days (2 months)</SelectItem>
                   <SelectItem value="90">90 days (3 months)</SelectItem>
                   <SelectItem value="120">120 days (4 months)</SelectItem>
                   <SelectItem value="180">180 days (6 months)</SelectItem>
                   <SelectItem value="365">365 days (1 year)</SelectItem>
                   {targetDate && (() => {
                     const diffTime = targetDate.getTime() - new Date().getTime();
                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                     if (diffDays > 0 && ![7, 14, 30, 60, 90, 120, 180, 365].includes(diffDays)) {
                       return <SelectItem value={diffDays.toString()}>{diffDays} days (to target date)</SelectItem>;
                     }
                     return null;
                   })()}
                 </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Current Trajectory</Label>
              <div className="text-2xl font-bold text-blue-600">
                {projections?.daily_rate ? Math.abs(projections.daily_rate * 7).toFixed(2) : 'N/A'} lbs/week
              </div>
              <div className="text-sm text-muted-foreground">
                Based on recent weight data
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medication Impact</Label>
              <div className="text-2xl font-bold text-green-600">
                {medicationMultiplier > 0 ? `+${(medicationMultiplier * 100).toFixed(0)}%` : 'None'}
              </div>
              <div className="text-sm text-muted-foreground">
                {medicationMultiplier > 0 ? 'Enhanced weight loss' : 'Natural weight loss only'}
              </div>
            </div>
          </div>

          {/* Scenario Toggles */}
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showMedication"
                checked={showMedication}
                onChange={(e) => setShowMedication(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showMedication" className="text-sm font-medium">
                With Medication ({medicationMultiplier > 0 ? `+${(medicationMultiplier * 100).toFixed(0)}% boost` : 'No active medications'})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showNoMedication"
                checked={showNoMedication}
                onChange={(e) => setShowNoMedication(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showNoMedication" className="text-sm font-medium">
                Without Medication (Natural trajectory)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Projection Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weight Loss Trajectory Projections</CardTitle>
                   <CardDescription>
           Projected weight loss from {startingWeight?.toFixed(1)} lbs to {targetWeight?.toFixed(1)} lbs
           {targetDate && `, targeting ${targetDate.toLocaleDateString()}`}
           <br />
           <span className="text-sm text-muted-foreground">
             Showing {projectionDays} day projection period • X-axis range: {projectionDays} days
           </span>
         </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chart Legend */}
          <div className="mb-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Current Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Without Medication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">With Medication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Target Weight</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ChartContainer
              config={{
                currentWeight: {
                  label: "Current Weight (lbs)",
                  color: "#3b82f6"
                },
                noMedication: {
                  label: "Without Medication (lbs)",
                  color: "#ef4444"
                },
                withMedication: {
                  label: "With Medication (lbs)",
                  color: "#10b981"
                },
                target: {
                  label: "Target Weight (lbs)",
                  color: "#8b5cf6"
                }
              }}
              className="h-full w-full"
            >
              <LineChart data={projectionData} width={800} height={320}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis 
                   dataKey="date" 
                   tick={{ fontSize: 12 }}
                   tickLine={false}
                   axisLine={false}
                   interval={Math.max(0, Math.floor(projectionData.length / 8))} // Show ~8 ticks for readability
                   tickFormatter={(value) => {
                     // Show more detailed date formatting for longer periods
                     if (projectionDays > 90) {
                       return value;
                     } else if (projectionDays > 30) {
                       return value;
                     } else {
                       return value;
                     }
                   }}
                 />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[targetWeight - 5, Math.max(startingWeight + 10, currentWeight + 20)]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[200px]"
                      nameKey="noMedication"
                    />
                  }
                />
                
                {/* Target Weight Line */}
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target Weight"
                />
                
                {/* Current Weight Starting Point */}
                <Line 
                  type="monotone" 
                  dataKey="currentWeight" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  dot={{ fill: "#3b82f6", strokeWidth: 3, r: 6 }}
                  connectNulls={false}
                  name="Current Weight"
                />
                
                {/* Without Medication */}
                {showNoMedication && (
                  <Line 
                    type="monotone" 
                    dataKey="noMedication" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                    name="Without Medication"
                  />
                )}
                
                {/* With Medication */}
                {showMedication && medicationMultiplier > 0 && (
                  <Line 
                    type="monotone" 
                    dataKey="withMedication" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    name="With Medication"
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytical Insights */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Projection Analysis & Insights</CardTitle>
          <CardDescription>
            Detailed breakdown of your weight loss journey and medication impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalWeightToLose.toFixed(1)} lbs
              </div>
              <div className="text-sm text-muted-foreground">Total Lost</div>
              <div className="text-xs text-blue-500 mt-1">{weightLostPercentage}% of starting weight</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {weeksToTargetNoMed} weeks
              </div>
              <div className="text-sm text-muted-foreground">To Target (Natural)</div>
              <div className="text-xs text-red-500 mt-1">Without medication</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {weeksToTargetWithMed} weeks
              </div>
              <div className="text-sm text-muted-foreground">To Target (Medication)</div>
              <div className="text-xs text-green-500 mt-1">With current medications</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {medicationBenefit} weeks
              </div>
              <div className="text-sm text-muted-foreground">Time Saved</div>
              <div className="text-xs text-purple-500 mt-1">Medication benefit</div>
            </div>
          </div>

          <Separator />

          {/* Detailed Analysis */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Weight Loss Journey Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Starting Weight:</strong> {startingWeight?.toFixed(1)} lbs
                  </p>
                  <p>
                    <strong>Current Weight:</strong> {currentWeight?.toFixed(1)} lbs
                  </p>
                  <p>
                    <strong>Target Weight:</strong> {targetWeight?.toFixed(1)} lbs
                  </p>
                  <p>
                    <strong>Total Lost:</strong> {totalWeightToLose.toFixed(1)} lbs ({weightLostPercentage}%)
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Current Trajectory:</strong> {projections?.daily_rate ? Math.abs(projections.daily_rate * 7).toFixed(2) : 'N/A'} lbs per week
                  </p>
                  <p>
                    <strong>Data Points:</strong> {weightData?.length || 0} weight measurements
                  </p>
                  <p>
                    <strong>Confidence Level:</strong> {projections?.confidence ? `${(projections.confidence * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                  <p>
                    <strong>Algorithm:</strong> {projections?.algorithm || 'Linear Regression'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Medication Impact Analysis</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                {medicationMultiplier > 0 ? (
                  <>
                    <p>
                      <strong>Active Medications:</strong> {activeMedicationNames}
                    </p>
                    <p>
                      <strong>Effectiveness Boost:</strong> Your current medications provide a {(medicationMultiplier * 100).toFixed(0)}% improvement in weight loss rate.
                    </p>
                    <p>
                      <strong>Enhanced Weekly Rate:</strong> {projections?.daily_rate ? Math.abs(projections.daily_rate * (1 + medicationMultiplier) * 7).toFixed(2) : 'N/A'} lbs per week with medication vs. {projections?.daily_rate ? Math.abs(projections.daily_rate * 7).toFixed(2) : 'N/A'} lbs per week naturally.
                    </p>
                    <p>
                      <strong>Time to Target:</strong> {weeksToTargetWithMed} weeks with medication vs. {weeksToTargetNoMed} weeks without medication.
                    </p>
                    <p>
                      <strong>Time Saved:</strong> {medicationBenefit} weeks faster to reach your target weight.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>No Active Medications:</strong> You're currently using natural weight loss methods only.
                    </p>
                    <p>
                      <strong>Consideration:</strong> Discuss weight loss medications with your healthcare provider to potentially accelerate your progress.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Recommendations & Insights</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                {medicationBenefit > 0 ? (
                  <>
                    <p>
                      <strong>Medication Benefits:</strong> Your current medication regimen could save you {medicationBenefit} weeks in reaching your target weight of {targetWeight} lbs.
                    </p>
                    <p>
                      <strong>Consistency is Key:</strong> Whether using medication or not, maintaining your current daily routine of {projections?.daily_rate ? Math.abs(projections.daily_rate).toFixed(3) : 'N/A'} lbs/day will be crucial for success.
                    </p>
                    <p>
                      <strong>Monitoring:</strong> Continue tracking your weight regularly to monitor medication effectiveness and adjust projections as needed.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Natural Progress:</strong> You're making steady progress toward your target weight. Consider if medication could provide additional benefits.
                    </p>
                    <p>
                      <strong>Lifestyle Factors:</strong> Focus on diet, exercise, and sleep quality to optimize your natural weight loss rate.
                    </p>
                  </>
                )}
                
                <p>
                  <strong>Target Achievement:</strong> Reaching your goal of {targetWeight} lbs will take {weeksToTargetNoMed} weeks naturally
                  {medicationMultiplier > 0 ? ` or ${weeksToTargetWithMed} weeks with your current medications.` : '.'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Data Quality & Confidence</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Data Points:</strong> Projections based on {weightData?.length || 0} weight measurements over {projectionDays} days.
                </p>
                <p>
                  <strong>Confidence Level:</strong> {projections?.confidence ? `${(projections.confidence * 100).toFixed(0)}%` : 'N/A'} confidence in current projections.
                </p>
                <p>
                  <strong>Algorithm:</strong> Using {projections?.algorithm || 'Linear Regression'} for trend analysis and future predictions.
                </p>
                <p>
                  <strong>Disclaimer:</strong> These projections are estimates based on historical data. Individual results may vary based on lifestyle changes, medical conditions, and adherence to treatment plans.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Analytics dashboard component (pounds only)
 */
function AnalyticsDashboard() {
  const { isAuthenticated } = useAuth();
  
  const analytics = isAuthenticated ? useQuery({
    queryKey: ["analytics"],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30),
  }).data : DUMMY_DATA.analytics;

  const isLoading = isAuthenticated && useQuery({
    queryKey: ["analytics"],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30),
  }).isLoading;

  const error = isAuthenticated && useQuery({
    queryKey: ["analytics"],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30),
  }).error;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load analytics. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendData = [
    { metric: "Starting", value: analytics.metrics.starting_weight },
    { metric: "Current", value: analytics.metrics.current_weight },
    { metric: "Average", value: analytics.metrics.average_weight },
    { metric: "Min", value: analytics.metrics.min_weight },
    { metric: "Max", value: analytics.metrics.max_weight },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your weight loss journey (pounds)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {trendData.map((item) => (
            <div key={item.metric} className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {item.value.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">{item.metric}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label>Overall Trend</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={
                analytics.trends.overall_trend === 'losing' ? 'default' :
                analytics.trends.overall_trend === 'gaining' ? 'destructive' : 'secondary'
              }>
                {analytics.trends.overall_trend.charAt(0).toUpperCase() + analytics.trends.overall_trend.slice(1)}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Consistency Score</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={analytics.trends.consistency_score} className="flex-1" />
              <span className="text-sm font-medium">
                {analytics.trends.consistency_score.toFixed(0)}%
              </span>
            </div>
                     </div>
         </div>

         {/* Chart Legend */}
         <div className="mb-4 flex flex-wrap gap-4 justify-center">
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
             <span className="text-sm text-muted-foreground">Weight Metrics</span>
           </div>
         </div>
         
         <div className="h-48 w-full">
          <ChartContainer
            config={{
              value: {
                label: "Weight (lbs)",
                color: "#3b82f6"
              }
            }}
            className="h-full w-full"
          >
            <BarChart data={trendData} width={400} height={200}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="metric" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="value"
                  />
                }
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Generated: {format(new Date(analytics.generated_at), "PPP 'at' p")}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Weight data table component with shadcn table and chart (pounds only)
 */
function WeightDataTable() {
  const { isAuthenticated } = useAuth();
  
  const measurements = isAuthenticated ? useQuery({
    queryKey: ["weight-measurements"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50 }),
  }).data : [];

  const isLoading = isAuthenticated && useQuery({
    queryKey: ["weight-measurements"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50 }),
  }).isLoading;

  const error = isAuthenticated && useQuery({
    queryKey: ["weight-measurements"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50 }),
  }).error;

  // State for chart filtering and sorting
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90" | "all">(isAuthenticated ? "30" : "all");
  const [chartSort, setChartSort] = useState<"asc" | "desc">("asc");
  const [showTrendline, setShowTrendline] = useState(true);
  const [showMovingAverage, setShowMovingAverage] = useState(true);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">Loading weight data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !measurements) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load weight data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use dummy data when not authenticated, real data when authenticated
  const mockMeasurements = isAuthenticated ? [] : DUMMY_DATA.weightData.map((item, index) => ({
    id: index + 1,
    weight: item.weight,
    weight_lb: `${item.weight} lbs`,
    weight_kg: `${(item.weight * 0.453592).toFixed(1)} kg`,
    timestamp: item.timestamp,
    source: "Scale"
  }));

  const displayData = isAuthenticated ? (measurements.length > 0 ? measurements : mockMeasurements) : mockMeasurements;

  // Prepare chart data with filtering and sorting
  const chartData = displayData
    .filter((measurement) => {
      if (chartPeriod === "all") return true;
      const days = parseInt(chartPeriod);
      const measurementDate = new Date(measurement.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return measurementDate >= cutoffDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return chartSort === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    })
    .map((measurement) => ({
      date: format(new Date(measurement.timestamp), "MMM dd"),
      weight: measurement.weight,
      timestamp: measurement.timestamp,
    }));

  // Simplify chart data - just use the basic weight data for now
  const simpleChartData = chartData.map((item, index) => ({
    name: item.date,
    weight: item.weight,
    index: index
  }));

  // Calculate moving average for the selected period
  const calculateMovingAverage = (data: typeof simpleChartData, period: number) => {
    if (data.length < period) return [];
    
    const movingAverages = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.weight, 0);
      const average = sum / period;
      movingAverages.push({
        name: data[i].name,
        avgWeight: average,
        index: data[i].index
      });
    }
    return movingAverages;
  };

  // Calculate trend line using linear regression
  const calculateTrendLine = (data: typeof simpleChartData) => {
    if (data.length < 2) return [];
    
    const n = data.length;
    const sumX = data.reduce((acc, _, index) => acc + index, 0);
    const sumY = data.reduce((acc, item) => acc + item.weight, 0);
    const sumXY = data.reduce((acc, item, index) => acc + (index * item.weight), 0);
    const sumXX = data.reduce((acc, _, index) => acc + (index * index), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((item, index) => ({
      name: item.name,
      trendWeight: slope * index + intercept,
      index: index
    }));
  };

  // Generate trend line and moving average data
  const trendLineData = showTrendline ? calculateTrendLine(simpleChartData) : [];
  const movingAverageData = showMovingAverage ? calculateMovingAverage(simpleChartData, 3) : [];

  // Combine all data into a single dataset to prevent chart shrinking
  const combinedChartData = simpleChartData.map((item, index) => {
    const trendItem = trendLineData.find(t => t.index === index);
    const avgItem = movingAverageData.find(a => a.index === index);
    
    return {
      ...item,
      trendWeight: trendItem?.trendWeight || null,
      avgWeight: avgItem?.avgWeight || null
    };
  });

  // Calculate fixed Y-axis domain based on original weight data only
  const calculateYAxisDomain = (data: typeof simpleChartData) => {
    if (data.length === 0) return [0, 100];
    
    const weights = data.map(item => item.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = Math.max(2, Math.round((max - min) * 0.1)); // 10% padding
    
    return [min - padding, max + padding];
  };

  const yAxisDomain = calculateYAxisDomain(simpleChartData);



  return (
    <div className="space-y-6">
      {/* Weight Loss Chart */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                             <CardTitle className="flex items-center gap-2">
                 <TrendingDown className="h-5 w-5" />
                 Weight Loss Progress Chart
               </CardTitle>
               <CardDescription className="mt-2">
                 Visualize your weight loss journey with interactive filtering and analysis
               </CardDescription>
            </div>
            
            {/* Chart Controls */}
            <div className="flex flex-wrap gap-2">
              {/* Period Filter */}
              <Select value={chartPeriod} onValueChange={(value: "7" | "30" | "90" | "all") => setChartPeriod(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

                             {/* Sort Direction */}
               <Select value={chartSort} onValueChange={(value: "asc" | "desc") => setChartSort(value)}>
                 <SelectTrigger className="w-24">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="asc">Oldest</SelectItem>
                   <SelectItem value="desc">Newest</SelectItem>
                 </SelectContent>
               </Select>

              {/* Chart Options */}
              <div className="flex items-center gap-2">
                <Button
                  variant={showTrendline ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTrendline(!showTrendline)}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trend
                </Button>
                <Button
                  variant={showMovingAverage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMovingAverage(!showMovingAverage)}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Avg
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
                 <CardContent>
           {/* Chart Legend */}
           <div className="mb-4 flex flex-wrap gap-4 justify-center">
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>
               <span className="text-sm text-muted-foreground">Weight Data</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-red-500 rounded-full"></div>
               <span className="text-sm text-muted-foreground">Trend Line</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-green-500 rounded-full"></div>
               <span className="text-sm text-muted-foreground">Moving Average</span>
             </div>
           </div>
           
           <div className="h-80 w-full overflow-hidden">
                             {simpleChartData.length > 0 ? (
                                      <div className="w-full h-full flex items-center justify-center">
                       <ChartContainer
                         config={{
                           weight: {
                             label: "Weight (lbs)",
                             color: "#0891b2"
                            },
                            trendWeight: {
                              label: "Trend Line",
                              color: "#ef4444"
                            },
                            avgWeight: {
                              label: "Moving Average",
                              color: "#10b981"
                           }
                         }}
                         className="h-full w-full"
                       >
                         <LineChart data={combinedChartData} width={800} height={320}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                           <XAxis 
                             dataKey="name" 
                             tick={{ fontSize: 12 }}
                             tickLine={false}
                             axisLine={false}
                           />
                           <YAxis 
                             tick={{ fontSize: 12 }}
                             tickLine={false}
                             axisLine={false}
                              domain={yAxisDomain}
                           />
                           <ChartTooltip
                             content={
                               <ChartTooltipContent
                                 className="w-[200px]"
                                 nameKey="weight"
                               />
                             }
                           />
                           <Line 
                             type="monotone" 
                             dataKey="weight" 
                             stroke="#0891b2" 
                             strokeWidth={3}
                             dot={{ fill: "#0891b2", strokeWidth: 2, r: 4 }}
                             activeDot={{ r: 6, stroke: "#0891b2", strokeWidth: 2 }}
                           />
                            
                                                                                      {/* Trend Line */}
                              {showTrendline && (
                                <Line 
                                  type="monotone" 
                                  dataKey="trendWeight" 
                                  stroke="#ef4444" 
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="Trend Line"
                                />
                              )}
                              
                              {/* Moving Average */}
                              {showMovingAverage && (
                                <Line 
                                  type="monotone" 
                                  dataKey="avgWeight" 
                                  stroke="#10b981" 
                                  strokeWidth={2}
                                  dot={{ fill: "#10b981", strokeWidth: 1, r: 3 }}
                                  name="Moving Average"
                                />
                              )}
                         </LineChart>
                       </ChartContainer>
                   </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No data available for the selected period
              </div>
            )}
            
            
             

            
            
                     </div>
           
           {/* Chart Summary */}
           <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                         <div className="text-center p-3 bg-muted rounded-lg">
               <div className="font-semibold text-lg">
                 {displayData.length > 0 ? displayData[0].weight : 0} lbs
               </div>
               <div className="text-muted-foreground">Current Weight</div>
             </div>
                         <div className="text-center p-3 bg-muted rounded-lg">
               <div className="font-semibold text-lg">
                 {displayData.length > 1 ? (displayData[0].weight - displayData[displayData.length - 1].weight).toFixed(1) : 0} lbs
               </div>
               <div className="text-muted-foreground">
                 Weight Change
               </div>
             </div>
             <div className="text-center p-3 bg-muted rounded-lg">
               <div className="font-semibold text-lg">
                 {displayData.length > 1 ? 
                   ((displayData[0].weight - displayData[displayData.length - 1].weight) / (displayData.length - 1)).toFixed(2) : 0
                 } lbs/day
               </div>
               <div className="text-muted-foreground">Average Rate</div>
             </div>
             <div className="text-center p-3 bg-muted rounded-lg">
               <div className="font-semibold text-lg">
                 {simpleChartData.length > 0 ? 
                   (simpleChartData.reduce((sum, item) => sum + item.weight, 0) / simpleChartData.length).toFixed(1) : 0
                 } lbs
               </div>
               <div className="text-muted-foreground">Average Weight</div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Data Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Weight Measurements Data
          </CardTitle>
          <CardDescription>
            Detailed view of all your weight measurements for trend analysis (pounds)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight (lbs)</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((measurement) => (
                  <TableRow key={measurement.id}>
                    <TableCell className="font-medium">
                      {format(new Date(measurement.timestamp), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{measurement.weight_lb}</TableCell>
                    <TableCell>{measurement.weight_kg}</TableCell>
                    <TableCell className="capitalize">{measurement.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {displayData.length} measurements • 
            Last updated: {displayData.length > 0 ? format(new Date(displayData[0].timestamp), "PPP 'at' p") : 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Enhanced HealthBridge main component
 */
export default function HealthBridgeEnhancedPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(isAuthenticated ? "overview" : "data");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Generate TOC entries for the sidebar
  useEffect(() => {
    const tocEntries = [
      { title: "📊 Weight Entry", slug: "weight-entry" },
      { title: "📈 Projections", slug: "projections" },
      { title: "📊 Analytics", slug: "analytics" },
      { title: "📋 Data Table", slug: "data-table" }
    ];

    // Dispatch custom event to update sidebar TOC
    window.dispatchEvent(new CustomEvent('toc-updated', { 
      detail: { toc: tocEntries, file: 'healthbridge-enhanced' } 
    }));

    // Clean up event when component unmounts
    return () => {
      window.dispatchEvent(new CustomEvent('toc-updated', { 
        detail: { toc: [], file: null } 
      }));
    };
  }, []);



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <H1 className="flex items-center justify-center gap-3 mb-4">
          <Zap className="h-8 w-8 text-blue-600" />
          HealthBridge Enhanced
        </H1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced weight loss tracking with AI-powered projections and comprehensive analytics (pounds only)
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          💡 Weight goals are managed in your <a href="/protected/settings" className="text-blue-600 hover:underline">Settings page</a>
        </p>
      </div>

             {!isAuthenticated && (
         <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl">
           <h2 className="text-xl font-semibold text-blue-900 mb-3">Welcome to HealthBridge Enhanced - Demo Mode</h2>
           <p className="text-blue-800 mb-4">
             This advanced weight loss tracking dashboard provides personalized insights, predictive modeling, and comprehensive analytics. 
             You're currently viewing in demo mode with sample data. Sign in to access your personal data and start tracking your health journey.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
             <div className="text-center p-3 bg-white/60 rounded-lg">
               <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
               <strong>Weight Projections</strong>
               <p className="text-blue-700">AI-powered predictions with medication analysis</p>
             </div>
             <div className="text-center p-3 bg-white/60 rounded-lg">
               <BarChart3 className="w-6 h-6 text-teal-600 mx-auto mb-2" />
               <strong>Advanced Analytics</strong>
               <p className="text-teal-700">Comprehensive health metrics and trends</p>
             </div>
             <div className="text-center p-3 bg-white/60 rounded-lg">
               <Pill className="w-6 h-6 text-blue-600 mx-auto mb-2" />
               <strong>Medication Tracking</strong>
               <p className="text-blue-700">Monitor medication effects on weight loss</p>
             </div>
           </div>
         </div>
       )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isAuthenticated ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {isAuthenticated && (
            <TabsTrigger value="overview">Enter Weight</TabsTrigger>
          )}
          <TabsTrigger value="data">Current Progress</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!isAuthenticated ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  Please sign in to enter weight data and access personalized features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/protected/site-admin'}
                  className="w-full"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          ) : (
            <EnhancedWeightEntry />
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Demo Mode:</strong> Showing sample data to demonstrate the dashboard features
              </p>
            </div>
          )}
          <WeightDataTable />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Demo Mode:</strong> Showing sample projections to demonstrate the dashboard features
              </p>
            </div>
          )}
          <WeightProjections />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Demo Mode:</strong> Showing sample analytics to demonstrate the dashboard features
              </p>
            </div>
          )}
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
