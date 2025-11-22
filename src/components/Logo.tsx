import React from 'react';
import { Target } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTargetingDots?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'icon-only';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const dotSizes = {
  sm: { outer: 'w-2 h-2', inner: 'w-1 h-1' },
  md: { outer: 'w-3 h-3', inner: 'w-1.5 h-1.5' },
  lg: { outer: 'w-4 h-4', inner: 'w-2 h-2' },
  xl: { outer: 'w-5 h-5', inner: 'w-2.5 h-2.5' },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTargetingDots = true,
  className = '',
  variant = 'default',
}) => {
  const sizeClass = sizeClasses[size];
  const dotSize = dotSizes[size];

  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClass} ${className}`}>
        <img
          src='/header-logo.svg'
          alt='RCormier Logo'
          className='size-full'
          onError={e => {
            console.error('Failed to load logo:', e);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClass} hidden items-center justify-center rounded-2xl border border-slate-400/50 bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg`}
        >
          <Target className='size-1/2 text-white' />
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`${sizeClass} ${className}`}>
        <img
          src='/header-logo.svg'
          alt='RCormier Logo'
          className='size-full'
          onError={e => {
            console.error('Failed to load logo:', e);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClass} hidden items-center justify-center rounded-2xl border border-slate-400/50 bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg`}
        >
          <Target className='size-1/2 text-white' />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src='/header-logo.svg'
        alt='RCormier Logo'
        className={sizeClass}
        onError={e => {
          console.error('Failed to load logo:', e);
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Fallback Target icon (hidden by default) */}
      <div
        className={`${sizeClass} hidden items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg`}
      >
        <Target className='size-1/2 text-white' />
      </div>

      {/* Targeting indicator dots */}
      {showTargetingDots && (
        <>
          <div
            className={`absolute -right-1 -top-1 ${dotSize.outer} flex items-center justify-center rounded-full border border-orange-300/50 bg-gradient-to-br from-orange-500 to-red-600 shadow-md`}
          >
            <div className={`${dotSize.inner} rounded-full bg-white`}></div>
          </div>
          <div
            className={`absolute -bottom-1 -left-1 ${dotSize.outer} flex items-center justify-center rounded-full border border-slate-300/50 bg-gradient-to-br from-slate-500 to-slate-600 shadow-md`}
          >
            <div className={`${dotSize.inner} rounded-full bg-white`}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Logo;
