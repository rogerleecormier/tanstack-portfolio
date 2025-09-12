import { useParams } from '@tanstack/react-router';
import BlogPage from '../pages/BlogPage';

export default function BlogPostWrapper() {
  const { slug } = useParams({ from: '/blog/$slug' });
  return <BlogPage slug={slug} />;
}
