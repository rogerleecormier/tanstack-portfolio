import Fuse from 'fuse.js';

/**
 * @typedef {Object} FrontmatterSuggestion
 * @property {string} [title]
 * @property {string} [description]
 * @property {string[]} [tags]
 */

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Jwt-Assertion, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    const { markdown } = await request.json();

    if (!markdown) {
      return Response.json(
        { error: 'Markdown content required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    const suggestions = {};

    // Extract title from first H1
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      suggestions.title = h1Match[1].trim();
    }

    // Extract description from first paragraph
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
        suggestions.description = line.trim();
        break;
      }
    }

    // Extract potential tags from headings and keywords
    const headings = markdown.match(/^#+\s+(.+)$/gm) || [];
    const keywords = [
      'tutorial',
      'guide',
      'react',
      'javascript',
      'typescript',
      'api',
      'component',
    ];

    const potentialTags = [
      ...headings.map(h => h.replace(/^#+\s+/, '').toLowerCase()),
      ...keywords.filter(k => markdown.toLowerCase().includes(k)),
    ];

    // Use Fuse.js for fuzzy matching of common tags
    const commonTags = [
      'blog',
      'tutorial',
      'guide',
      'documentation',
      'react',
      'javascript',
      'typescript',
      'api',
      'component',
      'ui',
      'frontend',
      'backend',
    ];
    const fuse = new Fuse(commonTags, { threshold: 0.4 });

    const matchedTags = potentialTags
      .map(tag => fuse.search(tag))
      .flat()
      .map(result => result.item)
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 5);

    if (matchedTags.length > 0) {
      suggestions.tags = matchedTags;
    }

    return Response.json({ frontmatter: suggestions }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Failed to generate frontmatter' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
