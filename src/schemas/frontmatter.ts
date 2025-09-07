import { z } from 'zod';

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  updated: z.string().optional(),
  slug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
  cover: z.object({
    src: z.string(),
    alt: z.string().optional(),
  }).optional(),
  layout: z.enum(['post', 'page', 'doc']).optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
