import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-surface-base flex items-center justify-center px-6'>
      <div className='text-center max-w-md'>
        <AlertTriangle className='h-12 w-12 text-strategy-gold mx-auto mb-6' />
        <h1 className='text-7xl font-bold text-strategy-gold mb-2'>404</h1>
        <h2 className='text-xl font-semibold text-text-foreground mb-3'>Page not found</h2>
        <p className='text-text-secondary mb-8'>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className='flex justify-center gap-3'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-strategy-gold text-precision-charcoal font-semibold text-sm hover:brightness-110 transition-all'
          >
            <Home className='h-4 w-4' />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border-subtle text-text-secondary font-semibold text-sm hover:border-strategy-gold hover:text-text-foreground transition-all'
          >
            <ArrowLeft className='h-4 w-4' />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
