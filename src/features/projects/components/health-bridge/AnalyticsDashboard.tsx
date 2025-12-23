/**
 * AnalyticsDashboard Component
 *
 * A comprehensive analytics and insights dashboard for weight tracking.
 * Includes statistical analysis, trend charts, medication impact analysis,
 * and goal tracking metrics.
 * Extracted from HealthBridgeEnhanced.tsx for better modularity.
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';

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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { HealthBridgeEnhancedAPI } from '@/api/healthBridgeEnhanced';
import { UserProfilesAPI } from '@/api/userProfiles';
import { useAuth } from '@/hooks/useAuth';

/**
 * Analytics dashboard component (pounds only)
 */
export function AnalyticsDashboard() {
  const { user } = useAuth();

  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email ?? user?.sub ?? 'dev-user-123';

  // Always call hooks, but conditionally use their data
  const analyticsQuery = useQuery({
    queryKey: ['analytics', userId],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30, userId),
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

  // Bring goals and projections into Analytics for richer insights
  const weightGoalQuery = useQuery({
    queryKey: ['weightGoal', userId],
    queryFn: () => UserProfilesAPI.getWeightGoal(userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const projectionsQuery = useQuery({
    queryKey: ['projections', userId],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(90, userId),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const userMedicationsQuery = useQuery({
    queryKey: ['userMedications', userId],
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
  const error = analyticsQuery.error ?? weightDataQuery.error;

  // Calculate enhanced analytics metrics
  const enhancedMetrics = useMemo(() => {
    if (!weightData || weightData.length === 0) return null;

    // Extract and convert weights to numbers
    const weights = weightData
      .map(w => {
        const weight = w.weight_lb || w.weight;
        return typeof weight === 'string' ? parseFloat(weight) : weight;
      })
      .filter((w): w is number => !isNaN(w));

    if (weights.length === 0) return null;

    // Sort weight data by timestamp
    const sortedWeightData = [...weightData].sort((a, b) => {
      const dateA = new Date(a.timestamp || '');
      const dateB = new Date(b.timestamp || '');
      return dateA.getTime() - dateB.getTime();
    });

    // Extract sorted weights as numbers
    const sortedWeights = sortedWeightData
      .map(w => {
        const weight = w.weight_lb || w.weight;
        return typeof weight === 'string' ? parseFloat(weight) : weight;
      })
      .filter((w): w is number => !isNaN(w));

    if (sortedWeights.length === 0) return null;

    const currentWeight = sortedWeights[sortedWeights.length - 1];
    const startingWeight = sortedWeights[0];
    if (currentWeight === undefined || startingWeight === undefined)
      return null;

    const totalChange = currentWeight - startingWeight;
    const totalChangePercentage = (totalChange / startingWeight) * 100;

    // Calculate weekly averages for trend analysis
    const weeklyAverages: number[] = [];
    const weeklyChanges: number[] = [];
    for (let i = 7; i < sortedWeights.length; i += 7) {
      const weekStart = sortedWeights[i - 7];
      const weekEnd = sortedWeights[i];
      if (weekStart !== undefined && weekEnd !== undefined) {
        const weeklyAvg = (weekStart + weekEnd) / 2;
        const weeklyChange = weekEnd - weekStart;
        weeklyAverages.push(weeklyAvg);
        weeklyChanges.push(weeklyChange);
      }
    }

    // Calculate statistical measures
    const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
    const variance =
      weights.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      weights.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    // Calculate trend consistency
    const positiveChanges = weeklyChanges.filter(
      (change: number) => change < 0
    ).length;
    const consistencyScore =
      weeklyChanges.length > 0
        ? (positiveChanges / weeklyChanges.length) * 100
        : 0;

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
        start: new Date(
          sortedWeightData[sortedWeightData.length - 1]?.timestamp ?? ''
        ),
        end: new Date(sortedWeightData[0]?.timestamp ?? ''),
      },
    };
  }, [weightData]);

  // Derive projections-based metrics (moved from Projections tab)
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
    return weightGoal?.target_weight_lbs ?? null;
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
          baseMultiplier = 0.1; // 10% conservative default
      }

      if (medication.dosage_mg) {
        const dosage =
          typeof medication.dosage_mg === 'string'
            ? parseFloat(medication.dosage_mg)
            : medication.dosage_mg;
        if (medName === 'zepbound' || genericName === 'tirzepatide') {
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
        } else if (medName === 'saxenda' || genericName === 'liraglutide') {
          // Saxenda/Liraglutide dosage scaling (0.6mg to 3.0mg daily)
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
          if (dosage <= 3.75)
            dosageMultiplier = 0.3; // 3.75mg = 30% of max efficacy
          else if (dosage <= 7.5)
            dosageMultiplier = 0.6; // 7.5mg = 60% of max efficacy
          else if (dosage <= 11.25)
            dosageMultiplier = 0.8; // 11.25mg = 80% of max efficacy
          else dosageMultiplier = 1.0; // 15mg = 100% of max efficacy
        } else if (medName === 'contrave') {
          // Contrave dosage scaling (8/90mg to 32/360mg)
          if (dosage <= 8)
            dosageMultiplier = 0.25; // 8mg = 25% of max efficacy
          else if (dosage <= 16)
            dosageMultiplier = 0.5; // 16mg = 50% of max efficacy
          else if (dosage <= 24)
            dosageMultiplier = 0.75; // 24mg = 75% of max efficacy
          else dosageMultiplier = 1.0; // 32mg = 100% of max efficacy
        } else if (medName === 'xenical') {
          // Xenical dosage scaling (60mg to 120mg)
          if (dosage <= 60)
            dosageMultiplier = 0.5; // 60mg = 50% of max efficacy
          else dosageMultiplier = 1.0; // 120mg = 100% of max efficacy
        } else if (medName === 'belviq') {
          // Belviq dosage scaling (10mg to 20mg)
          if (dosage <= 10)
            dosageMultiplier = 0.7; // 10mg = 70% of max efficacy
          else dosageMultiplier = 1.0; // 20mg = 100% of max efficacy
        } else if (medName === 'phentermine') {
          // Phentermine dosage scaling (15mg to 37.5mg)
          if (dosage <= 15)
            dosageMultiplier = 0.4; // 15mg = 40% of max efficacy
          else if (dosage <= 30)
            dosageMultiplier = 0.7; // 30mg = 70% of max efficacy
          else dosageMultiplier = 1.0; // 37.5mg = 100% of max efficacy
        } else {
          dosageMultiplier = Math.min(dosage / 10, 1.0);
        }
      }

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

      const medicationContribution =
        baseMultiplier * dosageMultiplier * frequencyMultiplier;
      console.log(
        `AnalyticsDashboard - Medication: ${medication.medication_name}, Base: ${baseMultiplier}, Dosage: ${dosageMultiplier}, Frequency: ${frequencyMultiplier}, Contribution: ${medicationContribution}`
      );
      totalMultiplier += medicationContribution;
    });

    return Math.min(totalMultiplier, 1.0);
  }, [userMedications]);

  const weeksToTargetNoMed = useMemo(() => {
    if (!currentWeight || !targetWeight || !projections?.daily_rate) return 0;
    const dailyRate = Math.abs(projections.daily_rate);
    return dailyRate > 0
      ? Math.ceil((currentWeight - targetWeight) / (dailyRate * 7))
      : 0;
  }, [currentWeight, targetWeight, projections]);

  const weeksToTargetWithMed = useMemo(() => {
    if (
      !currentWeight ||
      !targetWeight ||
      !projections?.daily_rate ||
      medicationMultiplier <= 0
    )
      return weeksToTargetNoMed;
    const dailyRate = Math.abs(
      projections.daily_rate * (1 + medicationMultiplier)
    );
    return dailyRate > 0
      ? Math.ceil((currentWeight - targetWeight) / (dailyRate * 7))
      : 0;
  }, [
    currentWeight,
    targetWeight,
    projections,
    medicationMultiplier,
    weeksToTargetNoMed,
  ]);

  const medicationBenefit = useMemo(() => {
    return Math.max(0, weeksToTargetNoMed - weeksToTargetWithMed);
  }, [weeksToTargetNoMed, weeksToTargetWithMed]);

  const activeMedicationNames = useMemo(() => {
    if (!userMedications || userMedications.length === 0)
      return 'No active medications';
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
  const totalLostLbs = hasWeights ? startingWeight - currentWeight : 0;
  const totalLostPct =
    hasWeights && startingWeight > 0
      ? (totalLostLbs / startingWeight) * 100
      : 0;
  const dailyRate = projections?.daily_rate ?? null;
  const confidence = projections?.confidence ?? null;
  const activityLevel = projections?.activity_level;
  const activityMultiplier = projections?.activity_multiplier;
  const stdDev = enhancedMetrics?.standardDeviation ?? null;
  const cv = enhancedMetrics?.coefficientOfVariation ?? null;
  const consistencyPct =
    enhancedMetrics?.consistencyScore ??
    analytics?.trends?.consistency_score ??
    null;
  const dataPointsCount =
    enhancedMetrics?.dataPoints ?? weightData?.length ?? 0;

  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center'>Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center text-strategy-rose'>
            Failed to load analytics. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendData = [
    { metric: 'Starting', value: analytics.metrics.starting_weight },
    { metric: 'Current', value: analytics.metrics.current_weight },
    { metric: 'Average', value: analytics.metrics.average_weight },
    { metric: 'Min', value: analytics.metrics.min_weight },
    { metric: 'Max', value: analytics.metrics.max_weight },
  ];

  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='size-5' />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your weight loss journey (pounds)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
            {trendData.map(item => (
              <div key={item.metric} className='text-center'>
                <div className='text-2xl font-bold text-text-foreground'>
                  {item.value.toFixed(1)}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {item.metric}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className='space-y-4'>
            <div>
              <Label>Overall Trend</Label>
              <div className='mt-1 flex items-center gap-2'>
                <Badge
                  variant={
                    analytics.trends.overall_trend === 'losing'
                      ? 'default'
                      : analytics.trends.overall_trend === 'gaining'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {analytics.trends.overall_trend.charAt(0).toUpperCase() +
                    analytics.trends.overall_trend.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Consistency Score</Label>
              <div className='mt-1 flex items-center gap-2'>
                <Progress
                  value={analytics.trends.consistency_score}
                  className='flex-1'
                />
                <span className='text-sm font-medium'>
                  {analytics.trends.consistency_score.toFixed(0)}%
                </span>
              </div>
            </div>

            {analytics.projections?.activity_level && (
              <div>
                <Label>Activity Level Impact</Label>
                <div className='mt-1 flex items-center gap-2'>
                  <Badge variant='outline' className='capitalize'>
                    {analytics.projections.activity_level.replace('_', ' ')}
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    {analytics.projections.activity_multiplier
                      ? `${analytics.projections.activity_multiplier.toFixed(2)}x multiplier`
                      : 'Standard rate'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className='mb-4 flex flex-wrap justify-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-blue-600'></div>
              <span className='text-sm text-muted-foreground'>
                Weight Metrics
              </span>
            </div>
          </div>

          <div className='h-48 w-full'>
            <ChartContainer
              config={{
                value: {
                  label: 'Weight (lbs)',
                  color: '#3b82f6',
                },
              }}
              className='size-full'
            >
              <BarChart data={trendData} width={400} height={200}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='metric'
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
                      className='w-[150px]'
                      nameKey='value'
                    />
                  }
                />
                <Bar dataKey='value' fill='#3b82f6' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {(() => {
            const start = analytics.metrics.starting_weight;
            const curr = analytics.metrics.current_weight;
            const min = analytics.metrics.min_weight;
            const max = analytics.metrics.max_weight;
            const delta = Number((curr - start).toFixed(1));
            const direction =
              delta === 0 ? 'no net change' : delta < 0 ? 'loss' : 'gain';
            return (
              <div className='mt-2 text-center text-sm text-muted-foreground'>
                {`Since start: ${Math.abs(delta).toFixed(1)} lbs ${direction}. Range: ${min.toFixed(1)}–${max.toFixed(1)} lbs.`}
              </div>
            );
          })()}

          <div className='text-center text-sm text-muted-foreground'>
            Generated: {format(new Date(analytics.generated_at), "PPP 'at' p")}
          </div>
        </CardContent>
      </Card>

      {/* Actual vs 7-day Moving Average */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Actual vs 7-day Moving Average</CardTitle>
          <CardDescription>
            Short-term smoothing to reveal the underlying trend
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {weightData && weightData.length > 1 ? (
            <>
              {(() => {
                // Prepare chronological series
                const sorted = [...weightData]
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp ?? 0).getTime() -
                      new Date(b.timestamp ?? 0).getTime()
                  )
                  .map(d => ({
                    date: format(new Date(d.timestamp ?? ''), 'MMM dd'),
                    weight:
                      typeof (d.weight_lb ?? d.weight) === 'string'
                        ? parseFloat(String(d.weight_lb ?? d.weight))
                        : Number(d.weight_lb ?? d.weight),
                  }));

                // 7-point moving average (approx 1 week if daily)
                const ma = sorted.map((_, idx) => {
                  const start = Math.max(0, idx - 6);
                  const window = sorted.slice(start, idx + 1);
                  const avg =
                    window.reduce((sum, v) => sum + (v.weight ?? 0), 0) /
                    window.length;
                  return Number(avg.toFixed(2));
                });

                const chartData = sorted.map((row, i) => ({
                  name: row.date,
                  actual: row.weight,
                  ma7: ma[i],
                }));

                return (
                  <div className='h-64 w-full'>
                    <ChartContainer
                      config={{
                        actual: { label: 'Actual (lbs)', color: '#2563eb' },
                        ma7: { label: '7-day MA (lbs)', color: '#10b981' },
                      }}
                      className='size-full'
                    >
                      <LineChart data={chartData} width={800} height={256}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                          dataKey='name'
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent className='w-[180px]' />
                          }
                        />
                        <Line
                          type='monotone'
                          dataKey='actual'
                          stroke='#2563eb'
                          strokeWidth={2}
                          dot={false}
                          name='Actual'
                        />
                        <Line
                          type='monotone'
                          dataKey='ma7'
                          stroke='#10b981'
                          strokeWidth={2}
                          dot={false}
                          name='7-day MA'
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                );
              })()}
              <p className='text-sm text-muted-foreground'>
                The blue line shows your raw daily weights. The green line
                smooths short-term noise by averaging the last 7 readings,
                making your underlying trend easier to see.
              </p>
              {(() => {
                // Recompute quick metrics for the notes
                const sorted = [...weightData]
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp ?? 0).getTime() -
                      new Date(b.timestamp ?? 0).getTime()
                  )
                  .map(d => ({
                    date: format(new Date(d.timestamp ?? ''), 'MMM dd'),
                    weight:
                      typeof (d.weight_lb ?? d.weight) === 'string'
                        ? parseFloat(String(d.weight_lb ?? d.weight))
                        : Number(d.weight_lb ?? d.weight),
                  }));
                const ma = sorted.map((_, idx) => {
                  const start = Math.max(0, idx - 6);
                  const window = sorted.slice(start, idx + 1);
                  const avg =
                    window.reduce((sum, v) => sum + (v.weight ?? 0), 0) /
                    window.length;
                  return Number(avg.toFixed(2));
                });
                if (ma.length === 0) return null;
                const lastIdx = ma.length - 1;
                const compareIdx = Math.max(0, lastIdx - 7);
                const lastMA = ma[lastIdx];
                const compareMA = ma[compareIdx];
                const lastWeight = sorted[lastIdx];

                if (
                  lastMA === undefined ||
                  compareMA === undefined ||
                  !lastWeight
                )
                  return null;

                const weeklyChange = Number((lastMA - compareMA).toFixed(2));
                const actualVsMA =
                  lastWeight.weight < lastMA ? 'below' : 'above';
                return (
                  <p className='text-sm text-muted-foreground'>
                    {`Past week, the smoothed trend ${weeklyChange < 0 ? 'decreased' : weeklyChange > 0 ? 'increased' : 'held steady'} by ${Math.abs(weeklyChange).toFixed(2)} lbs. Latest actual is ${actualVsMA} the trendline.`}
                  </p>
                );
              })()}
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              Not enough data to render moving average yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Effect Comparison */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Medication Effect on Weekly Rate</CardTitle>
          <CardDescription>
            Comparison of natural vs. with-medication projected weekly loss
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {dailyRate != null ? (
            (() => {
              const natural = Math.abs(dailyRate * 7);
              const withMed = Math.abs(
                dailyRate * (1 + medicationMultiplier) * 7
              );
              const medData = [
                { label: 'Natural', value: Number(natural.toFixed(2)) },
                { label: 'With Medication', value: Number(withMed.toFixed(2)) },
              ];
              return (
                <>
                  <div className='h-56 w-full'>
                    <ChartContainer
                      config={{
                        value: {
                          label: 'Weekly Rate (lbs/wk)',
                          color: '#3b82f6',
                        },
                      }}
                      className='size-full'
                    >
                      <BarChart data={medData} width={800} height={224}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                          dataKey='label'
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className='w-[160px]'
                              nameKey='value'
                            />
                          }
                        />
                        <Bar
                          dataKey='value'
                          fill='#3b82f6'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Bars compare your projected weekly loss without medication
                    versus with your current regimen applied. The difference
                    reflects your estimated medication effectiveness.
                  </p>
                  {(() => {
                    if (dailyRate == null) return null;
                    const natural = Math.abs(dailyRate * 7);
                    const withMed = Math.abs(
                      dailyRate * (1 + medicationMultiplier) * 7
                    );
                    const delta = withMed - natural;
                    const pct = natural > 0 ? (delta / natural) * 100 : 0;
                    return (
                      <p className='text-sm text-muted-foreground'>
                        {`With medication, projected weekly loss improves by ${delta.toFixed(2)} lbs (${pct.toFixed(0)}%) versus natural.`}
                      </p>
                    );
                  })()}
                </>
              );
            })()
          ) : (
            <div className='text-sm text-muted-foreground'>
              No trajectory available to compute medication effect.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Impact (scenario comparison) */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Activity Impact Scenarios</CardTitle>
          <CardDescription>
            How weekly rate changes across typical activity levels
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {dailyRate != null ? (
            (() => {
              const ACTIVITY: Record<string, number> = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9,
              };
              const actData = Object.entries(ACTIVITY).map(([k, mult]) => ({
                label: k.replace('_', ' ').replace(/^./, c => c.toUpperCase()),
                value: Number(Math.abs(dailyRate * mult * 7).toFixed(2)),
                key: k,
              }));
              return (
                <>
                  <div className='h-56 w-full'>
                    <ChartContainer
                      config={{
                        value: {
                          label: 'Weekly Rate (lbs/wk)',
                          color: '#10b981',
                        },
                      }}
                      className='size-full'
                    >
                      <BarChart data={actData} width={800} height={224}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                          dataKey='label'
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className='w-[160px]'
                              nameKey='value'
                            />
                          }
                        />
                        <Bar
                          dataKey='value'
                          fill='#10b981'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    These scenarios illustrate how your weekly loss could vary
                    with different activity levels. Your current activity
                    setting is{' '}
                    {activityLevel
                      ? activityLevel.replace('_', ' ')
                      : 'moderate'}{' '}
                    with a multiplier of{' '}
                    {activityMultiplier != null
                      ? activityMultiplier.toFixed(2)
                      : '1.00'}
                    x.
                  </p>
                  {(() => {
                    if (dailyRate == null) return null;
                    const ACTIVITY: Record<string, number> = {
                      sedentary: 1.2,
                      light: 1.375,
                      moderate: 1.55,
                      active: 1.725,
                      very_active: 1.9,
                    };
                    const currentKey = activityLevel ?? 'moderate';
                    const currentWeekly = Math.abs(
                      dailyRate * (ACTIVITY[currentKey] ?? 1.0) * 7
                    );
                    const entries = Object.entries(ACTIVITY).map(([k, m]) => ({
                      k,
                      v: Math.abs(dailyRate * m * 7),
                    }));
                    const best = entries.reduce(
                      (a, b) => (a && b.v > a.v ? b : a),
                      entries[0]
                    );
                    if (!best) return null;
                    const delta = best.v - currentWeekly;
                    if (delta <= 0.01) {
                      return (
                        <p className='text-sm text-muted-foreground'>
                          Your current activity setting is already near the
                          best-case weekly rate.
                        </p>
                      );
                    }
                    const label = best.k?.replace('_', ' ') || 'unknown';
                    return (
                      <p className='text-sm text-muted-foreground'>{`Shifting to ${label} could increase weekly loss by ~${delta.toFixed(2)} lbs.`}</p>
                    );
                  })()}
                </>
              );
            })()
          ) : (
            <div className='text-sm text-muted-foreground'>
              No trajectory available to estimate activity impact.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Change Trend */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Weekly Change Trend</CardTitle>
          <CardDescription>
            Week-over-week weight change (negative is loss)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {enhancedMetrics?.weeklyChanges &&
          enhancedMetrics.weeklyChanges.length > 0 ? (
            (() => {
              const wc = enhancedMetrics.weeklyChanges.map(
                (c: number, i: number) => ({
                  week: `W${i + 1}`,
                  change: Number(c.toFixed(2)),
                })
              );
              return (
                <>
                  <div className='h-56 w-full'>
                    <ChartContainer
                      config={{
                        change: {
                          label: 'Weekly Change (lbs)',
                          color: '#f59e0b',
                        },
                      }}
                      className='size-full'
                    >
                      <BarChart data={wc} width={800} height={224}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis
                          dataKey='week'
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className='w-[160px]'
                              nameKey='change'
                            />
                          }
                        />
                        <Bar
                          dataKey='change'
                          fill='#f59e0b'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Each bar shows the change from one week to the next. Taller
                    negative bars indicate larger weekly losses; positive bars
                    indicate weeks with gains or rebounds.
                  </p>
                  {(() => {
                    const changes = enhancedMetrics?.weeklyChanges ?? [];
                    if (!changes.length) return null;
                    const avg =
                      changes.reduce((s, v) => s + v, 0) / changes.length;
                    const best = Math.min(...changes); // most negative = biggest loss
                    const worst = Math.max(...changes);
                    return (
                      <p className='text-sm text-muted-foreground'>
                        {`Avg weekly change: ${avg.toFixed(2)} lbs. Best week: ${best.toFixed(2)} lbs. Toughest week: ${worst.toFixed(2)} lbs.`}
                      </p>
                    );
                  })()}
                </>
              );
            })()
          ) : (
            <div className='text-sm text-muted-foreground'>
              Not enough data to compute weekly change trend.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projection Analysis & Insights (moved from Projections tab) */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Projection Analysis & Insights</CardTitle>
          <CardDescription>
            Detailed breakdown of projections, medication impact, and
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 gap-4 text-center md:grid-cols-4'>
            <div className='rounded-lg bg-muted p-4'>
              <div className='text-2xl font-bold text-text-foreground'>
                {hasWeights ? totalLostLbs.toFixed(1) : '0.0'} lbs
              </div>
              <div className='text-sm text-muted-foreground'>Total Lost</div>
              {hasWeights ? (
                <div className='mt-1 text-xs text-strategy-gold'>
                  {totalLostPct.toFixed(1)}% of starting weight
                </div>
              ) : null}
            </div>
            <div className='rounded-lg bg-muted p-4'>
              <div className='text-2xl font-bold text-red-600'>
                {weeksToTargetNoMed} weeks
              </div>
              <div className='text-sm text-muted-foreground'>
                To Target (Natural)
              </div>
            </div>
            <div className='rounded-lg bg-muted p-4'>
              <div className='text-2xl font-bold text-strategy-emerald'>
                {weeksToTargetWithMed} weeks
              </div>
              <div className='text-sm text-muted-foreground'>
                To Target (Medication)
              </div>
            </div>
            <div className='rounded-lg bg-muted p-4'>
              <div className='text-2xl font-bold text-strategy-gold'>
                {medicationBenefit} weeks
              </div>
              <div className='text-sm text-muted-foreground'>Time Saved</div>
            </div>
          </div>

          <Separator />

          {/* Detailed Analysis */}
          <div className='space-y-6'>
            <div>
              <h4 className='mb-3 text-lg font-semibold'>
                Weight Loss Journey Analysis
              </h4>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <p>
                    <strong>Starting Weight:</strong>{' '}
                    {startingWeight != null ? startingWeight.toFixed(1) : 'N/A'}{' '}
                    lbs
                  </p>
                  <p>
                    <strong>Current Weight:</strong>{' '}
                    {currentWeight != null ? currentWeight.toFixed(1) : 'N/A'}{' '}
                    lbs
                  </p>
                  <p>
                    <strong>Target Weight:</strong>{' '}
                    {targetWeight != null ? targetWeight.toFixed(1) : 'Not set'}{' '}
                    lbs
                  </p>
                </div>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <p>
                    <strong>Current Trajectory:</strong>{' '}
                    {dailyRate != null
                      ? Math.abs(dailyRate * 7).toFixed(2)
                      : 'N/A'}{' '}
                    lbs/week
                  </p>
                  <p>
                    <strong>Data Points:</strong> {weightData?.length ?? 0}{' '}
                    weight measurements
                  </p>
                  <p>
                    <strong>Confidence Level:</strong>{' '}
                    {confidence != null
                      ? `${(confidence * 100).toFixed(0)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-lg font-semibold'>
                Medication Impact Analysis
              </h4>
              <div className='space-y-3 text-sm text-muted-foreground'>
                {medicationMultiplier > 0 ? (
                  <>
                    <p>
                      <strong>Active Medications:</strong>{' '}
                      {activeMedicationNames}
                    </p>
                    <p>
                      <strong>Effectiveness Boost:</strong>{' '}
                      {(medicationMultiplier * 100).toFixed(0)}%
                    </p>
                    <p>
                      <strong>Enhanced Weekly Rate:</strong>{' '}
                      {dailyRate != null
                        ? Math.abs(
                            dailyRate * (1 + medicationMultiplier) * 7
                          ).toFixed(2)
                        : 'N/A'}{' '}
                      lbs/week
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>No Active Medications:</strong> Natural trajectory
                    only.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-lg font-semibold'>
                Activity Level Impact
              </h4>
              <div className='space-y-3 text-sm text-muted-foreground'>
                <p>
                  <strong>Activity Level:</strong>{' '}
                  {activityLevel
                    ? activityLevel.replace('_', ' ').toUpperCase()
                    : 'MODERATE'}
                </p>
                <p>
                  <strong>Activity Multiplier:</strong>{' '}
                  {activityMultiplier != null
                    ? activityMultiplier.toFixed(2)
                    : '1.00'}
                  x
                </p>
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-lg font-semibold'>
                Statistical Insights
              </h4>
              <div className='grid grid-cols-2 gap-4 text-center md:grid-cols-4'>
                <div className='rounded bg-muted p-3'>
                  <div className='text-lg font-semibold'>
                    {stdDev != null ? stdDev.toFixed(2) : 'N/A'}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Std Dev (lbs)
                  </div>
                </div>
                <div className='rounded bg-muted p-3'>
                  <div className='text-lg font-semibold'>
                    {cv != null ? cv.toFixed(1) : 'N/A'}%
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Variability
                  </div>
                </div>
                <div className='rounded bg-muted p-3'>
                  <div className='text-lg font-semibold'>
                    {consistencyPct != null
                      ? String(Math.round(consistencyPct))
                      : 'N/A'}
                    %
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Consistency
                  </div>
                </div>
                <div className='rounded bg-muted p-3'>
                  <div className='text-lg font-semibold'>{dataPointsCount}</div>
                  <div className='text-xs text-muted-foreground'>
                    Data Points
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-lg font-semibold'>Recommendations</h4>
              <div className='space-y-2 text-sm text-muted-foreground'>
                {medicationBenefit > 0 ? (
                  <p>
                    <strong>Medication Benefit:</strong> Your regimen could save
                    ~{medicationBenefit} weeks to reach{' '}
                    {targetWeight != null ? targetWeight.toFixed(1) : 'target'}{' '}
                    lbs.
                  </p>
                ) : (
                  <p>
                    <strong>Natural Progress:</strong> Steady progress observed.
                    Consider medical options if appropriate.
                  </p>
                )}
                <p>
                  <strong>Consistency:</strong> Maintain current weekly rate{' '}
                  {dailyRate != null
                    ? Math.abs(dailyRate * 7).toFixed(2)
                    : 'N/A'}{' '}
                  lbs/week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
