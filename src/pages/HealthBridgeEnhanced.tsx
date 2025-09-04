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

// Enhanced API imports
import HealthBridgeEnhancedAPI, {
  CreateWeightMeasurementRequest
} from "../api/healthBridgeEnhanced";
import { UserProfilesAPI } from "../api/userProfiles";

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";

// shadcn/ui charts
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";

// Dummy data for non-authenticated users (no longer used - backend handles dummy data)
/* const DUMMY_DATA = {
  weightGoal: {
    target_weight_lbs: 165,
    target_date: "2024-06-15T00:00:00.000Z"
  },
  userMedications: [
    {
      id: "1",
      user_id: "dev-user-123",
      medication_type_id: 1,
      medication_type: {
        name: "Wegovy",
        generic_name: "Semaglutide",
        weekly_efficacy_multiplier: 1.5
      },
      medication_name: "Wegovy",
      generic_name: "Semaglutide",
      weekly_efficacy_multiplier: 1.5,
      dosage_mg: 2.4,
      frequency: "weekly",
      start_date: "2024-01-01T00:00:00.000Z",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    algorithm: "linear_regression_v4_activity_medication_scenarios",
    activity_level: "sedentary",
    activity_multiplier: 1.2,
    medication_scenarios: {
      no_medication: {
        daily_rate: -0.15,
        projections: []
      },
      with_medication: {
        daily_rate: -0.21,
        multiplier: 0.4,
        projections: []
      }
    },
    user_medications: []
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
    projections: {
      current_weight: 178.5,
      daily_rate: -0.15,
      confidence: 0.89,
      algorithm: "linear_regression_v4_activity_medication_scenarios",
      activity_level: "sedentary",
      activity_multiplier: 0.8,
      projections: []
    },
    generated_at: new Date().toISOString()
  }
}; */

