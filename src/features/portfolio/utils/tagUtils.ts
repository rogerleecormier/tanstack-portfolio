/**
 * Tag Utilities
 * Helper functions for tag formatting and deduplication
 */

const COMMON_WORDS = [
  'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
];

const ACRONYMS = [
  'ai', 'ml', 'api', 'ui', 'ux', 'devops', 'saas', 'pmp', 'pmi', 'ide', 'erp', 'ap',
];

/**
 * Format a tag with proper title case, handling acronyms and common words
 */
export function formatTag(tag: string): string {
  return tag
    .split(' ')
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      // Handle acronyms - always uppercase
      if (ACRONYMS.includes(lowerWord)) {
        return lowerWord.toUpperCase();
      }

      // Handle connected words with acronyms (e.g., "API-first", "AI-powered")
      if (word.includes('-')) {
        const parts = word.split('-');
        return parts
          .map(part => {
            const lowerPart = part.toLowerCase();
            if (ACRONYMS.includes(lowerPart)) {
              return lowerPart.toUpperCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join('-');
      }

      // Always capitalize first word, capitalize others unless they're common words
      if (index === 0 || !COMMON_WORDS.includes(lowerWord)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return lowerWord;
    })
    .join(' ');
}

/**
 * Deduplicate tags by converting to lowercase for comparison
 */
export function getUniqueTags(tags: string[]): string[] {
  return [...new Set(tags.map(tag => tag.toLowerCase()))];
}

/**
 * Safely parse tags from various input formats
 */
export function parseTagsSafely(tags: unknown): string[] {
  if (!tags) return [];

  // If tags is already an array, process each item
  if (Array.isArray(tags)) {
    const allTags: string[] = [];

    for (const item of tags) {
      if (typeof item === 'string') {
        // Check if this string looks like JSON
        if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(item) as unknown;
            if (Array.isArray(parsed)) {
              allTags.push(
                ...parsed.filter((tag): tag is string => typeof tag === 'string')
              );
            }
          } catch {
            // If parsing fails, treat as a single tag
            allTags.push(item);
          }
        } else {
          // Regular string tag
          allTags.push(item);
        }
      }
    }

    return allTags;
  }

  // If tags is a string, try to parse it
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // If parsing fails, split by comma and clean up
      return tags.split(',').map((tag: string) =>
        tag
          .trim()
          .replace(/^\[|\]$/g, '')
          .replace(/"/g, '')
      );
    }
  }

  return [];
}
