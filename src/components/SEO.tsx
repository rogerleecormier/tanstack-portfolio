import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const SITE_NAME = 'Roger Lee Cormier'
const SITE_TITLE = 'Roger Lee Cormier - Technical Project Manager'
const SITE_DESCRIPTION = 'PMP-certified Technical Project Manager and U.S. Army veteran specializing in enterprise systems, SaaS integrations, and cross-functional project delivery.'
const SITE_URL = 'https://www.rcormier.dev'
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`

export function SEO({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author = 'Roger Lee Cormier',
  publishedTime,
  modifiedTime
}: SEOProps) {
  // Construct full title using best practices
  const fullTitle = title 
    ? `${title} | ${SITE_NAME}`
    : SITE_TITLE

  // Construct full URL
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL

  // Default keywords
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@rogerleecormier" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data for Person/Professional */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Roger Lee Cormier",
          "jobTitle": "Technical Project Manager",
          "description": description,
          "url": SITE_URL,
          "image": image,
          "sameAs": [
            "https://www.linkedin.com/in/rogerleecormier",
            "https://github.com/rogerleecormier"
          ],
          "knowsAbout": [
            "Project Management",
            "Enterprise Integration",
            "SaaS Platforms",
            "Cloud Computing",
            "DevOps",
            "Process Optimization"
          ],
          "alumniOf": "Excelsior University",
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Project Management Professional (PMP)",
              "credentialCategory": "Professional Certification"
            }
          ]
        })}
      </script>
    </Helmet>
  )
}