import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToBlog } from '@/api/blogSubscriptionService';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export default function NewsletterSignup({
  className,
  variant = 'default',
  title = 'Stay Updated',
  description = 'Get notified when new articles are published. No spam, just quality content.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await subscribeToBlog(email, name || undefined);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('mt-8 pt-6 border-t border-gray-200', className)}>
        <div className='text-center mb-6'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
            {title}
          </h3>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
          <div className='flex flex-col sm:flex-row gap-3 mb-3'>
            <Input
              type='text'
              placeholder='Your name (optional)'
              value={name}
              onChange={e => setName(e.target.value)}
              className='flex-1'
              disabled={isSubmitting}
            />
            <Input
              type='email'
              placeholder={placeholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='flex-1'
              disabled={isSubmitting}
              required
            />
          </div>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Subscribing...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </form>

        {message && (
          <div
            className={cn(
              'flex items-center justify-center gap-2 text-sm mt-3',
              getStatusColor()
            )}
          >
            {getStatusIcon()}
            <span>{message}</span>
          </div>
        )}

        <p className='text-xs text-gray-500 mt-3 text-center'>
          By subscribing, you agree to receive email updates. You can
          unsubscribe at any time.
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col sm:flex-row gap-3', className)}
      >
        <Input
          type='email'
          placeholder={placeholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='flex-1'
          disabled={isSubmitting}
        />
        <Button
          type='submit'
          disabled={isSubmitting}
          className='whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn('mt-16 pt-8 border-t border-gray-200', className)}>
      <Card className='text-center'>
        <CardContent className='py-8'>
          <BookOpen className='w-12 h-12 text-teal-600 mx-auto mb-4' />
          <h3 className='text-2xl font-semibold text-gray-900 dark:text-white mb-2'>
            {title}
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto'>
            {description}
          </p>

          <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
            <div className='flex flex-col sm:flex-row gap-4 mb-4'>
              <Input
                type='text'
                placeholder='Your name (optional)'
                value={name}
                onChange={e => setName(e.target.value)}
                className='flex-1'
                disabled={isSubmitting}
              />
              <Input
                type='email'
                placeholder={placeholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='flex-1'
                disabled={isSubmitting}
                required
              />
            </div>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Subscribing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>

          {message && (
            <div
              className={cn(
                'flex items-center justify-center gap-2 text-sm mt-4',
                getStatusColor()
              )}
            >
              {getStatusIcon()}
              <span>{message}</span>
            </div>
          )}

          <p className='text-xs text-gray-500 mt-4'>
            By subscribing, you agree to receive email updates. You can
            unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
