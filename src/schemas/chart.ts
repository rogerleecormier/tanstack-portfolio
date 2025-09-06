import { z } from 'zod';

export const chartSchema = z.object({
  type: z.enum(['bar', 'line', 'area']),
  data: z.array(z.record(z.any())),
  xKey: z.string(),
  yKeys: z.array(z.string()),
});

export type ChartData = z.infer<typeof chartSchema>;
