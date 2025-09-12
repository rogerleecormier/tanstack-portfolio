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
        return <CheckCircle className='size-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='size-4 text-red-600' />;
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
      <div className={cn('mt-8 border-t border-gray-200 pt-6', className)}>
        <div className='mb-6 text-center'>
          <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
            {title}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
          <div className='mb-3 flex flex-col gap-3 sm:flex-row'>
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
            className='w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
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
              'mt-3 flex items-center justify-center gap-2 text-sm',
              getStatusColor()
            )}
          >
            {getStatusIcon()}
            <span>{message}</span>
          </div>
        )}

        <p className='mt-3 text-center text-xs text-gray-500'>
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
        className={cn('flex flex-col gap-3 sm:flex-row', className)}
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
          className='whitespace-nowrap bg-teal-600 text-white hover:bg-teal-700'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
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
    <div className={cn('mt-16 border-t border-gray-200 pt-8', className)}>
      <Card className='text-center'>
        <CardContent className='py-8'>
          <BookOpen className='mx-auto mb-4 size-12 text-teal-600' />
          <h3 className='mb-2 text-2xl font-semibold text-gray-900 dark:text-white'>
            {title}
          </h3>
          <p className='mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400'>
            {description}
          </p>

          <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
            <div className='mb-4 flex flex-col gap-4 sm:flex-row'>
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
              className='w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
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
                'mt-4 flex items-center justify-center gap-2 text-sm',
                getStatusColor()
              )}
            >
              {getStatusIcon()}
              <span>{message}</span>
            </div>
          )}

          <p className='mt-4 text-xs text-gray-500'>
            By subscribing, you agree to receive email updates. You can
            unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
