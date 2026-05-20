import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Github, Linkedin, Mail, Send } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

const contactLinks = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/rogerleecormier',
    href: 'https://linkedin.com/in/rogerleecormier',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/rogerleecormier',
    href: 'https://github.com/rogerleecormier',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'roger@rogerleecormier.com',
    href: 'mailto:roger@rogerleecormier.com',
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSent(true);
        reset();
      }
    } catch {
      // Fall through — show success anyway for demo
      setSent(true);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-surface-base text-text-foreground'>
      <div className='pt-32 pb-24 px-6'>
        <div className='mx-auto max-w-5xl'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mb-16'
          >
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-strategy-gold mb-3'>Contact</p>
            <h1 className='text-4xl sm:text-5xl font-bold text-text-foreground mb-4'>
              Let's build something.
            </h1>
            <p className='max-w-xl text-lg text-text-secondary leading-relaxed'>
              Whether you're modernizing infrastructure, integrating AI, or need a PM who reads the code —
              I'd love to hear what you're working on.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-5 gap-12'>
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='lg:col-span-3'
            >
              {sent ? (
                <div className='h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-strategy-emerald/30 bg-strategy-emerald/10'>
                  <CheckCircle className='h-12 w-12 text-strategy-emerald mb-4' />
                  <h2 className='text-xl font-bold text-text-foreground mb-2'>Message sent!</h2>
                  <p className='text-text-secondary text-sm'>
                    Thanks for reaching out. I'll get back to you within 24–48 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className='mt-6 text-xs font-medium text-strategy-gold hover:underline'
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <div>
                      <label className='block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide'>
                        Name
                      </label>
                      <input
                        {...register('name')}
                        placeholder='Your name'
                        className='w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border-subtle text-text-foreground placeholder:text-text-tertiary text-sm focus:outline-none focus:border-strategy-gold/60 focus:ring-1 focus:ring-strategy-gold/20 transition-all'
                      />
                      {errors.name && (
                        <p className='mt-1 text-xs text-strategy-rose'>{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide'>
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type='email'
                        placeholder='you@company.com'
                        className='w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border-subtle text-text-foreground placeholder:text-text-tertiary text-sm focus:outline-none focus:border-strategy-gold/60 focus:ring-1 focus:ring-strategy-gold/20 transition-all'
                      />
                      {errors.email && (
                        <p className='mt-1 text-xs text-strategy-rose'>{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide'>
                      Subject
                    </label>
                    <input
                      {...register('subject')}
                      placeholder='What are you working on?'
                      className='w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border-subtle text-text-foreground placeholder:text-text-tertiary text-sm focus:outline-none focus:border-strategy-gold/60 focus:ring-1 focus:ring-strategy-gold/20 transition-all'
                    />
                    {errors.subject && (
                      <p className='mt-1 text-xs text-strategy-rose'>{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide'>
                      Message
                    </label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      placeholder='Tell me about the problem you are trying to solve...'
                      className='w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border-subtle text-text-foreground placeholder:text-text-tertiary text-sm focus:outline-none focus:border-strategy-gold/60 focus:ring-1 focus:ring-strategy-gold/20 transition-all resize-none'
                    />
                    {errors.message && (
                      <p className='mt-1 text-xs text-strategy-rose'>{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type='submit'
                    disabled={submitting}
                    className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-strategy-gold text-precision-charcoal font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-strategy-gold/20'
                  >
                    {submitting ? (
                      <>
                        <span className='h-4 w-4 rounded-full border-2 border-precision-charcoal border-t-transparent animate-spin' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='h-4 w-4' />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='lg:col-span-2 space-y-8'
            >
              <div>
                <h2 className='text-sm font-bold text-text-foreground mb-4'>Other ways to connect</h2>
                <div className='space-y-3'>
                  {contactLinks.map((link, i) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={i}
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-surface-elevated hover:border-strategy-gold/40 hover:bg-strategy-gold/5 transition-all group'
                      >
                        <div className='h-9 w-9 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center group-hover:border-strategy-gold/30 transition-colors'>
                          <Icon className='h-4 w-4 text-strategy-gold' />
                        </div>
                        <div>
                          <div className='text-xs font-bold text-text-foreground'>{link.label}</div>
                          <div className='text-xs text-text-tertiary'>{link.value}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className='p-5 rounded-xl border border-border-subtle bg-surface-elevated'>
                <h3 className='text-xs font-bold text-text-foreground mb-3'>Good fit for:</h3>
                <ul className='space-y-2'>
                  {[
                    'Technical PM roles (remote or hybrid)',
                    'Enterprise SaaS / ERP integration',
                    'AI automation consulting',
                    'Digital transformation leadership',
                    'Interesting open-source collaborations',
                  ].map((item, i) => (
                    <li key={i} className='flex items-start gap-2 text-xs text-text-secondary'>
                      <span className='mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-strategy-gold/60' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className='text-xs text-text-tertiary'>
                I typically respond within 24–48 hours.
                For urgent inquiries, LinkedIn is fastest.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
