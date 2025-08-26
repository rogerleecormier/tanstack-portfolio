import fm from 'front-matter'

export interface PortfolioItem {
  title: string
  url: string
  description: string
  tags: string[]
  category: string
  fileName: string
  frontmatter: Record<string, unknown>
}

// Define category mappings for display purposes only
const categoryMappings: Record<string, { name: string; icon: string; color: string }> = {
  'strategy': { name: 'Strategy & Consulting', icon: 'Target', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors' },
  'leadership': { name: 'Leadership & Culture', icon: 'Users2', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors' },
  'talent': { name: 'Talent & HR', icon: 'User', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors' },
  'devops': { name: 'Technology & Operations', icon: 'Code', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors' },
  'saas': { name: 'Technology & Operations', icon: 'Code', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors' },
  'analytics': { name: 'Data & Analytics', icon: 'BarChart3', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors' },
  'risk-compliance': { name: 'Risk & Compliance', icon: 'Shield', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors' },
  'governance-pmo': { name: 'Governance & PMO', icon: 'ClipboardList', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors' },
  'product-ux': { name: 'Product & UX', icon: 'Palette', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors' },
  'military-leadership': { name: 'Military Leadership', icon: 'Award', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors' },
  'education-certifications': { name: 'Education & Certifications', icon: 'GraduationCap', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors' },
  'ai-automation': { name: 'AI & Automation', icon: 'Brain', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors' }
}

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const portfolioFiles = [
    'strategy.md',
    'leadership.md',
    'talent.md',
    'devops.md',
    'saas.md',
    'analytics.md',
    'risk-compliance.md',
    'governance-pmo.md',
    'product-ux.md',
    'military-leadership.md',
    'education-certifications.md',
    'ai-automation.md'
  ]

  const items: PortfolioItem[] = []

  for (const fileName of portfolioFiles) {
    try {
      const fileNameWithoutExt = fileName.replace('.md', '')
      const markdownModule = await import(`../content/portfolio/${fileNameWithoutExt}.md?raw`)
      const text = markdownModule.default

      // Parse frontmatter
      const { attributes } = fm(text)
      const frontmatter = attributes as Record<string, unknown>

      // Generate URL from filename
      const url = fileNameWithoutExt

      // Determine category
      const category = categoryMappings[fileNameWithoutExt]?.name || 'Other'

      // Create portfolio item
      const item: PortfolioItem = {
        title: (frontmatter.title as string) || fileNameWithoutExt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        url,
        description: (frontmatter.description as string) || 'No description available',
        tags: (frontmatter.tags as string[]) || (frontmatter.keywords as string[]) || [],
        category,
        fileName: fileNameWithoutExt,
        frontmatter
      }

      items.push(item)
    } catch (error) {
      console.error(`Error loading portfolio file ${fileName}:`, error)
    }
  }

  return items
}

export function getCategoryColors(): Record<string, string> {
  const colors: Record<string, string> = {}
  Object.values(categoryMappings).forEach(category => {
    colors[category.name] = category.color
  })
  return colors
}
