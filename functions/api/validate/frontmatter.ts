import { frontmatterSchema } from '../../../src/schemas/frontmatter';

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
    const { yaml } = await request.json();

    if (!yaml) {
      return Response.json({ error: 'YAML content required' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const yamlObj = JSON.parse(yaml); // Assuming frontend sends JSON
    const result = frontmatterSchema.safeParse(yamlObj);

    if (result.success) {
      return Response.json({ ok: true, normalized: result.data }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    } else {
      return Response.json({
        ok: false,
        errors: result.error.errors.map(err => err.message),
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json(
      { error: 'Failed to validate frontmatter' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
