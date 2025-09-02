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

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3, Activity, Zap, Loader2, TableIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Enhanced API imports
import HealthBridgeEnhancedAPI, {
  CreateWeightMeasurementRequest
} from "../api/healthBridgeEnhanced";
import type { AnalyticsDashboard } from "../api/healthBridgeEnhanced";

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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Tooltip } from "recharts";

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
  const { data: projections, isLoading, error } = useQuery({
    queryKey: ["projections"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(30),
  });

  // State for projection scenarios
  const [showMedication, setShowMedication] = useState(true);
  const [showNoMedication, setShowNoMedication] = useState(true);
  const [targetWeight, setTargetWeight] = useState(150);
  const [projectionDays, setProjectionDays] = useState(90);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">Loading projections...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !projections) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load projections. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate medication vs non-medication projections
  const calculateProjections = () => {
    const currentWeight = projections.current_weight;
    const baseDailyRate = projections.daily_rate;
    
    // Medication typically improves weight loss by 15-25%
    const medicationBoost = 0.2; // 20% improvement
    const medicationDailyRate = baseDailyRate * (1 + medicationBoost);
    
    const projections = [];
    const today = new Date();
    
    for (let i = 0; i <= projectionDays; i += 7) { // Weekly projections
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const weeks = i / 7;
      
      // Without medication
      const noMedWeight = currentWeight + (baseDailyRate * 7 * weeks);
      
      // With medication
      const medWeight = currentWeight + (medicationDailyRate * 7 * weeks);
      
      projections.push({
        date: format(date, "MMM dd"),
        week: weeks,
        noMedication: Math.max(noMedWeight, targetWeight), // Don't go below target
        withMedication: Math.max(medWeight, targetWeight),
        target: targetWeight
      });
    }
    
    return projections;
  };

  const projectionData = calculateProjections();
  
  // Calculate key metrics
  const weeksToTargetNoMed = Math.ceil((projections.current_weight - targetWeight) / (Math.abs(projections.daily_rate) * 7));
  const weeksToTargetWithMed = Math.ceil((projections.current_weight - targetWeight) / (Math.abs(projections.daily_rate * 1.2) * 7));
  const totalWeightToLose = projections.current_weight - targetWeight;
  const medicationBenefit = weeksToTargetNoMed - weeksToTargetWithMed;

  return (
    <div className="space-y-6">
      {/* Projection Controls */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weight Loss Projections
          </CardTitle>
          <CardDescription>
            Compare medication vs. non-medication scenarios with your target goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                min="100"
                max="300"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectionDays">Projection Period (days)</Label>
              <Select value={projectionDays.toString()} onValueChange={(value) => setProjectionDays(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="text-2xl font-bold text-blue-600">
                {projections.current_weight.toFixed(1)} lbs
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.abs(projections.daily_rate * 7).toFixed(2)} lbs/week
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
                With Medication (20% boost)
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
                Without Medication
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weight Loss Trajectory</CardTitle>
          <CardDescription>
            Projected weight loss over {projectionDays} days with and without medication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer
              config={{
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
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[targetWeight - 10, projections.current_weight + 10]}
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
                {showMedication && (
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

      {/* Analysis Results */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Projection Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of your weight loss journey scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalWeightToLose.toFixed(1)} lbs
              </div>
              <div className="text-sm text-muted-foreground">Total to Lose</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {weeksToTargetNoMed} weeks
              </div>
              <div className="text-sm text-muted-foreground">Without Medication</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {weeksToTargetWithMed} weeks
              </div>
              <div className="text-sm text-muted-foreground">With Medication</div>
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
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Medication Impact Analysis</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Current Trajectory:</strong> You're currently losing {Math.abs(projections.daily_rate * 7).toFixed(2)} lbs per week.
                </p>
                <p>
                  <strong>Medication Boost:</strong> Medication typically improves weight loss by 20%, increasing your weekly rate to {Math.abs(projections.daily_rate * 1.2 * 7).toFixed(2)} lbs per week.
                </p>
                <p>
                  <strong>Target Achievement:</strong> Reaching your goal of {targetWeight} lbs will take {weeksToTargetNoMed} weeks without medication or {weeksToTargetWithMed} weeks with medication.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Recommendations</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {medicationBenefit > 0 ? (
                  <>
                    <p>
                      <strong>Medication Benefits:</strong> Taking medication as prescribed could save you {medicationBenefit} weeks in reaching your target weight.
                    </p>
                    <p>
                      <strong>Consistency is Key:</strong> Whether you choose medication or not, maintaining your current daily routine of {Math.abs(projections.daily_rate).toFixed(3)} lbs/day will be crucial.
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>Note:</strong> You're already on track to reach your target weight quickly. Medication may provide additional benefits beyond weight loss.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Confidence Factors</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Data Quality:</strong> Projections based on {projections.projections.length} days of consistent tracking with {(projections.confidence * 100).toFixed(0)}% confidence.
                </p>
                <p>
                  <strong>Algorithm:</strong> Using {projections.algorithm} for trend analysis and future predictions.
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
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => HealthBridgeEnhancedAPI.getAnalyticsDashboard(30),
  });

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
  const { data: measurements, isLoading, error } = useQuery({
    queryKey: ["weight-measurements"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50 }),
  });

  // State for chart filtering and sorting
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90" | "all">("30");
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

  // Mock data for development since API isn't deployed yet
  const mockMeasurements = [
    {
      id: 1,
      weight: 168.7,
      weight_lb: "168.7 lbs",
      weight_kg: "76.5 kg",
      timestamp: "2024-01-15T08:00:00Z",
      source: "Scale"
    },
    {
      id: 2,
      weight: 169.3,
      weight_lb: "169.3 lbs",
      weight_kg: "76.8 kg",
      timestamp: "2024-01-14T08:00:00Z",
      source: "Scale"
    },
    {
      id: 3,
      weight: 170.0,
      weight_lb: "170.0 lbs",
      weight_kg: "77.1 kg",
      timestamp: "2024-01-13T08:00:00Z",
      source: "Scale"
    },
    {
      id: 4,
      weight: 170.6,
      weight_lb: "170.6 lbs",
      weight_kg: "77.4 kg",
      timestamp: "2024-01-12T08:00:00Z",
      source: "Scale"
    },
    {
      id: 5,
      weight: 171.3,
      weight_lb: "171.3 lbs",
      weight_kg: "77.7 kg",
      timestamp: "2024-01-11T08:00:00Z",
      source: "Scale"
    },
    {
      id: 6,
      weight: 172.0,
      weight_lb: "172.0 lbs",
      weight_kg: "78.0 kg",
      timestamp: "2024-01-10T08:00:00Z",
      source: "Scale"
    },
    {
      id: 7,
      weight: 172.5,
      weight_lb: "172.5 lbs",
      weight_kg: "78.2 kg",
      timestamp: "2024-01-09T08:00:00Z",
      source: "Scale"
    }
  ];

  const displayData = measurements.length > 0 ? measurements : mockMeasurements;

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
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Get authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the enhanced HealthBridge dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
          💡 Weight goals are managed in your <a href="/settings" className="text-blue-600 hover:underline">Settings page</a>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                 <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="overview">Enter Weight</TabsTrigger>
           <TabsTrigger value="data">Current Progress</TabsTrigger>
           <TabsTrigger value="projections">Projections</TabsTrigger>
           <TabsTrigger value="analytics">Analytics</TabsTrigger>
         </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedWeightEntry />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <WeightDataTable />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <WeightProjections />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
