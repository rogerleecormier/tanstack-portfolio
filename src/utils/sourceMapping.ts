/**
 * Maps database source values to user-friendly display names
 * Used in HealthBridge components to display proper source names
 */

export const getSourceDisplayName = (source: string): string => {
  const sourceMap: Record<string, string> = {
    'apple_health': 'Apple Health',
    'manual': 'Manual Entry',
    'myfitnesspal': 'MyFitnessPal',
    'google_fit': 'Google Fit',
    'fitbit': 'Fitbit',
    'samsung_health': 'Samsung Health',
    'scale': 'Scale',
    'unknown': 'Unknown Source',
    'dummy': 'Demo Data', // Handle legacy dummy data
    'legacy': 'Legacy Data', // Handle legacy database records
    'Manual Entry': 'Manual Entry', // Handle already formatted values
    'Scale': 'Scale' // Handle already formatted values
  };

  return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1);
};

/**
 * Gets an icon for the source type (optional enhancement)
 */
export const getSourceIcon = (source: string): string => {
  const iconMap: Record<string, string> = {
    'apple_health': '🍎',
    'manual': '✋',
    'myfitnesspal': '📱',
    'google_fit': '📊',
    'fitbit': '⌚',
    'samsung_health': '📱',
    'scale': '⚖️',
    'unknown': '❓',
    'dummy': '🎭',
    'legacy': '📜',
    'Manual Entry': '✋',
    'Scale': '⚖️'
  };

  return iconMap[source] || '📊';
};
