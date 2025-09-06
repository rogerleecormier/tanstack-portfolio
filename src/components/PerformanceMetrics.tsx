/**
 * Performance Metrics Component
 * Displays compilation performance metrics and targets
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Target, TrendingUp } from 'lucide-react';
import { getCompilerWorkerManager } from '../workers/compiler-worker-manager';

interface CompileMetrics {
  p50: number;
  p95: number;
  count: number;
  average: number;
}

interface PerformanceMetricsProps {
  className?: string;
}

export default function PerformanceMetrics({
  className,
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<CompileMetrics>({
    p50: 0,
    p95: 0,
    count: 0,
    average: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  const workerManager = getCompilerWorkerManager();

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = workerManager.getMetrics();
      setMetrics(currentMetrics);
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [workerManager]);

  const targets = workerManager.checkPerformanceTargets();

  const formatTime = (ms: number) => {
    if (ms < 1) return '<1ms';
    if (ms < 10) return `${ms.toFixed(1)}ms`;
    return `${Math.round(ms)}ms`;
  };

  const getPerformanceColor = (value: number, target: number) => {
    if (value <= target) return 'text-green-600';
    if (value <= target * 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (meetsTarget: boolean) => {
    return meetsTarget ? 'default' : 'destructive';
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={className}
      >
        <Activity className="h-4 w-4 mr-2" />
        Show Metrics
      </Button>
    );
  }

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Metrics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">P50</span>
              <Badge variant={getBadgeVariant(targets.p50Target)}>
                {formatTime(metrics.p50)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Target:{' '}
              <span className={getPerformanceColor(metrics.p50, 200)}>
                &lt;200ms
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">P95</span>
              <Badge variant={getBadgeVariant(targets.p95Target)}>
                {formatTime(metrics.p95)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Target:{' '}
              <span className={getPerformanceColor(metrics.p95, 500)}>
                &lt;500ms
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average</span>
            <span className="text-xs font-mono">
              {formatTime(metrics.average)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Compilations</span>
            <span className="text-xs font-mono">{metrics.count}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span
                className={
                  targets.p50Target && targets.p95Target
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }
              >
                {targets.p50Target && targets.p95Target
                  ? 'All targets met'
                  : 'Some targets missed'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
