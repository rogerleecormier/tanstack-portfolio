import { frontmatterSchema } from '../../../src/schemas/frontmatter';

export async function onRequest(context: { request: Request }) {
  const { request } = context;

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { yaml } = await request.json();

    if (!yaml) {
      return Response.json({ error: 'YAML content required' }, { status: 400 });
    }

    const yamlObj = JSON.parse(yaml); // Assuming frontend sends JSON
    const result = frontmatterSchema.safeParse(yamlObj);

    if (result.success) {
      return Response.json({ ok: true, normalized: result.data });
    } else {
      return Response.json({
        ok: false,
        errors: result.error.errors.map(err => err.message),
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json(
      { error: 'Failed to validate frontmatter' },
      { status: 500 }
    );
  }
}
