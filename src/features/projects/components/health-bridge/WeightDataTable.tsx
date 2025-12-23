/**
 * WeightDataTable Component
 *
 * A comprehensive weight data visualization component with chart and table views.
 * Includes filtering, trendline, and moving average calculations.
 * Extracted from HealthBridgeEnhanced.tsx for better modularity.
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart3, TableIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HealthBridgeEnhancedAPI } from '@/api/healthBridgeEnhanced';
import { useAuth } from '@/hooks/useAuth';

// Helper function for source display names
function getSourceDisplayName(source: string): string {
  const sourceMap: Record<string, string> = {
    manual: 'Manual Entry',
    apple_health: 'Apple Health',
    google_fit: 'Google Fit',
    fitbit: 'Fitbit',
    withings: 'Withings',
    api: 'API Import',
  };
  return sourceMap[source] || source;
}

export function WeightDataTable() {
  const { isAuthenticated, user } = useAuth();

  // Use default userId for non-authenticated users to get dummy data
  const userId = user?.email ?? user?.sub ?? 'dev-user-123';

  // Always call hooks, but conditionally use their data
  const measurementsQuery = useQuery({
    queryKey: ['weight-measurements', userId],
    queryFn: () =>
      HealthBridgeEnhancedAPI.getWeightMeasurements({ limit: 50, userId }),
    enabled: true, // Always enabled to get dummy data when not authenticated
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const measurements = measurementsQuery.data ?? [];
  const isLoading = measurementsQuery.isLoading;
  const error = measurementsQuery.error;

  // State for chart filtering and sorting
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90' | 'all'>(
    isAuthenticated ? '30' : 'all'
  );
  const [chartSort, setChartSort] = useState<'asc' | 'desc'>('asc');
  const [showTrendline, setShowTrendline] = useState(true);
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(3);

  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center'>Loading weight data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !measurements) {
    return (
      <Card className='w-full'>
        <CardContent className='pt-6'>
          <div className='text-center text-strategy-rose'>
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
    .filter(measurement => {
      if (chartPeriod === 'all') return true;
      const days = parseInt(chartPeriod);
      const measurementDate = new Date(measurement.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return measurementDate >= cutoffDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return chartSort === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    })
    .map(measurement => ({
      date: format(new Date(measurement.timestamp), 'MMM dd'),
      weight: measurement.weight,
      timestamp: measurement.timestamp,
    }));

  // Simplify chart data - just use the basic weight data for now
  const simpleChartData = chartData.map((item, index) => ({
    name: item.date,
    weight: item.weight,
    index: index,
  }));

  // Calculate moving average for the selected period
  const calculateMovingAverage = (
    data: typeof simpleChartData,
    period: number
  ) => {
    if (data.length === 0) return [];

    const movingAverages = [];
    for (let i = 0; i < data.length; i++) {
      // For early points, use all available data up to current index + 1
      const startIndex = Math.max(0, i - period + 1);
      const endIndex = i + 1;
      const dataSlice = data.slice(startIndex, endIndex);
      const sum = dataSlice.reduce((acc, item) => acc + item.weight, 0);
      const average = sum / dataSlice.length;

      const currentItem = data[i];
      if (currentItem) {
        movingAverages.push({
          name: currentItem.name,
          avgWeight: average,
          index: currentItem.index,
        });
      }
    }
    return movingAverages;
  };

  // Calculate trend line using linear regression
  const calculateTrendLine = (data: typeof simpleChartData) => {
    if (data.length < 2) return [];

    const n = data.length;
    const sumX = data.reduce((acc, _, index) => acc + index, 0);
    const sumY = data.reduce((acc, item) => acc + item.weight, 0);
    const sumXY = data.reduce(
      (acc, item, index) => acc + index * item.weight,
      0
    );
    const sumXX = data.reduce((acc, _, index) => acc + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((item, index) => ({
      name: item.name,
      trendWeight: slope * index + intercept,
      index: index,
    }));
  };

  // Generate trend line and moving average data
  const trendLineData = showTrendline
    ? calculateTrendLine(simpleChartData)
    : [];
  const movingAverageData = showMovingAverage
    ? calculateMovingAverage(simpleChartData, movingAveragePeriod)
    : [];

  // Combine all data into a single dataset to prevent chart shrinking
  const combinedChartData = simpleChartData.map((item, index) => {
    const trendItem = trendLineData.find(t => t.index === index);
    const avgItem = movingAverageData.find(a => a.index === index);

    return {
      ...item,
      trendWeight: trendItem?.trendWeight ?? null,
      avgWeight: avgItem?.avgWeight ?? null,
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
    <div className='space-y-6'>
      {/* Weight Loss Chart */}
      <Card className='w-full'>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <TrendingDown className='size-5' />
                Weight Loss Progress Chart
              </CardTitle>
              <CardDescription className='mt-2'>
                Visualize your weight loss journey with interactive filtering
                and analysis
              </CardDescription>
            </div>

            {/* Chart Controls */}
            <div className='flex flex-wrap gap-2'>
              {/* Period Filter */}
              <Select
                value={chartPeriod}
                onValueChange={(value: '7' | '30' | '90' | 'all') =>
                  setChartPeriod(value)
                }
              >
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7'>7 days</SelectItem>
                  <SelectItem value='30'>30 days</SelectItem>
                  <SelectItem value='90'>90 days</SelectItem>
                  <SelectItem value='all'>All time</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Direction */}
              <Select
                value={chartSort}
                onValueChange={(value: 'asc' | 'desc') => setChartSort(value)}
              >
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='asc'>Oldest</SelectItem>
                  <SelectItem value='desc'>Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* Chart Options */}
              <div className='flex items-center gap-2'>
                <Button
                  variant={showTrendline ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setShowTrendline(!showTrendline)}
                >
                  <TrendingUp className='mr-1 size-4' />
                  Trend
                </Button>
                <Button
                  variant={showMovingAverage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setShowMovingAverage(!showMovingAverage)}
                >
                  <BarChart3 className='mr-1 size-4' />
                  Avg
                </Button>
                {showMovingAverage && (
                  <Select
                    value={movingAveragePeriod.toString()}
                    onValueChange={value =>
                      setMovingAveragePeriod(parseInt(value))
                    }
                  >
                    <SelectTrigger className='w-20'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='3'>3-day</SelectItem>
                      <SelectItem value='5'>5-day</SelectItem>
                      <SelectItem value='7'>7-day</SelectItem>
                      <SelectItem value='10'>10-day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart Legend */}
          <div className='mb-4 flex flex-wrap justify-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-cyan-600'></div>
              <span className='text-sm text-muted-foreground'>Weight Data</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-red-500'></div>
              <span className='text-sm text-muted-foreground'>Trend Line</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='size-4 rounded-full bg-surface-elevated/30'></div>
              <span className='text-sm text-muted-foreground'>
                {showMovingAverage
                  ? `${movingAveragePeriod}-day Moving Average`
                  : 'Moving Average'}
              </span>
            </div>
          </div>

          <div className='h-80 w-full overflow-hidden'>
            {simpleChartData.length > 0 ? (
              <div className='flex size-full items-center justify-center'>
                <ChartContainer
                  config={{
                    weight: {
                      label: 'Weight (lbs)',
                      color: '#0891b2',
                    },
                    trendWeight: {
                      label: 'Trend Line',
                      color: '#ef4444',
                    },
                    avgWeight: {
                      label: `${movingAveragePeriod}-day Moving Average`,
                      color: '#10b981',
                    },
                  }}
                  className='size-full'
                >
                  <LineChart data={combinedChartData} width={800} height={320}>
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
                      domain={yAxisDomain}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className='w-[200px]'
                          nameKey='weight'
                        />
                      }
                    />
                    <Line
                      type='monotone'
                      dataKey='weight'
                      stroke='#0891b2'
                      strokeWidth={3}
                      dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#0891b2', strokeWidth: 2 }}
                    />

                    {/* Trend Line */}
                    {showTrendline && (
                      <Line
                        type='monotone'
                        dataKey='trendWeight'
                        stroke='#ef4444'
                        strokeWidth={2}
                        strokeDasharray='5 5'
                        dot={false}
                        name='Trend Line'
                      />
                    )}

                    {/* Moving Average */}
                    {showMovingAverage && (
                      <Line
                        type='monotone'
                        dataKey='avgWeight'
                        stroke='#10b981'
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                        name={`${movingAveragePeriod}-day Moving Average`}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </div>
            ) : (
              <div className='flex size-full items-center justify-center text-muted-foreground'>
                No data available for the selected period
              </div>
            )}
          </div>

          {/* Chart Summary */}
          <div className='mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-muted p-3 text-center'>
              <div className='text-lg font-semibold'>
                {displayData.length > 0 ? (displayData[0]?.weight ?? 0) : 0} lbs
              </div>
              <div className='text-muted-foreground'>Current Weight</div>
            </div>
            <div className='rounded-lg bg-muted p-3 text-center'>
              <div className='text-lg font-semibold'>
                {displayData.length > 1
                  ? (
                      (displayData[0]?.weight ?? 0) -
                      (displayData[displayData.length - 1]?.weight ?? 0)
                    ).toFixed(1)
                  : 0}{' '}
                lbs
              </div>
              <div className='text-muted-foreground'>Weight Change</div>
            </div>
            <div className='rounded-lg bg-muted p-3 text-center'>
              <div className='text-lg font-semibold'>
                {displayData.length > 1
                  ? (
                      ((displayData[0]?.weight ?? 0) -
                        (displayData[displayData.length - 1]?.weight ?? 0)) /
                      (displayData.length - 1)
                    ).toFixed(2)
                  : 0}{' '}
                lbs/day
              </div>
              <div className='text-muted-foreground'>Average Rate</div>
            </div>
            <div className='rounded-lg bg-muted p-3 text-center'>
              <div className='text-lg font-semibold'>
                {simpleChartData.length > 0
                  ? (
                      simpleChartData.reduce(
                        (sum, item) => sum + item.weight,
                        0
                      ) / simpleChartData.length
                    ).toFixed(1)
                  : 0}{' '}
                lbs
              </div>
              <div className='text-muted-foreground'>Average Weight</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Data Table */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TableIcon className='size-5' />
            Weight Measurements Data
          </CardTitle>
          <CardDescription>
            Detailed view of all your weight measurements for trend analysis
            (pounds)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
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
                {displayData.map(measurement => (
                  <TableRow key={measurement.id}>
                    <TableCell className='font-medium'>
                      {format(new Date(measurement.timestamp), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{measurement.weight_lb}</TableCell>
                    <TableCell>{measurement.weight_kg}</TableCell>
                    <TableCell>
                      {getSourceDisplayName(measurement.source)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='mt-4 text-center text-sm text-muted-foreground'>
            Showing {displayData.length} measurements • Last updated:{' '}
            {displayData.length > 0
              ? format(new Date(displayData[0]?.timestamp ?? ''), "PPP 'at' p")
              : 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
