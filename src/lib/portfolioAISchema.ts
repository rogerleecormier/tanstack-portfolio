import { z } from 'zod';

// AI Portfolio Analysis Schema
export const PortfolioAnalysisSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(300),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).min(1).max(10),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  expertise: z.array(z.string()).min(1).max(8),
  complexity: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .optional(),
  estimatedDuration: z.string().optional(),
  keyTechnologies: z.array(z.string()).min(1).max(6),
  businessValue: z.string().min(10).max(200),
  confidence: z.number().min(0).max(1).optional(),
  suggestedIcon: z.string().optional(),
  colorScheme: z.string().optional(),
  relatedServices: z.array(z.string()).max(5).optional(),
  fallback: z.boolean().optional().default(false),
});

// Type inference from schema
export type PortfolioAnalysisResult = z.infer<typeof PortfolioAnalysisSchema>;

// Validation function with error handling
export function validatePortfolioAnalysis(
  data: unknown
): PortfolioAnalysisResult {
  try {
    return PortfolioAnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Portfolio AI analysis validation failed:', error.errors);
      throw new Error(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}

// Safe validation that returns fallback data on failure
export function safeValidatePortfolioAnalysis(
  data: unknown
): PortfolioAnalysisResult {
  try {
    const result = validatePortfolioAnalysis(data);
    return result;
  } catch (error) {
    console.warn(
      'Portfolio AI analysis validation failed, using fallback:',
      error
    );

    // Enhanced fallback with better defaults
    const fallback: PortfolioAnalysisResult = {
      title: 'Portfolio Item',
      description: 'Professional expertise in this specialized area.',
      category: 'Professional Services',
      tags: ['consulting', 'expertise'], // Ensure at least 2 tags
      expertise: ['professional services', 'consulting'], // Ensure at least 2 expertise areas
      keyTechnologies: ['industry best practices'], // Ensure at least 1 technology
      businessValue: 'Professional expertise in this specialized area.',
      suggestedIcon: 'Briefcase',
      colorScheme: 'bg-teal-100 text-teal-800',
      fallback: true,
    };

    // If we have partial data, try to use it
    if (data && typeof data === 'object') {
      const partial = data as Record<string, unknown>;

      if (partial.title && typeof partial.title === 'string')
        fallback.title = partial.title;
      if (partial.description && typeof partial.description === 'string')
        fallback.description = partial.description;
      if (partial.category && typeof partial.category === 'string')
        fallback.category = partial.category;
      if (
        partial.tags &&
        Array.isArray(partial.tags) &&
        partial.tags.length > 0
      ) {
        fallback.tags = partial.tags.filter(tag => typeof tag === 'string');
      }
      if (
        partial.expertise &&
        Array.isArray(partial.expertise) &&
        partial.expertise.length > 0
      ) {
        fallback.expertise = partial.expertise.filter(
          exp => typeof exp === 'string'
        );
      }
      if (
        partial.keyTechnologies &&
        Array.isArray(partial.keyTechnologies) &&
        partial.keyTechnologies.length > 0
      ) {
        fallback.keyTechnologies = partial.keyTechnologies.filter(
          tech => typeof tech === 'string'
        );
      }
      if (partial.businessValue && typeof partial.businessValue === 'string')
        fallback.businessValue = partial.businessValue;
      if (partial.confidence && typeof partial.confidence === 'number')
        fallback.confidence = partial.confidence;
    }

    return fallback;
  }
}
