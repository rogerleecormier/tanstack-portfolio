import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import fm from 'front-matter'
import slugify from 'slugify'
import Sidebar from '../layout/Sidebar'

// Define TOCEntry type
type TOCEntry = {
  title: string
  slug: string
}

// Define your subpages structure
const subpagesConfig = {
  projects: [
    { title: 'All Projects', path: '/projects' },
    { title: 'Web Development', path: '/projects/web' },
    { title: 'Mobile Apps', path: '/projects/mobile' },
    { title: 'Data Science', path: '/projects/data' }
  ],
  about: [
    { title: 'About Me', path: '/about' },
    { title: 'Experience', path: '/about/experience' },
    { title: 'Skills', path: '/about/skills' },
    { title: 'Education', path: '/about/education' }
  ]
}

export default function MarkdownPage({ file }: { file: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<Record<string, any>>({})
  const [toc, setToc] = React.useState<TOCEntry[]>([])

  // Load markdown content and extract TOC
  React.useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const response = await fetch(`/content/${file}.md`)
        const text = await response.text()
        
        // Parse frontmatter
        const { attributes, body } = fm(text)
        setFrontmatter(attributes as Record<string, any>)
        setContent(body)
        
        // Extract headings for TOC
        const headingRegex = /^#{1,2}\s+(.+)$/gm
        const headings: TOCEntry[] = []
        let match
        
        while ((match = headingRegex.exec(body)) !== null) {
          const title = match[1].trim()
          const slug = slugify(title, { lower: true, strict: true })
          headings.push({ title, slug })
        }
        
        setToc(headings)
      } catch (error) {
        console.error('Error loading markdown:', error)
      }
    }
    
    loadMarkdown()
  }, [file])

  // Get subpages for current section
  const getSubpages = () => {
    if (file.startsWith('projects')) return subpagesConfig.projects || []
    if (file.startsWith('about')) return subpagesConfig.about || []
    return []
  }

  // Get current path for highlighting
  const getCurrentPath = () => {
    if (file === 'projects') return '/projects'
    if (file === 'about') return '/about'
    return `/${file}`
  }

  return (
    <div className="flex max-w-7xl mx-auto px-6 py-12">
      <Sidebar 
        currentToc={toc}
        subpages={getSubpages()}
        currentPath={getCurrentPath()}
      />

      <main className="prose max-w-4xl px-8 flex-1">
        {frontmatter.title && <h1>{frontmatter.title}</h1>}
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, children, ...props }) => {
              const text = String(children)
              const id = slugify(text, { lower: true, strict: true })
              return (
                <h1 id={id} {...props}>
                  {children}
                </h1>
              )
            },
            h2: ({ node, children, ...props }) => {
              const text = String(children)
              const id = slugify(text, { lower: true, strict: true })
              return (
                <h2 id={id} {...props}>
                  {children}
                </h2>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </main>
    </div>
  )
}