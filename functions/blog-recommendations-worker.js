// AI-powered blog recommendations worker using Cloudflare AI
// Analyzes blog content and recommends relevant portfolio pages

// Rate limiting configuration
const RATE_LIMITS = {
  requestsPerMinute: 10,
  requestsPerHour: 50,
  burstLimit: 5
}

// Portfolio page metadata for recommendations
const PORTFOLIO_PAGES = [
  {
    id: 'military-leadership',
    title: 'Military Leadership',
    description: 'Signal Corps NCO experience—mission-critical communications, 24/7 NOC leadership, and a Be-Know-Do philosophy that shapes how I lead today.',
    tags: ['leadership', 'military', 'communication', 'team-building', 'discipline', 'technical-excellence'],
    category: 'Leadership & Culture',
    url: '/military-leadership'
  },
  {
    id: 'leadership',
    title: 'Leadership & Culture',
    description: 'Building high-performing teams through strategic leadership, cultural transformation, and organizational development.',
    tags: ['leadership', 'culture', 'team-building', 'organizational-development', 'change-management'],
    category: 'Leadership & Culture',
    url: '/leadership'
  },
  {
    id: 'strategy',
    title: 'Strategy & Consulting',
    description: 'Strategic planning, digital transformation, and organizational consulting to drive sustainable growth and competitive advantage.',
    tags: ['strategy', 'consulting', 'digital-transformation', 'planning', 'growth'],
    category: 'Strategy & Consulting',
    url: '/strategy'
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation',
    description: 'Implementing intelligent automation solutions, AI workflows, and machine learning systems to optimize business processes.',
    tags: ['ai', 'automation', 'machine-learning', 'workflow', 'optimization'],
    category: 'Technology & Operations',
    url: '/ai-automation'
  },
  {
    id: 'devops',
    title: 'Technology & Operations',
    description: 'DevOps implementation, infrastructure automation, and operational excellence to accelerate delivery and improve reliability.',
    tags: ['devops', 'infrastructure', 'automation', 'operations', 'reliability'],
    category: 'Technology & Operations',
    url: '/devops'
  },
  {
    id: 'analytics',
    title: 'Data & Analytics',
    description: 'Data-driven decision making, analytics implementation, and business intelligence to uncover insights and drive growth.',
    tags: ['analytics', 'data', 'business-intelligence', 'insights', 'decision-making'],
    category: 'Data & Analytics',
    url: '/analytics'
  },
  {
    id: 'governance-pmo',
    title: 'Governance & PMO',
    description: 'Project management office setup, governance frameworks, and portfolio management to ensure strategic alignment and delivery.',
    tags: ['governance', 'pmo', 'project-management', 'portfolio', 'alignment'],
    category: 'Governance & PMO',
    url: '/governance-pmo'
  },
  {
    id: 'risk-compliance',
    title: 'Risk & Compliance',
    description: 'Risk management frameworks, compliance programs, and governance structures to protect organizations and ensure regulatory adherence.',
    tags: ['risk', 'compliance', 'governance', 'regulatory', 'protection'],
    category: 'Risk & Compliance',
    url: '/risk-compliance'
  },
  {
    id: 'talent',
    title: 'Talent & HR',
    description: 'Talent acquisition, development programs, and HR transformation to build high-performing teams and organizational capability.',
    tags: ['talent', 'hr', 'recruitment', 'development', 'organizational-capability'],
    category: 'Talent & HR',
    url: '/talent'
  },
  {
    id: 'product-ux',
    title: 'Product & UX',
    description: 'Product strategy, user experience design, and digital product development to create engaging and effective solutions.',
    tags: ['product', 'ux', 'design', 'strategy', 'digital'],
    category: 'Product & UX',
    url: '/product-ux'
  },
  {
    id: 'saas',
    title: 'SaaS & Technology',
    description: 'SaaS implementation, technology strategy, and digital transformation to modernize operations and drive innovation.',
    tags: ['saas', 'technology', 'digital-transformation', 'implementation', 'innovation'],
    category: 'Technology & Operations',
    url: '/saas'
  },
  {
    id: 'education-certifications',
    title: 'Education & Certifications',
    description: 'Professional development, certifications, and continuous learning to maintain expertise and drive career growth.',
    tags: ['education', 'certifications', 'professional-development', 'learning', 'expertise'],
    category: 'Education & Certifications',
    url: '/education-certifications'
  }
]

// Rate limiting with IP tracking
async function checkRateLimit(request, env) {
  if (!env.KV) {
    console.warn('KV not available, skipping rate limiting')
    return true
  }
  
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown'
  
  const now = Date.now()
  const minuteKey = `blog_recs:${clientIP}:${Math.floor(now / 60000)}`
  const hourKey = `blog_recs:${clientIP}:${Math.floor(now / 3600000)}`
  
  try {
    const [minuteCount, hourCount] = await Promise.all([
      env.KV.get(minuteKey, { type: 'text' }).then(v => parseInt(v) || 0),
      env.KV.get(hourKey, { type: 'text' }).then(v => parseInt(v) || 0)
    ])
    
    if (minuteCount >= RATE_LIMITS.requestsPerMinute) {
      throw new Error('Rate limit exceeded: too many requests per minute')
    }
    
    if (hourCount >= RATE_LIMITS.requestsPerHour) {
      throw new Error('Rate limit exceeded: too many requests per hour')
    }
    
    await Promise.all([
      env.KV.put(minuteKey, (minuteCount + 1).toString(), { expirationTtl: 60 }),
      env.KV.put(hourKey, (hourCount + 1).toString(), { expirationTtl: 3600 })
    ])
    
    return true
  } catch (error) {
    console.error('Rate limiting error:', error)
    return false
  }
}

