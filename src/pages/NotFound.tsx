import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <div className='mx-auto max-w-md'>
        <h1 className='mb-4 text-6xl font-bold text-teal-300'>404</h1>
        <h2 className='mb-4 text-2xl font-semibold text-teal-800'>
          Page Not Found
        </h2>
        <p className='mb-8 text-teal-600'>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button
            asChild
            // eslint-disable-next-line tailwindcss/no-custom-classname
            className='brand-button-primary inline-flex items-center gap-2'
          >
            <Link to='/'>
              <Home className='size-4' />
              Go Home
            </Link>
          </Button>
          <Button
            variant='outline'
            onClick={() => window.history.back()}
            className='inline-flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50'
          >
            <ArrowLeft className='size-4' />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
