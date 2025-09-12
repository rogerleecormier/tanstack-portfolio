/// <reference types="@cloudflare/workers-types" />

/**
 * R2 Content Proxy Worker
 *
 * This worker serves content from your R2 bucket with proper CORS headers
 * to resolve the CORS issue when fetching from files.rcormier.dev
 */

interface Env {
  PORTFOLIO_CONTENT: R2Bucket;
  PORTFOLIO_CONTENT_PREVIEW: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'false', // Explicitly disable credentials for content proxy
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Utility to send JSON with CORS
      const json = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'false',
          },
        });

      // Provide a lightweight listing endpoint for clients that need folder traversal
      // GET /_list?prefix=blog/ (returns { prefixes, objects })
      if (request.method === 'GET' && path === '/_list') {
        const prefix = url.searchParams.get('prefix') || '';
        const limit = Math.min(
          parseInt(url.searchParams.get('limit') || '1000'),
          1000
        );

        // Validate allowed roots
        const allowed = ['blog/', 'portfolio/', 'projects/', 'trash/', ''];
        if (!allowed.some(p => prefix === p || prefix.startsWith(p))) {
          return json({ error: 'Invalid prefix' }, 400);
        }

        // Root: just return top-level folders
        if (!prefix) {
          return json({
            prefixes: ['blog/', 'portfolio/', 'projects/'],
            objects: [],
          });
        }

        const res = await env.PORTFOLIO_CONTENT.list({ prefix, limit });

        // Files in current directory (no extra slash after prefix)
        const objects = res.objects
          .filter(o => o.key.endsWith('.md'))
          .filter(o => !o.key.slice(prefix.length).includes('/'))
          .map(o => ({
            key: o.key,
            size: o.size,
            uploaded: o.uploaded?.toISOString?.() || new Date().toISOString(),
            etag: o.etag,
          }));

        // Immediate subfolders
        const set = new Set<string>();
        for (const o of res.objects) {
          const rest = o.key.slice(prefix.length);
          const idx = rest.indexOf('/');
          if (idx > -1) {
            const seg = rest.slice(0, idx);
            if (seg) set.add(`${prefix}${seg}/`);
          }
        }
        const prefixes = Array.from(set);
        return json({ prefixes, objects });
      }

      // Only allow GET and HEAD requests
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405 });
      }

      // Extract the file path from the URL
      // URLs like /portfolio/analytics.md or /blog/post.md
      const pathParts = path.split('/').filter(Boolean);

      if (pathParts.length < 2) {
        return new Response('Invalid path', { status: 400 });
      }

      const directory = pathParts[0]; // portfolio, blog, projects
      const fileName = pathParts.slice(1).join('/'); // analytics.md, post.md, etc.

      // Validate directory
      const validDirectories = ['portfolio', 'blog', 'projects'];
      if (!validDirectories.includes(directory)) {
        return new Response('Invalid directory', { status: 400 });
      }

      // Get the appropriate R2 bucket
      const bucket = env.PORTFOLIO_CONTENT;

      // Construct the R2 key
      const r2Key = `${directory}/${fileName}`;

      // Get the object from R2
      const object = await bucket.get(r2Key);

      if (!object) {
        return new Response('File not found', {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'false',
            'Content-Type': 'text/plain',
          },
        });
      }

      // Prepare response headers
      const headers = new Headers();

      // Set CORS headers - be more restrictive to avoid conflicts with authentication
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      headers.set('Access-Control-Allow-Credentials', 'false'); // Explicitly disable credentials for content proxy

      // Set content type based on file extension
      if (fileName.endsWith('.md')) {
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
      } else if (fileName.endsWith('.json')) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
      } else if (fileName.endsWith('.txt')) {
        headers.set('Content-Type', 'text/plain; charset=utf-8');
      } else {
        // Let R2 determine the content type
        headers.set(
          'Content-Type',
          object.httpMetadata?.contentType || 'application/octet-stream'
        );
      }

      // Set cache headers
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      headers.set('ETag', object.httpEtag);

      if (object.uploaded) {
        headers.set('Last-Modified', object.uploaded.toUTCString());
      }

      // Return the object with headers
      return new Response(object.body, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('Error in R2 content proxy:', error);

      return new Response('Internal server error', {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'false',
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
