/**
 * Shared utility functions for projects feature.
 */

/**
 * Formats a date string into a human-readable relative time.
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

/**
 * Calculates a simple linear regression trend line.
 */
export function calculateTrendLine(
  data: { value: number }[]
): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach((point, i) => {
    sumX += i;
    sumY += point.value;
    sumXY += i * point.value;
    sumXX += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculates a moving average for a given data set.
 */
export function calculateMovingAverage(
  data: { value: number }[],
  period: number
): number[] {
  if (data.length < period) return [];

  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const point = data[i - j];
      if (point) {
        sum += point.value;
      }
    }
    result.push(sum / period);
  }
  return result;
}
