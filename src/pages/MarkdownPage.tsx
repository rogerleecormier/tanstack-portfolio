import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import fm from 'front-matter'
import { SITE_TITLE } from '../config/siteConfig'

const markdownFiles = import.meta.glob('../content/*.md', { as: 'raw' })

export default function MarkdownPage({ file }: { file: string }) {
  const [content, setContent] = React.useState<string>('')
  const [frontmatter, setFrontmatter] = React.useState<Record<string, any>>({})

  React.useEffect(() => {
    const load = async () => {
      const importer = markdownFiles[`../content/${file}.md`]
      if (importer) {
        const raw = await importer()
        const { attributes, body } = fm(raw)
        setFrontmatter(attributes as Record<string, any>)
        setContent(body)
        if ((attributes as any).title) {
          document.title = (attributes as any).title + ' – ' + SITE_TITLE
        } else {
          document.title = SITE_TITLE
        }
      } else {
        setContent('# 404\n\nContent not found.')
        setFrontmatter({})
        document.title = '404 – Not Found'
      }
    }
    load()
  }, [file])

  return (
    <div className="prose max-w-4xl mx-auto px-6 py-12 overflow-x-auto">
      {frontmatter.title && <h1>{frontmatter.title}</h1>}
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