// Additional imports needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { H1 } from "../components/ui/typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

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
  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email || user?.sub || 'dev-user-123';

  const weightGoalQuery = useQuery({
    queryKey: ["weightGoal", userId],
    queryFn: () => UserProfilesAPI.getWeightGoal(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userMedicationsQuery = useQuery({
    queryKey: ["userMedications", userId],
    queryFn: () => UserProfilesAPI.getUserMedications(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const weightDataQuery = useQuery({
    queryKey: ["enhanced-weights", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeights(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const projectionsQuery = useQuery({
    queryKey: ["projections", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(90, userId), // 90 days for better trend analysis
    enabled: true, // Always enabled to get dummy data when not authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use data from API calls (backend handles dummy data for dev users)
  const weightGoal = weightGoalQuery.data;
  const userMedications = userMedicationsQuery.data;
  const weightData = weightDataQuery.data;
  const projections = projectionsQuery.data;

  // State for dropdown selections
  const [medicationMode, setMedicationMode] = useState<'with' | 'without'>('without');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');

  // Set proper defaults based on user profile
  useEffect(() => {
    if (userMedications && userMedications.length > 0) {
      const hasActiveMedications = userMedications.some(med => med.is_active);
      if (hasActiveMedications) {
        setMedicationMode('with');
      }
    }
    
    if (projections?.activity_level) {
      setActivityLevel(projections.activity_level);
    }
  }, [userMedications, projections]);

  // Set loading states
  const isLoadingWeightGoal = weightGoalQuery.isLoading;
  const isLoadingMedications = userMedicationsQuery.isLoading;
  const isLoadingWeights = weightDataQuery.isLoading;
  const projectionsError = isAuthenticated && projectionsQuery.error;

  // State for projection controls
  const [projectionDays, setProjectionDays] = useState(90);

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
    if (!weightGoal?.target_date) return null;
    // Handle both ISO date strings and date-only strings
    const dateStr = weightGoal.target_date.includes('T') ? weightGoal.target_date : weightGoal.target_date + 'T00:00:00';
    return new Date(dateStr);
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
      
      // Use evidence-based multipliers from clinical trials (prioritize accuracy over database values)
      const medName = (medication.medication_name || medication.medication_type?.name || '').toLowerCase();
      const genericName = (medication.generic_name || medication.medication_type?.generic_name || '').toLowerCase();
      
      switch (medName) {
        case 'ozempic':
        case 'wegovy':
          // STEP trials: 15-18% weight loss at 2.4mg vs 2.6% placebo
          // Efficacy ratio: (15-2.6)/2.6 = 4.8x improvement
          baseMultiplier = 0.48; // 48% improvement (semaglutide)
          break;
        case 'zepbound':
        case 'mounjaro':
          // SURMOUNT trials: 20-22% weight loss at 15mg vs 2.4% placebo  
          // Efficacy ratio: (20-2.4)/2.4 = 7.3x improvement
          baseMultiplier = 0.73; // 73% improvement (tirzepatide)
          break;
        case 'saxenda':
          // SCALE trials: 8% weight loss vs 2.6% placebo
          // Efficacy ratio: (8-2.6)/2.6 = 2.1x improvement
          baseMultiplier = 0.21; // 21% improvement (liraglutide)
          break;
        case 'qsymia':
          // EQUIP trials: 9.3% weight loss vs 1.2% placebo
          // Efficacy ratio: (9.3-1.2)/1.2 = 6.8x improvement
          baseMultiplier = 0.68; // 68% improvement (phentermine-topiramate)
          break;
        case 'contrave':
          // COR-II trials: 6.1% weight loss vs 1.3% placebo
          // Efficacy ratio: (6.1-1.3)/1.3 = 3.7x improvement
          baseMultiplier = 0.37; // 37% improvement (naltrexone-bupropion)
          break;
        case 'xenical':
          // Clinical trials: 5.4% weight loss vs 3.0% placebo
          // Efficacy ratio: (5.4-3.0)/3.0 = 0.8x improvement
          baseMultiplier = 0.08; // 8% improvement (orlistat)
          break;
        case 'belviq':
          // BLOOM trials: 5.8% weight loss vs 2.2% placebo
          // Efficacy ratio: (5.8-2.2)/2.2 = 1.6x improvement
          baseMultiplier = 0.16; // 16% improvement (lorcaserin)
          break;
        case 'phentermine':
          // Clinical trials: 5-10% weight loss (short-term)
          // Conservative estimate: 5% weight loss vs 2% placebo
          // Efficacy ratio: (5-2)/2 = 1.5x improvement
          baseMultiplier = 0.15; // 15% improvement (phentermine)
          break;
        default:
          baseMultiplier = 0.10; // 10% conservative default
      }

      // Calculate dosage-based multiplier
      if (medication.dosage_mg) {
        const dosage = typeof medication.dosage_mg === 'string' ? parseFloat(medication.dosage_mg) : medication.dosage_mg;
        
        // Evidence-based dosage scaling from clinical trials
        if (medName === 'zepbound' || medName === 'mounjaro' || genericName === 'tirzepatide') {
          // SURMOUNT trial dose-response: 2.5mg (5% WL), 5mg (8% WL), 7.5mg (11% WL), 10mg (15% WL), 12.5mg (17% WL), 15mg (20% WL)
          // Relative efficacy: 2.5mg=25%, 5mg=40%, 7.5mg=55%, 10mg=75%, 12.5mg=85%, 15mg=100%
          if (dosage <= 2.5) dosageMultiplier = 0.25;       // 2.5mg = 25% of max efficacy (5% weight loss)
          else if (dosage <= 5) dosageMultiplier = 0.40;     // 5mg = 40% of max efficacy (8% weight loss)
          else if (dosage <= 7.5) dosageMultiplier = 0.55;   // 7.5mg = 55% of max efficacy (11% weight loss)
          else if (dosage <= 10) dosageMultiplier = 0.75;    // 10mg = 75% of max efficacy (15% weight loss)
          else if (dosage <= 12.5) dosageMultiplier = 0.85;  // 12.5mg = 85% of max efficacy (17% weight loss)
          else dosageMultiplier = 1.0;                       // 15mg = 100% of max efficacy (20% weight loss)
          } else if (medName === 'ozempic' || 
                     medName === 'wegovy' ||
                     genericName === 'semaglutide') {
            // STEP trial dose-response: 0.5mg (6% WL), 1.0mg (10% WL), 2.4mg (15% WL)
            // Relative efficacy: 0.25mg=15%, 0.5mg=40%, 1.0mg=67%, 1.7mg=85%, 2.4mg=100%
            if (dosage <= 0.25) dosageMultiplier = 0.15;      // 0.25mg = 15% of max efficacy (starting dose)
            else if (dosage <= 0.5) dosageMultiplier = 0.40;   // 0.5mg = 40% of max efficacy (6% weight loss)
            else if (dosage <= 1.0) dosageMultiplier = 0.67;   // 1.0mg = 67% of max efficacy (10% weight loss)
            else if (dosage <= 1.7) dosageMultiplier = 0.85;   // 1.7mg = 85% of max efficacy (interpolated)
            else dosageMultiplier = 1.0;                       // 2.4mg = 100% of max efficacy (15% weight loss)
          } else if (medName === 'saxenda' || 
                     genericName === 'liraglutide') {
            // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
            // Clinical data: 0.6mg (minimal), 1.2mg (moderate), 1.8mg (good), 3.0mg (max)
            if (dosage <= 0.6) dosageMultiplier = 0.2;       // 0.6mg = 20% of max efficacy
            else if (dosage <= 1.2) dosageMultiplier = 0.5;   // 1.2mg = 50% of max efficacy
            else if (dosage <= 1.8) dosageMultiplier = 0.75;  // 1.8mg = 75% of max efficacy
            else if (dosage <= 2.4) dosageMultiplier = 0.9;   // 2.4mg = 90% of max efficacy
            else dosageMultiplier = 1.0;                      // 3.0mg = 100% of max efficacy
          } else if (medName === 'qsymia') {
            // Qsymia dosage scaling (3.75/23mg to 15/92mg)
            // Based on phentermine component: 3.75mg (low), 7.5mg (medium), 11.25mg (high), 15mg (max)
            if (dosage <= 3.75) dosageMultiplier = 0.3;      // 3.75mg = 30% of max efficacy
            else if (dosage <= 7.5) dosageMultiplier = 0.6;   // 7.5mg = 60% of max efficacy
            else if (dosage <= 11.25) dosageMultiplier = 0.8; // 11.25mg = 80% of max efficacy
            else dosageMultiplier = 1.0;                      // 15mg = 100% of max efficacy
          } else if (medName === 'contrave') {
            // Contrave dosage scaling (8/90mg to 32/360mg)
            // Based on naltrexone component: 8mg (low), 16mg (medium), 24mg (high), 32mg (max)
            if (dosage <= 8) dosageMultiplier = 0.25;        // 8mg = 25% of max efficacy
            else if (dosage <= 16) dosageMultiplier = 0.5;    // 16mg = 50% of max efficacy
            else if (dosage <= 24) dosageMultiplier = 0.75;   // 24mg = 75% of max efficacy
            else dosageMultiplier = 1.0;                      // 32mg = 100% of max efficacy
          } else if (medName === 'xenical') {
            // Xenical dosage scaling (60mg to 120mg)
            // Clinical data: 60mg (half dose), 120mg (full dose)
            if (dosage <= 60) dosageMultiplier = 0.5;        // 60mg = 50% of max efficacy
            else dosageMultiplier = 1.0;                      // 120mg = 100% of max efficacy
          } else if (medName === 'belviq') {
            // Belviq dosage scaling (10mg to 20mg)
            // Clinical data: 10mg (standard), 20mg (higher dose)
            if (dosage <= 10) dosageMultiplier = 0.7;        // 10mg = 70% of max efficacy
            else dosageMultiplier = 1.0;                      // 20mg = 100% of max efficacy
          } else if (medName === 'phentermine') {
            // Phentermine dosage scaling (15mg to 37.5mg)
            // Clinical data: 15mg (low), 30mg (medium), 37.5mg (high)
            if (dosage <= 15) dosageMultiplier = 0.4;        // 15mg = 40% of max efficacy
            else if (dosage <= 30) dosageMultiplier = 0.7;    // 30mg = 70% of max efficacy
            else dosageMultiplier = 1.0;                      // 37.5mg = 100% of max efficacy
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

  // Calculate activity level multiplier
  const activityMultiplier = useMemo(() => {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  }, [activityLevel]);

  // Calculate current profile-based projection (unchangeable)
  const currentProfileProjection = useMemo(() => {
    if (!projections?.activity_level || !projections?.activity_multiplier) {
      return null;
    }
    
    const baseDailyRate = projections.daily_rate;
    const currentActivityMultiplier = projections.activity_multiplier;
    const currentMedicationMultiplier = medicationMultiplier; // User's actual medication multiplier
    
    // Calculate current profile rate
    const currentActivityRate = baseDailyRate * currentActivityMultiplier;
    const currentProfileRate = currentMedicationMultiplier > 0 
      ? currentActivityRate * (1 + currentMedicationMultiplier)
      : currentActivityRate;
    
    return {
      dailyRate: currentProfileRate,
      activityLevel: projections.activity_level,
      activityMultiplier: currentActivityMultiplier,
      medicationMultiplier: currentMedicationMultiplier
    };
  }, [projections, medicationMultiplier]);

  // Calculate projections with proper domain and range
  const projectionData = useMemo(() => {
    if (!currentWeight || !startingWeight || !targetWeight || !projections?.daily_rate) {
      return [];
    }

    const baseDailyRate = projections.daily_rate;
    
    // Calculate current profile projection rate (unchangeable)
    const currentProfileRate = currentProfileProjection?.dailyRate || baseDailyRate;
    
    // Calculate adjustable projection rate
    const activityAdjustedRate = baseDailyRate * activityMultiplier;
    const adjustableDailyRate = medicationMode === 'with' && medicationMultiplier > 0 
      ? activityAdjustedRate * (1 + medicationMultiplier)
      : activityAdjustedRate;
    
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
      
      // Calculate both projections
      const currentProfileWeight = Math.max(targetWeight, currentWeight + (currentProfileRate * days));
      const adjustableWeight = Math.max(targetWeight, currentWeight + (adjustableDailyRate * days));
      
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
        currentProfileWeight: currentProfileWeight,
        projectedWeight: adjustableWeight,
        target: targetWeight,
        currentWeight: i === 0 ? currentWeight : undefined // Mark starting point
      });
    }
    
    return projectionResults;
  }, [currentWeight, startingWeight, targetWeight, projections, medicationMultiplier, medicationMode, activityMultiplier, projectionDays, weightData, currentProfileProjection]);

  // Calculate key metrics
  // Note: weeksToTargetNoMed is calculated in AnalyticsDashboard component where it's actually used



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
                {targetDate ? targetDate.toLocaleDateString('en-US', { timeZone: 'America/New_York' }) : 'Not set'}
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
                           {medication.medication_name || medication.medication_type?.name || 'Unknown Medication'}
                         </h4>
                         <p className="text-sm text-muted-foreground">
                           {medication.generic_name || medication.medication_type?.generic_name || 'Generic name not available'}
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
                               <strong>Started:</strong> {new Date(medication.start_date.includes('T') ? medication.start_date : medication.start_date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                             </span>
                           )}
                         </div>
                         
                       </div>
                                               <div className="text-right">
                          {(() => {
                            // Use the same evidence-based calculation as the main medicationMultiplier
                            let baseMultiplier = 0;
                            let dosageMultiplier = 1;
                            
                            // Evidence-based base multipliers from clinical trials
                            const medName = (medication.medication_name || medication.medication_type?.name || '').toLowerCase();
                            const genericName = (medication.generic_name || medication.medication_type?.generic_name || '').toLowerCase();
                            
                            if (medName === 'ozempic' || medName === 'wegovy' || genericName === 'semaglutide') {
                              baseMultiplier = 0.48; // 48% boost from STEP trials
                            } else if (medName === 'zepbound' || medName === 'mounjaro' || genericName === 'tirzepatide') {
                              baseMultiplier = 0.73; // 73% boost from SURMOUNT trials
                            } else if (medName === 'saxenda' || genericName === 'liraglutide') {
                              baseMultiplier = 0.21; // 21% boost from SCALE trials
                            } else if (medName === 'qsymia') {
                              baseMultiplier = 0.68; // 68% boost from EQUIP trial
                            } else if (medName === 'contrave') {
                              baseMultiplier = 0.37; // 37% boost from COR-II trial
                            } else if (medName === 'xenical') {
                              baseMultiplier = 0.08; // 8% boost from clinical data
                            } else if (medName === 'belviq') {
                              baseMultiplier = 0.16; // 16% boost from BLOOM trial
                            } else if (medName === 'phentermine') {
                              baseMultiplier = 0.15; // 15% boost from clinical data
                            } else {
                              baseMultiplier = 0.10; // 10% conservative default
                            }
                            
                            // Calculate dosage-based multiplier
                            if (medication.dosage_mg) {
                              const dosage = typeof medication.dosage_mg === 'string' ? parseFloat(medication.dosage_mg) : medication.dosage_mg;
                              
                              // Evidence-based dosage scaling from clinical trials
                              if (medName === 'zepbound' || medName === 'mounjaro' || genericName === 'tirzepatide') {
                                // SURMOUNT trial dose-response: 2.5mg (5% WL), 5mg (8% WL), 7.5mg (11% WL), 10mg (15% WL), 12.5mg (17% WL), 15mg (20% WL)
                                if (dosage <= 2.5) dosageMultiplier = 0.25;       // 2.5mg = 25% of max efficacy (5% weight loss)
                                else if (dosage <= 5) dosageMultiplier = 0.40;     // 5mg = 40% of max efficacy (8% weight loss)
                                else if (dosage <= 7.5) dosageMultiplier = 0.55;   // 7.5mg = 55% of max efficacy (11% weight loss)
                                else if (dosage <= 10) dosageMultiplier = 0.75;    // 10mg = 75% of max efficacy (15% weight loss)
                                else if (dosage <= 12.5) dosageMultiplier = 0.85;  // 12.5mg = 85% of max efficacy (17% weight loss)
                                else dosageMultiplier = 1.0;                       // 15mg = 100% of max efficacy (20% weight loss)
                              } else if (medName === 'ozempic' || medName === 'wegovy' || genericName === 'semaglutide') {
                                // STEP trial dose-response: 0.5mg (6% WL), 1.0mg (10% WL), 2.4mg (15% WL)
                                if (dosage <= 0.25) dosageMultiplier = 0.15;      // 0.25mg = 15% of max efficacy (starting dose)
                                else if (dosage <= 0.5) dosageMultiplier = 0.40;   // 0.5mg = 40% of max efficacy (6% weight loss)
                                else if (dosage <= 1.0) dosageMultiplier = 0.67;   // 1.0mg = 67% of max efficacy (10% weight loss)
                                else if (dosage <= 1.7) dosageMultiplier = 0.85;   // 1.7mg = 85% of max efficacy (interpolated)
                                else dosageMultiplier = 1.0;                       // 2.4mg = 100% of max efficacy (15% weight loss)
                              } else if (medName === 'saxenda' || genericName === 'liraglutide') {
                                // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
                                if (dosage <= 0.6) dosageMultiplier = 0.2;       // 0.6mg = 20% of max efficacy
                                else if (dosage <= 1.2) dosageMultiplier = 0.5;   // 1.2mg = 50% of max efficacy
                                else if (dosage <= 1.8) dosageMultiplier = 0.75;  // 1.8mg = 75% of max efficacy
                                else dosageMultiplier = 1.0;                      // 3.0mg = 100% of max efficacy
                              } else if (medName === 'qsymia') {
                                // Qsymia dosage scaling (3.75/23mg to 15/92mg daily)
                                if (dosage <= 3.75) dosageMultiplier = 0.3;      // 3.75mg = 30% of max efficacy
                                else if (dosage <= 7.5) dosageMultiplier = 0.6;   // 7.5mg = 60% of max efficacy
                                else dosageMultiplier = 1.0;                      // 15mg = 100% of max efficacy
                              } else if (medName === 'contrave') {
                                // Contrave dosage scaling (8/90mg to 32/360mg daily)
                                if (dosage <= 8) dosageMultiplier = 0.4;         // 8mg = 40% of max efficacy
                                else if (dosage <= 16) dosageMultiplier = 0.7;    // 16mg = 70% of max efficacy
                                else dosageMultiplier = 1.0;                      // 32mg = 100% of max efficacy
                              } else if (medName === 'xenical') {
                                // Xenical dosage scaling (60mg to 120mg three times daily)
                                if (dosage <= 60) dosageMultiplier = 0.5;        // 60mg = 50% of max efficacy
                                else dosageMultiplier = 1.0;                      // 120mg = 100% of max efficacy
                              } else if (medName === 'belviq') {
                                // Belviq dosage scaling (10mg to 20mg daily)
                                if (dosage <= 10) dosageMultiplier = 0.6;        // 10mg = 60% of max efficacy
                                else dosageMultiplier = 1.0;                      // 20mg = 100% of max efficacy
                              } else if (medName === 'phentermine') {
                                // Phentermine dosage scaling (15mg to 37.5mg daily)
                                if (dosage <= 15) dosageMultiplier = 0.5;        // 15mg = 50% of max efficacy
                                else if (dosage <= 30) dosageMultiplier = 0.8;    // 30mg = 80% of max efficacy
                                else dosageMultiplier = 1.0;                      // 37.5mg = 100% of max efficacy
                              } else {
                                // Default dosage scaling for unknown medications
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

            <div className="space-y-2">
              <Label>Activity Level Impact</Label>
              <div className="text-2xl font-bold text-teal-600">
                {projections?.activity_level ? projections.activity_level.replace('_', ' ').toUpperCase() : 'MODERATE'}
              </div>
              <div className="text-sm text-muted-foreground">
                {projections?.activity_multiplier ? 
                  `Multiplier: ${projections.activity_multiplier.toFixed(2)}x` : 
                  'Standard activity level'
                }
              </div>
            </div>
          </div>

          {/* Projection Settings */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Medication Mode</Label>
              <Select value={medicationMode} onValueChange={(value: 'with' | 'without') => setMedicationMode(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="without">Without Medication</SelectItem>
                  <SelectItem value="with" disabled={medicationMultiplier === 0}>
                    With Medication {medicationMultiplier > 0 ? `(+${(medicationMultiplier * 100).toFixed(0)}% boost)` : '(No active medications)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (1.2x)</SelectItem>
                  <SelectItem value="light">Light (1.375x)</SelectItem>
                  <SelectItem value="moderate">Moderate (1.55x)</SelectItem>
                  <SelectItem value="active">Active (1.725x)</SelectItem>
                  <SelectItem value="very_active">Very Active (1.9x)</SelectItem>
                </SelectContent>
              </Select>
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
            {targetDate && `, targeting ${targetDate.toLocaleDateString('en-US', { timeZone: 'America/New_York' })}`}
            <br />
            <span className="text-sm text-muted-foreground">
              Showing {projectionDays} day projection period • X-axis range: {projectionDays} days
            </span>
            <br />
            <span className="text-sm text-amber-600 font-medium">
              Orange line shows your current profile projection (unchangeable). Teal line shows scenario projection based on your selected settings above.
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
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                Current Profile ({currentProfileProjection?.activityLevel?.replace('_', ' ') || 'moderate'}{(currentProfileProjection?.medicationMultiplier || 0) > 0 ? ', with medication' : ''})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                Scenario ({medicationMode === 'with' ? 'With Medication' : 'Without Medication'}, {activityLevel.replace('_', ' ')})
              </span>
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
                currentProfileWeight: {
                  label: "Current Profile Projection (lbs)",
                  color: "#f97316"
                },
                projectedWeight: {
                  label: "Scenario Projection (lbs)",
                  color: "#14b8a6"
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
                      nameKey="projectedWeight"
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
                
                {/* Current Profile Projection Line (unchangeable) */}
                <Line 
                  type="monotone" 
                  dataKey="currentProfileWeight" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "#f97316", strokeWidth: 2 }}
                  name="Current Profile Projection"
                />
                
                {/* Adjustable Scenario Projection Line */}
                <Line 
                  type="monotone" 
                  dataKey="projectedWeight" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#14b8a6", strokeWidth: 2 }}
                  name="Scenario Projection"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytical Insights moved to Analytics */}
    </div>
  );
}

/**
 * Analytics dashboard component (pounds only)
 */
function AnalyticsDashboard() {
  const { user } = useAuth();
  
  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email || user?.sub || 'dev-user-123';
  
  // Always call hooks, but conditionally use their data
  const analyticsQuery = useQuery({
    queryKey: ["analytics", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30, userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const weightDataQuery = useQuery({
    queryKey: ["enhanced-weights", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeights(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Bring goals and projections into Analytics for richer insights
  const weightGoalQuery = useQuery({
    queryKey: ["weightGoal", userId],
    queryFn: () => UserProfilesAPI.getWeightGoal(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const projectionsQuery = useQuery({
    queryKey: ["projections", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(90, userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const userMedicationsQuery = useQuery({
    queryKey: ["userMedications", userId],
    queryFn: () => UserProfilesAPI.getUserMedications(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use data from API calls (backend handles dummy data for dev users)
  const analytics = analyticsQuery.data;
  const weightData = weightDataQuery.data;
  const userMedications = userMedicationsQuery.data;
  const weightGoal = weightGoalQuery.data;
  const projections = projectionsQuery.data;
  
  const isLoading = analyticsQuery.isLoading || weightDataQuery.isLoading;
  const error = analyticsQuery.error || weightDataQuery.error;

  // Calculate enhanced analytics metrics
  const enhancedMetrics = useMemo(() => {
    if (!weightData || weightData.length === 0) return null;

    // Extract and convert weights to numbers
    const weights = weightData.map(w => {
      const weight = w.weight_lb || w.weight;
      return typeof weight === 'string' ? parseFloat(weight) : weight;
    }).filter((w): w is number => !isNaN(w));
    
    if (weights.length === 0) return null;
    
    // Sort weight data by timestamp
    const sortedWeightData = [...weightData].sort((a, b) => {
      const dateA = new Date(a.timestamp || '');
      const dateB = new Date(b.timestamp || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    // Extract sorted weights as numbers
    const sortedWeights = sortedWeightData.map(w => {
      const weight = w.weight_lb || w.weight;
      return typeof weight === 'string' ? parseFloat(weight) : weight;
    }).filter((w): w is number => !isNaN(w));
    
    if (sortedWeights.length === 0) return null;
    
    const currentWeight = sortedWeights[sortedWeights.length - 1];
    const startingWeight = sortedWeights[0];
    const totalChange = currentWeight - startingWeight;
    const totalChangePercentage = ((totalChange / startingWeight) * 100);
    
    // Calculate weekly averages for trend analysis
    const weeklyAverages: number[] = [];
    const weeklyChanges: number[] = [];
    for (let i = 7; i < sortedWeights.length; i += 7) {
      const weekStart = sortedWeights[i - 7];
      const weekEnd = sortedWeights[i];
      const weeklyAvg = (weekStart + weekEnd) / 2;
      const weeklyChange = weekEnd - weekStart;
      weeklyAverages.push(weeklyAvg);
      weeklyChanges.push(weeklyChange);
    }

    // Calculate statistical measures
    const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
    const variance = weights.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / weights.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    // Calculate trend consistency
    const positiveChanges = weeklyChanges.filter((change: number) => change < 0).length;
    const consistencyScore = weeklyChanges.length > 0 ? (positiveChanges / weeklyChanges.length) * 100 : 0;

    return {
      currentWeight,
      startingWeight,
      totalChange,
      totalChangePercentage,
      mean,
      standardDeviation,
      coefficientOfVariation,
      weeklyAverages,
      weeklyChanges,
      consistencyScore,
      dataPoints: weights.length,
      dateRange: {
        start: new Date(sortedWeightData[sortedWeightData.length - 1].timestamp || ''),
        end: new Date(sortedWeightData[0].timestamp || '')
      }
    };
  }, [weightData]);

  // Derive projections-based metrics (moved from Projections tab)
  const currentWeight = useMemo(() => {
    if (weightData && weightData.length > 0) {
      const weight = weightData[0].weight_lb || weightData[0].weight;
      return typeof weight === 'string' ? parseFloat(weight) : weight;
    }
    return null;
  }, [weightData]);

  const startingWeight = useMemo(() => {
    if (weightData && weightData.length > 0) {
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
    return weightGoal?.target_weight_lbs || null;
  }, [weightGoal]);

  const medicationMultiplier = useMemo(() => {
    if (!userMedications || userMedications.length === 0) return 0;
    const activeMedications = userMedications.filter(med => med.is_active);
    if (activeMedications.length === 0) return 0;

    let totalMultiplier = 0;
    activeMedications.forEach(medication => {
      let baseMultiplier = 0;
      let dosageMultiplier = 1;

      // Use evidence-based multipliers from clinical trials (same as WeightProjections)
      const medName = (medication.medication_name || medication.medication_type?.name || '').toLowerCase();
      const genericName = (medication.generic_name || medication.medication_type?.generic_name || '').toLowerCase();
      switch (medName) {
        case 'ozempic':
        case 'wegovy':
          // STEP trials: 15-18% weight loss at 2.4mg vs 2.6% placebo
          baseMultiplier = 0.48; // 48% improvement (semaglutide)
          break;
        case 'zepbound':
        case 'mounjaro':
          // SURMOUNT trials: 20-22% weight loss at 15mg vs 2.4% placebo
          baseMultiplier = 0.73; // 73% improvement (tirzepatide)
          break;
        case 'saxenda':
          // SCALE trials: 8% weight loss vs 2.6% placebo
          baseMultiplier = 0.21; // 21% improvement (liraglutide)
          break;
        case 'qsymia':
          // EQUIP trials: 9.3% weight loss vs 1.2% placebo
          baseMultiplier = 0.68; // 68% improvement (phentermine-topiramate)
          break;
        case 'contrave':
          // COR-II trials: 6.1% weight loss vs 1.3% placebo
          baseMultiplier = 0.37; // 37% improvement (naltrexone-bupropion)
          break;
        case 'xenical':
          // Clinical trials: 5.4% weight loss vs 3.0% placebo
          baseMultiplier = 0.08; // 8% improvement (orlistat)
          break;
        case 'belviq':
          // BLOOM trials: 5.8% weight loss vs 2.2% placebo
          baseMultiplier = 0.16; // 16% improvement (lorcaserin)
          break;
        case 'phentermine':
          // Clinical trials: 5-10% weight loss (short-term)
          baseMultiplier = 0.15; // 15% improvement (phentermine)
          break;
        default:
          baseMultiplier = 0.10; // 10% conservative default
      }

      if (medication.dosage_mg) {
        const dosage = typeof medication.dosage_mg === 'string' ? parseFloat(medication.dosage_mg) : medication.dosage_mg;
        if (medName === 'zepbound' || 
            genericName === 'tirzepatide') {
          // SURMOUNT trial dose-response: 2.5mg (5% WL), 5mg (8% WL), 7.5mg (11% WL), 10mg (15% WL), 12.5mg (17% WL), 15mg (20% WL)
          if (dosage <= 2.5) dosageMultiplier = 0.25;       // 2.5mg = 25% of max efficacy (5% weight loss)
          else if (dosage <= 5) dosageMultiplier = 0.40;     // 5mg = 40% of max efficacy (8% weight loss)
          else if (dosage <= 7.5) dosageMultiplier = 0.55;   // 7.5mg = 55% of max efficacy (11% weight loss)
          else if (dosage <= 10) dosageMultiplier = 0.75;    // 10mg = 75% of max efficacy (15% weight loss)
          else if (dosage <= 12.5) dosageMultiplier = 0.85;  // 12.5mg = 85% of max efficacy (17% weight loss)
          else dosageMultiplier = 1.0;                       // 15mg = 100% of max efficacy (20% weight loss)
        } else if (medName === 'ozempic' || medName === 'wegovy' || genericName === 'semaglutide') {
          // STEP trial dose-response: 0.5mg (6% WL), 1.0mg (10% WL), 2.4mg (15% WL)
          if (dosage <= 0.25) dosageMultiplier = 0.15;      // 0.25mg = 15% of max efficacy (starting dose)
          else if (dosage <= 0.5) dosageMultiplier = 0.40;   // 0.5mg = 40% of max efficacy (6% weight loss)
          else if (dosage <= 1.0) dosageMultiplier = 0.67;   // 1.0mg = 67% of max efficacy (10% weight loss)
          else if (dosage <= 1.7) dosageMultiplier = 0.85;   // 1.7mg = 85% of max efficacy (interpolated)
          else dosageMultiplier = 1.0;                       // 2.4mg = 100% of max efficacy (15% weight loss)
        } else if (medName === 'saxenda' || genericName === 'liraglutide') {
          // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
          if (dosage <= 0.6) dosageMultiplier = 0.2;       // 0.6mg = 20% of max efficacy
          else if (dosage <= 1.2) dosageMultiplier = 0.5;   // 1.2mg = 50% of max efficacy
          else if (dosage <= 1.8) dosageMultiplier = 0.75;  // 1.8mg = 75% of max efficacy
          else if (dosage <= 2.4) dosageMultiplier = 0.9;   // 2.4mg = 90% of max efficacy
          else dosageMultiplier = 1.0;                      // 3.0mg = 100% of max efficacy
        } else if (medName === 'qsymia') {
          // Qsymia dosage scaling (3.75/23mg to 15/92mg)
          if (dosage <= 3.75) dosageMultiplier = 0.3;      // 3.75mg = 30% of max efficacy
          else if (dosage <= 7.5) dosageMultiplier = 0.6;   // 7.5mg = 60% of max efficacy
          else if (dosage <= 11.25) dosageMultiplier = 0.8; // 11.25mg = 80% of max efficacy
          else dosageMultiplier = 1.0;                      // 15mg = 100% of max efficacy
        } else if (medName === 'contrave') {
          // Contrave dosage scaling (8/90mg to 32/360mg)
          if (dosage <= 8) dosageMultiplier = 0.25;        // 8mg = 25% of max efficacy
          else if (dosage <= 16) dosageMultiplier = 0.5;    // 16mg = 50% of max efficacy
          else if (dosage <= 24) dosageMultiplier = 0.75;   // 24mg = 75% of max efficacy
          else dosageMultiplier = 1.0;                      // 32mg = 100% of max efficacy
        } else if (medName === 'xenical') {
          // Xenical dosage scaling (60mg to 120mg)
          if (dosage <= 60) dosageMultiplier = 0.5;        // 60mg = 50% of max efficacy
          else dosageMultiplier = 1.0;                      // 120mg = 100% of max efficacy
        } else if (medName === 'belviq') {
          // Belviq dosage scaling (10mg to 20mg)
          if (dosage <= 10) dosageMultiplier = 0.7;        // 10mg = 70% of max efficacy
          else dosageMultiplier = 1.0;                      // 20mg = 100% of max efficacy
        } else if (medName === 'phentermine') {
          // Phentermine dosage scaling (15mg to 37.5mg)
          if (dosage <= 15) dosageMultiplier = 0.4;        // 15mg = 40% of max efficacy
          else if (dosage <= 30) dosageMultiplier = 0.7;    // 30mg = 70% of max efficacy
          else dosageMultiplier = 1.0;                      // 37.5mg = 100% of max efficacy
        } else {
          dosageMultiplier = Math.min(dosage / 10, 1.0);
        }
      }

      let frequencyMultiplier = 1;
      switch (medication.frequency?.toLowerCase()) {
        case 'daily': frequencyMultiplier = 1.0; break;
        case 'weekly': frequencyMultiplier = 1.0; break;
        case 'bi-weekly':
        case 'biweekly': frequencyMultiplier = 0.7; break;
        case 'monthly': frequencyMultiplier = 0.4; break;
        default: frequencyMultiplier = 1.0;
      }

      const medicationContribution = baseMultiplier * dosageMultiplier * frequencyMultiplier;
      console.log(`AnalyticsDashboard - Medication: ${medication.medication_name}, Base: ${baseMultiplier}, Dosage: ${dosageMultiplier}, Frequency: ${frequencyMultiplier}, Contribution: ${medicationContribution}`);
      totalMultiplier += medicationContribution;
    });

    return Math.min(totalMultiplier, 1.0);
  }, [userMedications]);

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

  const activeMedicationNames = useMemo(() => {
    if (!userMedications || userMedications.length === 0) return 'No active medications';
    return userMedications
      .filter(med => med.is_active)
      .map(med => {
        let name = 'Unknown Medication';
        if (med.medication_name) {
          name = med.medication_name;
        } else if (med.medication_type?.name) {
          name = med.medication_type.name;
        } else if (med.generic_name) {
          name = med.generic_name;
        } else if (med.medication_type?.generic_name) {
          name = med.medication_type.generic_name;
        }
        const dosage = med.dosage_mg ? ` ${med.dosage_mg}mg` : '';
        const frequency = med.frequency ? ` (${med.frequency})` : '';
        return `${name}${dosage}${frequency}`;
      })
      .join(', ');
  }, [userMedications]);

  // Safe derived values for presentation
  const hasWeights = currentWeight != null && startingWeight != null;
  const totalLostLbs = hasWeights ? (startingWeight as number) - (currentWeight as number) : 0;
  const totalLostPct = hasWeights && (startingWeight as number) > 0
    ? (totalLostLbs / (startingWeight as number)) * 100
    : 0;
  const dailyRate = projections?.daily_rate ?? null;
  const confidence = projections?.confidence ?? null;
  const activityLevel = projections?.activity_level;
  const activityMultiplier = projections?.activity_multiplier;
  const stdDev = enhancedMetrics?.standardDeviation ?? null;
  const cv = enhancedMetrics?.coefficientOfVariation ?? null;
  const consistencyPct = enhancedMetrics?.consistencyScore ?? analytics?.trends?.consistency_score ?? null;
  const dataPointsCount = enhancedMetrics?.dataPoints ?? (weightData?.length || 0);

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
    <>
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

          {analytics.projections?.activity_level && (
            <div>
              <Label>Activity Level Impact</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {analytics.projections.activity_level.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {analytics.projections.activity_multiplier ? 
                    `${analytics.projections.activity_multiplier.toFixed(2)}x multiplier` : 
                    'Standard rate'
                  }
                </span>
              </div>
            </div>
          )}
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

        {(() => {
          const start = analytics.metrics.starting_weight;
          const curr = analytics.metrics.current_weight;
          const min = analytics.metrics.min_weight;
          const max = analytics.metrics.max_weight;
          const delta = Number((curr - start).toFixed(1));
          const direction = delta === 0 ? 'no net change' : (delta < 0 ? 'loss' : 'gain');
          return (
            <div className="text-sm text-muted-foreground mt-2 text-center">
              {`Since start: ${Math.abs(delta).toFixed(1)} lbs ${direction}. Range: ${min.toFixed(1)}–${max.toFixed(1)} lbs.`}
            </div>
          );
        })()}

        <div className="text-sm text-muted-foreground text-center">
          Generated: {format(new Date(analytics.generated_at), "PPP 'at' p")}
        </div>
      </CardContent>
    </Card>

    {/* Actual vs 7-day Moving Average */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Actual vs 7-day Moving Average</CardTitle>
        <CardDescription>Short-term smoothing to reveal the underlying trend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {weightData && weightData.length > 1 ? (
          <>
            {(() => {
              // Prepare chronological series
              const sorted = [...weightData]
                .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
                .map((d) => ({
                  date: format(new Date(d.timestamp || ''), 'MMM dd'),
                  weight: typeof (d.weight_lb ?? d.weight) === 'string' ? parseFloat(String(d.weight_lb ?? d.weight)) : Number(d.weight_lb ?? d.weight)
                }));

              // 7-point moving average (approx 1 week if daily)
              const ma = sorted.map((_, idx) => {
                const start = Math.max(0, idx - 6);
                const window = sorted.slice(start, idx + 1);
                const avg = window.reduce((sum, v) => sum + (v.weight || 0), 0) / window.length;
                return Number(avg.toFixed(2));
              });

              const chartData = sorted.map((row, i) => ({ name: row.date, actual: row.weight, ma7: ma[i] }));

              return (
                <div className="h-64 w-full">
                  <ChartContainer
                    config={{
                      actual: { label: 'Actual (lbs)', color: '#2563eb' },
                      ma7: { label: '7-day MA (lbs)', color: '#10b981' },
                    }}
                    className="h-full w-full"
                  >
                    <LineChart data={chartData} width={800} height={256}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent className="w-[180px]" />} />
                      <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} name="Actual" />
                      <Line type="monotone" dataKey="ma7" stroke="#10b981" strokeWidth={2} dot={false} name="7-day MA" />
                    </LineChart>
                  </ChartContainer>
                </div>
              );
            })()}
            <p className="text-sm text-muted-foreground">
              The blue line shows your raw daily weights. The green line smooths short-term noise by averaging the last 7 readings,
              making your underlying trend easier to see.
            </p>
            {(() => {
              // Recompute quick metrics for the notes
              const sorted = [...weightData]
                .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
                .map((d) => ({
                  date: format(new Date(d.timestamp || ''), 'MMM dd'),
                  weight: typeof (d.weight_lb ?? d.weight) === 'string' ? parseFloat(String(d.weight_lb ?? d.weight)) : Number(d.weight_lb ?? d.weight)
                }));
              const ma = sorted.map((_, idx) => {
                const start = Math.max(0, idx - 6);
                const window = sorted.slice(start, idx + 1);
                const avg = window.reduce((sum, v) => sum + (v.weight || 0), 0) / window.length;
                return Number(avg.toFixed(2));
              });
              if (ma.length === 0) return null;
              const lastIdx = ma.length - 1;
              const compareIdx = Math.max(0, lastIdx - 7);
              const weeklyChange = Number((ma[lastIdx] - ma[compareIdx]).toFixed(2));
              const actualVsMA = sorted[lastIdx].weight < ma[lastIdx] ? 'below' : 'above';
              return (
                <p className="text-sm text-muted-foreground">
                  {`Past week, the smoothed trend ${weeklyChange < 0 ? 'decreased' : weeklyChange > 0 ? 'increased' : 'held steady'} by ${Math.abs(weeklyChange).toFixed(2)} lbs. Latest actual is ${actualVsMA} the trendline.`}
                </p>
              );
            })()}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Not enough data to render moving average yet.</div>
        )}
      </CardContent>
    </Card>

    {/* Medication Effect Comparison */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Medication Effect on Weekly Rate</CardTitle>
        <CardDescription>Comparison of natural vs. with-medication projected weekly loss</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dailyRate != null ? (
          (() => {
            const natural = Math.abs(dailyRate * 7);
            const withMed = Math.abs(dailyRate * (1 + medicationMultiplier) * 7);
            const medData = [
              { label: 'Natural', value: Number(natural.toFixed(2)) },
              { label: 'With Medication', value: Number(withMed.toFixed(2)) },
            ];
            return (
              <>
                <div className="h-56 w-full">
                  <ChartContainer
                    config={{ value: { label: 'Weekly Rate (lbs/wk)', color: '#3b82f6' } }}
                    className="h-full w-full"
                  >
                    <BarChart data={medData} width={800} height={224}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent className="w-[160px]" nameKey="value" />} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bars compare your projected weekly loss without medication versus with your current regimen applied.
                  The difference reflects your estimated medication effectiveness.
                </p>
                {(() => {
                  if (dailyRate == null) return null;
                  const natural = Math.abs(dailyRate * 7);
                  const withMed = Math.abs(dailyRate * (1 + medicationMultiplier) * 7);
                  const delta = withMed - natural;
                  const pct = natural > 0 ? (delta / natural) * 100 : 0;
                  return (
                    <p className="text-sm text-muted-foreground">
                      {`With medication, projected weekly loss improves by ${delta.toFixed(2)} lbs (${pct.toFixed(0)}%) versus natural.`}
                    </p>
                  );
                })()}
              </>
            );
          })()
        ) : (
          <div className="text-sm text-muted-foreground">No trajectory available to compute medication effect.</div>
        )}
      </CardContent>
    </Card>

    {/* Activity Impact (scenario comparison) */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activity Impact Scenarios</CardTitle>
        <CardDescription>How weekly rate changes across typical activity levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dailyRate != null ? (
          (() => {
            const ACTIVITY: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
            const actData = Object.entries(ACTIVITY).map(([k, mult]) => ({
              label: k.replace('_', ' ').replace(/^./, (c) => c.toUpperCase()),
              value: Number(Math.abs(dailyRate * mult * 7).toFixed(2)),
              key: k,
            }));
            return (
              <>
                <div className="h-56 w-full">
                  <ChartContainer
                    config={{ value: { label: 'Weekly Rate (lbs/wk)', color: '#10b981' } }}
                    className="h-full w-full"
                  >
                    <BarChart data={actData} width={800} height={224}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent className="w-[160px]" nameKey="value" />} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <p className="text-sm text-muted-foreground">
                  These scenarios illustrate how your weekly loss could vary with different activity levels. Your current
                  activity setting is {activityLevel ? activityLevel.replace('_', ' ') : 'moderate'} with a multiplier of
                  {" "}{activityMultiplier != null ? activityMultiplier.toFixed(2) : '1.00'}x.
                </p>
                {(() => {
                  if (dailyRate == null) return null;
                  const ACTIVITY: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
                  const currentKey = activityLevel ?? 'moderate';
                  const currentWeekly = Math.abs(dailyRate * (ACTIVITY[currentKey] ?? 1.0) * 7);
                  const entries = Object.entries(ACTIVITY).map(([k, m]) => ({ k, v: Math.abs(dailyRate * m * 7) }));
                  const best = entries.reduce((a, b) => (b.v > a.v ? b : a), entries[0]);
                  const delta = best.v - currentWeekly;
                  if (delta <= 0.01) {
                    return (
                      <p className="text-sm text-muted-foreground">Your current activity setting is already near the best-case weekly rate.</p>
                    );
                  }
                  const label = best.k.replace('_', ' ');
                  return (
                    <p className="text-sm text-muted-foreground">{`Shifting to ${label} could increase weekly loss by ~${delta.toFixed(2)} lbs.`}</p>
                  );
                })()}
              </>
            );
          })()
        ) : (
          <div className="text-sm text-muted-foreground">No trajectory available to estimate activity impact.</div>
        )}
      </CardContent>
    </Card>

    {/* Weekly Change Trend */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Change Trend</CardTitle>
        <CardDescription>Week-over-week weight change (negative is loss)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {enhancedMetrics && enhancedMetrics.weeklyChanges && enhancedMetrics.weeklyChanges.length > 0 ? (
          (() => {
            const wc = enhancedMetrics.weeklyChanges.map((c: number, i: number) => ({ week: `W${i + 1}`, change: Number(c.toFixed(2)) }));
            return (
              <>
                <div className="h-56 w-full">
                  <ChartContainer
                    config={{ change: { label: 'Weekly Change (lbs)', color: '#f59e0b' } }}
                    className="h-full w-full"
                  >
                    <BarChart data={wc} width={800} height={224}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent className="w-[160px]" nameKey="change" />} />
                      <Bar dataKey="change" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each bar shows the change from one week to the next. Taller negative bars indicate larger weekly losses;
                  positive bars indicate weeks with gains or rebounds.
                </p>
                {(() => {
                  const changes = (enhancedMetrics?.weeklyChanges as number[]) || [];
                  if (!changes.length) return null;
                  const avg = changes.reduce((s, v) => s + v, 0) / changes.length;
                  const best = Math.min(...changes); // most negative = biggest loss
                  const worst = Math.max(...changes);
                  return (
                    <p className="text-sm text-muted-foreground">
                      {`Avg weekly change: ${avg.toFixed(2)} lbs. Best week: ${best.toFixed(2)} lbs. Toughest week: ${worst.toFixed(2)} lbs.`}
                    </p>
                  );
                })()}
              </>
            );
          })()
        ) : (
          <div className="text-sm text-muted-foreground">Not enough data to compute weekly change trend.</div>
        )}
      </CardContent>
    </Card>

    {/* Projection Analysis & Insights (moved from Projections tab) */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Projection Analysis & Insights</CardTitle>
        <CardDescription>
          Detailed breakdown of projections, medication impact, and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {hasWeights ? totalLostLbs.toFixed(1) : '0.0'} lbs
            </div>
            <div className="text-sm text-muted-foreground">Total Lost</div>
            {hasWeights ? (
              <div className="text-xs text-blue-500 mt-1">
                {totalLostPct.toFixed(1)}% of starting weight
              </div>
            ) : null}
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {weeksToTargetNoMed} weeks
            </div>
            <div className="text-sm text-muted-foreground">To Target (Natural)</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {weeksToTargetWithMed} weeks
            </div>
            <div className="text-sm text-muted-foreground">To Target (Medication)</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {medicationBenefit} weeks
            </div>
            <div className="text-sm text-muted-foreground">Time Saved</div>
          </div>
        </div>

        <Separator />

        {/* Detailed Analysis */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Weight Loss Journey Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Starting Weight:</strong> {startingWeight != null ? startingWeight.toFixed(1) : 'N/A'} lbs</p>
                <p><strong>Current Weight:</strong> {currentWeight != null ? currentWeight.toFixed(1) : 'N/A'} lbs</p>
                <p><strong>Target Weight:</strong> {targetWeight != null ? targetWeight.toFixed(1) : 'Not set'} lbs</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Current Trajectory:</strong> {dailyRate != null ? Math.abs(dailyRate * 7).toFixed(2) : 'N/A'} lbs/week</p>
                <p><strong>Data Points:</strong> {weightData?.length || 0} weight measurements</p>
                <p><strong>Confidence Level:</strong> {confidence != null ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Medication Impact Analysis</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {medicationMultiplier > 0 ? (
                <>
                  <p><strong>Active Medications:</strong> {activeMedicationNames}</p>
                  <p><strong>Effectiveness Boost:</strong> {(medicationMultiplier * 100).toFixed(0)}%</p>
                  <p><strong>Enhanced Weekly Rate:</strong> {dailyRate != null ? Math.abs(dailyRate * (1 + medicationMultiplier) * 7).toFixed(2) : 'N/A'} lbs/week</p>
                </>
              ) : (
                <p><strong>No Active Medications:</strong> Natural trajectory only.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Activity Level Impact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong>Activity Level:</strong> {activityLevel ? activityLevel.replace('_', ' ').toUpperCase() : 'MODERATE'}</p>
              <p><strong>Activity Multiplier:</strong> {activityMultiplier != null ? activityMultiplier.toFixed(2) : '1.00'}x</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Statistical Insights</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded">
                <div className="text-lg font-semibold">{stdDev != null ? stdDev.toFixed(2) : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Std Dev (lbs)</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="text-lg font-semibold">{cv != null ? cv.toFixed(1) : 'N/A'}%</div>
                <div className="text-xs text-muted-foreground">Variability</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="text-lg font-semibold">{consistencyPct != null ? String(Math.round(consistencyPct)) : 'N/A'}%</div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="text-lg font-semibold">{dataPointsCount}</div>
                <div className="text-xs text-muted-foreground">Data Points</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Recommendations</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {medicationBenefit > 0 ? (
                <p><strong>Medication Benefit:</strong> Your regimen could save ~{medicationBenefit} weeks to reach {targetWeight != null ? targetWeight.toFixed(1) : 'target'} lbs.</p>
              ) : (
                <p><strong>Natural Progress:</strong> Steady progress observed. Consider medical options if appropriate.</p>
              )}
              <p><strong>Consistency:</strong> Maintain current weekly rate {dailyRate != null ? Math.abs(dailyRate * 7).toFixed(2) : 'N/A'} lbs/week.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

/**
 * Weight data table component with shadcn table and chart (pounds only)
 */
function WeightDataTable() {
  const { isAuthenticated, user } = useAuth();
  
  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email || user?.sub || 'dev-user-123';
  
  // Always call hooks, but conditionally use their data
  const measurementsQuery = useQuery({
    queryKey: ["weight-measurements", userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50, userId }),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const measurements = measurementsQuery.data || [];
  const isLoading = measurementsQuery.isLoading;
  const error = measurementsQuery.error;

  // State for chart filtering and sorting
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90" | "all">(isAuthenticated ? "30" : "all");
  const [chartSort, setChartSort] = useState<"asc" | "desc">("asc");
  const [showTrendline, setShowTrendline] = useState(true);
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(3);

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

  // Use data from API calls (backend handles dummy data for dev users)
  const displayData = measurements || [];

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
    if (data.length === 0) return [];
    
    const movingAverages = [];
    for (let i = 0; i < data.length; i++) {
      // For early points, use all available data up to current index + 1
      const startIndex = Math.max(0, i - period + 1);
      const endIndex = i + 1;
      const dataSlice = data.slice(startIndex, endIndex);
      const sum = dataSlice.reduce((acc, item) => acc + item.weight, 0);
      const average = sum / dataSlice.length;
      
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
  const movingAverageData = showMovingAverage ? calculateMovingAverage(simpleChartData, movingAveragePeriod) : [];

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
                {showMovingAverage && (
                  <Select value={movingAveragePeriod.toString()} onValueChange={(value) => setMovingAveragePeriod(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3-day</SelectItem>
                      <SelectItem value="5">5-day</SelectItem>
                      <SelectItem value="7">7-day</SelectItem>
                      <SelectItem value="10">10-day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
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
               <span className="text-sm text-muted-foreground">
                 {showMovingAverage ? `${movingAveragePeriod}-day Moving Average` : "Moving Average"}
               </span>
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
                              label: `${movingAveragePeriod}-day Moving Average`,
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
                                  name={`${movingAveragePeriod}-day Moving Average`}
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-teal-950 dark:via-blue-950 dark:to-teal-900">
      {/* Hero Section - Compact with Targeting Theme */}
      <div className="relative overflow-hidden border-b border-teal-200 dark:border-teal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10"></div>
        
        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Icon and Title with Targeting Theme */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                {/* Targeting indicator dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <H1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl" style={{fontWeight: 700}}>
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    HealthBridge Enhanced
                  </span>
                </H1>
                <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>
            
            {/* Description with Targeting Language */}
            <p className="text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced weight loss tracking with AI-powered projections and comprehensive analytics. 
              <span className="font-medium text-teal-700 dark:text-teal-300"> Target your health goals </span>
              with precision-driven insights and data-driven decision making.
            </p>
            
            {/* Quick Stats with Targeting Theme */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Precision Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI Projections</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Goal Targeting</span>
              </div>
            </div>
            
            {isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-4">
                💡 Weight goals are managed in your <a href="/protected/settings" className="text-blue-600 hover:underline">Settings page</a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
        <TabsList className={`grid w-full ${isAuthenticated ? 'grid-cols-4' : 'grid-cols-3'} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-teal-200 dark:border-teal-800`}>
          {isAuthenticated && (
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-0">
              <Scale className="w-4 h-4 mr-2" />
              Enter Weight
            </TabsTrigger>
          )}
          <TabsTrigger value="data" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-0">
            <TableIcon className="w-4 h-4 mr-2" />
            Current Progress
          </TabsTrigger>
          <TabsTrigger value="projections" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-0">
            <TrendingUp className="w-4 h-4 mr-2" />
            Projections
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-0">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!isAuthenticated ? (
            <Card className="max-w-md mx-auto border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100">Authentication Required</CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-300">
                  Please sign in to enter weight data and access personalized features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/projects/healthbridge-enhanced'}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white border-0"
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
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg dark:bg-teal-950/50 dark:border-teal-800">
              <p className="text-sm text-teal-700 dark:text-teal-300">
                💡 <strong>Demo Mode:</strong> Showing sample data to demonstrate the dashboard features
              </p>
            </div>
          )}
          <WeightDataTable />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg dark:bg-teal-950/50 dark:border-teal-800">
              <p className="text-sm text-teal-700 dark:text-teal-300">
                💡 <strong>Demo Mode:</strong> Showing sample projections to demonstrate the dashboard features
              </p>
            </div>
          )}
          <WeightProjections />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg dark:bg-teal-950/50 dark:border-teal-800">
              <p className="text-sm text-teal-700 dark:text-teal-300">
                💡 <strong>Demo Mode:</strong> Showing sample analytics to demonstrate the dashboard features
              </p>
            </div>
          )}
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
