// Cloudflare Worker for LinkedIn API integration
// Handles server-side API calls to avoid CORS issues

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    try {
      switch (path) {
        case '/articles':
          return await handleGetArticles(request, env, corsHeaders)
        case '/article':
          return await handleGetArticle(request, env, corsHeaders)
        case '/search':
          return await handleSearchArticles(request, env, corsHeaders)
        case '/engagement':
          return await handleGetEngagement(request, env, corsHeaders)
        default:
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
      }
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}

async function handleGetArticles(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { accessToken, limit = 10 } = await request.json()

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Access token required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Fetch user's posts from LinkedIn API
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A' + env.LINKEDIN_USER_ID + ')&count=' + limit, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform LinkedIn data to our format
    const articles = data.elements?.map(post => ({
      id: post.id,
      title: extractTitle(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      summary: extractSummary(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || '',
      publishedDate: post.created.time,
      url: `https://www.linkedin.com/posts/${post.id}`,
      author: {
        name: 'Your Name', // Will be populated from profile
        profileUrl: 'https://www.linkedin.com/in/yourprofile',
      },
      engagement: {
        likes: post.totalShareStatistics?.totalShareStatistics?.aggregatedTotalShares || 0,
        comments: 0, // LinkedIn API doesn't provide this directly
        shares: 0,
      },
      tags: extractTags(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      readTime: estimateReadingTime(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
    })) || []

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetArticle(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { accessToken, articleId } = await request.json()

  if (!accessToken || !articleId) {
    return new Response(JSON.stringify({ error: 'Access token and article ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Fetch specific article from LinkedIn API
    const response = await fetch(`https://api.linkedin.com/v2/ugcPosts/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`)
    }

    const post = await response.json()
    
    const article = {
      id: post.id,
      title: extractTitle(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      summary: extractSummary(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || '',
      publishedDate: post.created.time,
      url: `https://www.linkedin.com/posts/${post.id}`,
      author: {
        name: 'Your Name',
        profileUrl: 'https://www.linkedin.com/in/yourprofile',
      },
      engagement: {
        likes: post.totalShareStatistics?.totalShareStatistics?.aggregatedTotalShares || 0,
        comments: 0,
        shares: 0,
      },
      tags: extractTags(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      readTime: estimateReadingTime(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
    }

    return new Response(JSON.stringify({ article }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleSearchArticles(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { accessToken, query, limit = 10 } = await request.json()

  if (!accessToken || !query) {
    return new Response(JSON.stringify({ error: 'Access token and query required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // For now, we'll fetch all articles and filter client-side
    // LinkedIn doesn't provide a direct search API for user posts
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aperson%3A' + env.LINKEDIN_USER_ID + ')&count=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter articles by query
    const articles = data.elements
      ?.map(post => ({
        id: post.id,
        title: extractTitle(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
        summary: extractSummary(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
        content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || '',
        publishedDate: post.created.time,
        url: `https://www.linkedin.com/posts/${post.id}`,
        author: {
          name: 'Your Name',
          profileUrl: 'https://www.linkedin.com/in/yourprofile',
        },
        engagement: {
          likes: post.totalShareStatistics?.totalShareStatistics?.aggregatedTotalShares || 0,
          comments: 0,
          shares: 0,
        },
        tags: extractTags(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
        readTime: estimateReadingTime(post.specificContent?.['com.linkedin.ugc.ShareContent']?.text || ''),
      }))
      ?.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      ?.slice(0, limit) || []

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error searching articles:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetEngagement(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { accessToken, articleId } = await request.json()

  if (!accessToken || !articleId) {
    return new Response(JSON.stringify({ error: 'Access token and article ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // LinkedIn API doesn't provide detailed engagement metrics for individual posts
    // We'll return basic metrics from the post data
    const response = await fetch(`https://api.linkedin.com/v2/ugcPosts/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`)
    }

    const post = await response.json()
    
    const engagement = {
      likes: post.totalShareStatistics?.totalShareStatistics?.aggregatedTotalShares || 0,
      comments: 0, // Not available via API
      shares: 0, // Not available via API
    }

    return new Response(JSON.stringify({ engagement }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching engagement:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// Utility functions
function extractTitle(content) {
  // Extract first line or first sentence as title
  const lines = content.split('\n').filter(line => line.trim())
  return lines[0]?.substring(0, 100) || 'Untitled'
}

function extractSummary(content, maxLength = 200) {
  const plainText = content.replace(/<[^>]*>/g, '').trim()
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = truncated.lastIndexOf('.')
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1)
  }
  
  return truncated + '...'
}

function extractTags(content) {
  const hashtagRegex = /#(\w+)/g
  const matches = content.match(hashtagRegex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

function estimateReadingTime(content) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
