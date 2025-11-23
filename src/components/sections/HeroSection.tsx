import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

export interface HeroSectionProps {
  profile?: {
    name: string;
    role: string;
    avatar?: string;
    image?: string;
  };
  title: string;
  subtitle?: string;
  description: string;
  stats?: Array<{ number: string; label: string }>;
  ctas?: Array<{
    label: string;
    href?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
  }>;
  children?: ReactNode;
}

export function HeroSection({
  profile,
  title,
  subtitle,
  description,
  stats = [],
  ctas = [],
  children,
}: HeroSectionProps) {
  return (
    <section className='relative mb-24 overflow-hidden rounded-lg border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-base p-12 md:p-16'>
      {/* Background gradient effect */}
      <div className='bg-gradient-radial pointer-events-none absolute -right-1/2 -top-1/2 h-96 w-96 from-strategy-gold/10 to-transparent' />

      <div
        className={`relative z-10 grid grid-cols-1 items-center gap-12 ${
          profile ? 'lg:grid-cols-5' : 'lg:grid-cols-1'
        }`}
      >
        {/* Profile Section */}
        {profile && (
          <div className='flex flex-col items-center text-center lg:col-span-2'>
            <div className='mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-strategy-gold bg-strategy-gold/10 shadow-lg shadow-strategy-gold/20'>
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <span className='text-6xl'>{profile.avatar || '👨‍💻'}</span>
              )}
            </div>
            <h2 className='mb-2 text-2xl font-bold text-text-foreground'>
              {profile.name}
            </h2>
            <p className='text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
              {profile.role}
            </p>
          </div>
        )}

        {/* Content Section */}
        <div className={profile ? 'lg:col-span-3' : ''}>
          {subtitle && (
            <p className='mb-3 text-sm font-semibold uppercase tracking-widest text-strategy-gold'>
              {subtitle}
            </p>
          )}

          <h1 className='mb-6 text-4xl font-bold leading-tight text-text-foreground md:text-5xl'>
            {title}
          </h1>

          <p className='mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary'>
            {description}
          </p>

          {/* Stats Grid */}
          {stats.length > 0 && (
            <div className='mb-8 grid grid-cols-2 gap-4 md:grid-cols-3'>
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className='rounded-lg border border-border-subtle bg-strategy-gold/5 p-4 text-center'
                >
                  <div className='text-3xl font-bold text-strategy-gold'>
                    {stat.number}
                  </div>
                  <div className='mt-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          {ctas.length > 0 && (
            <div className='flex flex-col gap-4 sm:flex-row'>
              {ctas.map((cta, idx) => (
                <Button
                  key={idx}
                  variant={cta.variant === 'secondary' ? 'outline' : 'default'}
                  className={
                    cta.variant === 'secondary'
                      ? 'border-strategy-gold text-strategy-gold hover:bg-strategy-gold/10'
                      : 'bg-strategy-gold text-precision-charcoal hover:brightness-110'
                  }
                  onClick={cta.onClick}
                  asChild={!!cta.href}
                >
                  {cta.href ? <a href={cta.href}>{cta.label}</a> : cta.label}
                </Button>
              ))}
            </div>
          )}

          {/* Custom children */}
          {children}
        </div>
      </div>
    </section>
  );
}