// Content sanitization
function sanitizeContent(content) {
  if (!content || typeof content !== 'string') return ''
  
  // Remove markdown formatting
  let sanitized = content
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Normalize line breaks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  // Limit content length for AI processing
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...'
  }
  
  return sanitized
}

// Generate recommendations using AI
async function generateRecommendations(blogContent, blogTitle, blogTags, env) {
  try {
    const sanitizedContent = sanitizeContent(blogContent)
    
    // Create context for AI to analyze and recommend with confidence scores
    const context = `
Blog Post: "${blogTitle}"
Content: ${sanitizedContent}
Tags: ${blogTags?.join(', ') || 'None'}

Available Portfolio Pages:
${PORTFOLIO_PAGES.map(page => `
- ${page.title} (${page.category})
  Description: ${page.description}
  Tags: ${page.tags.join(', ')}
  URL: ${page.url}
`).join('\n')}

Based on the blog post content, title, and tags, analyze the relevance of each portfolio page and return exactly 2 recommendations with AI-calculated confidence scores.

For each recommendation, provide:
1. The portfolio page ID
2. A confidence score between 0.6 and 0.98 based on your analysis of content relevance

Consider:
- Topic similarity and thematic alignment
- Skill and expertise overlap  
- Practical application of concepts discussed
- Complementary knowledge areas

Return your response in this exact format:
ID1:CONFIDENCE1,ID2:CONFIDENCE2

Example: military-leadership:0.87,leadership:0.76
`

    // Use Cloudflare AI to analyze and recommend with confidence scores
    const ai = env.AI
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert content analyst. Analyze blog content and recommend portfolio pages with AI-calculated confidence scores based on content relevance and thematic alignment.'
        },
        {
          role: 'user',
          content: context
        }
      ],
      stream: false
    })

    const aiResponse = response.response.trim()
    
    // Parse AI response for recommendations with confidence scores
    const recommendations = aiResponse.split(',').map(rec => {
      const [id, confidenceStr] = rec.split(':')
      const confidence = parseFloat(confidenceStr) || 0.75
      return { id: id.trim(), confidence: Math.max(0.6, Math.min(0.98, confidence)) }
    }).filter(rec => rec.id && !isNaN(rec.confidence))
    
    // Map to full portfolio page data
    const recommendedPages = []
    for (const rec of recommendations) {
      const page = PORTFOLIO_PAGES.find(p => p.id === rec.id)
      if (page) {
        recommendedPages.push({
          ...page,
          confidence: rec.confidence
        })
      }
      if (recommendedPages.length >= 2) break
    }
    
    // If AI didn't provide enough recommendations, fill with additional ones
    if (recommendedPages.length < 2) {
      const remainingPages = PORTFOLIO_PAGES.filter(p => 
        !recommendedPages.some(r => r.id === p.id)
      )
      const additionalPages = remainingPages.slice(0, 2 - recommendedPages.length)
      
      additionalPages.forEach(page => {
        recommendedPages.push({
          ...page,
          confidence: 0.75 // Default confidence for fallback
        })
      })
    }
    
    // Return exactly 2 recommendations sorted by confidence
    return recommendedPages
      .slice(0, 2)
      .sort((a, b) => b.confidence - a.confidence)
    
  } catch (error) {
    console.error('AI recommendation error:', error)
    // Fallback to default recommendations with confidence scores
    return [
      {
        ...PORTFOLIO_PAGES.find(p => p.id === 'leadership'),
        confidence: 0.75
      },
      {
        ...PORTFOLIO_PAGES.find(p => p.id === 'strategy'),
        confidence: 0.70
      }
    ].filter(Boolean)
  }
}

// Fallback to tag-based recommendations
function fallbackRecommendations(blogTags) {
  if (!blogTags || blogTags.length === 0) {
    // Default recommendations if no tags
    return [
      PORTFOLIO_PAGES.find(p => p.id === 'leadership'),
      PORTFOLIO_PAGES.find(p => p.id === 'strategy'),
      PORTFOLIO_PAGES.find(p => p.id === 'ai-automation')
    ].filter(Boolean)
  }
  
  // Score pages based on tag overlap
  const scoredPages = PORTFOLIO_PAGES.map(page => {
    const tagOverlap = page.tags.filter(tag => 
      blogTags.some(blogTag => 
        blogTag.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(blogTag.toLowerCase())
      )
    ).length
    
    return {
      ...page,
      score: tagOverlap
    }
  })
  
  // Sort by score and return top 3
  return scoredPages
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...page }) => page)
}

// Main handler
export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      })
    }

    // Handle health check
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        worker: 'blog-recommendations'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    try {
      // Check rate limits
      const rateLimitOk = await checkRateLimit(request, env)
      if (!rateLimitOk) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Parse request body
      const body = await request.json()
      const { content, title, tags } = body

      // Validate input
      if (!content || !title) {
        return new Response(JSON.stringify({ error: 'Missing required fields: content and title' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Generate recommendations
      const recommendations = await generateRecommendations(content, title, tags, env)

      // Return recommendations
      return new Response(JSON.stringify({
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Blog recommendations error:', error)
      
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
