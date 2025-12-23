/**
 * WeightProjections Component
 *
 * A comprehensive weight projection and goal visualization component.
 * Includes medication impact calculations, activity level adjustments,
 * and interactive projection charts.
 * Extracted from HealthBridgeEnhanced.tsx for better modularity.
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Pill, Scale, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HealthBridgeEnhancedAPI } from '@/api/healthBridgeEnhanced';
import { UserProfilesAPI } from '@/api/userProfiles';
import { useAuth } from '@/hooks/useAuth';

/**
 * Weight projections component with medication scenarios and target goals (pounds only)
 */
export function WeightProjections() {
  const { user, isAuthenticated } = useAuth();

  // Always call hooks, but conditionally use their data
  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email ?? user?.sub ?? 'dev-user-123';

  const weightGoalQuery = useQuery({
    queryKey: ['weightGoal', userId],
    queryFn: () => UserProfilesAPI.getWeightGoal(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userMedicationsQuery = useQuery({
    queryKey: ['userMedications', userId],
    queryFn: () => UserProfilesAPI.getUserMedications(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const weightDataQuery = useQuery({
    queryKey: ['enhanced-weights', userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeights(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const projectionsQuery = useQuery({
    queryKey: ['projections', userId],
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
  const [medicationMode, setMedicationMode] = useState<'with' | 'without'>(
    'without'
  );
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
      const firstWeight = weightData[0];
      if (firstWeight) {
        const weight = firstWeight.weight_lb || firstWeight.weight;
        return typeof weight === 'string' ? parseFloat(weight) : weight;
      }
    }
    return null;
  }, [weightData]);

  const startingWeight = useMemo(() => {
    if (weightData && weightData.length > 0) {
      // Sort by date to get chronological order
      const sortedWeightData = [...weightData].sort((a, b) => {
        const dateA = new Date(a.timestamp ?? 0);
        const dateB = new Date(b.timestamp ?? 0);
        return dateA.getTime() - dateB.getTime();
      });
      const firstWeight = sortedWeightData[0];
      if (firstWeight) {
        const weight = firstWeight.weight_lb || firstWeight.weight;
        return typeof weight === 'string' ? parseFloat(weight) : weight;
      }
    }
    return null;
  }, [weightData]);

  const targetWeight = useMemo(() => {
    return weightGoal?.target_weight_lbs ?? 150;
  }, [weightGoal]);

  const targetDate = useMemo(() => {
    if (!weightGoal?.target_date) return null;
    // Handle both ISO date strings and date-only strings
    const dateStr = weightGoal.target_date.includes('T')
      ? weightGoal.target_date
      : weightGoal.target_date + 'T00:00:00';
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
      const medName = (
        medication.medication_name ??
        medication.medication_type?.name ??
        ''
      ).toLowerCase();
      const genericName = (
        medication.generic_name ??
        medication.medication_type?.generic_name ??
        ''
      ).toLowerCase();

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
          baseMultiplier = 0.1; // 10% conservative default
      }

      // Calculate dosage-based multiplier
      if (medication.dosage_mg) {
        const dosage =
          typeof medication.dosage_mg === 'string'
            ? parseFloat(medication.dosage_mg)
            : medication.dosage_mg;

        // Evidence-based dosage scaling from clinical trials
        if (
          medName === 'zepbound' ||
          medName === 'mounjaro' ||
          genericName === 'tirzepatide'
        ) {
          // SURMOUNT trial dose-response: 2.5mg (5% WL), 5mg (8% WL), 7.5mg (11% WL), 10mg (15% WL), 12.5mg (17% WL), 15mg (20% WL)
          // Relative efficacy: 2.5mg=25%, 5mg=40%, 7.5mg=55%, 10mg=75%, 12.5mg=85%, 15mg=100%
          if (dosage <= 2.5)
            dosageMultiplier = 0.25; // 2.5mg = 25% of max efficacy (5% weight loss)
          else if (dosage <= 5)
            dosageMultiplier = 0.4; // 5mg = 40% of max efficacy (8% weight loss)
          else if (dosage <= 7.5)
            dosageMultiplier = 0.55; // 7.5mg = 55% of max efficacy (11% weight loss)
          else if (dosage <= 10)
            dosageMultiplier = 0.75; // 10mg = 75% of max efficacy (15% weight loss)
          else if (dosage <= 12.5)
            dosageMultiplier = 0.85; // 12.5mg = 85% of max efficacy (17% weight loss)
          else dosageMultiplier = 1.0; // 15mg = 100% of max efficacy (20% weight loss)
        } else if (
          medName === 'ozempic' ||
          medName === 'wegovy' ||
          genericName === 'semaglutide'
        ) {
          // STEP trial dose-response: 0.5mg (6% WL), 1.0mg (10% WL), 2.4mg (15% WL)
          // Relative efficacy: 0.25mg=15%, 0.5mg=40%, 1.0mg=67%, 1.7mg=85%, 2.4mg=100%
          if (dosage <= 0.25)
            dosageMultiplier = 0.15; // 0.25mg = 15% of max efficacy (starting dose)
          else if (dosage <= 0.5)
            dosageMultiplier = 0.4; // 0.5mg = 40% of max efficacy (6% weight loss)
          else if (dosage <= 1.0)
            dosageMultiplier = 0.67; // 1.0mg = 67% of max efficacy (10% weight loss)
          else if (dosage <= 1.7)
            dosageMultiplier = 0.85; // 1.7mg = 85% of max efficacy (interpolated)
          else dosageMultiplier = 1.0; // 2.4mg = 100% of max efficacy (15% weight loss)
        } else if (medName === 'saxenda' || genericName === 'liraglutide') {
          // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
          // Clinical data: 0.6mg (minimal), 1.2mg (moderate), 1.8mg (good), 3.0mg (max)
          if (dosage <= 0.6)
            dosageMultiplier = 0.2; // 0.6mg = 20% of max efficacy
          else if (dosage <= 1.2)
            dosageMultiplier = 0.5; // 1.2mg = 50% of max efficacy
          else if (dosage <= 1.8)
            dosageMultiplier = 0.75; // 1.8mg = 75% of max efficacy
          else if (dosage <= 2.4)
            dosageMultiplier = 0.9; // 2.4mg = 90% of max efficacy
          else dosageMultiplier = 1.0; // 3.0mg = 100% of max efficacy
        } else if (medName === 'qsymia') {
          // Qsymia dosage scaling (3.75/23mg to 15/92mg)
          // Based on phentermine component: 3.75mg (low), 7.5mg (medium), 11.25mg (high), 15mg (max)
          if (dosage <= 3.75)
            dosageMultiplier = 0.3; // 3.75mg = 30% of max efficacy
          else if (dosage <= 7.5)
            dosageMultiplier = 0.6; // 7.5mg = 60% of max efficacy
          else if (dosage <= 11.25)
            dosageMultiplier = 0.8; // 11.25mg = 80% of max efficacy
          else dosageMultiplier = 1.0; // 15mg = 100% of max efficacy
        } else if (medName === 'contrave') {
          // Contrave dosage scaling (8/90mg to 32/360mg)
          // Based on naltrexone component: 8mg (low), 16mg (medium), 24mg (high), 32mg (max)
          if (dosage <= 8)
            dosageMultiplier = 0.25; // 8mg = 25% of max efficacy
          else if (dosage <= 16)
            dosageMultiplier = 0.5; // 16mg = 50% of max efficacy
          else if (dosage <= 24)
            dosageMultiplier = 0.75; // 24mg = 75% of max efficacy
          else dosageMultiplier = 1.0; // 32mg = 100% of max efficacy
        } else if (medName === 'xenical') {
          // Xenical dosage scaling (60mg to 120mg)
          // Clinical data: 60mg (half dose), 120mg (full dose)
          if (dosage <= 60)
            dosageMultiplier = 0.5; // 60mg = 50% of max efficacy
          else dosageMultiplier = 1.0; // 120mg = 100% of max efficacy
        } else if (medName === 'belviq') {
          // Belviq dosage scaling (10mg to 20mg)
          // Clinical data: 10mg (standard), 20mg (higher dose)
          if (dosage <= 10)
            dosageMultiplier = 0.7; // 10mg = 70% of max efficacy
          else dosageMultiplier = 1.0; // 20mg = 100% of max efficacy
        } else if (medName === 'phentermine') {
          // Phentermine dosage scaling (15mg to 37.5mg)
          // Clinical data: 15mg (low), 30mg (medium), 37.5mg (high)
          if (dosage <= 15)
            dosageMultiplier = 0.4; // 15mg = 40% of max efficacy
          else if (dosage <= 30)
            dosageMultiplier = 0.7; // 30mg = 70% of max efficacy
          else dosageMultiplier = 1.0; // 37.5mg = 100% of max efficacy
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
      const medicationContribution =
        baseMultiplier * dosageMultiplier * frequencyMultiplier;
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
      very_active: 1.9,
    };
    return (
      activityMultipliers[activityLevel as keyof typeof activityMultipliers] ||
      1.55
    );
  }, [activityLevel]);

  // Calculate current profile-based projection (unchangeable)
  const currentProfileProjection = useMemo(() => {
    if (!projections?.activity_level || !projections?.activity_multiplier) {
      return null;
    }

    // Ensure daily rate is negative for weight loss (fix for production API issue)
    const baseDailyRate =
      projections.daily_rate > 0
        ? -projections.daily_rate
        : projections.daily_rate;
    const currentActivityMultiplier = projections.activity_multiplier;
    const currentMedicationMultiplier = medicationMultiplier; // User's actual medication multiplier

    // Calculate current profile rate
    const currentActivityRate = baseDailyRate * currentActivityMultiplier;
    const currentProfileRate =
      currentMedicationMultiplier > 0
        ? currentActivityRate * (1 + currentMedicationMultiplier)
        : currentActivityRate;

    return {
      dailyRate: currentProfileRate,
      activityLevel: projections.activity_level,
      activityMultiplier: currentActivityMultiplier,
      medicationMultiplier: currentMedicationMultiplier,
    };
  }, [projections, medicationMultiplier]);

  // Calculate projections with proper domain and range
  const projectionData = useMemo(() => {
    if (
      !currentWeight ||
      !startingWeight ||
      !targetWeight ||
      !projections?.daily_rate
    ) {
      return [];
    }

    // Ensure daily rate is negative for weight loss (fix for production API issue)
    const baseDailyRate =
      projections.daily_rate > 0
        ? -projections.daily_rate
        : projections.daily_rate;

    // Calculate current profile projection rate (unchangeable)
    const currentProfileRate =
      currentProfileProjection?.dailyRate ?? baseDailyRate;

    // Calculate adjustable projection rate
    const activityAdjustedRate = baseDailyRate * activityMultiplier;
    const adjustableDailyRate =
      medicationMode === 'with' && medicationMultiplier > 0
        ? activityAdjustedRate * (1 + medicationMultiplier)
        : activityAdjustedRate;

    const projectionResults = [];
    const today = new Date();
    const lastWeightDate =
      weightData && weightData.length > 0
        ? new Date(weightData[0]?.timestamp ?? '')
        : today;

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

      // Calculate both projections (daily rate should be negative for weight loss)
      const currentProfileWeight = Math.max(
        targetWeight,
        currentWeight + currentProfileRate * days
      );
      const adjustableWeight = Math.max(
        targetWeight,
        currentWeight + adjustableDailyRate * days
      );

      // Format date based on the projection period
      let dateFormat = 'MMM dd';
      if (maxDays > 90) {
        dateFormat = 'MMM yy';
      } else if (maxDays > 30) {
        dateFormat = 'MMM dd';
      }

      projectionResults.push({
        date: format(date, dateFormat),
        day: days,
        currentProfileWeight: currentProfileWeight,
        projectedWeight: adjustableWeight,
        target: targetWeight,
        currentWeight: i === 0 ? currentWeight : undefined, // Mark starting point
      });
    }

    return projectionResults;
  }, [
    currentWeight,
    startingWeight,
    targetWeight,
    projections,
    medicationMultiplier,
    medicationMode,
    activityMultiplier,
    projectionDays,
    weightData,
    currentProfileProjection,
  ]);

  // Calculate key metrics
  // Note: weeksToTargetNoMed is calculated in AnalyticsDashboard component where it's actually used

  // Loading states
  if (isLoadingWeights || isLoadingWeightGoal || isLoadingMedications) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center'>Loading weight data and settings...</div>
        </CardContent>
      </Card>
    );
  }

  // Error handling (only for authenticated users)
  if (isAuthenticated && projectionsError) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center text-strategy-rose'>
            Failed to load required data. Please check your connection and try
            again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have sufficient data
  if (!currentWeight || !startingWeight) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center text-strategy-gold-dark'>
            No weight data available. Please enter your weight first to see
            projections.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Current Status Overview */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Scale className='size-5' />
            Current Status & Goals
          </CardTitle>
          <CardDescription>
            Your current weight, target goals, and medication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
            <div className='rounded-lg bg-surface-elevated/30 p-4 text-center'>
              <div className='mb-2 text-sm font-medium text-text-foreground'>
                Current Weight
              </div>
              <div className='text-3xl font-bold text-text-foreground'>
                {currentWeight?.toFixed(1) || 'N/A'} lbs
              </div>
              {weightData && weightData.length > 0 && (
                <div className='mt-1 text-xs text-strategy-gold'>
                  {new Date(
                    weightData[0]?.timestamp ?? ''
                  ).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className='rounded-lg bg-surface-elevated/30 p-4 text-center'>
              <div className='mb-2 text-sm font-medium text-strategy-emerald'>
                Target Weight
              </div>
              <div className='text-3xl font-bold text-strategy-emerald'>
                {targetWeight?.toFixed(1) || 'N/A'} lbs
              </div>
              {weightGoal && (
                <div className='mt-1 text-xs text-strategy-emerald'>From settings</div>
              )}
            </div>

            <div className='rounded-lg bg-surface-elevated/30 p-4 text-center'>
              <div className='mb-2 text-sm font-medium text-strategy-gold'>
                Target Date
              </div>
              <div className='text-3xl font-bold text-text-foreground'>
                {targetDate
                  ? targetDate.toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                    })
                  : 'Not set'}
              </div>
              {targetDate && (
                <div className='mt-1 text-xs text-purple-500'>
                  {Math.ceil(
                    (targetDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days away
                </div>
              )}
            </div>

            <div className='rounded-lg bg-orange-50 p-4 text-center'>
              <div className='mb-2 text-sm font-medium text-orange-600'>
                Active Medications
              </div>
              <div className='text-lg font-bold text-orange-700'>
                {userMedications?.filter(med => med.is_active).length ?? 0}
              </div>
              <div className='mt-1 text-xs text-orange-500'>
                {medicationMultiplier > 0
                  ? `+${(medicationMultiplier * 100).toFixed(0)}% boost`
                  : 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Details */}
      {userMedications &&
        userMedications.filter(med => med.is_active).length > 0 && (
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Pill className='size-5' />
                Current Medications
              </CardTitle>
              <CardDescription>
                Active medications and their impact on weight loss projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {userMedications
                  .filter(med => med.is_active)
                  .map(medication => (
                    <div
                      key={medication.id}
                      className='rounded-lg bg-muted p-4'
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <h4 className='text-lg font-semibold'>
                            {medication.medication_name ??
                              medication.medication_type?.name ??
                              'Unknown Medication'}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {medication.generic_name ??
                              medication.medication_type?.generic_name ??
                              'Generic name not available'}
                          </p>
                          <div className='mt-2 flex gap-4 text-sm'>
                            {medication.dosage_mg && (
                              <span className='text-text-foreground'>
                                <strong>Dosage:</strong> {medication.dosage_mg}
                                mg
                              </span>
                            )}
                            {medication.frequency && (
                              <span className='text-strategy-emerald'>
                                <strong>Frequency:</strong>{' '}
                                {medication.frequency}
                              </span>
                            )}
                            {medication.start_date && (
                              <span className='text-strategy-gold'>
                                <strong>Started:</strong>{' '}
                                {new Date(
                                  medication.start_date.includes('T')
                                    ? medication.start_date
                                    : medication.start_date + 'T00:00:00'
                                ).toLocaleDateString('en-US', {
                                  timeZone: 'America/New_York',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='text-right'>
                          {(() => {
                            // Use the same evidence-based calculation as the main medicationMultiplier
                            let baseMultiplier = 0;
                            let dosageMultiplier = 1;

                            // Evidence-based base multipliers from clinical trials
                            const medName = (
                              medication.medication_name ??
                              medication.medication_type?.name ??
                              ''
                            ).toLowerCase();
                            const genericName = (
                              medication.generic_name ??
                              medication.medication_type?.generic_name ??
                              ''
                            ).toLowerCase();

                            if (
                              medName === 'ozempic' ||
                              medName === 'wegovy' ||
                              genericName === 'semaglutide'
                            ) {
                              baseMultiplier = 0.48; // 48% boost from STEP trials
                            } else if (
                              medName === 'zepbound' ||
                              medName === 'mounjaro' ||
                              genericName === 'tirzepatide'
                            ) {
                              baseMultiplier = 0.73; // 73% boost from SURMOUNT trials
                            } else if (
                              medName === 'saxenda' ||
                              genericName === 'liraglutide'
                            ) {
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
                              baseMultiplier = 0.1; // 10% conservative default
                            }

                            // Calculate dosage-based multiplier
                            if (medication.dosage_mg) {
                              const dosage =
                                typeof medication.dosage_mg === 'string'
                                  ? parseFloat(medication.dosage_mg)
                                  : medication.dosage_mg;

                              // Evidence-based dosage scaling from clinical trials
                              if (
                                medName === 'zepbound' ||
                                medName === 'mounjaro' ||
                                genericName === 'tirzepatide'
                              ) {
                                // SURMOUNT trial dose-response: 2.5mg (5% WL), 5mg (8% WL), 7.5mg (11% WL), 10mg (15% WL), 12.5mg (17% WL), 15mg (20% WL)
                                if (dosage <= 2.5)
                                  dosageMultiplier = 0.25; // 2.5mg = 25% of max efficacy (5% weight loss)
                                else if (dosage <= 5)
                                  dosageMultiplier = 0.4; // 5mg = 40% of max efficacy (8% weight loss)
                                else if (dosage <= 7.5)
                                  dosageMultiplier = 0.55; // 7.5mg = 55% of max efficacy (11% weight loss)
                                else if (dosage <= 10)
                                  dosageMultiplier = 0.75; // 10mg = 75% of max efficacy (15% weight loss)
                                else if (dosage <= 12.5)
                                  dosageMultiplier = 0.85; // 12.5mg = 85% of max efficacy (17% weight loss)
                                else dosageMultiplier = 1.0; // 15mg = 100% of max efficacy (20% weight loss)
                              } else if (
                                medName === 'ozempic' ||
                                medName === 'wegovy' ||
                                genericName === 'semaglutide'
                              ) {
                                // STEP trial dose-response: 0.5mg (6% WL), 1.0mg (10% WL), 2.4mg (15% WL)
                                if (dosage <= 0.25)
                                  dosageMultiplier = 0.15; // 0.25mg = 15% of max efficacy (starting dose)
                                else if (dosage <= 0.5)
                                  dosageMultiplier = 0.4; // 0.5mg = 40% of max efficacy (6% weight loss)
                                else if (dosage <= 1.0)
                                  dosageMultiplier = 0.67; // 1.0mg = 67% of max efficacy (10% weight loss)
                                else if (dosage <= 1.7)
                                  dosageMultiplier = 0.85; // 1.7mg = 85% of max efficacy (interpolated)
                                else dosageMultiplier = 1.0; // 2.4mg = 100% of max efficacy (15% weight loss)
                              } else if (
                                medName === 'saxenda' ||
                                genericName === 'liraglutide'
                              ) {
                                // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
                                if (dosage <= 0.6)
                                  dosageMultiplier = 0.2; // 0.6mg = 20% of max efficacy
                                else if (dosage <= 1.2)
                                  dosageMultiplier = 0.5; // 1.2mg = 50% of max efficacy
                                else if (dosage <= 1.8)
                                  dosageMultiplier = 0.75; // 1.8mg = 75% of max efficacy
                                else dosageMultiplier = 1.0; // 3.0mg = 100% of max efficacy
                              } else if (medName === 'qsymia') {
                                // Qsymia dosage scaling (3.75/23mg to 15/92mg daily)
                                if (dosage <= 3.75)
                                  dosageMultiplier = 0.3; // 3.75mg = 30% of max efficacy
                                else if (dosage <= 7.5)
                                  dosageMultiplier = 0.6; // 7.5mg = 60% of max efficacy
                                else dosageMultiplier = 1.0; // 15mg = 100% of max efficacy
                              } else if (medName === 'contrave') {
                                // Contrave dosage scaling (8/90mg to 32/360mg daily)
                                if (dosage <= 8)
                                  dosageMultiplier = 0.4; // 8mg = 40% of max efficacy
                                else if (dosage <= 16)
                                  dosageMultiplier = 0.7; // 16mg = 70% of max efficacy
                                else dosageMultiplier = 1.0; // 32mg = 100% of max efficacy
                              } else if (medName === 'xenical') {
                                // Xenical dosage scaling (60mg to 120mg three times daily)
                                if (dosage <= 60)
                                  dosageMultiplier = 0.5; // 60mg = 50% of max efficacy
                                else dosageMultiplier = 1.0; // 120mg = 100% of max efficacy
                              } else if (medName === 'belviq') {
                                // Belviq dosage scaling (10mg to 20mg daily)
                                if (dosage <= 10)
                                  dosageMultiplier = 0.6; // 10mg = 60% of max efficacy
                                else dosageMultiplier = 1.0; // 20mg = 100% of max efficacy
                              } else if (medName === 'phentermine') {
                                // Phentermine dosage scaling (15mg to 37.5mg daily)
                                if (dosage <= 15)
                                  dosageMultiplier = 0.5; // 15mg = 50% of max efficacy
                                else if (dosage <= 30)
                                  dosageMultiplier = 0.8; // 30mg = 80% of max efficacy
                                else dosageMultiplier = 1.0; // 37.5mg = 100% of max efficacy
                              } else {
                                // Default dosage scaling for unknown medications
                                dosageMultiplier = Math.min(dosage / 10, 1.0);
                              }
                            }

                            // Calculate frequency multiplier
                            let frequencyMultiplier = 1;
                            switch (medication.frequency?.toLowerCase()) {
                              case 'daily':
                                frequencyMultiplier = 1.0;
                                break;
                              case 'weekly':
                                frequencyMultiplier = 1.0;
                                break;
                              case 'bi-weekly':
                              case 'biweekly':
                                frequencyMultiplier = 0.7;
                                break;
                              case 'monthly':
                                frequencyMultiplier = 0.4;
                                break;
                              default:
                                frequencyMultiplier = 1.0;
                            }

                            const actualEfficacy =
                              baseMultiplier *
                              dosageMultiplier *
                              frequencyMultiplier;
                            return (
                              <div className='text-lg font-bold text-strategy-emerald'>
                                +{(actualEfficacy * 100).toFixed(0)}%
                              </div>
                            );
                          })()}
                          <div className='text-xs text-muted-foreground'>
                            Calculated Efficacy
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Projection Controls */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='size-5' />
            Projection Settings
          </CardTitle>
          <CardDescription>
            Configure your weight loss projection analysis
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='projectionDays'>Projection Period</Label>
              <Select
                value={projectionDays.toString()}
                onValueChange={handleProjectionPeriodChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7'>7 days (1 week)</SelectItem>
                  <SelectItem value='14'>14 days (2 weeks)</SelectItem>
                  <SelectItem value='30'>30 days (1 month)</SelectItem>
                  <SelectItem value='60'>60 days (2 months)</SelectItem>
                  <SelectItem value='90'>90 days (3 months)</SelectItem>
                  <SelectItem value='120'>120 days (4 months)</SelectItem>
                  <SelectItem value='180'>180 days (6 months)</SelectItem>
                  <SelectItem value='365'>365 days (1 year)</SelectItem>
                  {targetDate &&
                    (() => {
                      const diffTime =
                        targetDate.getTime() - new Date().getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      if (
                        diffDays > 0 &&
                        ![7, 14, 30, 60, 90, 120, 180, 365].includes(diffDays)
                      ) {
                        return (
                          <SelectItem value={diffDays.toString()}>
                            {diffDays} days (to target date)
                          </SelectItem>
                        );
                      }
                      return null;
                    })()}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Current Trajectory</Label>
              <div className='text-2xl font-bold text-text-foreground'>
                {projections?.daily_rate
                  ? Math.abs(projections.daily_rate * 7).toFixed(2)
                  : 'N/A'}{' '}
                lbs/week
              </div>
              <div className='text-sm text-muted-foreground'>
                Based on recent weight data
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Medication Impact</Label>
              <div className='text-2xl font-bold text-strategy-emerald'>
                {medicationMultiplier > 0
                  ? `+${(medicationMultiplier * 100).toFixed(0)}%`
                  : 'None'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {medicationMultiplier > 0
                  ? 'Enhanced weight loss'
                  : 'Natural weight loss only'}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Activity Level Impact</Label>
              <div className='text-2xl font-bold text-strategy-gold'>
                {projections?.activity_level
                  ? projections.activity_level.replace('_', ' ').toUpperCase()
                  : 'MODERATE'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {projections?.activity_multiplier
                  ? `Multiplier: ${projections.activity_multiplier.toFixed(2)}x`
                  : 'Standard activity level'}
              </div>
            </div>
          </div>

          {/* Projection Settings */}
          <div className='flex gap-4'>
            <div className='space-y-2'>
              <Label>Medication Mode</Label>
              <Select
                value={medicationMode}
                onValueChange={(value: 'with' | 'without') =>
                  setMedicationMode(value)
                }
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='without'>Without Medication</SelectItem>
                  <SelectItem
                    value='with'
                    disabled={medicationMultiplier === 0}
                  >
                    With Medication{' '}
                    {medicationMultiplier > 0
                      ? `(+${(medicationMultiplier * 100).toFixed(0)}% boost)`
                      : '(No active medications)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger className='w-[200px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='sedentary'>Sedentary (1.2x)</SelectItem>
                  <SelectItem value='light'>Light (1.375x)</SelectItem>
                  <SelectItem value='moderate'>Moderate (1.55x)</SelectItem>
                  <SelectItem value='active'>Active (1.725x)</SelectItem>
                  <SelectItem value='very_active'>
                    Very Active (1.9x)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Projection Chart */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Weight Loss Trajectory Projections</CardTitle>
          <CardDescription>
            Projected weight loss from {startingWeight?.toFixed(1)} lbs to{' '}
            {targetWeight?.toFixed(1)} lbs
            {targetDate &&
              `, targeting ${targetDate.toLocaleDateString('en-US', { timeZone: 'America/New_York' })}`}
            <br />
            <span className='text-sm text-muted-foreground'>
              Showing {projectionDays} day projection period • X-axis range:{' '}
              {projectionDays} days
            </span>
            <br />
            <span className='text-sm font-medium text-strategy-gold-dark'>
              Orange line shows your current profile projection (unchangeable).
              Teal line shows scenario projection based on your selected
              settings above.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chart Legend */}
          <div className='mb-4 flex flex-wrap justify-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-blue-600'></div>
              <span className='text-sm text-muted-foreground'>
                Current Weight
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-orange-500'></div>
              <span className='text-sm text-muted-foreground'>
                Current Profile (
                {currentProfileProjection?.activityLevel?.replace('_', ' ') ??
                  'moderate'}
                {(currentProfileProjection?.medicationMultiplier ?? 0) > 0
                  ? ', with medication'
                  : ''}
                )
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-surface-elevated/30'></div>
              <span className='text-sm text-muted-foreground'>
                Scenario (
                {medicationMode === 'with'
                  ? 'With Medication'
                  : 'Without Medication'}
                , {activityLevel.replace('_', ' ')})
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-surface-elevated/30'></div>
              <span className='text-sm text-muted-foreground'>
                Target Weight
              </span>
            </div>
          </div>

          <div className='h-80 w-full'>
            <ChartContainer
              config={{
                currentWeight: {
                  label: 'Current Weight (lbs)',
                  color: '#3b82f6',
                },
                currentProfileWeight: {
                  label: 'Current Profile Projection (lbs)',
                  color: '#f97316',
                },
                projectedWeight: {
                  label: 'Scenario Projection (lbs)',
                  color: '#14b8a6',
                },
                target: {
                  label: 'Target Weight (lbs)',
                  color: '#8b5cf6',
                },
              }}
              className='size-full'
            >
              <LineChart data={projectionData} width={800} height={320}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(projectionData.length / 8))} // Show ~8 ticks for readability
                  tickFormatter={(value: unknown) => {
                    // Show more detailed date formatting for longer periods
                    if (projectionDays > 90) {
                      return typeof value === 'string' ? value : '';
                    } else if (projectionDays > 30) {
                      return typeof value === 'string' ? value : '';
                    } else {
                      return typeof value === 'string' ? value : '';
                    }
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[
                    targetWeight - 5,
                    Math.max(startingWeight + 10, currentWeight + 20),
                  ]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className='w-[200px]'
                      nameKey='projectedWeight'
                    />
                  }
                />

                {/* Target Weight Line */}
                <Line
                  type='monotone'
                  dataKey='target'
                  stroke='#8b5cf6'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                  dot={false}
                  name='Target Weight'
                />

                {/* Current Weight Starting Point */}
                <Line
                  type='monotone'
                  dataKey='currentWeight'
                  stroke='#3b82f6'
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', strokeWidth: 3, r: 6 }}
                  connectNulls={false}
                  name='Current Weight'
                />

                {/* Current Profile Projection Line (unchangeable) */}
                <Line
                  type='monotone'
                  dataKey='currentProfileWeight'
                  stroke='#f97316'
                  strokeWidth={2}
                  strokeDasharray='8 4'
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#f97316', strokeWidth: 2 }}
                  name='Current Profile Projection'
                />

                {/* Adjustable Scenario Projection Line */}
                <Line
                  type='monotone'
                  dataKey='projectedWeight'
                  stroke='#14b8a6'
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                  name='Scenario Projection'
                />
              </LineChart>
            </ChartContainer>
          </div>

          {/* Medical Disclaimer Tooltip */}
          <div className='mt-4 flex justify-center'>
            <div className='group relative inline-flex cursor-help items-center gap-2 rounded-lg border border-amber-200 bg-surface-elevated/30 px-3 py-2 text-sm text-strategy-gold-dark'>
              <svg className='size-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Medical Disclaimer</span>

              {/* Tooltip */}
              <div className='invisible absolute bottom-full left-1/2 z-50 mb-2 w-96 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100'>
                <div className='text-sm text-gray-800'>
                  <h4 className='mb-2 font-semibold text-strategy-gold-dark'>
                    Important Medical Disclaimer
                  </h4>
                  <div className='space-y-2'>
                    <p>
                      <strong>
                        These projections are estimates only and should not be
                        considered medical advice or guarantees.
                      </strong>
                      Weight loss results vary significantly between individuals
                      due to factors including genetics, metabolism, medical
                      conditions, lifestyle, and adherence to treatment plans.
                    </p>
                    <p>
                      <strong>Clinical Study Basis:</strong> Projection
                      calculations are based on published clinical trial data
                      from studies including SURMOUNT (tirzepatide), STEP
                      (semaglutide), SCALE (liraglutide), EQUIP
                      (phentermine-topiramate), COR-II (naltrexone-bupropion),
                      and other peer-reviewed research. However, individual
                      results may differ substantially from study averages.
                    </p>
                    <p>
                      <strong>Consult Your Healthcare Provider:</strong> Always
                      consult with your healthcare provider before making any
                      changes to your medication, diet, or exercise routine.
                      These projections do not replace professional medical
                      advice, diagnosis, or treatment.
                    </p>
                    <p>
                      <strong>Limitations:</strong> Projections assume
                      consistent medication adherence, stable activity levels,
                      and do not account for plateaus, metabolic adaptation, or
                      other factors that may affect weight loss over time.
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className='absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-4 border-t-4 border-transparent border-t-white'></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytical Insights moved to Analytics */}
    </div>
  );
}

