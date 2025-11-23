import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  return (
    <div className='min-h-screen bg-surface-base'>
      {/* Hero Section with Glassmorphism */}
      <div className='relative overflow-hidden border-b border-surface-elevated/50 bg-surface-base/40 backdrop-blur-xl'>
        <div className='relative px-4 py-16 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Error Icon */}
            <div className='mb-8 flex justify-center'>
              <div className='relative'>
                <div className='flex size-24 items-center justify-center rounded-3xl bg-surface-elevated/60 shadow-lg ring-1 ring-strategy-gold/20 backdrop-blur-md'>
                  <AlertTriangle className='size-12 text-strategy-gold' />
                </div>
                {/* Decorative dots */}
                <div className='absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-surface-deep/80 backdrop-blur-sm'>
                  <div className='size-3 rounded-full bg-strategy-rose'></div>
                </div>
              </div>
            </div>

            {/* 404 Title */}
            <h1 className='mb-4 text-7xl font-bold tracking-tight text-strategy-gold sm:text-8xl lg:text-9xl'>
              404
            </h1>
            <div className='mx-auto mb-6 h-1 w-24 rounded-full bg-strategy-gold/50'></div>

            {/* Description */}
            <h2 className='mb-4 text-2xl font-semibold text-text-foreground sm:text-3xl'>
              Page Not Found
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-lg leading-7 text-text-secondary'>
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                asChild
                className='inline-flex items-center gap-2 border-0 bg-strategy-gold px-6 py-3 text-precision-charcoal hover:bg-strategy-gold/90'
              >
                <Link to='/'>
                  <Home className='size-4' />
                  Go Home
                </Link>
              </Button>
              <Button
                variant='outline'
                onClick={() => window.history.back()}
                className='inline-flex items-center gap-2 border-strategy-gold/20 bg-surface-deep/30 px-6 py-3 text-strategy-gold hover:border-strategy-gold/50 hover:bg-surface-elevated/50'
              >
                <ArrowLeft className='size-4' />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Links Section */}
      <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
        <h3 className='mb-6 text-center text-lg font-semibold text-strategy-gold'>
          Maybe try one of these pages?
        </h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card className='border-strategy-gold/20 bg-surface-elevated/30 transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'>
            <CardContent className='p-6'>
              <Link to='/projects' className='group'>
                <h4 className='mb-2 font-semibold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  Projects
                </h4>
                <p className='text-sm text-text-secondary'>
                  View case studies and professional work
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className='border-strategy-gold/20 bg-surface-elevated/30 transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'>
            <CardContent className='p-6'>
              <Link to='/blog' className='group'>
                <h4 className='mb-2 font-semibold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  Blog
                </h4>
                <p className='text-sm text-text-secondary'>
                  Read articles and insights
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className='border-strategy-gold/20 bg-surface-elevated/30 transition-all duration-300 hover:border-strategy-gold/40 hover:bg-surface-elevated/50'>
            <CardContent className='p-6'>
              <Link to='/contact' className='group'>
                <h4 className='mb-2 font-semibold text-text-foreground transition-colors group-hover:text-strategy-gold'>
                  Contact
                </h4>
                <p className='text-sm text-text-secondary'>
                  Get in touch for opportunities
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
