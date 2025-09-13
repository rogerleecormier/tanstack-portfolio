import { useParams } from '@tanstack/react-router';
import BlogPage from '../pages/BlogPage';

export default function BlogPostWrapper() {
  const params: unknown = useParams({ from: '/blog/$slug' });
  const slug =
    params &&
    typeof params === 'object' &&
    'slug' in params &&
    typeof (params as { slug: unknown }).slug === 'string'
      ? (params as { slug: string }).slug
      : '';
  return <BlogPage slug={slug} />;
}
