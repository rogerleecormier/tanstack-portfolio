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
import { CalendarIcon, TrendingUp, BarChart3, Activity, Zap, Loader2, TableIcon } from "lucide-react";
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
 * Weight projections component with confidence intervals (pounds only)
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
          Based on your current trajectory with confidence intervals (pounds)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {projections.current_weight.toFixed(1)} lbs
            </div>
            <div className="text-sm text-muted-foreground">Current Weight</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.abs(projections.daily_rate * 7).toFixed(2)} lbs/week
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

        <div className="h-64 w-full">
          <ChartContainer
            config={{
              projected: {
                label: "Projected Weight (lbs)",
                color: "#3b82f6"
              }
            }}
            className="h-full w-full"
          >
            <LineChart data={chartData} width={400} height={250}>
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
                domain={['dataMin - 5', 'dataMax + 5']}
              />
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
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
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
 * Weight data table component with shadcn table (pounds only)
 */
function WeightDataTable() {
  const { data: measurements, isLoading, error } = useQuery({
    queryKey: ["weight-measurements"],
    queryFn: () => HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50 }),
  });

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
    }
  ];

  const displayData = measurements.length > 0 ? measurements : mockMeasurements;

  return (
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedWeightEntry />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <WeightProjections />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <WeightDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
