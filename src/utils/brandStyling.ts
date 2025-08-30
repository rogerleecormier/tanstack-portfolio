/**
 * Brand Styling System
 * 
 * This file provides standardized styling classes and utilities for maintaining
 * consistent teal-blue branding throughout the portfolio site.
 * 
 * Color Palette:
 * - Primary: Teal (#0d9488, teal-600) - Main brand color
 * - Secondary: Blue (#0891b2, blue-600) - Supporting color
 * - Gradients: Teal-to-blue gradients for visual depth
 */

// CSS Custom Properties (defined in index.css)
export const BRAND_COLORS = {
  primary: {
    light: 'hsl(168 100% 97%)', // teal-50
    main: 'hsl(168 100% 35%)',  // teal-600
    dark: 'hsl(168 100% 20%)',  // teal-900
  },
  secondary: {
    light: 'hsl(199 89% 97%)',  // blue-50
    main: 'hsl(199 89% 48%)',   // blue-500
    dark: 'hsl(199 89% 38%)',   // blue-600
  },
  gradients: {
    primary: 'linear-gradient(135deg, hsl(168 100% 97%) 0%, hsl(199 89% 97%) 100%)',
    secondary: 'linear-gradient(135deg, hsl(168 100% 95%) 0%, hsl(199 89% 95%) 100%)',
    accent: 'linear-gradient(135deg, hsl(168 100% 50%) 0%, hsl(199 89% 50%) 100%)',
  }
}

// Standardized CSS Classes (defined in index.css)
export const BRAND_CLASSES = {
  // Background gradients
  gradient: 'brand-gradient',
  gradientSecondary: 'brand-gradient-secondary',
  gradientAccent: 'brand-gradient-accent',
  
  // Cards and containers
  card: 'brand-card',
  
  // Buttons
  buttonPrimary: 'brand-button-primary',
  buttonSecondary: 'brand-button-secondary',
  
  // Text colors
  textPrimary: 'brand-text-primary',
  textSecondary: 'brand-text-secondary',
  
  // Borders
  borderPrimary: 'brand-border-primary',
  borderSecondary: 'brand-border-secondary',
  
  // Backgrounds
  bgPrimary: 'brand-bg-primary',
  bgSecondary: 'brand-bg-secondary',
}

// Content type styling mapping
export const CONTENT_TYPE_STYLES = {
  portfolio: {
    bg: 'brand-bg-primary',
    text: 'text-teal-800',
    border: 'brand-border-primary',
    icon: 'text-teal-600',
  },
  blog: {
    bg: 'brand-bg-secondary',
    text: 'text-blue-800',
    border: 'brand-border-secondary',
    icon: 'text-blue-600',
  },
  project: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
}

// Confidence level styling
export const CONFIDENCE_STYLES = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'brand-bg-secondary text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

// Helper functions
export const getContentTypeStyle = (contentType: 'portfolio' | 'blog' | 'project') => {
  return CONTENT_TYPE_STYLES[contentType] || CONTENT_TYPE_STYLES.portfolio
}

export const getConfidenceStyle = (confidence: number) => {
  if (confidence >= 0.9) return CONFIDENCE_STYLES.high
  if (confidence >= 0.7) return CONFIDENCE_STYLES.medium
  if (confidence >= 0.5) return CONFIDENCE_STYLES.low
  return CONFIDENCE_STYLES.default
}

// Usage examples:
/*
// For cards and containers
<div className={BRAND_CLASSES.card}>
  <h2 className={BRAND_CLASSES.textPrimary}>Title</h2>
  <p className="text-gray-600">Content</p>
</div>

// For buttons
<Button className={BRAND_CLASSES.buttonPrimary}>
  Primary Action
</Button>
<Button className={BRAND_CLASSES.buttonSecondary}>
  Secondary Action
</Button>

// For content type badges
<Badge className={`${getContentTypeStyle('portfolio').bg} ${getContentTypeStyle('portfolio').text}`}>
  Portfolio
</Badge>

// For confidence indicators
<Badge className={getConfidenceStyle(0.85)}>
  {Math.round(0.85 * 100)}% Match
</Badge>
*/
