export interface NavigationPage {
  title: string
  path: string
  file: string
  children?: NavigationPage[]
}

export const navigationPages: NavigationPage[] = [
  { title: 'About', path: '/', file: 'about.md' },
  { title: 'Strategy', path: '/strategy', file: 'strategy.md' },
  { title: 'Leadership', path: '/leadership', file: 'leadership.md' },
  { title: 'Vision', path: '/vision', file: 'vision.md' },
  { title: 'Culture', path: '/culture', file: 'culture.md' },
  { title: 'Talent', path: '/talent', file: 'talent.md' },
  { title: 'DevOps', path: '/devops', file: 'devops.md' },
  { title: 'SaaS', path: '/saas', file: 'saas.md' },
  { 
    title: 'Analytics', 
    path: '/analytics', 
    file: 'analytics.md',
    children: [
      { title: 'Project Risk Analysis', path: '/analytics/project-analysis', file: 'project-risk-analysis.md' }
    ]
  }
]

export const allowedPaths = navigationPages.flatMap(page => {
  const paths = [page.path]
  if (page.children) {
    paths.push(...page.children.map(child => child.path))
  }
  return paths
})