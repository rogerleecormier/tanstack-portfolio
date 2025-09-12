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
          className='w-full h-full'
          onError={e => {
            console.error('Failed to load logo:', e);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClass} bg-gradient-to-br from-teal-800 to-blue-800 rounded-2xl items-center justify-center shadow-lg hidden border border-teal-600/50`}
        >
          <Target className='w-1/2 h-1/2 text-white' />
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
          className='w-full h-full'
          onError={e => {
            console.error('Failed to load logo:', e);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClass} bg-gradient-to-br from-teal-800 to-blue-800 rounded-2xl items-center justify-center shadow-lg hidden border border-teal-600/50`}
        >
          <Target className='w-1/2 h-1/2 text-white' />
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
        className={`${sizeClass} bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl items-center justify-center shadow-lg hidden`}
      >
        <Target className='w-1/2 h-1/2 text-white' />
      </div>

      {/* Targeting indicator dots */}
      {showTargetingDots && (
        <>
          <div
            className={`absolute -top-1 -right-1 ${dotSize.outer} bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-md border border-orange-300/50`}
          >
            <div className={`${dotSize.inner} bg-white rounded-full`}></div>
          </div>
          <div
            className={`absolute -bottom-1 -left-1 ${dotSize.outer} bg-gradient-to-br from-teal-600 to-blue-600 rounded-full flex items-center justify-center shadow-md border border-teal-300/50`}
          >
            <div className={`${dotSize.inner} bg-white rounded-full`}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Logo;
