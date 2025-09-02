/**
 * @fileoverview Enhanced HealthBridge Weight Analysis Dashboard
 * @description Advanced weight loss tracking with projections, goals, and comprehensive analytics
 * @author Roger Lee Cormier
 * @version 2.0.0
 * @lastUpdated 2024
 * 
 * @features
 * - Weight loss projections with confidence intervals
 * - Goal setting and progress tracking
 * - Advanced trend analysis and analytics
 * - Enhanced data visualization with shadcn charts
 * - Comprehensive health metrics tracking
 * - Mobile-responsive design with modern UI
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
 * - fitness goals
 * - weight tracking
 * - health metrics
 * - fitness dashboard
 * - weight loss trends
 * - health data visualization
 * 
 * @searchTags
 * ["health", "fitness", "analytics", "weight-loss", "projections", "goals", "tracking", "dashboard", "metrics"]
 * 
 * @searchSection
 * "Health Analysis"
 * 
 * @searchDescription
 * "Advanced weight loss tracking dashboard with projections, goal setting, and comprehensive health analytics. Features weight loss projections, trend analysis, and goal progress tracking."
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp, BarChart3, Goal, Activity, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Enhanced API imports
import HealthBridgeEnhancedAPI, {
  GoalProgress,
  CreateWeightMeasurementRequest,
  SetGoalRequest
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

// shadcn charts
import {
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

// const PAGE_SIZE = 10;

/**
 * Enhanced weight entry component with additional health metrics
 */
function EnhancedWeightEntry() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [waterPercentage, setWaterPercentage] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: CreateWeightMeasurementRequest) => {
      return await HealthBridgeEnhancedAPI.createWeightMeasurement(data);
    },
    onSuccess: () => {
      setSuccess(true);
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      setWaterPercentage("");
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
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      muscleMass: muscleMass ? Number(muscleMass) : undefined,
      waterPercentage: waterPercentage ? Number(waterPercentage) : undefined,
    };

    mutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Add Weight & Health Metrics
        </CardTitle>
        <CardDescription>
          Track your weight along with body composition and other health metrics
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="Optional"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                placeholder="Optional"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterPercentage">Water %</Label>
              <Input
                id="waterPercentage"
                type="number"
                step="0.1"
                placeholder="Optional"
                value={waterPercentage}
                onChange={(e) => setWaterPercentage(e.target.value)}
              />
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
 * Goal setting and progress tracking component
 */
function GoalTracker() {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalData, setGoalData] = useState({
    targetWeight: "",
    startWeight: "",
    startDate: new Date(),
    targetDate: undefined as Date | undefined,
    weeklyGoal: ""
  });

  const { data: goalProgress } = useQuery({
    queryKey: ["goal-progress"],
    queryFn: () => HealthBridgeEnhancedAPI.getGoalProgress(),
  });

  const setGoalMutation = useMutation({
    mutationFn: async (data: SetGoalRequest) => {
      return await HealthBridgeEnhancedAPI.setGoal(data);
    },
    onSuccess: () => {
      setShowGoalForm(false);
      setGoalData({
        targetWeight: "",
        startWeight: "",
        startDate: new Date(),
        targetDate: undefined,
        weeklyGoal: ""
      });
    },
  });

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalData.targetWeight || !goalData.startWeight || !goalData.startDate) {
      return;
    }

    const data: SetGoalRequest = {
      target_weight: Number(goalData.targetWeight),
      start_weight: Number(goalData.startWeight),
      start_date: goalData.startDate.toISOString().split('T')[0],
      target_date: goalData.targetDate?.toISOString().split('T')[0],
      weekly_goal: goalData.weeklyGoal ? Number(goalData.weeklyGoal) : undefined,
    };

    setGoalMutation.mutate(data);
  };

  if ('message' in (goalProgress || {})) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Goal className="h-5 w-5" />
            Weight Loss Goals
          </CardTitle>
          <CardDescription>
            Set and track your weight loss goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowGoalForm(true)} className="w-full">
            Set Your First Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = goalProgress as GoalProgress;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Goal className="h-5 w-5" />
          Goal Progress
        </CardTitle>
        <CardDescription>
          Track your progress toward your weight loss goal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {progress.progress_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {progress.weight_lost.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">Lost</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {progress.weight_remaining.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {progress.days_since_start}
            </div>
            <div className="text-sm text-muted-foreground">Days</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Goal</span>
            <span>{progress.progress_percentage.toFixed(1)}%</span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={progress.is_on_track ? "default" : "destructive"}>
            {progress.is_on_track ? "On Track" : "Behind Schedule"}
          </Badge>
          {progress.weekly_goal && (
            <span className="text-sm text-muted-foreground">
              Weekly goal: {progress.weekly_goal} kg
            </span>
          )}
        </div>

        <Button onClick={() => setShowGoalForm(true)} variant="outline" className="w-full">
          Update Goal
        </Button>
      </CardContent>

      {showGoalForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <form onSubmit={handleSetGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startWeight">Starting Weight (kg)</Label>
                  <Input
                    id="startWeight"
                    type="number"
                    step="0.1"
                    placeholder="Enter starting weight"
                    value={goalData.startWeight}
                    onChange={(e) => setGoalData({ ...goalData, startWeight: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    placeholder="Enter target weight"
                    value={goalData.targetWeight}
                    onChange={(e) => setGoalData({ ...goalData, targetWeight: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(goalData.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={goalData.startDate}
                        onSelect={(date) => date && setGoalData({ ...goalData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Weekly Goal (kg)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    step="0.1"
                    placeholder="Optional"
                    value={goalData.weeklyGoal}
                    onChange={(e) => setGoalData({ ...goalData, weeklyGoal: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={setGoalMutation.isPending} className="flex-1">
                  {setGoalMutation.isPending ? "Setting Goal..." : "Set Goal"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}

/**
 * Weight projections component with confidence intervals
 */
function WeightProjections() {
  const { data: projections, isLoading, error } = useQuery({
    queryKey: ["projections"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightProjections(30),
  });

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

  const chartData = projections.projections.slice(0, 14).map(proj => ({
    date: format(new Date(proj.date), "MMM dd"),
    projected: proj.projected_weight,
    confidence: proj.confidence * 100,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weight Loss Projections
        </CardTitle>
        <CardDescription>
          Based on your current trajectory with confidence intervals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {projections.current_weight.toFixed(1)} kg
            </div>
            <div className="text-sm text-muted-foreground">Current Weight</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.abs(projections.daily_rate * 7).toFixed(2)} kg/week
            </div>
            <div className="text-sm text-muted-foreground">Weekly Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {(projections.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Confidence</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey="projected"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Algorithm: {projections.algorithm} • 
          Projections based on {projections.projections.length} days of data
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Analytics dashboard component
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
          Comprehensive analysis of your weight loss journey
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

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="value"
                  />
                }
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Generated: {format(new Date(analytics.generated_at), "PPP 'at' p")}
        </div>
      </CardContent>
    </Card>
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
      { title: "🎯 Goal Tracking", slug: "goal-tracking" },
      { title: "📈 Projections", slug: "projections" },
      { title: "📊 Analytics", slug: "analytics" }
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
          Advanced weight loss tracking with AI-powered projections, goal setting, and comprehensive analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedWeightEntry />
            <GoalTracker />
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalTracker />
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
