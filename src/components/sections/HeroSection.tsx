import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage,
  className = '',
}) => {
  return (
    <section 
      className={`relative min-h-[60vh] bg-surface-deep ${className}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {subtitle && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
              {subtitle}
            </p>
          )}
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-300 md:text-2xl">
              {description}
            </p>
          )}
          {(ctaText || secondaryCtaText) && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {ctaText && (
                <a
                  href={ctaLink || '#'}
                  className="btn-strategy-primary"
                >
                  {ctaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink || '#'}
                  className="btn-strategy-secondary"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
