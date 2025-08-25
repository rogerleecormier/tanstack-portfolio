import { useEffect } from 'react'

interface UseDocumentTitleProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
}

const SITE_NAME = 'Roger Lee Cormier'
const SITE_TITLE = 'Roger Lee Cormier - rcormier.dev'
const SITE_DESCRIPTION = 'PMP-certified Technical Project Manager and U.S. Army veteran specializing in enterprise systems modernization, SaaS integrations, and cross-functional project delivery.'
const SITE_URL = 'https://www.rcormier.dev'
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/roger-cormier-profile.jpg`

export function useDocumentTitle({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author = 'Roger Lee Cormier',
  publishedTime
}: UseDocumentTitleProps) {
  useEffect(() => {
    // Construct full title using SEO best practices
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE
    
    // Update document title
    document.title = fullTitle

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attribute: string = 'content') => {
      const metaTag = document.querySelector(selector)
      if (metaTag) {
        metaTag.setAttribute(attribute, content)
      } else {
        const newMetaTag = document.createElement('meta')
        if (selector.includes('property=')) {
          const propertyValue = selector.match(/property="([^"]+)"/)?.[1]
          if (propertyValue) {
            newMetaTag.setAttribute('property', propertyValue)
          }
        } else if (selector.includes('name=')) {
          const nameValue = selector.match(/name="([^"]+)"/)?.[1]
          if (nameValue) {
            newMetaTag.setAttribute('name', nameValue)
          }
        }
        newMetaTag.setAttribute(attribute, content)
        document.head.appendChild(newMetaTag)
      }
    }

    // Helper function to update or create link tag
    const updateLinkTag = (selector: string, href: string) => {
      const linkTag = document.querySelector(selector) as HTMLLinkElement
      if (linkTag) {
        linkTag.href = href
      } else {
        const newLinkTag = document.createElement('link')
        const relValue = selector.match(/rel="([^"]+)"/)?.[1]
        if (relValue) {
          newLinkTag.rel = relValue
        }
        newLinkTag.href = href
        document.head.appendChild(newLinkTag)
      }
    }

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', description)
    updateMetaTag('meta[name="author"]', author)

    // Update keywords if provided
    if (keywords.length > 0) {
      const defaultKeywords = [
        'Technical Project Manager',
        'PMP Certified',
        'Enterprise Integration',
        'SaaS',
        'Cloud Computing',
        'DevOps',
        'Project Management',
        'U.S. Army Veteran',
        'NetSuite',
        'Azure Functions',
        'Process Optimization'
      ]
      
      const allKeywords = [...defaultKeywords, ...keywords].join(', ')
      updateMetaTag('meta[name="keywords"]', allKeywords)
    }

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', fullTitle)
    updateMetaTag('meta[property="og:description"]', description)
    updateMetaTag('meta[property="og:type"]', type)
    updateMetaTag('meta[property="og:image"]', image)
    updateMetaTag('meta[property="og:site_name"]', SITE_NAME)

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image')
    updateMetaTag('meta[name="twitter:title"]', fullTitle)
    updateMetaTag('meta[name="twitter:description"]', description)
    updateMetaTag('meta[name="twitter:image"]', image)

    // Update URL-based tags
    if (url) {
      const fullUrl = `${SITE_URL}${url}`
      updateMetaTag('meta[property="og:url"]', fullUrl)
      updateLinkTag('link[rel="canonical"]', fullUrl)
    }

    // Add article-specific meta tags
    if (type === 'article' && publishedTime) {
      updateMetaTag('meta[property="article:published_time"]', publishedTime)
      updateMetaTag('meta[property="article:author"]', author)
    }

    // Add structured data for better SEO
    const addStructuredData = () => {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]')
      if (existingScript) {
        existingScript.remove()
      }

      // Create new structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": type === 'profile' ? "Person" : "Article",
        "name": type === 'profile' ? author : fullTitle,
        "description": description,
        "url": url ? `${SITE_URL}${url}` : SITE_URL,
        "image": image,
        ...(type === 'profile' && {
          "jobTitle": "Technical Project Manager",
          "worksFor": {
            "@type": "Organization",
            "name": "Technical Project Management"
          },
          "alumniOf": "Excelsior University",
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Project Management Professional (PMP)",
              "credentialCategory": "Professional Certification"
            }
          ],
          "knowsAbout": [
            "Project Management",
            "Enterprise Integration",
            "SaaS Platforms",
            "Cloud Computing",
            "DevOps",
            "Process Optimization"
          ]
        }),
        ...(type === 'article' && {
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Person",
            "name": author
          },
          ...(publishedTime && { "datePublished": publishedTime }),
          "dateModified": new Date().toISOString()
        })
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData, null, 2)
      document.head.appendChild(script)
    }

    addStructuredData()

  }, [title, description, keywords, image, url, type, author, publishedTime])
}