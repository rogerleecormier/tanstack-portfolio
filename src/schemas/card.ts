import { z } from 'zod';

export const cardSchema = z.object({
  title: z.string(),
  body: z.string(),
  variant: z.enum(['info', 'warning', 'success']).optional(),
});

export type CardData = z.infer<typeof cardSchema>;
